/* Magic Mirror
 * Node Helper: Medication-Alarm_module
 *
 * By Lyba Mughees
 * MIT Licensed.
 */

const NodeHelper = require("node_helper");
const schedule = require("node-schedule");
const sqlite3 = require("sqlite3").verbose();

module.exports = NodeHelper.create({
  start: function () {
    console.log("Medication-Alarm helper started...");

  },

  
});
