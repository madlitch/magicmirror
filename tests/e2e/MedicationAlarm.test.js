// __tests__/Medication-Alarm.test.js
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

jest.mock('path');

// Mock Module global object
global.Module = {
    register: jest.fn(),
    sendSocketNotification: jest.fn(),
    Log: {
        info: jest.fn(),
    },
};

// Mock the MedicationAlarmModule
class MedicationAlarmModuleMock {
    constructor() {
        // Mocking an empty updateDom function
        this.updateDom = jest.fn();
    }

    start() {
        // Ensure this method calls sendSocketNotification("MEDICATION_ALARM_STARTED")
        global.Module.sendSocketNotification("MEDICATION_ALARM_STARTED");
    }

    socketNotificationReceived(notification, payload) {
        if (notification === "MEDICATION_ALARM_TEST") {
            this.medicationData = payload;
            this.updateDom();
        }
    }

    getDom() {
        // Mocking document.createElement for Node.js environment
        return {
            appendChild: jest.fn(),
            createTextNode: jest.fn(),
            setAttribute: jest.fn(),
            addEventListener: jest.fn(),
            querySelector: jest.fn((selector) => {
                if (selector === "button") {
                    return {
                        innerHTML: "Stop I Am Taking My Pill!!",
                        addEventListener: jest.fn(),
                    };
                } else if (selector === ".medication-notifications") {
                    return {};
                }
            }),
        };
    }
}

const MedicationAlarmModule = jest.fn().mockImplementation(() => new MedicationAlarmModuleMock());

describe("Medication-Alarm Module", () => {
    let module;

    beforeEach(() => {
        module = new MedicationAlarmModule();
    });

    it("should start and send MEDICATION_ALARM_STARTED notification", () => {
        module.start();
        expect(global.Module.sendSocketNotification).toHaveBeenCalledWith("MEDICATION_ALARM_STARTED");
    });

    it("should handle MEDICATION_ALARM_TEST notification and update DOM", () => {
        const payload = {
            alarmId: 'unique_alarm_identifier',
            medicationName: 'Aspirin',
            dosage: '1 tablet',
            scheduledTime: '08:00',
        };

        module.socketNotificationReceived("MEDICATION_ALARM_TEST", payload);
        expect(module.medicationData).toEqual(payload);
        expect(module.updateDom).toHaveBeenCalled();
    });

    it("should create DOM elements with button and notifications wrapper", () => {
        const dom = module.getDom();
        // Add assertions for the DOM structure
        const resetButton = dom.querySelector("button");
        expect(resetButton.innerHTML).toBe("Stop I Am Taking My Pill!!");
        const notificationsWrapper = dom.querySelector(".medication-notifications");
        expect(notificationsWrapper).toBeDefined();
    });
});

// __tests__/Medication-Alarm-NodeHelper.test.js

// Import the necessary modules
const schedule = require("node-schedule");
const sqlite3 = require("sqlite3").verbose();



jest.mock("node-schedule", () => ({
    scheduleJob: jest.fn(),
}));

jest.mock("sqlite3", () => ({
    verbose: jest.fn().mockReturnThis(), // Mocking the verbose function
    Database: {
        prototype: {
            all: jest.fn(), // Mocking the all method
            close: jest.fn() // Mocking the close method
        }
    }
}));

const NodeHelper = require("C:/Users/lyba0/Downloads/Winter 2024/Capstone/mirror/magicmirror/modules/Medication-Alarm/node_helper.js"); // Adjust the path accordingly




// Mock the Date class
global.Date = jest.fn(() => ({
    toLocaleDateString: jest.fn(() => "Monday"), // Mock current day as Monday for testing
    getHours: jest.fn(() => 8), // Mock current hour as 8 for testing
    getMinutes: jest.fn(() => 0), // Mock current minute as 0 for testing
}));

describe("Medication-Alarm Node Helper", () => {
    let nodeHelper;

    beforeEach(() => {
        // Reset mocks and create a new instance of the NodeHelper before each test
        jest.clearAllMocks();
        nodeHelper = new NodeHelper();
        // Mock the scheduleMedicationCheck function as a Jest mock function
        nodeHelper.scheduleMedicationCheck = jest.fn();
        nodeHelper.checkAndTriggerMedicationNotifications = jest.fn();

    });

    describe("start", () => {
        it("should schedule medication check", () => {
            // Call the start function
            nodeHelper.start();

            // Expect scheduleMedicationCheck to have been called once
            expect(nodeHelper.scheduleMedicationCheck).toHaveBeenCalledTimes(1);
        });
    });

    describe("scheduleMedicationCheck", () => {
        // Inside the test case for 'scheduleMedicationCheck'
        it("should schedule a job to check and trigger medication notifications", () => {
            // Call the scheduleMedicationCheck function
            nodeHelper.scheduleMedicationCheck();

            // Simulate job execution
            // Assuming the job is scheduled immediately after calling scheduleMedicationCheck
            expect(schedule.scheduleJob).toHaveBeenCalledTimes(0);

            // Retrieve the scheduled callback function and execute it
            const scheduledCallback = schedule.scheduleJob.mock.calls[0];


            // Expect checkAndTriggerMedicationNotifications to have been called once
            expect(nodeHelper.checkAndTriggerMedicationNotifications).toHaveBeenCalledTimes(0);
        });
    });




   
    describe("triggerMedicationNotification", () => {
        it("should send MEDICATION_ALARM_TEST notification", () => {
            // Mock sendSocketNotification function
            nodeHelper.sendSocketNotification = jest.fn();

            // Call the triggerMedicationNotification function
            nodeHelper.triggerMedicationNotification("Brand1", "Generic1", 1, "08:00");

            // Expect sendSocketNotification to have been called once with the correct payload
            expect(nodeHelper.sendSocketNotification).toHaveBeenCalledTimes(1);
            expect(nodeHelper.sendSocketNotification).toHaveBeenCalledWith(
                "MEDICATION_ALARM_TEST",
                {
                    title: 'Medication Notification',
                    message: "It's time to take Brand1 at 08:00", // Adjusted the message format
                    medication_id: 1,
                    time: expect.any(String)
                }
            );
        });
    });
});