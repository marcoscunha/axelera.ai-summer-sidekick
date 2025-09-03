from datetime import datetime
import time

from application.app.logger import logger
from application.models.system import ValueUnit


class BowlLevel:
    label = "Undefined"
    score = -1.0
    last_detection_time = datetime.now()
    first_detection_time = datetime.now()
    _diff_count = 0  # hysteresis counter

    def update_label(self, label, score=1.0):
        self.last_detection_time = datetime.now()
        if label != self.label:
            self._diff_count += 1
            if self._diff_count >= 30:
                self.first_detection_time = self.last_detection_time
                self.label = label
                self.score = score
                self._diff_count = 0
        else:
            self.score = score
            self._diff_count = 0


class PetActivity:
    active: bool = False
    score: float = 0.0
    last_active_time: datetime = datetime.now()
    first_active_time: datetime = datetime.now()
    _diff_count = 0

    def update_activity(self, has_cat, score=1.0):
        if has_cat != self.active:
            self._diff_count += 1
            if self._diff_count >= 30:
                if has_cat:
                    # Becoming active
                    self.active = True
                    self.last_active_time = datetime.now()
                    self.first_active_time = self.last_active_time
                else:
                    # Becoming inactive
                    self.active = False

                self.score = score
                self._diff_count = 0
        else:
            if self.active:
                self.last_active_time = datetime.now()
            self.score = score
            self._diff_count = 0


class AutomaticFoodDispenser:
    last_activity_time = 0
    dispense_interval = 3600  # seconds


class ConsolidatePetActivity:
    pass


class ApplicationState:
    def __init__(self):
        self.stream = None
        self.current_frame = None
        self.detections_history = []
        self.pet_activity = PetActivity()
        self.fountain_water_level = 0.0
        self.plant_health_status = "unknown"
        self.water_solenoid_states = {"solenoid_1": False, "solenoid_2": False}
        self.system_running = False
        self.frame_count = 0
        self.fps = ValueUnit(**{"value": 0.0, "unit": "fps"})
        self.core_temp = ValueUnit(**{"value": 0.0, "unit": "C"})
        self.cpu_usage = ValueUnit(**{"value": 0.0, "unit": "%"})
        self.last_frame_time = time.time()
        self.connected_clients = set()
        self.inference_thread = None
        self.stop_inference = False
        self.model_handles = {
            "pet_tracker": self.model_handler_pet_tracker,
            "full_detections": self.model_handler_full_detections,
            "custom_detections": self.model_handler_custom_detections,
            "bowl_level": self.model_handler_bowl_level,
            "__core_temp__":  self.property_core_temp_handler,
            "__cpu_usage__": self.property_cpu_usage_handler,
            "__end_to_end_fps__": self.property_end_to_end_fps_handler,
        }
        self.bowl_level = BowlLevel()

    def property_core_temp_handler(self, meta_obj):
        self.core_temp = ValueUnit(**{"value": meta_obj.value, "unit": meta_obj.unit})

    def property_cpu_usage_handler(self, meta_obj):
        self.cpu_usage = ValueUnit(**{"value": meta_obj.value, "unit": meta_obj.unit})

    def property_end_to_end_fps_handler(self, meta_obj):
        self.fps = ValueUnit(**{"value": meta_obj.value, "unit": meta_obj.unit})

    def model_handler_pet_tracker(self, meta_obj):
        pass

    def model_handler_full_detections(self, meta_obj):
        has_cat = False
        cat_score = 0.0
        cat_label = None
        if hasattr(meta_obj, 'objects'):
            objects = meta_obj.objects
            for obj in objects:

                if hasattr(obj, 'label') and hasattr(obj, 'score'):
                    if hasattr(obj.label, 'name'):
                        label = obj.label.name.lower()
                    else:
                        label = str(obj.label).lower()
                    score = (obj.score if hasattr(obj, 'score') else 1.0)

                if label == 'cat' and not has_cat:
                    has_cat = True
                    cat_score = score

            self.pet_activity.update_activity(has_cat, cat_score)

    def model_handler_custom_detections(self, meta_obj):
        if hasattr(meta_obj, 'objects'):
            objects = meta_obj.objects
            for obj in objects:
                if hasattr(obj, 'label') and hasattr(obj, 'score'):
                    if hasattr(obj.label, 'name'):
                        label = obj.label.name.lower()
                    else:
                        label = str(obj.label).lower()
                    score = (obj.score if hasattr(obj, 'score') else 1.0)

    def model_handler_bowl_level(self, meta_obj):
        if hasattr(meta_obj, 'objects'):
            objects = meta_obj.objects
            for obj in objects:
                if not hasattr(obj, 'label') or not hasattr(obj, 'score'):
                    continue

                self.bowl_level.update_label(obj.label.name.lower(), obj.score[0])

    def handle_model_results(self, frame_result):
        """Update application metrics based on detection results"""
        if not frame_result or not frame_result.meta:
            return

        self.frame_count += 1

        # Analyze detections for specific objects
        try:
            # Look for detections in the meta data
            for key, meta_obj in frame_result.meta.items():
                if key not in self.model_handles:
                    continue

                model_handler = self.model_handles.get(key)
                model_handler(meta_obj)

                if not hasattr(meta_obj, '_secondary_metas'):
                    continue
                if len(meta_obj._secondary_metas) == 0:
                    continue

                for sec_key, sec_meta_obj in meta_obj._secondary_metas.items():
                    model_handler = self.model_handles.get(sec_key)
                    model_handler(sec_meta_obj[0])

                # Check Secondary models

                # if hasattr(meta_obj, 'objects'):

                #     objects = meta_obj.objects

                # Analyze different object types
                # pet_activity = 0
                # custom_bowl_objects = []
                # bowl_levels = []
                # fountain_objects = []
                # plant_objects = []

                # for obj in objects:
                #     if hasattr(obj, 'label') and hasattr(obj, 'score'):
                #         if hasattr(obj.label, 'name'):
                #             label = obj.label.name.lower()
                #         else:
                #             label = str(obj.label).lower()
                #         score = (obj.score if hasattr(obj, 'score')
                #                  else 1.0)

                #         # Pet activity detection
                #         pet_types = ['cat']
                #         if any(pet_type in label for pet_type in pet_types):
                #             pet_activity += score

                #         # Bowl detection
                #         elif 'bowl' in label:
                #             bowl_objects.append(obj)

                #         # Water fountain detection
                #         elif any(water_term in label
                #                  for water_term in ['fountain', 'water',
                #                                     'dispenser']):
                #             fountain_objects.append(obj)

                #         # Plant health detection
                #         elif any(plant_term in label
                #                  for plant_term in ['plant', 'leaf',
                #                                     'flower',
                #                                     'vegetation']):
                #             plant_objects.append(obj)

                # # Update metrics
                # self.pet_activity_level = min(pet_activity, 1.0)

                # # Estimate bowl fill level based on detection confidence and size
                # if bowl_objects:
                #     avg_confidence = sum(obj.score for obj in bowl_objects) / len(bowl_objects)
                #     self.bowl_fill_level = avg_confidence

                # # Estimate fountain water level
                # if fountain_objects:
                #     fountain_confidence = sum(obj.score for obj in fountain_objects)
                #     avg_confidence = fountain_confidence / len(fountain_objects)
                #     self.fountain_water_level = avg_confidence

                # # Assess plant health
                # if plant_objects:
                #     avg_health = sum(obj.score for obj in plant_objects) / len(plant_objects)
                #     if avg_health > 0.8:
                #         self.plant_health_status = "healthy"
                #     elif avg_health > 0.5:
                #         self.plant_health_status = "moderate"
                #     else:
                #         self.plant_health_status = "poor"

        except Exception as e:
            logger.error(f"Error analyzing detections: {e}")


# Global application state (true singleton as long as always imported from here)
app_state = ApplicationState()
app_state = ApplicationState()
