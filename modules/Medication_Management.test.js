const axios = require("axios");
const MedicationManagement = require('modules/Medication-Management/Medication-Management.js');
const MedicationManagementHelper = require('modules/Medication-Management/node_helper.js');

jest.mock('axios');

describe('Medication-Management Module', () => {
  let module;

  beforeEach(() => {
    module = new MedicationManagement();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should start and fetch medication data', () => {
    module.start();
    expect(module.sendSocketNotification).toHaveBeenCalledWith('FETCH_MEDICATION_DATA');
  });

  it('should handle socket notification for medication data', () => {
    const medicationData = [{ /* sample medication data */ }];
    module.socketNotificationReceived('MEDICATION_DATA', medicationData);
    expect(module.medicationData).toEqual(medicationData);
  });
});

describe('Medication-Management Node Helper', () => {
  let helper;

  beforeEach(() => {
    helper = new MedicationManagementHelper();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch medication data and save to the database', async () => {
    axios.get.mockResolvedValue({ data: { results: [] } });
    const processMedicationDataSpy = jest.spyOn(helper, 'processMedicationData');
    const saveMedicationsToDatabaseSpy = jest.spyOn(helper, 'saveMedicationsToDatabase');

    await helper.fetchMedicationData();

    expect(axios.get).toHaveBeenCalled();
    expect(processMedicationDataSpy).toHaveBeenCalled();
    expect(saveMedicationsToDatabaseSpy).toHaveBeenCalled();
  });

  it('should process medication data', () => {
    const sampleData = { results: [{ openfda: { brand_name: ['BrandName'], generic_name: ['GenericName'] }, dosage_form: ['Tablet'], route: ['Oral'], product_ndc: ['1234567890'] }] };

    const result = helper.processMedicationData(sampleData);

    expect(result).toEqual([{ brand_name: 'BrandName', generic_name: 'GenericName', dosage_form: 'Tablet', route: 'Oral', product_ndc: '1234567890' }]);
  });

  it('should save medications to the database', () => {
    const sampleMedications = [{ brand_name: 'BrandName', generic_name: 'GenericName', dosage_form: 'Tablet', route: 'Oral', product_ndc: '1234567890' }];

    helper.saveMedicationsToDatabase(sampleMedications);

    expect(helper.db.run).toHaveBeenCalledTimes(2); // Once for creating the table, once for inserting data
  });
});
