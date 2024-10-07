import { ServerResponse } from 'http';
import { IGarageQueryParams } from '.';
import { sendResponse } from '../../../utils/http';
import { IGarageModel, IGetAllGaragesResult } from '../../../models/garage-model/index.types';
import log from '../../../utils/logger';
import { EnumHttpStatus, EnumLogLevel } from '../../../../config/enums';

const LOG_PREFIX = "[GarageController] getAll";

const getAll = async (res: ServerResponse, garageModel: IGarageModel, queryParams: IGarageQueryParams) => {
  const result: IGetAllGaragesResult = await garageModel.getAllGarages(queryParams);
  const messages = `Successfully fetched ${result.data?.length || 0} garages`;

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

export default getAll