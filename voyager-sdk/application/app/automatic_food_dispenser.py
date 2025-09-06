from datetime import datetime
import time

from application.app.application_state import app_state
from application.app.logger import logger
import paho.mqtt.publish as publish


def automatic_food_dispenser_worker():
    while True:
        dispenser.dispense_food()
        # Check every 5 seconds
        time.sleep(5)


class AutomaticFoodDispenser:
    def __init__(self):
        self.portions = 5
        self.trigger_dispenser_after_bowl_empty_in_seconds = 60
        self.last_dispense_time = None

    def should_dispense(self):
        """Determine if food should be dispensed based on bowl level"""
        bowl_label = app_state.bowl_level.label
        last_detection_time = app_state.bowl_level.last_detection_time
        first_detection_time = app_state.bowl_level.first_detection_time

        # Evaluate just fresh detection
        if (datetime.now() - last_detection_time).total_seconds() > 120:
            logger.info(
                f"Old detection - {(datetime.now() - last_detection_time).total_seconds()} seconds")
            return False

        if self.last_dispense_time is not None and (datetime.now() - self.last_dispense_time).total_seconds() < 300:
            logger.info(
                f"Recent dispensing {(datetime.now() - self.last_dispense_time).total_seconds()} seconds ago")
            return False

        if bowl_label != "bowl_empty":
            logger.info(f"Not Empty - {bowl_label}")
            return False

        if (datetime.now() - first_detection_time).total_seconds() < self.trigger_dispenser_after_bowl_empty_in_seconds:
            logger.info(
                f"Time window not passed yet {(datetime.now() - first_detection_time).total_seconds()} seconds")
            return False

        logger.info("Conditions met for dispensing food")
        return True

    def dispense_food(self):
        """Simulate dispensing food."""
        if self.should_dispense():
            logger.info("Dispensing food...")
            self.last_dispense_time = datetime.now()
            # Publish to MQTT topic
            publish.single(
                "axelera.ai/feed_control/02/feed_dispenser",
                str(self.portions),
                hostname="192.168.1.100"
            )
        else:
            logger.info("No need to dispense food at this time.")


dispenser = AutomaticFoodDispenser()
