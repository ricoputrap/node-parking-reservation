import { IncomingMessage, ServerResponse } from 'http';
import { sendResponse } from '../../../utils/http';
import { EnumHttpStatus } from '../../../../config/enums';
import log from '../../../utils/logger';
import { blacklistedRefreshTokens } from '../../../stores/tokens';
import { generateAccessToken, verifyRefreshToken } from '../../../utils/token';
import { IPayload } from '../../../utils/token/index.types';
import IUserModel from '../../../models/user-model/index.types';

const LOG_PREFIX = "[AuthController] handleRefresh";

const refresh = async (req: IncomingMessage, res: ServerResponse, userModel: IUserModel) => {
  // read the refresh token from cookie httpOnly
  const cookies = req.headers.cookie;

  if (!cookies) {
    sendResponse({
      res,
      status: EnumHttpStatus.UNAUTHORIZED,
      success: false,
      message: 'Authorization cookie is missing'
    });

    // log the error
    log(`${LOG_PREFIX}: Authorization cookie is missing`);

    return;
  }

  const refreshTokenCookie = cookies
    .split(';')
    .find((cookie) => cookie.trim().startsWith('refreshToken='));

  if (!refreshTokenCookie) {
    sendResponse({
      res,
      status: EnumHttpStatus.UNAUTHORIZED,
      success: false,
      message: 'Authorization cookie is missing'
    });

    // log the error
    log(`${LOG_PREFIX}: Authorization cookie is missing`);

    return;
  }

  const refreshToken = refreshTokenCookie
    .split('=')[1]
    .trim();

  // check if refresh token is blacklisted
  if (blacklistedRefreshTokens[refreshToken]) {
    sendResponse({
      res,
      status: EnumHttpStatus.UNAUTHORIZED,
      success: false,
      message: 'Refresh token is blacklisted already'
    });

    // log the error
    log(`${LOG_PREFIX}: Refresh token is blacklisted already. Token: ${refreshToken}`);
    return;
  }

  // verify refresh token
  const refreshPayload = verifyRefreshToken(refreshToken) as IPayload;

  // invalid refresh token
  if (!refreshPayload) {
    sendResponse({
      res,
      status: EnumHttpStatus.UNAUTHORIZED,
      success: false,
      message: 'Invalid refresh token'
    });

    // log the error
    log(`${LOG_PREFIX}: Invalid refresh token. Token: ${refreshToken}`);

    return;
  }

  // get user from database
  const user = await userModel.getUser(refreshPayload.email);

  if (!user) {
    sendResponse({
      res,
      status: EnumHttpStatus.NOT_FOUND,
      success: false,
      message: 'User not found'
    });

    // log the error
    log(`${LOG_PREFIX}: User not found with email: "${refreshPayload.email}"`);

    return;
  }

  // generate access and refresh tokens
  const accessToken = generateAccessToken(user);

  // send access and refresh tokens
  sendResponse({
    res,
    status: EnumHttpStatus.OK,
    success: true,
    message: 'Access token refreshed successfully',
    data: { accessToken }
  });

  // log the success
  log(`${LOG_PREFIX}: Access token refreshed successfully for email: "${refreshPayload.email}"`);
}

export default refresh;