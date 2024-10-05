import { ServerResponse } from 'http';
import { handleSchemaValidationError, parseData } from '../../../utils/validations';
import { GarageRegistration, garageRegistrationSchema } from '../validation';
import { EnumHttpStatus, EnumLogLevel } from '../../../../config/enums';
import { sendResponse } from '../../../utils/http';
import { ICreateGarageResult, IGarageModel } from '../../../models/garage-model/index.types';
import log from '../../../utils/logger';
import IGarage from '../../../entity/garage.entity';

const LOG_PREFIX = "[GarageController] createGarage";

/**
 * Handles the incoming garage creation request.
 * 
 * This function parses the incoming JSON body, validates the data using Zod,
 * and creates a new garage in the database if the data is valid.
 * 
 * If the validation fails, it sends a 400 response with the validation errors.
 * If the garage is created successfully, it sends a 201 response with the created garage's id.
 * 
 * @param res - The outgoing HTTP response.
 * @param body - The incoming JSON body.
 * @param garageModel - The instance of the garage model.
 */
const create = async (res: ServerResponse, userID: number, body: string, garageModel: IGarageModel) => {
  // Parse the incoming JSON body
  const newGarageData = parseData(res, body, LOG_PREFIX);
  if (!newGarageData) return;

  // Validate the incoming data using Zod
  const parsedResult = garageRegistrationSchema.safeParse(newGarageData);

  if (!parsedResult.success) {
    handleSchemaValidationError(res, parsedResult.error.issues, LOG_PREFIX);
    return;
  }

  // Extract the validated data
  const validatedGarage: GarageRegistration = parsedResult.data;

  // Create the new garage
  const result: ICreateGarageResult = await garageModel.createGarage(userID, validatedGarage);

  // Garage creation is successful
  if (result.success && result.data) {
    const garageID = result.data.id;

    const newGarage: Omit<IGarage, "active"> = {
      id: garageID,
      name: result.data.name,
      location: result.data.location,
      pricePerHour: result.data.pricePerHour,
      adminID: userID
    };

    sendResponse({
      res,
      status: EnumHttpStatus.CREATED,
      success: true,
      message: "Garage created successfully with id: " + garageID,
      data: newGarage
    });
  
    // log the success
    log(`${EnumLogLevel.INFO} ${LOG_PREFIX}: Garage created successfully with id: ${garageID}`);
    return;
  }

  // Garage creation failed
  sendResponse({
    res,
    status: EnumHttpStatus.INTERNAL_SERVER_ERROR,
    success: false,
    message: result.message || "Failed to create garage"
  });

  // log the error
  log(`${EnumLogLevel.ERROR} ${LOG_PREFIX}: Failed to create garage: ${result.message}`);
}

export default create;