/* MagicMirror² Test config default weather
 *
 * By fewieden https://github.com/fewieden
 * MIT Licensed.
 */
let config = {
	timeFormat: 12,

	modules: [
		{
			module: "weather",
			position: "bottom_bar",
			config: {
				location: "Munich",
				mockData: '"{"coord":{"lon":11.58,"lat":48.14},"weather":[{"id":615,"main":"Snow","description":"light rain and snow","icon":"13d"},{"id":500,"main":"Rain","description":"light rain","icon":"10d"}],"base":"stations","main":{"temp":1.49,"pressure":1005,"humidity":93.7,"temp_min":1,"temp_max":2},"visibility":7000,"wind":{"speed":11.8,"deg":250},"clouds":{"all":75},"dt":1547387400,"sys":{"type":1,"id":1267,"message":0.0031,"country":"DE","sunrise":1547362817,"sunset":1547394301},"id":2867714,"name":"Munich","cod":200}"'
			}
		}
	]
};

/*************** DO NOT EDIT THE LINE BELOW ***************/
if (typeof module !== "undefined") {
	module.exports = config;
}
