/* global Module */

/* Magic Mirror
 * Module: template_module
 *
 * By Massimo Albanese
 * MIT Licensed.
 */

// TODO read module documentation:
// TODO https://docs.magicmirror.builders/development/core-module-file.html#subclassable-module-methods

Module.register("template", {
  defaults: {},

  start: function () {},

  log: function (data) {
    this.sendSocketNotification(this.name + "LOG", data);
  },

  notificationReceived: function (notification, payload, sender) {
    if (sender) {
      this.log(
        this.name +
          " received a module notification: " +
          notification +
          " from sender: " +
          sender.name
      );
      Log.info(
        this.name +
          " received a module notification: " +
          notification +
          " from sender: " +
          sender.name
      );
    } else {
      this.log(this.name + " received a module notification: " + notification);
      Log.info(this.name + " received a system notification: " + notification);
    }
  },

  // socketNotificationReceived from node helper
  socketNotificationReceived: function (notification, payload) {
    Log.info(this.name);
    if (notification === "template_module-NOTIFICATION_TEST") {
      // set dataNotification
      this.dataNotification = payload;
      this.updateDom();
    }
  }
});
