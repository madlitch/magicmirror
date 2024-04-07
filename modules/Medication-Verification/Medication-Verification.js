/* Magic Mirror
 * Module: Medication-Verification
 *
 * By Lyba Mughees
 * MIT Licensed.
 */

Module.register("Medication-Verification", {
	start: function() {
		console.log("Medication Verification module started...");
	},

	notificationReceived: function(notification, payload) {
		if (notification === "START_MEDICATION_VERIFICATION") {
			// Start the verification process by notifying the helper with the medication ID
			this.sendSocketNotification("START_MEDICATION_VERIFICATION", {
				medication_id: payload.medication_id,
				startTime: payload.startTime, // Pass the start time
				alarmTime: payload.alarmTime // Pass the alarm time
			});
			// this.sendNotification("GPIO_PIN_WRITE", { pin: 8, state: true });

		}

	},


	socketNotificationReceived: function(notification, payload) {
		if (notification === "VERIFY_MEDICATION_RESULT") {
			// Log the entire payload object
			console.log("Payload:", payload);

			// Access and log specific properties of the payload object
			console.log("Medication ID:", payload.medication_id);
			console.log("Success:", payload.success);
			console.log("Message:", payload.message);
			console.log("Start Time:", payload.startTime);
			console.log("Stop Time:", payload.stopTime);
			console.log("Alarm Time:", payload.alarmTime);

			// Prepare medication data object
			const medicationData = {
				medication_id: payload.medication_id,
				ingested: payload.success,
				start_time: payload.startTime,
				end_time: payload.stopTime
			};

			// Send medication data to the cloud
			this.sendNotification("CLOUD_PUSH_SESSION", {
				patient_id: "b6673aee-c9d8-11ee-8491-029e9cf81533",
				cabinet_id: "b45569c2-c9d9-11ee-8491-029e9cf81533",
				alarm_time: payload.alarmTime,
				start_time: payload.startTime,
				end_time: payload.stopTime,
				session_intakes: [medicationData]
			});

			// Send notification to the alarm module
			this.sendNotification("VERIFICATION_COMPLETE");
			// this.sendNotification("GPIO_PIN_WRITE", { pin: 8, state: false });
			console.log(medicationData);

		} else if (notification === "CLOUD_PUSH_SESSION_RESULT") {
			this.log(payload);
		} else if (notification === "MEDICATION_BOX_NUMBER") {
			// Handle the notification
			console.log("Received MEDICATION_BOX_NUMBER:", payload);
			this.sendNotification("GPIO_PIN_CYCLE", {
				pin: payload.boxNumber // Access boxNumber from payload
			});
			console.log("The box is:", payload.boxNumber); // Log boxNumber
		}
	},


	log: function(data) {
		this.sendSocketNotification("LOG", data);
	}
});
