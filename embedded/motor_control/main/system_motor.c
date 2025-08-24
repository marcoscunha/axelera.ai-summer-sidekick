#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <stdint.h>
#include "pico/stdlib.h"
#include "system_pwm.h"
#include "system_gpio.h"
#include "system_led.h"


static uint8_t feed_counter = 0;
static uint8_t feed_requested = 0;

static alarm_id_t safe_stop_alarm_id = -1;
static alarm_id_t feed_counter_alarm_id = -1;

void motor_feed_counter_cb(void);
void motor_stop_turn_count_cb(void);
void motor_start_turn_count_cb(void);


void motor_feed_counter(void ){
    printf("Stop Motor\n");
    pwm_set_pwm_duty_cycle(0);
}

int64_t alarm_callback(alarm_id_t id, void *user_data) {
    // Put your timeout handler code in here
    system_gpio_set_enable_interrupt(true);
    motor_start_turn_count_cb();
    return 0; // Return 0 to indicate that the alarm should not be rescheduled

}

int64_t safe_stop_alarm_callback(alarm_id_t id, void *user_data){
    system_led_set_toogle_time_in_ms(1000);
    motor_stop_turn_count_cb();
}


void motor_feed_counter_cb(void) {
    // This function is called when the motor feed counter is triggered
    feed_counter++;
    printf("Feed %d/%d\n", feed_counter, feed_requested);
    // Turn off the motor
    motor_stop_turn_count_cb();
    //
    if (safe_stop_alarm_id != -1) {
        cancel_alarm(safe_stop_alarm_id);
        safe_stop_alarm_id = -1;
    }

    if (feed_counter >= feed_requested) {
        feed_counter = 0;
        feed_requested = 0;
        system_led_set_toogle_time_in_ms(1000);
        printf("Feed requested, counter reset\n");
    }
    else{
        feed_counter_alarm_id = add_alarm_in_ms(1000, alarm_callback, NULL, false);
        if( feed_counter_alarm_id == -1) {
            printf("Failed to add feed counter alarm\n");
        } else {
            printf("Feed counter alarm added successfully for next feed turn\n");
        }
    }
}

void motor_start_turn_count_cb(void) {
    printf("Starting Motor\n");
    system_gpio_set_enable_interrupt(true);
    pwm_set_pwm_duty_cycle(50);

    // Create an alarm to stop the motor after 5 seconds
    if (safe_stop_alarm_id != -1) {
        cancel_alarm(safe_stop_alarm_id);
        safe_stop_alarm_id = -1;
    }
    safe_stop_alarm_id = add_alarm_in_ms(10000, safe_stop_alarm_callback, NULL, false);
}

void motor_stop_turn_count_cb(void){
    printf("Stopping Motor\n");
    system_gpio_set_enable_interrupt(false);
    pwm_set_pwm_duty_cycle(0);
}

// TODO: Create a call that should subscrite to the feed dispenser topic

void feet_dispenser_topic_cb(char *message, int len) {
    // This function is called when a feed dispenser command is received
    if (len > 0) {
        feed_requested = atoi(message);
        printf("Feed requested: %d turns\n", feed_requested);
        if (feed_requested > 0) {
            system_led_set_toogle_time_in_ms(500);
            motor_start_turn_count_cb();
        }
    } else {
        printf("Invalid feed request received\n");
    }
}