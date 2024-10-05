import { IncomingMessage, ServerResponse } from 'http';
import { sendResponse } from '../../../utils/http';
import { EnumHttpStatus, EnumLogLevel } from '../../../../config/enums';
import { blacklistedAccessTokens } from '../../../stores/tokens';
import { verifyAccessToken } from '../../../utils/token';
import { IPayload } from '../../../utils/token/index.types';
import { log } from 'console';
import { IGarageModel } from '../../../models/garage-model/index.types';

const LOG_PREFIX = "[GarageController] getByAdmin";

const getByAdmin = async (req: IncomingMessage, res: ServerResponse, garageModel: IGarageModel) => {
  const authHeader = req.headers['authorization'];

  // auth header not found
  if (!authHeader) {
    sendResponse({
      res,
      status: EnumHttpStatus.UNAUTHORIZED,
      success: false,
      message: 'Authorization header not found'
    });

    // log the error
    log(`[GarageController] getGarage: Authorization header not found`);

    return;
  }

  // extract token from auth header
  const token = authHeader.split(' ')[1];

  // token not found in auth header
  if (!token) {
    sendResponse({
      res,
      status: EnumHttpStatus.UNAUTHORIZED,
      success: false,
      message: 'Authorization token not found'
    });

    // log the error
    log(`[GarageController] getGarage: Authorization token not found`);

    return;
  }

  // check if token is blacklisted
  if (blacklistedAccessTokens[token]) {
    sendResponse({
      res,
      status: EnumHttpStatus.UNAUTHORIZED,
      success: false,
      message: 'Access token is blacklisted already'
    });

    // log the error
    log(`[GarageController] getGarage: Access token is blacklisted already. Token: ${token}`);
  
    return;
  }

  // verify token
  const payload = verifyAccessToken(token) as IPayload;

  // invalid access token
  if (!payload) {
    sendResponse({
      res,
      status: EnumHttpStatus.UNAUTHORIZED,
      success: false,
      message: 'Invalid access token'
    });

    // log the error
    log(`[GarageController] getGarage: Invalid access token. Token: ${token}`);

    return;
  }

  const userID = payload.user_id;

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