from datetime import datetime

from application.app.application_state import app_state
from application.app.logger import logger
from application.helpers.socket import setup_socket_fix

from axelera.app import inf_tracers
from axelera.app import logging_utils
from axelera.app.stream import create_inference_stream


def inference_worker():
    """Background worker for inference processing"""
    setup_socket_fix()

    # Create tracers
    tracers = inf_tracers.create_tracers('core_temp', 'end_to_end_fps', 'cpu_usage')

    # Create inference stream
    stream = create_inference_stream(
        network="yolo11m-v1-coco-custom-cascade-tracker",
        sources=["usb:20"],
        log_level=logging_utils.INFO,
        tracers=tracers,
    )

    app_state.stream = stream
    app_state.system_running = True

    try:
        for frame_result in stream:
            if app_state.stop_inference:
                break

            app_state.current_frame = frame_result
            app_state.update_detection_metrics(frame_result)

            # Add to history (keep last 100 frames)
            detection_data = {
                'timestamp': datetime.now(),
                'frame_id': frame_result.stream_id,
                'objects': []
            }

            if frame_result.meta:
                try:
                    for key, meta_obj in frame_result.meta.items():
                        if hasattr(meta_obj, 'objects'):
                            for obj in meta_obj.objects:
                                obj_data = {
                                    'label': (obj.label.name if hasattr(obj.label, 'name')
                                              else str(obj.label)),
                                    'score': float(obj.score) if hasattr(obj, 'score') else 0.0,
                                    'bbox': obj.bbox if hasattr(obj, 'bbox') else None
                                }
                                detection_data['objects'].append(obj_data)
                except Exception as e:
                    logger.error(f"Error processing meta objects: {e}")

            app_state.detections_history.append(detection_data)
            if len(app_state.detections_history) > 100:
                app_state.detections_history.pop(0)

    except Exception as e:
        logger.error(f"Error in inference worker: {e}")
    finally:
        app_state.system_running = False
        if stream:
            stream.stop()
            stream.stop()
