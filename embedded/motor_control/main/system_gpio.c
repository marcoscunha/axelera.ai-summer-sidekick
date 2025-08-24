// Configure the GPIO pins for the system
#include <stdio.h>
#include "pico/stdlib.h"
#include "hardware/gpio.h"
#include "system_gpio.h"
#include "system_motor.h"
#define TURN_COUNT_GPIO_PIN 2

// Callback function for GPIO interrupt
void gpio_irq_callback(uint gpio, uint32_t events) {
    if (gpio == TURN_COUNT_GPIO_PIN) {
        // Handle the GPIO interrupt event
        static uint32_t last_interrupt_time = 0;
        uint32_t current_time = to_ms_since_boot(get_absolute_time());

        // Debounce the interrupt
        if (current_time - last_interrupt_time < 2000) {
            printf("GPIO interrupt too close to last one, ignoring\n");
            return; // Ignore this interrupt, it's too close to the last one
        }

        // Read the GPIO pin state
        sleep_ms(20); // Small delay to ensure the pin state is stable
        int pin_state = gpio_get(TURN_COUNT_GPIO_PIN);
        if (pin_state != 0) {
            printf("GPIO interrupt on pin %d, but pin state is not low, ignoring\n", gpio);
            return; // Ignore this interrupt if the pin state is not low
        }
        last_interrupt_time = current_time;

        printf("GPIO interrupt on pin %d\n", gpio);
        motor_feed_counter_cb();
    }
}

void setup_system_gpio() {
    // Initialize GPIO pins
    // The gpio pin 2 as a input pin and pull it up
    gpio_init(TURN_COUNT_GPIO_PIN);
    gpio_set_dir(TURN_COUNT_GPIO_PIN, GPIO_IN);
    gpio_pull_up(TURN_COUNT_GPIO_PIN);

    // Configure the Interruption for this GPIO pin while pin is low
    gpio_set_irq_enabled_with_callback(TURN_COUNT_GPIO_PIN, GPIO_IRQ_EDGE_FALL, true, gpio_irq_callback);
    //gpio_set_irq_enabled_with_callback(TURN_COUNT_GPIO_PIN, GPIO_IRQ_LEVEL_LOW, true, gpio_irq_callback);
}

void system_gpio_set_enable_interrupt(bool enable) {
    // Enable or disable the GPIO interrupt for turn count
    if (enable) {
        gpio_set_irq_enabled(TURN_COUNT_GPIO_PIN, GPIO_IRQ_EDGE_FALL, true);
    } else {
        gpio_set_irq_enabled(TURN_COUNT_GPIO_PIN, GPIO_IRQ_EDGE_FALL, false);
    }
}