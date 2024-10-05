import { ServerResponse } from 'http';
import { handleSchemaValidationError, parseData } from '../../../utils/validations';
import { GarageRegistration, garageSchema } from '../validation';
import { EnumHttpStatus, EnumLogLevel } from '../../../../config/enums';
import { sendResponse } from '../../../utils/http';
import { IUpdateGarageResult, IGarageModel } from '../../../models/garage-model/index.types';
import log from '../../../utils/logger';
import IGarage from '../../../entity/garage.entity';
import NotFoundError from '../../../errors/NotFoundError';

const LOG_PREFIX = "[GarageController] updateGarage";

const update = async (
  res: ServerResponse,
  userID: number,
  garageID: number,
  body: string,
  garageModel: IGarageModel
) => {
  // Parse the incoming JSON body
  const data = parseData(res, body, LOG_PREFIX);

  // Validate the incoming data using Zod
  const parsedResult = garageSchema.safeParse(data);

  if (!parsedResult.success) {
    handleSchemaValidationError(res, parsedResult.error.issues, LOG_PREFIX);
    return;
  }

  // Extract the validated data
  const validatedGarage: GarageRegistration = parsedResult.data;

  // check if garage exists and is owned by the user
  const garage = await garageModel.getGarageAdmin(garageID);
  if (garage == -1) {
    throw new NotFoundError(`Garage ${garageID} not found`);
  }

  // Update the garage
  const result: IUpdateGarageResult = await garageModel.updateGarage(userID, garageID, validatedGarage);

  // update is successful
  if (result.success && result.data) {
    const updatedGarage: Omit<IGarage, "active"> = {
      id: result.data.id,
      name: result.data.name,
      location: result.data.location,
      pricePerHour: result.data.pricePerHour,
      adminID: userID,
    };

    sendResponse({
      res,
      status: EnumHttpStatus.OK,
      success: true,
      message: "Garage updated successfully",
      data: updatedGarage
    });

    log(`${EnumLogLevel.INFO} ${LOG_PREFIX}: Successfully updated garage ${garageID}`);
    return;
  }

  // Handle any other errors
  sendResponse({
    res,
    status: EnumHttpStatus.INTERNAL_SERVER_ERROR,
    success: false,
    message: result.message || "An unexpected error occurred",
    data: null
  });

  log(`${EnumLogLevel.ERROR} ${LOG_PREFIX}: Failed to update garage ${garageID}`);
}

export default update;