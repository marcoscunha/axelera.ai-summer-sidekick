import socket

# from axelera.app import config
from axelera.app import display
from axelera.app import inf_tracers
from axelera.app import logging_utils
from axelera.app.stream import create_inference_stream

tracers = inf_tracers.create_tracers('core_temp', 'end_to_end_fps', 'cpu_usage')

orig_getaddrinfo = socket.getaddrinfo


def getaddrinfo_ipv4(host, port, family=0, type=0, proto=0, flags=0):
    return orig_getaddrinfo(host, port, socket.AF_INET, type, proto, flags)


socket.getaddrinfo = getaddrinfo_ipv4

stream = create_inference_stream(
    # network="yolo11m-v1-coco-custom",
    # network="mobilenetv2-imagenet-bowl",
    network="yolo11m-v1-coco-custom-cascade-tracker",
    # network="yolo11n-v1-coco-custom-cascade-tracker",
    # network="yolo11n-coco-onnx",
    # network="yolo11m-coco-onnx",
    # network="yolo11s-coco-onnx",
    sources=[
        # str(config.env.framework / "media/traffic1_1080p.mp4"),
        # str(config.env.framework / "media/traffic2_1080p.mp4")
        "usb:20",
        # "usb:23"
    ],
    log_level=logging_utils.INFO,  # INFO, DEBUG, TRACE
    tracers=tracers,
)


def main(window, stream):
    window.options(0, title="Traffic 1")
    # window.options(1, title="Traffic 2")

    # VEHICLE = ('car', 'truck', 'motorcycle')
    def center(box): return ((box[0] + box[2]) // 2, (box[1] + box[3]) // 2)

    for frame_result in stream:
        window.show(frame_result.image, frame_result.meta, frame_result.stream_id)
        print(f"Frame {frame_result}")
        print(f"=================================")
        # for det in frame_result.detections:
        # for bowl in frame_result:
        #     print(f"Detected bowl at {center(bowl.box)} with {bowl.score:.2f}")


with display.App(visible=True) as app:
    wnd = app.create_window("Business logic demo", (900, 600))
    app.start_thread(main, (wnd, stream), name='InferenceThread')
    app.run()
stream.stop()
