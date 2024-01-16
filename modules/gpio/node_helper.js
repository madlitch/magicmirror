/* Magic Mirror
 * Node Helper: gpio
 *
 * By Massimo Albanese
 * MIT Licensed.
 */

const NodeHelper = require("node_helper");
const gpio = require("rpi-gpio");

class GPIOPin {
	constructor(id, HWPin) {
		this.id = id;
		this.HWPin = HWPin;
		this.state = false; // false represents HIGH, true represents LOW, HIGH = OFF, LOW = ON
		this.setup();
	}

	setup() {
		gpio.setup(this.HWPin, gpio.DIR_HIGH, (err) => {
			if (err) {
				console.error("Error setting up pin", this.id, ":", err);
			} else {
				console.log("Pin", this.id, "set up as OUTPUT ");
			}
		});
	}

	write(state, callback) {
		gpio.write(this.HWPin, !state, (err) => {
			if (err) {
				console.error("Error writing to pin", this.id, ":", err);
			} else {
				this.state = state;
				console.log("Pin", this.id, "written to", state ? "ON (LOW)" : "OFF (HIGH)");
				callback({
					id: this.id,
					state: this.state
				});
			}
		});
	}

	toggle() {
		gpio.write(this.HWPin, !this.state, (err) => {
			if (err) {
				console.error("Error toggling pin", this.id, ":", err);
			} else {
				this.state = !this.state;
				console.log("Pin", this.id, "toggled to", this.state ? "ON (LOW)" : "OFF (HIGH)");
			}
		});
	}
}

let pin1 = new GPIOPin(1, 16);
let pin2 = new GPIOPin(2, 11);
let pin3 = new GPIOPin(3, 13);
let pin4 = new GPIOPin(4, 15);
let pin5 = new GPIOPin(5, 29);
let pin6 = new GPIOPin(6, 31);
let pin7 = new GPIOPin(7, 36);
let pin8 = new GPIOPin(8, 37);

module.exports = NodeHelper.create({

	socketNotificationReceived: function(notification, payload) {
		// console.log(payload);
		if (notification === this.name + "SETUP") {
			// this.setupAndWritePins(PINS);
		}

		if (notification === this.name + "SOLENOID_WRITE") {
			switch (payload.container) {
			case 1:
				pin1.write(!pin1.state, (pl) => {
					this.sendSocketNotification("gpio-WRITE_SUCCESS", pl);
				});
				break;
			case 2:
				pin2.write(!pin2.state);
				break;
			case 3:
				pin3.write(!pin3.state);
				break;
			case 4:
				pin4.write(!pin4.state);
				break;
			case 5:
				pin5.write(!pin5.state);
				break;
			case 6:
				pin6.write(!pin6.state);
				break;
			case 7:
				pin7.write(!pin7.state);
				break;
			case 8:
				pin8.write(!pin8.state);
				break;
			}
		}

		if (notification === this.name + "SOLENOID_TOGGLE") {

		}

		if (notification === this.name + "LOG") {
			console.log(payload);
		}
	}
});
