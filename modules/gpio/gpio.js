/* global Module */

/* Magic Mirror
 * Module: gpio
 *
 * By Massimo Albanese
 * MIT Licensed.
 */

Module.register("gpio", {
	defaults: {
		demo: false
	},

	requiresVersion: "2.1.0", // Required version of MagicMirror

	start: function() {
		this.sendSocketNotification(this.name + "SETUP");
	},


	log: function(data) {
		this.sendSocketNotification(this.name + "LOG", data);
	},

	notificationReceived: function(notification, payload, sender) {

		if (notification === "SOLENOID_TOGGLE") {
			this.sendSocketNotification(this.name + "SOLENOID_WRITE", payload);
		}
	},

	socketNotificationReceived: function(notification, payload) {
		if (notification === "gpio-NOTIFICATION_TEST") {
		} else if (notification === "gpio-WRITE_SUCCESS") {
			this.sendNotification("hello", {
				"output": true
			});

			this.log(payload);
			this.log({state: payload.state});
		}
	}
});
