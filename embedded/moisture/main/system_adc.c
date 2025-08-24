#include "hardware/gpio.h"
#include "hardware/adc.h"

void system_adc_init() {
    adc_init();
    adc_set_temp_sensor_enabled(true);

    // Set all pins to input (as far as SIO is concerned)
    gpio_set_dir_all_bits(0);
    for (int i = 2; i < 30; ++i) {
        gpio_set_function(i, GPIO_FUNC_SIO);
        if (i >= 26) {
            gpio_disable_pulls(i);
            gpio_set_input_enabled(i, false);
        }
    }
}

void system_adc_select_input(int channel) {
    adc_select_input(channel);
}

uint32_t system_adc_read() {
    return adc_read();
}
