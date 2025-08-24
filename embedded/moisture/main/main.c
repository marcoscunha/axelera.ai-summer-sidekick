#include <stdio.h>
#include "pico/stdlib.h"
#include "hardware/timer.h"
#include "hardware/watchdog.h"
#include "pico/cyw43_arch.h"
#include "lwip/apps/mqtt.h"
#include "hardware/uart.h"
// Custom includes
#include "settings.h" // Contains WIFI_SSID and WIFI_PASSWORD
#include "system_adc.h"
#include "system_led.h"
#include "system_gpio.h"
#include "mqtt_client.h"

int64_t alarm_callback(alarm_id_t id, void *user_data) {
    // Put your timeout handler code in here
    printf("Alarm callback triggered!\n");
    return 0;
}

// UART defines
// By default the stdout UART is `uart0`, so we will use the second one
#define UART_ID uart1
#define BAUD_RATE 115200

// Use pins 4 and 5 for UART1
// Pins can be changed, see the GPIO function select table in the datasheet for information on GPIO assignments
#define UART_TX_PIN 4
#define UART_RX_PIN 5

// Conenct to MQTT broker


int main()
{
    stdio_init_all();
    system_adc_select_input(0); // Select ADC input channel 0

    // Init ADC
    system_adc_init();

    // Init GPIO
    system_gpio_init();

    // Init LED
    setup_system_led();

    // Initialise the Wi-Fi chip
    // if (cyw43_arch_init()) {
    //     printf("Wi-Fi init failed\n");
    //     return -1;
    // }

    // Timer example code - This example fires off the callback after 2000ms
    add_alarm_in_ms(2000, alarm_callback, NULL, false);
    // For more examples of timer use see https://github.com/raspberrypi/pico-examples/tree/master/timer

    // Watchdog example code
    if (watchdog_caused_reboot()) {
        printf("Rebooted by Watchdog!\n");
        // Whatever action you may take if a watchdog caused a reboot
    }

    // Enable the watchdog, requiring the watchdog to be updated every 100ms or the chip will reboot
    // second arg is pause on debug which means the watchdog will pause when stepping through code
    watchdog_enable(10000, 1);

    // You need to call this function at least more often than the 100ms in the enable call to prevent a reboot
    watchdog_update();

    // Enable wifi station
    cyw43_arch_enable_sta_mode();

    printf("Connecting to Wi-Fi...\n");
    if (cyw43_arch_wifi_connect_timeout_ms(WIFI_SSID, WIFI_PASSWORD, CYW43_AUTH_WPA2_AES_PSK, 30000)) {
        printf("failed to connect.\n");
        return 1;
    } else {
        printf("Connected.\n");
        // Read the ip address in a human readable way
        uint8_t *ip_address = (uint8_t*)&(cyw43_state.netif[0].ip_addr.addr);
        printf("IP address %d.%d.%d.%d\n", ip_address[0], ip_address[1], ip_address[2], ip_address[3]);
    }

    // Initialize the MQTT client
    printf("Connecting to MQTT Broker...\n");
    mqtt_client_t *client = mqtt_client_new();
    if (!client) {
        printf("Failed to create MQTT client\n");
        return 1;
    }


    mqtt_do_connect(client, MQTT_BROKER_IP); // Connect to the MQTT broker using the defined IP address

    // Set up our UART
    uart_init(UART_ID, BAUD_RATE);
    // Set the TX and RX pins by using the function select on the GPIO
    // Set datasheet for more information on function select
    gpio_set_function(UART_TX_PIN, GPIO_FUNC_UART);
    gpio_set_function(UART_RX_PIN, GPIO_FUNC_UART);

    // Use some the various UART functions to send out data
    // In a default system, printf will also output via the default UART

    // Send out a string, with CR/LF conversions
    uart_puts(UART_ID, " Hello, UART!\n");

    // For more examples of UART use see https://github.com/raspberrypi/pico-examples/tree/master/uart

    uint32_t last_publish_ms = 0; // Track last publish time
    while (true) {
        int moisture_adc_value = system_adc_read(); // Read ADC value
        bool moisture_gpio = gpio_get(2); // Read GPIO value (assuming GPIO 2 is connected to the moisture sensor)
        bool connected =  mqtt_client_is_connected(client);

        uint32_t now_ms = to_ms_since_boot(get_absolute_time());
        if (connected && (now_ms - last_publish_ms >= 10000)) {
            printf("MOISTURE SOIL  ADC Value = 0x%x GPIO = %d CONNECTED = %d \n",moisture_adc_value,moisture_gpio, connected);
            char adc_str[16];
            char gpio_str[8];
            snprintf(adc_str, sizeof(adc_str), "%d", moisture_adc_value);
            snprintf(gpio_str, sizeof(gpio_str), "%d", moisture_gpio ? 1 : 0);
            mqtt_client_publish(client, "axelera.ai/moisture/01/adc", adc_str, NULL); // Publish ADC value
            mqtt_client_publish(client, "axelera.ai/moisture/01/gpio", gpio_str, NULL); // Publish GPIO value
            last_publish_ms = now_ms;

        }

        mqtt_health_check(client);
        system_led_pool();
        cyw43_arch_poll();
        watchdog_update();
        sleep_ms(100);
    }
}

