import time

from application.app.logger import logger


class ApplicationState:
    def __init__(self):
        self.stream = None
        self.current_frame = None
        self.detections_history = []
        self.pet_activity_level = 0.0
        self.bowl_fill_level = 0.0
        self.fountain_water_level = 0.0
        self.plant_health_status = "unknown"
        self.water_solenoid_states = {"solenoid_1": False, "solenoid_2": False}
        self.system_running = False
        self.frame_count = 0
        self.fps = 0.0
        self.last_frame_time = time.time()
        self.connected_clients = set()
        self.inference_thread = None
        self.stop_inference = False

    def update_detection_metrics(self, frame_result):
        """Update application metrics based on detection results"""
        if not frame_result or not frame_result.meta:
            return

        current_time = time.time()

        # Calculate FPS
        if self.last_frame_time:
            self.fps = 1.0 / max(current_time - self.last_frame_time, 0.001)
        self.last_frame_time = current_time
        self.frame_count += 1

        # Analyze detections for specific objects
        try:
            # Look for detections in the meta data
            for key, meta_obj in frame_result.meta.items():
                if hasattr(meta_obj, 'objects'):
                    objects = meta_obj.objects

                    # Analyze different object types
                    pet_activity = 0
                    bowl_objects = []
                    fountain_objects = []
                    plant_objects = []

                    for obj in objects:
                        if hasattr(obj, 'label') and hasattr(obj, 'score'):
                            if hasattr(obj.label, 'name'):
                                label = obj.label.name.lower()
                            else:
                                label = str(obj.label).lower()
                            score = (obj.score if hasattr(obj, 'score')
                                     else 1.0)

                            # Pet activity detection
                            pet_types = ['cat', 'dog', 'pet', 'animal']
                            if any(pet_type in label for pet_type in pet_types):
                                pet_activity += score

                            # Bowl detection
                            elif 'bowl' in label:
                                bowl_objects.append(obj)

                            # Water fountain detection
                            elif any(water_term in label
                                     for water_term in ['fountain', 'water',
                                                        'dispenser']):
                                fountain_objects.append(obj)

                            # Plant health detection
                            elif any(plant_term in label
                                     for plant_term in ['plant', 'leaf',
                                                        'flower',
                                                        'vegetation']):
                                plant_objects.append(obj)

                    # Update metrics
                    self.pet_activity_level = min(pet_activity, 1.0)

                    # Estimate bowl fill level based on detection confidence and size
                    if bowl_objects:
                        avg_confidence = sum(obj.score for obj in bowl_objects) / len(bowl_objects)
                        self.bowl_fill_level = avg_confidence

                    # Estimate fountain water level
                    if fountain_objects:
                        fountain_confidence = sum(obj.score for obj in fountain_objects)
                        avg_confidence = fountain_confidence / len(fountain_objects)
                        self.fountain_water_level = avg_confidence

                    # Assess plant health
                    if plant_objects:
                        avg_health = sum(obj.score for obj in plant_objects) / len(plant_objects)
                        if avg_health > 0.8:
                            self.plant_health_status = "healthy"
                        elif avg_health > 0.5:
                            self.plant_health_status = "moderate"
                        else:
                            self.plant_health_status = "poor"

        except Exception as e:
            logger.error(f"Error analyzing detections: {e}")


# Global application state
app_state = ApplicationState()
app_state = ApplicationState()
app_state = ApplicationState()
