const NodeHelper = require("node_helper");
const axios = require('axios');

const cloud_url = "http://0.0.0.0:8081";

const patient_id = "b6673aee-c9d8-11ee-8491-029e9cf81533";
const cabinet_id = "b45569c2-c9d9-11ee-8491-029e9cf81533";

module.exports = NodeHelper.create({

    start: function () {
        axios.post(`${cloud_url}/api/test`, {
            message: "Testing Connection"
        }).then(r => {
            console.log("Cloud Connection Successful");
        }).catch(function (error) {
            console.log("Connection to server failed");
            console.log(error.cause);
        });
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "LOG") {
            console.log(payload);
        }

        if (notification === "CLOUD_UPDATE_MEDICATIONS") {
            axios.post(`${cloud_url}/api/medication`, payload
            ).then(r => {
                this.sendSocketNotification("CLOUD_UPDATE_MEDICATIONS_RESULT", r.data)
            }).catch(function (error) {
                console.log(`${notification} failed:`);
                console.log(error.cause);
            });
        }

        if (notification === "CLOUD_PUSH_SESSION") {
            axios.post(`${cloud_url}/api/session`, payload
            ).then(r => {
                this.sendSocketNotification("CLOUD_PUSH_SESSION_RESULT", r.data)
            }).catch(function (error) {
                console.log(`${notification} failed:`);
                console.log(error.cause);
            });
        }

        if (notification === "CLOUD_PUSH_SCHEDULE") {
            axios.post(`${cloud_url}/api/schedule`, payload
            ).then(r => {
                this.sendSocketNotification("CLOUD_PUSH_SCHEDULE_RESULT", r.data)
            }).catch(function (error) {
                console.log(`${notification} failed:`);
                console.log(error.cause);
            });
        }

        if (notification === "CLOUD_SEARCH_MEDICATIONS") {
            axios.get(`${cloud_url}/api/search_medications/${payload}`)
                .then(r => {
                    this.sendSocketNotification("CLOUD_SEARCH_MEDICATIONS_RESULT", r.data)

                }).catch(function (error) {
                console.log(`${notification} failed:`);
                console.log(error.cause);
            });
        }

        if (notification === "CLOUD_GET_MEDICATION") {
            axios.get(`${cloud_url}/api/get_medication/${payload}`)
                .then(r => {
                    this.sendSocketNotification("CLOUD_GET_MEDICATION_RESULT", r.data)
                }).catch(function (error) {
                console.log(`${notification} failed:`);
                console.log(error.cause);
            });
        }
    }
});
