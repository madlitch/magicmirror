/* global Module */

/* Magic Mirror
 * Module: gpio
 *
 * By Massimo Albanese
 * MIT Licensed.
 */

Module.register("gpio", {

	start: function() {
		this.sendSocketNotification(this.name + "SETUP");
	},

	log: function(data) {
		this.sendSocketNotification(this.name + "LOG", data);
	},

	notificationReceived: function(notification, payload, sender) {
		if (notification === "GPIO_PIN_TOGGLE") {
			this.sendSocketNotification(this.name + "PIN_TOGGLE", payload);
		} else if (notification === "GPIO_PIN_WRITE") {
			this.sendSocketNotification(this.name + "PIN_WRITE", payload);
		} else if (notification === "GPIO_PIN_CYCLE") {
			this.sendSocketNotification(this.name + "PIN_CYCLE", payload);
		} else if (notification === "MEDICATION_ALARM") {
			this.sendSocketNotification(this.name + "START_CYCLE", payload);
		} else if (notification === "ALARM_STOPPED") {
			this.sendSocketNotification(this.name + "STOP_CYCLE", payload);
		} else if (notification === "VERIFICATION_COMPLETE") {
			this.sendSocketNotification(this.name + "PIN_WRITE", { pin: 8, state: false });
		}
	},

	socketNotificationReceived: function(notification, payload) {
		if (notification === this.name + "WRITE_SUCCESS") {
			this.sendNotification(payload.state ? "GPIO_WRITE_ON_SUCCESS" : "GPIO_WRITE_OFF_SUCCESS", payload.pinID);
		}
	}
});
