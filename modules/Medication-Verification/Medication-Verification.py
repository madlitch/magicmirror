# Import necessary packages
import mediapipe
import cv2

# Use MediaPipe to draw the hand framework over the top of hands it identifies in Real-Time
drawingModule = mediapipe.solutions.drawing_utils
handsModule = mediapipe.solutions.hands

# Use CV2 functionality to create a video stream and add some values
cap = cv2.VideoCapture(0)
fourcc = cv2.VideoWriter_fourcc('m', 'p', '4', 'v')

# Add confidence values and extra settings to MediaPipe hand tracking
with handsModule.Hands(static_image_mode=False, min_detection_confidence=0.7, min_tracking_confidence=0.7, max_num_hands=2) as hands:

    # Create an infinite loop for the live feed
    while True:
        ret, frame = cap.read()

        # Resize the frame for better performance
        frame = cv2.resize(frame, (640, 480))

        # Produce the hand framework overlay on top of the hand
        results = hands.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))

        # Check if hands are detected
        if results.multi_hand_landmarks is not None:
            for handLandmarks in results.multi_hand_landmarks:
                # Draw landmarks and connections on the frame
                drawingModule.draw_landmarks(frame, handLandmarks, handsModule.HAND_CONNECTIONS)

                # Check if the hand is near the mouth based on specific landmarks
                thumb_tip = handLandmarks.landmark[handsModule.HandLandmark.THUMB_TIP]
                index_finger_tip = handLandmarks.landmark[handsModule.HandLandmark.INDEX_FINGER_TIP]

                # Calculate the distance between thumb tip and mouth
                thumb_mouth_distance = abs(thumb_tip.y - index_finger_tip.y)

                # Assuming that if the distance is less than a certain threshold, the hand is near the mouth
                if thumb_mouth_distance < 0.05:
                    print("Hand near the mouth!")

        # Display the current frame
        cv2.imshow("Medication Intake Verification", frame)
        key = cv2.waitKey(1) & 0xFF

        # If 'q' is pressed on the keyboard, stop the system
        if key == ord("q"):
            break