import { ServerResponse } from 'http';
import { handleSchemaValidationError, parseData } from '../../../utils/validations';
import { IGarageModel } from '../../../models/garage-model/index.types';
import { createSpotSchema } from '../validation';
import NotFoundError from '../../../errors/NotFoundError';
import ForbiddenError from '../../../errors/ForbiddenError';
import { ICreateUpdateSpotResult, IParkingSpotModel } from '../../../models/parking-spot-model/index.types';
import IParkingSpot from '../../../entity/spot.entity';
import { EnumHttpStatus, EnumLogLevel } from '../../../../config/enums';
import { sendResponse } from '../../../utils/http';
import log from '../../../utils/logger';

const LOG_PREFIX = "[ParkingSpotController] createSpot";

const create = async ({
  res, userID, body, garageModel, parkingSpotModel
}: {
  res: ServerResponse,
  userID: number,
  body: string,
  garageModel: IGarageModel,
  parkingSpotModel: IParkingSpotModel
}) => {
  // Parse the incoming JSON body
  const newSpotData = parseData(res, body, LOG_PREFIX);
  if (!newSpotData) return;

  // Validate the incoming data using Zod
  const validationErrors = createSpotSchema.safeParse(newSpotData);

  if (!validationErrors.success) {
    handleSchemaValidationError(res, validationErrors.error.issues, LOG_PREFIX);
    return;
  }

  // Extract the validated data
  const validatedSpot = validationErrors.data;

  // check if garage exists and is owned by the user
  const garage = await garageModel.getGarageAdmin(validatedSpot.garageID);
  if (garage == -1) {
    throw new NotFoundError(`Garage ${validatedSpot.garageID} not found`);
  }

  // check if the user is allowed to access this resource
  if (garage != userID) {
    const message = `User with ID ${userID} is not allowed to access this garage with ID ${validatedSpot.garageID}.`;
    throw new ForbiddenError(message);
  }

  // Create the spot
  const result: ICreateUpdateSpotResult = await parkingSpotModel.createParkingSpot(validatedSpot);

  // Creation is successful
  if (result.success && result.data) {
    const newSpot: Omit<IParkingSpot, "active"> = {
      id: result.data.id,
      name: result.data.name,
      garageID: result.data.garageID,
      reserved: false
    };

    sendResponse({
      res,
      status: EnumHttpStatus.CREATED,
      success: true,
      message: `Parking spot is created successfully with id ${result.data.id}.`,
      data: newSpot
    });

    // log the success
    log(`${EnumLogLevel.INFO} ${LOG_PREFIX}: Successfully created parking spot with id ${result.data.id}.`);
    return;
  }

  // Creation failed
  sendResponse({
    res,
    status: EnumHttpStatus.INTERNAL_SERVER_ERROR,
    success: false,
    message: "Failed to create parking spot."
  });

  const message = `Failed to create parking spot - error: ${result.message}`;
  log(`${EnumLogLevel.ERROR} ${LOG_PREFIX}: ${message}`);
}

export default create