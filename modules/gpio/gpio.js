/* global Module */

/* Magic Mirror
 * Module: gpio
 *
 * By Massimo Albanese
 * MIT Licensed.
 */

Module.register("gpio", {
	defaults: {
		mock: false
	},

	start: function() {
		if (this.config.mock) {
			this.log("GPIO Loaded in MOCK mode");
		} else {
			this.sendSocketNotification(this.name + "SETUP");
		}
	},

	log: function(data) {
		this.sendSocketNotification(this.name + "LOG", data);
	},

	notificationReceived: function(notification, payload, sender) {
		if (this.config.mock) {
			if (notification === "GPIO_PIN_TOGGLE" || notification === "GPIO_PIN_WRITE") {
				this.sendNotification("GPIO_MOCK_NOTIFICATION_RECEIVED", payload);
				this.log("GPIO_MOCK_NOTIFICATION_RECEIVED");
				this.log(payload);
			}
		} else {
			if (notification === "GPIO_PIN_TOGGLE") {
				this.sendSocketNotification(this.name + "PIN_TOGGLE", payload);
			} else if (notification === "GPIO_PIN_WRITE") {
				this.sendSocketNotification(this.name + "PIN_WRITE", payload);
			}
		}
	},

	socketNotificationReceived: function(notification, payload) {
		if (notification === this.name + "WRITE_SUCCESS") {
			this.sendNotification(payload.state ? "GPIO_WRITE_ON_SUCCESS" : "GPIO_WRITE_OFF_SUCCESS", payload.pinID);
		}
	}
});
