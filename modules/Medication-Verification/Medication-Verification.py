# Import necessary packages
import cv2
import mediapipe as mp
from picamera2 import Picamera2, Preview
import numpy as np
import libcamera

# MediaPipe setup
drawingModule = mp.solutions.drawing_utils
handsModule = mp.solutions.hands

# DIM=(2592, 1944)
# DIM=(640, 480)
SENSOR_DIM = (1164, 874)
# Desired output resolution
OUTPUT_DIM = (1164, 874)

# K=np.array([[342.9837584457945, 0.0, 314.25919634522825], [0.0, 342.44023085140554, 243.15271698598514], [0.0, 0.0, 1.0]])
# D=np.array([[-0.10714087202017064], [0.06859468860588519], [-0.08742521945007528], [0.04206839025686303]])

# Initialize Picamera2
picam2 = Picamera2()
preview_config = picam2.create_preview_configuration(main={"size": SENSOR_DIM})
# preview_config = picam2.create_preview_configuration(main={"size": (640, 480)})
preview_config["transform"] = libcamera.Transform(hflip=1, vflip=1)
picam2.configure(preview_config)
picam2.start()

# map1, map2 = cv2.fisheye.initUndistortRectifyMap(K, D, np.eye(3), K, DIM, cv2.CV_16SC2)

# Add confidence values and extra settings to MediaPipe hand tracking
with handsModule.Hands(static_image_mode=False, min_detection_confidence=0.5, min_tracking_confidence=0.5, max_num_hands=2) as hands:

    timeout = 60  # Set the timeout to 60 seconds
        max_retries = 3  # Maximum number of retries
        attempt = 0  # Initialize attempt counter

        while attempt < max_retries:
            attempt += 1  # Increment attempt counter
            start_time = time.time()  # Record the start time for each attempt
            retry = False  # Flag to track if retry is needed

            while True:
                # Capture frame from the camera
                frame = picam2.capture_array()

                if not frame:
                    print("Failed to capture frame from camera")
                    break

                # Convert the color space from BGR to RGB
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

                # Process the frame with MediaPipe Hands
                results = hands.process(frame_rgb)

                # Check if hands are detected
                if results.multi_hand_landmarks is not None:
                    for handLandmarks in results.multi_hand_landmarks:
                        # Check if the hand is near the mouth based on specific landmarks
                        thumb_tip = handLandmarks.landmark[handsModule.HandLandmark.THUMB_TIP]
                        index_finger_tip = handLandmarks.landmark[handsModule.HandLandmark.INDEX_FINGER_TIP]

                        # Calculate the distance between thumb tip and mouth
                        thumb_mouth_distance = abs(thumb_tip.y - index_finger_tip.y)

                        # Assuming that if the distance is less than a certain threshold, the hand is near the mouth
                        if thumb_mouth_distance < 0.05:
                            print("Hand near the mouth!")
                            sys.exit()  # Exit the program
                            retry = False  # Reset retry flag
                            break

                # Check if the timeout has been reached
                if time.time() - start_time > timeout:
                    print("Timeout reached. Retrying")
                    retry = True  # Set retry flag
                    break  # Exit the inner loop

                # Display the frame
                cv2.imshow("Frame", frame_rgb)
                key = cv2.waitKey(1) & 0xFF

                # If 'q' is pressed, exit the loop
                if key == ord('q'):
                    break

            if not retry:
                break  # Exit the retry loop if no retry is needed

        # Print "Hand not detected" if all retries are exhausted
        if attempt == max_retries:
            print("Hand not detected")
            sys.exit()  # Exit the program

# Release resources
picam2.stop()
cv2.destroyAllWindows()