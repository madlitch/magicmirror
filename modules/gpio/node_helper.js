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

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = NodeHelper.create({

	start: function() {
		pins.push(new GPIOPin(1, 16)); //GPIO 23
		pins.push(new GPIOPin(2, 11)); //GPIO 17
		pins.push(new GPIOPin(3, 13)); //GPIO 27
		pins.push(new GPIOPin(4, 15)); //GPIO 22
		pins.push(new GPIOPin(5, 29)); //GPIO 5
		pins.push(new GPIOPin(6, 31)); //GPIO 6
		pins.push(new GPIOPin(7, 36)); //GPIO 16
		pins.push(new GPIOPin(8, 37)); //GP
	},

	alarm: false,

	async cyclePin(payload) {
		while (this.alarm) {
			await new Promise((resolve, reject) => {
				pins[7].write(true, async () => {
					await sleep(1000);
					pins[7].write(false, async () => {
						await sleep(1000);
						resolve();
					});
				});
			});
		}
		pins[7].write(true, async (pl) => {
			this.sendSocketNotification(this.name + "ALARM_SUCCESS");
		});
	},

	socketNotificationReceived: function(notification, payload) {

		if (notification === this.name + "PIN_WRITE") {
			console.log(payload);
			pins[payload.pin - 1].write(payload.state, (pl) => {
				this.sendSocketNotification(this.name + "WRITE_SUCCESS", pl);
			});
		} else if (notification === this.name + "PIN_TOGGLE") {
			pins[payload.pin - 1].write(!pins[payload.pin - 1].state, (pl) => {
				this.sendSocketNotification(this.name + "TOGGLE_SUCCESS", pl);
			});
		} else if (notification === this.name + "PIN_CYCLE") {
			pins[payload.pin - 1].write(true, (pl) => {
				sleep(250).then(() => {
					pins[payload.pin - 1].write(false, (pl) => {
						this.sendSocketNotification(this.name + "CYCLE_SUCCESS", pl);
					});
				});
			});
		} else if (notification === this.name + "START_CYCLE") {
			// Start the loop
			this.alarm = true;
			this.cyclePin(payload);
		} else if (notification === this.name + "STOP_CYCLE") {
			this.alarm = false;
		}

		if (notification === this.name + "LOG") {
			console.log(payload);
		}
	}
});
