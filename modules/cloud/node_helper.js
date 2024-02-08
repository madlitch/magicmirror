const NodeHelper = require("node_helper");
const axios = require('axios');

// TODO documentation on node helper:
// TODO https://docs.magicmirror.builders/development/node-helper.html#available-module-instance-properties

module.exports = NodeHelper.create({

    start: function () {
        // console.log("CLOUD MODULE STARTED ---------");
        axios.post('http://0.0.0.0:8081/api/test', {
            message: "cloud working"
        }).then(r => {
            console.log(r.data);
        }).catch(function (error) {
            console.log("Connection to server failed");
            console.log(error.cause);
        });
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === this.name + "LOG") {
            console.log(payload);
        }

        if (notification === this.name + "UPDATE_MEDICATIONS") {
            axios.post('http://0.0.0.0:8081/api/medications', payload
            ).then(r => {
                console.log(r.data);
            }).catch(function (error) {
                console.log("Connection to server failed");
                console.log(error.cause);
            });
        }

        if (notification === this.name + "CLOUD_PUSH_SESSION") {
            axios.post('http://0.0.0.0:8081/api/test', {
                message: "cloud working"
            }).then(r => {
                console.log(r.data);
            }).catch(function (error) {
                console.log("Connection to server failed");
                console.log(error.cause);
            });
        }
    }
});
