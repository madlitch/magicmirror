/* Magic Mirror
 * Node Helper: template_module
 *
 * By Massimo Albanese
 * MIT Licensed.
 */

const NodeHelper = require("node_helper");

// TODO documentation on node helper:
// TODO https://docs.magicmirror.builders/development/node-helper.html#available-module-instance-properties

module.exports = NodeHelper.create({
  // Override socketNotificationReceived method.

  /* socketNotificationReceived(notification, payload)
   * This method is called when a socket notification arrives.
   *
   * argument notification string - The identifier of the notification.
   * argument payload mixed - The payload of the notification.
   */
  socketNotificationReceived: function (notification, payload) {
    // log to program console
    if (notification === this.name + "LOG") {
      console.log(payload);
    }
  }
});
