import time

from application.app.application_state import app_state
from application.app.inference import inference_worker

# from axelera.app import config
from axelera.app import display


def test_app_state():
    print("System running:", app_state.system_running)
    print("Current frame:", app_state.current_frame)


def test_inference():
    global app_state

    with display.App(visible=True) as app:
        wnd = app.create_window("Business logic demo", (900, 600))
        app.start_thread(inference_worker, name='InferenceThread')

        wnd.options(0, title="CAM 1")

        # Wait until system is running
        while not app_state.system_running:
            time.sleep(1)

        while app_state.system_running:
            print(f"=================================")
            since_time = (app_state.bowl_level.last_detection_time -
                          app_state.bowl_level.first_detection_time).total_seconds()
            print(f"bowl_level")
            print(f"  label      : {app_state.bowl_level.label}")
            print(f"  score      : {app_state.bowl_level.score}")
            print(f"  last_time  : {app_state.bowl_level.last_detection_time.isoformat()}")
            print(f"  first_time : {app_state.bowl_level.first_detection_time.isoformat()}")
            print(f"  since      : {since_time} seconds")
            print(f"**********************************")
            since_time = (app_state.pet_activity.last_active_time -
                          app_state.pet_activity.first_active_time).total_seconds()
            print(f"pet_activity")
            print(f"  active     : {app_state.pet_activity.active}")
            print(f"  score      : {app_state.pet_activity.score}")
            print(f"  last_time  : {app_state.pet_activity.last_active_time.isoformat()}")
            print(f"  first_time : {app_state.pet_activity.first_active_time.isoformat()}")
            print(f"  since      : {since_time} seconds")
            print(f"**********************************")
            since_time = (app_state.fountain_level.last_detection_time -
                          app_state.fountain_level.first_detection_time).total_seconds()
            print(f"fountain_level")
            print(f"  label      : {app_state.fountain_level.label}")
            print(f"  score      : {app_state.fountain_level.score}")
            print(f"  last_time  : {app_state.fountain_level.last_detection_time.isoformat()}")
            print(f"  first_time : {app_state.fountain_level.first_detection_time.isoformat()}")
            print(f"  since      : {since_time} seconds")
            time.sleep(1)

        # def center(box): return ((box[0] + box[2]) // 2, (box[1] + box[3]) // 2)

        for frame_result in app_state.current_frames:
            wnd.show(frame_result.image, frame_result.meta, frame_result.stream_id)
            print(f"Frame {frame_result}")
            print(f"=================================")
            # for det in frame_result.detections:
            # for bowl in frame_result:
            #     print(f"Detected bowl at {center(bowl.box)} with {bowl.score:.2f}")


if __name__ == "__main__":
    test_app_state()
    test_inference()


# with display.App(visible=True) as app:
#     wnd = app.create_window("Business logic demo", (900, 600))
#     app.start_thread(main, (wnd), name='InferenceWorker')
#     app.run()
# stream.stop()
#     app.run()
# stream.stop()
# stream.stop()
# stream.stop()
# stream.stop()
# stream.stop()
# stream.stop()
# stream.stop()
