/* MagicMirror² Config Sample
 *
 * By Michael Teeuw https://michaelteeuw.nl
 * MIT Licensed.
 *
 * For more information on how you can configure this file
 * see https://docs.magicmirror.builders/configuration/introduction.html
 * and https://docs.magicmirror.builders/modules/configuration.html
 *
 * You can use environment variables using a `config.js.template` file instead of `config.js`
 * which will be converted to `config.js` while starting. For more information
 * see https://docs.magicmirror.builders/configuration/introduction.html#enviromnent-variables
 */
let config = {
	address: "localhost",	// Address to listen on, can be:
	// - "localhost", "127.0.0.1", "::1" to listen on loopback interface
	// - another specific IPv4/6 to listen on a specific interface
	// - "0.0.0.0", "::" to listen on any interface
	// Default, when address config is left out or empty, is "localhost"
	port: 8080,
	basePath: "/",			// The URL path where MagicMirror² is hosted. If you are using a Reverse proxy
	// you must set the sub path here. basePath must end with a /
	// ipWhitelist: ["127.0.0.1", "::ffff:127.0.0.1", "::1"],	// Set [] to allow all IP addresses
	ipWhitelist: [],	// Set [] to allow all IP addresses
	// or add a specific IPv4 of 192.168.1.5 :
	// ["127.0.0.1", "::ffff:127.0.0.1", "::1", "::ffff:192.168.1.5"],
	// or IPv4 range of 192.168.3.0 --> 192.168.3.15 use CIDR format :
	// ["127.0.0.1", "::ffff:127.0.0.1", "::1", "::ffff:192.168.3.0/28"],

	useHttps: false, 		// Support HTTPS or not, default "false" will use HTTP
	httpsPrivateKey: "", 	// HTTPS private key path, only require when useHttps is true
	httpsCertificate: "", 	// HTTPS Certificate path, only require when useHttps is true

	language: "en",
	locale: "en-US",
	logLevel: ["INFO", "LOG", "WARN", "ERROR", "DEBUG"], // Add "DEBUG" for even more logging
	timeFormat: 24,
	units: "metric",
	electronOptions: {
		fullscreen: false,
		resizeable: false
	},
	modules: [
		{
			module: "alert"
		},
		{
			module: "clock",
			position: "top_left"
		},
		{
			module: "cloud"
		},
		{
			module: "weather",
			position: "top_right",
			header: "Weather Forecast",
			config: {
				weatherProvider: "envcanada",
				type: "forecast",
				siteCode: "s0000707",
				provCode: "ON",
				location: "Oshawa, ON"
			}
		},
		{
			module: "Medication-Input",
			position: "middle_center",
			config: {
				text: ""
			}
			// header: "Medication Input"
		},
		{
			module: "Medication-Management"
		},
		{
			module: "Medication-Scheduler",
			position: "middle_center"
		},
		{
			module: "Medication-Verification"
		},
		{
			module: "Medication-Alarm",
			position: "middle_center"
		},
		{
			module: "MMM-Cursor",
			config: {
				timeout: 50
			}
		},
		{
			module: "gpio",
		},
		{
			module: "MMM-ModuleToggle",
			config: {
				// hide: ["Medication-Input", "MMM-TouchButton", "MMM-ViewNotifications", "Medication-Scheduler"],
				hide: ["Medication-Input", "MMM-TouchButton", "Medication-Scheduler"],
				speed: 0
			}
		},
		// {
		// 	module: "MMM-TouchButton-Unlock",
		// 	position: "bottom_right",
		// 	config: {
		// 		classes: "scale-4x",
		// 		buttons: [
		// 			{
		// 				name: "Unlock",
		// 				icon: "fluent:person-lock-24-filled",
		// 				notification: "MODULE_TOGGLE",
		// 				payload: { hide: ["MMM-TouchButton-Unlock"], show: ["Medication-Input", "MMM-TouchButton", "MMM-ViewNotifications", "MMM-TouchButton-Lock"], toggle:[] }
		// 			},
		// 		]
		// 	}
		// },
		{
			module: "MMM-TouchButton-Lock",
			position: "bottom_right",
			config: {
				classes: "scale-4x",
				buttons: [
					{
						name: "Unlock",
						icon: "fluent:person-lock-24-filled",
						notification: "MODULE_TOGGLE",
						// payload: { hide: ["Medication-Input", "MMM-TouchButton", "MMM-ViewNotifications",  "MMM-TouchButton-Lock"], show: ["MMM-TouchButton-Unlock"], toggle:[] }
						payload: { hide: [], show: [], toggle:["Medication-Input"] }
						// payload: { hide: [], show: [], toggle:["Medication-Input", "MMM-ViewNotifications"] }
					},
				]
			}
		},
		{
			module: "MMM-TouchButton",
			position: "bottom_center",
			config: {
				classes: "scale-3x",
				buttons: [
					{
						name: "Solenoid_1",
						icon: "icon-park-solid:one-key",
						notification: "GPIO_PIN_CYCLE",
						payload: { pin: 1 }
					},
					{
						name: "Solenoid_2",
						icon: "icon-park-solid:two-key",
						notification: "GPIO_PIN_CYCLE",
						payload: { pin: 2 }
					},
					{
						name: "Solenoid_3",
						icon: "icon-park-solid:three-key",
						notification: "GPIO_PIN_CYCLE",
						payload: { pin: 3 }
					},
					{
						name: "Solenoid_4",
						icon: "icon-park-solid:four-key",
						notification: "GPIO_PIN_CYCLE",
						payload: { pin: 4 }
					},
					{
						name: "Solenoid_5",
						icon: "icon-park-solid:five-key",
						notification: "GPIO_PIN_CYCLE",
						payload: { pin: 5 }
					},
					{
						name: "Solenoid_6",
						icon: "icon-park-solid:six-key",
						notification: "GPIO_PIN_CYCLE",
						payload: { pin: 6 }
					},
					{
						name: "Solenoid_7",
						icon: "icon-park-solid:seven-key",
						notification: "GPIO_PIN_CYCLE",
						payload: { pin: 7 }
					},
					{
						name: "Solenoid_8",
						icon: "mingcute:light-fill",
						notification: "GPIO_PIN_TOGGLE",
						payload: { pin: 8 }
					}
				]
			}
		},
		{
			module: "MMM-ViewNotifications",
			position: "top_left",
			config: {
				text: ""
			}
		}
	]
};

/*************** DO NOT EDIT THE LINE BELOW ***************/
if (typeof module !== "undefined") {
	module.exports = config;
}
