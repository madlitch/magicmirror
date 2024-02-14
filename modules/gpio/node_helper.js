/* Magic Mirror
 * Node Helper: gpio
 *
 * By Massimo Albanese
 * MIT Licensed.
 */

const NodeHelper = require("node_helper");
const gpio = require("../../node_modules/rpi-gpio");

class GPIOPin {
	constructor(pinID, HWPin) {
		this.pinID = pinID;
		this.HWPin = HWPin;
		this.state = false; // false represents HIGH, true represents LOW, HIGH = OFF, LOW = ON
		this.setup();
	}

	setup() {
		gpio.setup(this.HWPin, gpio.DIR_HIGH, (err) => {
			if (err) {
				console.error("Error setting up pin", this.pinID, ":", err);
			} else {
				console.log("Pin", this.pinID, "set up as OUTPUT ");
			}
		});
	}

	write(state, callback) {
		gpio.write(this.HWPin, !state, (err) => {
			if (err) {
				console.error("Error writing to pin", this.pinID, ":", err);
			} else {
				this.state = state;
				console.log("Pin", this.pinID, "written to", state ? "ON (LOW)" : "OFF (HIGH)");
				callback({
					pinID: this.pinID,
					state: this.state
				});
			}
		});
	}
}

let pins = [];

module.exports = NodeHelper.create({

	start: function () {
		pins.push(new GPIOPin(0, 16)); //GPIO 23
		pins.push(new GPIOPin(1, 11)); //GPIO 17
		pins.push(new GPIOPin(2, 13)); //GPIO 27
		pins.push(new GPIOPin(3, 15)); //GPIO 22
		pins.push(new GPIOPin(4, 29)); //GPIO 5
		pins.push(new GPIOPin(5, 31)); //GPIO 6
		pins.push(new GPIOPin(6, 36)); //GPIO 16
		pins.push(new GPIOPin(7, 37)); //GP
	},

	socketNotificationReceived: function(notification, payload) {

		if (notification === this.name + "PIN_WRITE") {
			pins[payload.pin].write(payload.state, (pl) => {
				this.sendSocketNotification(this.name + "WRITE_SUCCESS", pl);
			});
		} else if (notification === this.name + "PIN_TOGGLE") {
			pins[payload.pin].write(!pins[payload.pin].state, (pl) => {
				this.sendSocketNotification(this.name + "WRITE_SUCCESS", pl);
			});
		}

		if (notification === this.name + "LOG") {
			console.log(payload);
		}
	}
});
