#include <stdio.h>
#include "pico/stdlib.h"
#include "pico/cyw43_arch.h"
#include "lwip/apps/mqtt.h"
#include "hardware/timer.h"
#include "hardware/watchdog.h"
#include "hardware/pwm.h"
#include "system_pwm.h"
#include "system_led.h"
#include "system_gpio.h"
#include "settings.h"
#include "mqtt_client.h"

void pico_set_led(bool led_on) {
#if defined(PICO_DEFAULT_LED_PIN)
    // Just set the GPIO on or off
    gpio_put(PICO_DEFAULT_LED_PIN, led_on);
#elif defined(CYW43_WL_GPIO_LED_PIN)
    // Ask the wifi "driver" to set the GPIO on or off
    cyw43_arch_gpio_put(CYW43_WL_GPIO_LED_PIN, led_on);
#endif
}

void system_setup(){
    printf("Setting up LED...\n");
    setup_system_led();

    printf("Setting up PWM...\n");
    setup_system_pwm();

    printf("Setting up GPIOs...\n");
    setup_system_gpio();

    printf("Setup complete.\n");

    // Perform initialisation
 }

int network_setup(mqtt_client_t *client)
{
    // Initialise the Wi-Fi chip
    // If it is already initialised, this will do nothing
    // if (cyw43_arch_init()) {
    //     printf("Wi-Fi init failed\n");
    //     return -1;
    // }

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
    if (!client) {
        printf("Failed to create MQTT client\n");
        return 1;
    }
    mqtt_do_connect(client, MQTT_BROKER_IP);

    return 0;
}

int main()
{
    stdio_init_all();
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

    // the low level pins
    system_setup();

    mqtt_client_t *client = mqtt_client_new();
    int state = network_setup(client);
    if (state != 0) {
        printf("Network setup failed with state: %d\n", state);
        return state;
    }

    while (true) {
        mqtt_health_check(client);
        system_led_pool();
        cyw43_arch_poll();
        watchdog_update();
        sleep_ms(100);
    }
}

