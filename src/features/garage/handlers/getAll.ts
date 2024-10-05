import { ServerResponse } from 'http';
import { IGarageQueryParams } from '.';
import { sendResponse } from '../../../utils/http';
import { IGarageModel } from '../../../models/garage-model/index.types';
import log from '../../../utils/logger';
import { EnumHttpStatus, EnumLogLevel } from '../../../../config/enums';

const LOG_PREFIX = "[GarageController] getAll";

const getAll = async (res: ServerResponse, garageModel: IGarageModel, queryParams: IGarageQueryParams) => {
  const garages = await garageModel.getAllGarages(queryParams);
  const messages = `Successfully fetched ${garages.length} garages`;

  sendResponse({
    res,
    status: EnumHttpStatus.OK,
    success: true,
    message: messages,
    data: garages
  });

  log(`${EnumLogLevel.INFO} ${LOG_PREFIX}: ${messages}`);
}

export default getAll