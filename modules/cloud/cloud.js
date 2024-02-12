
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
            this.sendSocketNotification("CLOUD_UPDATE_MEDICATIONS", payload);
        }

        if (notification === "CLOUD_PUSH_SESSION") {
            this.sendSocketNotification("CLOUD_PUSH_SESSION", payload);
        }

        if (notification === "CLOUD_PUSH_SCHEDULE") {
            this.sendSocketNotification("CLOUD_PUSH_SCHEDULE", payload);
        }

        if (notification === "CLOUD_SEARCH_MEDICATIONS") {
            this.sendSocketNotification("CLOUD_SEARCH_MEDICATIONS", payload);
        }

        if (notification === "CLOUD_GET_MEDICATION") {
            this.sendSocketNotification("CLOUD_GET_MEDICATION", payload);
        }
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "CLOUD_UPDATE_MEDICATIONS_RESULT") {
            this.sendNotification("CLOUD_UPDATE_MEDICATIONS_RESULT", payload);
        }

        if (notification === "CLOUD_PUSH_SESSION_RESULT") {
            this.sendSocketNotification("CLOUD_PUSH_SESSION_RESULT", payload);
        }

        if (notification === "CLOUD_PUSH_SESSION_RESULT") {
            this.sendNotification("CLOUD_PUSH_SESSION_RESULT", payload);
        }

        if (notification === "CLOUD_SEARCH_MEDICATIONS_RESULT") {
            this.sendNotification("CLOUD_SEARCH_MEDICATIONS_RESULT", payload);
        }

        if (notification === "CLOUD_GET_MEDICATION_RESULT") {
            this.sendNotification("CLOUD_GET_MEDICATION_RESULT", payload);
        }
    }
});
