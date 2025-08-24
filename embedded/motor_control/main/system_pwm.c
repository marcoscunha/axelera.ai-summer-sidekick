#include "hardware/pwm.h"
#include "hardware/gpio.h"
#include "system_pwm.h"

void setup_system_pwm() {
    // This function is called once at the start of the program
    // You can put any setup code here that you want to run once
    // Init PWM
    gpio_set_function(PWM_MOTOR_PIN, GPIO_FUNC_PWM);

    // Find out which PWM slice is connected to GPIO 0 (it's slice 0)
    uint slice_num = pwm_gpio_to_slice_num(PWM_MOTOR_PIN);

    // Set period of 64 cycles (0 to 64 inclusive)
    pwm_set_wrap(slice_num, 6144);
    // Set channel A output high for one cycle before dropping
    pwm_set_chan_level(slice_num, PWM_CHAN_A, 1);
    // Set initial B output high for three cycles before dropping
    pwm_set_chan_level(slice_num, PWM_CHAN_B, 1);

    pwm_set_gpio_level(PWM_MOTOR_PIN, 0);

    pwm_set_enabled(slice_num, true);
}

void pwm_set_pwm_duty_cycle(uint16_t duty_cycle) {
    // Set the PWM duty cycle for the motor
    // duty_cycle should be between 0 and 6144 (for a 50% duty cycle)
    if (duty_cycle > 6144) {
        duty_cycle = 6144; // Cap at maximum value
    }
    pwm_set_gpio_level(PWM_MOTOR_PIN, duty_cycle * 6144 / 100); // Convert percentage to level
}