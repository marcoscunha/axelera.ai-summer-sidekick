from datetime import datetime
import time

from application.app.logger import logger
from application.models.system import ValueUnit


class BowlLevel:
    label = "Undefined"
    score = -1.0
    first_detection_time = datetime.now()
    last_detection_time = datetime.now()
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


class FountainlLevel:
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
    first_active_time: datetime = datetime.now()
    last_active_time: datetime = datetime.now()
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


class PlantHealth:
    label = "Unknown"
    score = 0.0
    first_detection_time = datetime.now()
    last_detection_time = datetime.now()
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
            self


class ApplicationState:
    def __init__(self):
        self.stream = None
        self.current_frame = None
        self.detections_history = []
        self.bowl_level = BowlLevel()
        self.pet_activity = PetActivity()
        self.fountain_level = FountainlLevel()
        self.plant_health = PlantHealth()
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
        self.automatic_food_dispenser_thread = None
        self.stop_inference = False
        self.model_handles = {
            "pet_tracker": self.model_handler_pet_tracker,
            "full_detections": self.model_handler_full_detections,
            "custom_detections": self.model_handler_custom_detections,
            "bowl_level": self.model_handler_bowl_level,
            "fountain_level": self.model_handler_fountain_level,
            "plant_health": self.model_handler_plant_health,
            "__core_temp__":  self.property_core_temp_handler,
            "__cpu_usage__": self.property_cpu_usage_handler,
            "__end_to_end_fps__": self.property_end_to_end_fps_handler,
        }

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
        pass
        # if hasattr(meta_obj, 'objects'):
        #     objects = meta_obj.objects
        #     for obj in objects:
        #         if hasattr(obj, 'label') and hasattr(obj, 'score'):
        #             if hasattr(obj.label, 'name'):
        #                 label = obj.label.name.lower()
        #             else:
        #                 label = str(obj.label).lower()
        #             score = (obj.score if hasattr(obj, 'score') else 1.0)

    def model_handler_bowl_level(self, meta_obj):
        if hasattr(meta_obj, 'objects'):
            objects = meta_obj.objects
            for obj in objects:
                if not hasattr(obj, 'label') or not hasattr(obj, 'score'):
                    continue

                self.bowl_level.update_label(obj.label.name.lower(), obj.score[0])

    def model_handler_fountain_level(self, meta_obj):
        if hasattr(meta_obj, 'objects'):
            objects = meta_obj.objects
            for obj in objects:
                if not hasattr(obj, 'label') or not hasattr(obj, 'score'):
                    continue

                self.fountain_level.update_label(obj.label.name.lower(), obj.score[0])

    def model_handler_plant_health(self, meta_obj):
        if hasattr(meta_obj, 'objects'):
            objects = meta_obj.objects
            for obj in objects:
                if not hasattr(obj, 'label') or not hasattr(obj, 'score'):
                    continue
                self.plant_health.update_label(obj.label.name.lower(), obj.score[0])

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

        except Exception as e:
            logger.error(f"Error analyzing detections: {e}")


# Global application state (true singleton as long as always imported from here)
app_state = ApplicationState()
