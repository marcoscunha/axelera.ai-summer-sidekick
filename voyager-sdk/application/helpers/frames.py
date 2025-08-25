import base64

from application.app.logger import logger
import cv2


# Helper functions
def frame_to_base64(frame_result):
    """Convert frame result to base64 encoded image"""
    try:
        if frame_result and frame_result.image is not None:
            # Convert image to BGR for OpenCV
            if hasattr(frame_result.image, 'asarray'):
                image_array = frame_result.image.asarray()
            else:
                image_array = np.array(frame_result.image)

            # Ensure the image is in the right format
            if len(image_array.shape) == 3:
                if image_array.shape[2] == 3:  # RGB
                    image_array = cv2.cvtColor(image_array, cv2.COLOR_RGB2BGR)
                elif image_array.shape[2] == 4:  # RGBA
                    image_array = cv2.cvtColor(image_array, cv2.COLOR_RGBA2BGR)

            # Encode image
            _, buffer = cv2.imencode('.jpg', image_array)
            img_base64 = base64.b64encode(buffer).decode('utf-8')
            return img_base64
    except Exception as e:
        logger.error(f"Error converting frame to base64: {e}")
    return None
    logger.error(f"Error converting frame to base64: {e}")
    return None
    logger.error(f"Error converting frame to base64: {e}")
    return None
