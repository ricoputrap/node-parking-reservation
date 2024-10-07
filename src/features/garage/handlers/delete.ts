import { ServerResponse } from 'http';
import { IGarageModel } from '../../../models/garage-model/index.types';
import NotFoundError from '../../../errors/NotFoundError';
import { IOperationResult } from '../../../models/types';
import { sendResponse } from '../../../utils/http';
import { EnumHttpStatus, EnumLogLevel } from '../../../../config/enums';
import ForbiddenError from '../../../errors/ForbiddenError';
import log from '../../../utils/logger';

const LOG_PREFIX = "[GarageController] deleteGarage";

const deleteGarage = async (res: ServerResponse, userID: number, garageID: number, garageModel: IGarageModel) => {
  // check if the garage exists and is owned by the user
  const adminID = await garageModel.getGarageAdmin(garageID);
  if (adminID == -1) {
    throw new NotFoundError(`Garage ${garageID} not found`);
  }

  // check if the user is allowed to access this resource
  if (adminID != userID) {
    const message = `User with ID ${userID} is not allowed to access this garage with ID ${garageID}.`;
    throw new ForbiddenError(message);
  }

  // delete the garage
  const result: IOperationResult<undefined> = await garageModel.deleteGarage(garageID);

  if (!result.success) {
    throw new NotFoundError(`Garage ${garageID} not found`);
  }

  sendResponse({
    res,
    status: EnumHttpStatus.OK,
    success: true,
    message: 'Garage deleted successfully'
  });

  log(`${EnumLogLevel.INFO} ${LOG_PREFIX}: Garage ${garageID} deleted successfully`);
}

export default deleteGarage;