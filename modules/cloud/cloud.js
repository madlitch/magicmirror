
Module.register("cloud", {
    defaults: {
        url: "0.0.0.0",
        port: "8081"
    },

    requiresVersion: "2.1.0",

    start: function () {
        // this.log("CLOUD MODULE STARTED ---------");
        Log.log("CLOUD MODULE STARTED ---------");
        this.sendNotification("CLOUD_UPDATE_MEDICATIONS", "payload");
    },

    log: function (data) {
        this.sendSocketNotification(this.name + "LOG", data);
    },

    notificationReceived: function (notification, payload, sender) {

        if (notification === "CLOUD_UPDATE_MEDICATIONS") {
            this.sendSocketNotification(this.name + "UPDATE_MEDICATIONS", payload);
        }

        if (notification === "CLOUD_PUSH_SESSION") {
            this.sendSocketNotification(this.name + "PUSH_SESSION", payload);
        }
    },

    socketNotificationReceived: function (notification, payload) {

    }
});
