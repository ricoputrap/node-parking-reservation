import { ServerResponse } from 'http';
import { sendResponse } from '../../../utils/http';
import { EnumHttpStatus, EnumLogLevel } from '../../../../config/enums';
import { IGarageModel } from '../../../models/garage-model/index.types';
import log from '../../../utils/logger';

const LOG_PREFIX = "[GarageController] getByAdmin";

const getByAdmin = async (res: ServerResponse, userID: number, garageModel: IGarageModel) => {
  const garages = await garageModel.getMyGarages(userID);
  const messages = `Successfully fetched ${garages.length} garages of admin with ID ${userID}`;

  sendResponse({
    res,
    status: EnumHttpStatus.OK,
    success: true,
    message: messages,
    data: garages
  });

  log(`${EnumLogLevel.INFO} ${LOG_PREFIX}: ${messages}`);
}

export default getByAdmin;