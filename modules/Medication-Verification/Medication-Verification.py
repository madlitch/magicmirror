import cv2
import mediapipe as mp
import sys

# MediaPipe setup
drawingModule = mp.solutions.drawing_utils
handsModule = mp.solutions.hands

# Initialize VideoCapture with the default camera 
cap = cv2.VideoCapture(0)

# Add confidence values and extra settings to MediaPipe hand tracking
with handsModule.Hands(static_image_mode=False, min_detection_confidence=0.7, min_tracking_confidence=0.7, max_num_hands=2) as hands:

    while True:
        # Capture frame from the camera
        ret, frame = cap.read()

        if not ret:
            print("Failed to capture frame from camera")
            break
        
        # Convert the color space from BGR to RGB
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Process the frame with MediaPipe Hands
        results = hands.process(frame_rgb)
        
        # Check if hands are detected
        if results.multi_hand_landmarks is not None:
            for handLandmarks in results.multi_hand_landmarks:
                # Draw landmarks and connections on the frame
                drawingModule.draw_landmarks(frame_rgb, handLandmarks, handsModule.HAND_CONNECTIONS)

                # Check if the hand is near the mouth based on specific landmarks
                thumb_tip = handLandmarks.landmark[handsModule.HandLandmark.THUMB_TIP]
                index_finger_tip = handLandmarks.landmark[handsModule.HandLandmark.INDEX_FINGER_TIP]

                # Calculate the distance between thumb tip and mouth
                thumb_mouth_distance = abs(thumb_tip.y - index_finger_tip.y)

                # Assuming that if the distance is less than a certain threshold, the hand is near the mouth
                if thumb_mouth_distance < 0.05:
                    print("Hand near the mouth!")
                    # Display green checkmark on the screen
                    checkmark = cv2.imread('green_checkmark.png')  # Load green checkmark image
                    cv2.imshow("Green Checkmark", checkmark)
                    cv2.waitKey(3000)  # Display the checkmark for 3 seconds
                    cv2.destroyAllWindows()  # Close the window
                    sys.exit()  # Exit the program

        # Display the frame
        cv2.imshow("Frame", frame_rgb)
        key = cv2.waitKey(1) & 0xFF

        # If 'q' is pressed, exit the loop
        if key == ord('q'):
            break

# Release resources
cap.release()
cv2.destroyAllWindows()