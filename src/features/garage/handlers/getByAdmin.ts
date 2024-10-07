import { ServerResponse } from 'http';
import { sendResponse } from '../../../utils/http';
import { EnumHttpStatus, EnumLogLevel } from '../../../../config/enums';
import { IGarageModel, IGetAllGaragesResult } from '../../../models/garage-model/index.types';
import log from '../../../utils/logger';
import { IGarageQueryParams } from '.';

const LOG_PREFIX = "[GarageController] getByAdmin";

const getByAdmin = async (
  res: ServerResponse,
  userID: number,
  garageModel: IGarageModel,
  queryParams: IGarageQueryParams
) => {
  const result: IGetAllGaragesResult = await garageModel.getMyGarages(userID, queryParams);
  const messages = `Successfully fetched ${result.data?.length || 0} garages of admin with ID ${userID}`;

  sendResponse({
    res,
    status: EnumHttpStatus.OK,
    success: true,
    message: messages,
    data: result.data,
    currentPage: queryParams.page,
    totalPages: Math.ceil(result.totalCount / queryParams.size),
    totalItems: result.totalCount
  });

  log(`${EnumLogLevel.INFO} ${LOG_PREFIX}: ${messages}`);
}

export default getByAdmin;