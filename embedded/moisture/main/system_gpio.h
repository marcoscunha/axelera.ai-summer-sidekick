#include "hardware/gpio.h"


void system_gpio_init() {

    // Init GPIO 2
    gpio_init(2);
    gpio_set_dir(2, GPIO_IN);
    // gpio_set_pulls(2, false, false); // Disable pull-up and pull-down resistors
}

