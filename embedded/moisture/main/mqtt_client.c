
#include <string.h>
#include "pico/stdlib.h"
#include "hardware/timer.h"
#include "hardware/watchdog.h"
#include "lwip/apps/mqtt.h"
#include "lwip/ip_addr.h"
#include "settings.h"
#include "main.h"

static void mqtt_connection_cb(mqtt_client_t *client, void *arg, mqtt_connection_status_t status);
static void mqtt_incoming_publish_cb(void *arg, const char *topic, u32_t tot_len);
static void mqtt_incoming_data_cb(void *arg, const u8_t *data, u16_t len, u8_t flags);

static void mqtt_pub_request_cb(void *arg, err_t result);

char mqtt_broker_ip[64] = MQTT_BROKER_IP;

void mqtt_do_connect(mqtt_client_t *client, char *broker_ip)
{
    struct mqtt_connect_client_info_t ci;
    err_t err;
    ip_addr_t mqtt_ip_addr;
    memcpy(mqtt_broker_ip, broker_ip, strlen(broker_ip) + 1);
    bool result = ipaddr_aton(mqtt_broker_ip, &mqtt_ip_addr);
    if (!result)
    {
        printf("Invalid IP address format\n");
        return;
    }

    /* Setup an empty client info structure */
    memset(&ci, 0, sizeof(ci));

    /* Minimal amount of information required is client identifier, so set it here */
    ci.client_id = "lwip_test";

    /* Initiate client and connect to server, if this fails immediately an error code is returned
     otherwise mqtt_connection_cb will be called with connection result after attempting
     to establish a connection with the server.
     For now MQTT version 3.1.1 is always used*/

    err = mqtt_client_connect(client, &mqtt_ip_addr, MQTT_PORT, mqtt_connection_cb, 0, &ci);

    /* For now just print the result code if something goes wrong */
    if (err != ERR_OK)
    {
        printf("mqtt_connect return %d\n", err);
    }
}

static void mqtt_connection_cb(mqtt_client_t *client, void *arg, mqtt_connection_status_t status)
{
    err_t err;
    if (status == MQTT_CONNECT_ACCEPTED)
    {
        printf("mqtt_connection_cb: Successfully connected\n");

        /* Setup callback for incoming publish requests */
        mqtt_set_inpub_callback(client, mqtt_incoming_publish_cb, mqtt_incoming_data_cb, arg);

        /* Subscribe to a topic named "subtopic" with QoS level 1, call mqtt_sub_request_cb with result */
        err = mqtt_subscribe(client, CONTROL_RESET_TOPIC, 1, mqtt_sub_request_cb, arg);

        if (err != ERR_OK)
        {
            printf("mqtt_subscribe return: %d\n", err);
        }
    }
    else
    {
        printf("mqtt_connection_cb: Disconnected, reason: %d\n", status);

        /* Its more nice to be connected, so try to reconnect */
        mqtt_do_connect(client, MQTT_BROKER_IP);
    }
}

void mqtt_sub_request_cb(void *arg, err_t result)
{
    /* Just print the result code here for simplicity,
       normal behaviour would be to take some action if subscribe fails like
       notifying user, retry subscribe or disconnect from server */
    printf("Subscribe result: %d\n", result);
    if (result != ERR_OK)
    {
        printf("Subscribe failed with error: %d\n", result);
    }
    else
    {
        printf("Subscribe successful\n");
    }
}

// -----------------------------------------------------------------
// 3. Implementing callbacks for incoming publish and data

/* The idea is to demultiplex topic and create some reference to be used in data callbacks
   Example here uses a global variable, better would be to use a member in arg
   If RAM and CPU budget allows it, the easiest implementation might be to just take a copy of
   the topic string and use it in mqtt_incoming_data_cb
*/
static int inpub_id;
static void mqtt_incoming_publish_cb(void *arg, const char *topic, u32_t tot_len)
{
    printf("Incoming publish at topic %s with total length %u\n", topic, (unsigned int)tot_len);

    /* Decode topic string into a user defined reference */
    if (strcmp(topic, CONTROL_RESET_TOPIC) == 0)
    {
        inpub_id = 0;
    }
    else
    {
        /* For all other topics */
        inpub_id = 1;
    }
}

/**
 * mqtt_incoming_data_cb is called when a publish payload is received.
 * It processes the payload based on the topic it was published to.
 * @param arg User-defined argument passed to the callback.
 * @param data Pointer to the incoming data payload.
 * @param len Length of the incoming data payload.
 * @param flags Flags indicating the state of the data (e.g., if it's the last fragment).
 *
 */
static void mqtt_incoming_data_cb(void *arg, const u8_t *data, u16_t len, u8_t flags)
{
    printf("Incoming publish payload with length %d, flags %u\n", len, (unsigned int)flags);

    char message[len + 1];
    strncpy(message, (const char *)data, len);
    message[len] = '\0'; // Ensure null termination for string safety

    if (flags & MQTT_DATA_FLAG_LAST)
    {
        /* Last fragment of payload received (or whole part if payload fits receive buffer
           See MQTT_VAR_HEADER_BUFFER_LEN)  */
        /* Call function or do action depending on reference, in this case inpub_id */
        if (inpub_id == 0)
        {
            if (strcmp(message, "RESET") == 0)
            {
                printf("mqtt_incoming_data_cb: Reset command received, performing reset...\n");
                watchdog_reboot(0, 0, 0); // Example action: reboot the system
            }
            else
            {
                printf("mqtt_incoming_data_cb: Unknown command received: %s\n", message);
            }
        }
        else if (inpub_id == 1)
        {
            /* Call an 'A' function... */
        }
        else
        {
            printf("mqtt_incoming_data_cb: Ignoring payload...\n");
        }
    }
    else
    {
        /* Handle fragmented payload, store in buffer, write to file or whatever */
    }
}

//-----------------------------------------------------------------
// 4. Using outgoing publish

void mqtt_client_publish(mqtt_client_t *client, const char *topic, const char *pub_payload, void *arg)
{
    err_t err;
    u8_t qos = 2;    /* 0 1 or 2, see MQTT specification */
    u8_t retain = 0; /* No don't retain such crappy payload... */
    err = mqtt_publish(client, topic, pub_payload, strlen(pub_payload), qos, retain, mqtt_pub_request_cb, arg);
    if (err != ERR_OK)
    {
        printf("Publish err: %d\n", err);
    }
}

/* Called when publish is complete either with sucess or failure */
static void mqtt_pub_request_cb(void *arg, err_t result)
{
    if (result != ERR_OK)
    {
        printf("Publish result: %d\n", result);
    }
}

void mqtt_health_check(mqtt_client_t *client)
{
    static uint32_t last_health_check = 0;
    uint32_t current_time = to_ms_since_boot(get_absolute_time());
    if (current_time - last_health_check > 60 * 1000)
    {
        bool connected = mqtt_client_is_connected(client);
        if (connected)
        {
            mqtt_client_publish(client, CONTROL_HEALTH_TOPIC, "ALIVE", NULL);
        }
        last_health_check = current_time;
    }
}