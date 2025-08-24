
#include <stdint.h>
#include "pico/stdlib.h"
#include "pico/cyw43_arch.h"
#include "pico/time.h"
#include "hardware/gpio.h"
#include "pico/stdlib.h"
#include "system_led.h"

static int led_toogle_time_in_ms = 1000; // 10 s

static void system_led_toggle(void);

void setup_system_led(void)
{
    cyw43_arch_init();
    cyw43_arch_gpio_put(CYW43_WL_GPIO_LED_PIN, true);
}

void system_led_set_toogle_time_in_ms(int toogle_time_in_ms)
{
    // Set the timer for the system LED
    led_toogle_time_in_ms = toogle_time_in_ms;
}

void system_led_pool(void)
{
    uint32_t current_time_in_ms = to_ms_since_boot(get_absolute_time());
    static uint32_t last_toggle_time_in_ms = 0;

    if (current_time_in_ms - last_toggle_time_in_ms >= led_toogle_time_in_ms)
    {
        system_led_toggle();
        last_toggle_time_in_ms = current_time_in_ms;
    }
}

static void system_led_toggle(void)
{
    static bool led_on = false;
    // Toggle the LED state using the Wi-Fi driver
    led_on = !led_on;
    cyw43_arch_gpio_put(CYW43_WL_GPIO_LED_PIN, led_on);
}
