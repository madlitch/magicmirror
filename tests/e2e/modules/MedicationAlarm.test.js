jest.mock("path");

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
            alarmId: 'unique_alarm_identifier', // Unique identifier for the medication alarm
            medicationName: 'Aspirin',           // Name of the medication
            dosage: '1 tablet',                  // Dosage information
            scheduledTime: '08:00 AM',           // Scheduled time for the medication alarm
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

jest.mock("axios", () => ({
    get: jest.fn(() => Promise.resolve({ data: { results: [] } })),
}));

const mockDatabase = {
    run: jest.fn(),
    close: jest.fn(),
    all: jest.fn(),
};

jest.mock('sqlite3', () => ({
    verbose: jest.fn(() => ({
        Database: jest.fn(() => mockDatabase)
    }))
}));

// Import the 'node-schedule' module
const scheduleMock = require('node-schedule');

// Mock the module
jest.mock('node-schedule', () => ({
    scheduleJob: jest.fn(),
}));

const MedicationAlarmNodeHelper = require("C:/Users/lyba0/Downloads/Fall23/Capstone/capstone/magicmirror/modules/Medication-Alarm/node_helper.js");

describe("Medication-Alarm NodeHelper", () => {
    let nodeHelper;

    beforeEach(() => {
        nodeHelper = new MedicationAlarmNodeHelper();

        // Mock the 'io' object
        nodeHelper.io = {
            of: jest.fn().mockReturnValue({
                emit: jest.fn(),
            }),
        };

        // Mock the 'sendSocketNotification' function
        jest.spyOn(nodeHelper, 'sendSocketNotification');
    });

    it("should start without errors", () => {
        expect(() => nodeHelper.start()).not.toThrow();
    });

    it("should handle MEDICATION_ALARM_TEST notification", () => {
        const medicationAlarmTestPayload = {
            alarmId: "unique_alarm_identifier",
            medicationName: "Aspirin",
            dosage: "1 tablet",
            scheduledTime: "08:00 AM",
        };

        nodeHelper.socketNotificationReceived("MEDICATION_ALARM_TEST", medicationAlarmTestPayload);

        expect(nodeHelper.sendSocketNotification).toHaveBeenCalledWith("MEDICATION_ALARM_TEST", medicationAlarmTestPayload);
        // Add more expectations as needed
    });

    it("should check and trigger medication notifications", () => {
        // Define a mock database response
        const mockMedications = [
            {
                ndc: "123456",
                brand_name: "Brand1",
                generic_name: "Generic1",
                day: "Monday",
                time: "08:00 AM"
            },
            {
                ndc: "789012",
                brand_name: "Brand2",
                generic_name: "Generic2",
                day: "Tuesday",
                time: "09:00 AM"
            },
        ];

        // Mock the database response
        mockDatabase.all.mockImplementationOnce((query, params, callback) => {
            // Ensure that the callback is a function
            if (typeof callback === 'function') {
                // Simulate a successful database query
                callback(null, mockMedications);
            }
        });

        // Mock the current date and time
        jest.spyOn(global.Date.prototype, 'toLocaleDateString').mockReturnValueOnce('Monday');
        jest.spyOn(global.Date.prototype, 'toLocaleTimeString').mockReturnValueOnce('08:30 AM');

        // Call the function to check and trigger medication notifications
        nodeHelper.checkAndTriggerMedicationNotifications();

        // Add expectations based on the functionality of the NodeHelper
        expect(mockDatabase.all).toHaveBeenCalledWith(expect.any(String), ['08:30 AM'], expect.any(Function));
        expect(scheduleMock.scheduleJob).toHaveBeenCalledTimes(1);
        expect(nodeHelper.sendSocketNotification).toHaveBeenCalledTimes(1); // There should be one call per medication
        expect(nodeHelper.sendSocketNotification).toHaveBeenCalledWith("MEDICATION_ALARM_TEST", {
            title: 'Medication Notification',
            message: `It's time to take Brand1 at 08:00 AM`,
        });
        expect(nodeHelper.sendSocketNotification).toHaveBeenCalledWith("MEDICATION_ALARM_TEST", {
            title: 'Medication Notification',
            message: `It's time to take Brand1 at 08:00 AM`,
        });
        // Add more expectations as needed


    });
});
