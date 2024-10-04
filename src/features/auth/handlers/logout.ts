import { IncomingMessage, ServerResponse } from 'http';
import { EnumHttpStatus } from '../../../../config/enums';
import { sendResponse } from '../../../utils/http';
import { verifyAccessToken, verifyRefreshToken } from '../../../utils/token';
import { IPayload } from '../../../utils/token/index.types';
import log from '../../../utils/logger';

const LOG_PREFIX = "[AuthController] handleLogout";

/**
 * The key will be the token string.
 * The value will be in seconds, representing the unix timestamp
 * when the token will expire.
 * 
 * Utilize cronjob to clear the blacklisted tokens
 * when they are expired.
 * 
 * TODO: Utilize Redis
 */
const blacklistedAccessTokens: Record<string, number> = {};
const blacklistedRefreshTokens: Record<string, number> = {};


const logout = async (req: IncomingMessage, res: ServerResponse) => {
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
    log(`${LOG_PREFIX}: Authorization header not found`);

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
    log(`${LOG_PREFIX}: Authorization token not found`);

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
    log(`${LOG_PREFIX}: Access token is blacklisted already. Token: ${token}`);
  
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
    log(`${LOG_PREFIX}: Invalid access token. Token: ${token}`);

    return;
  }

  // blacklist the access token
  blacklistedAccessTokens[token] = payload.exp;

  // log the blacklisted access token
  log(`${LOG_PREFIX}: Blacklisted access token. Token: ${token}`);

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

  // blacklist the refresh token
  blacklistedRefreshTokens[refreshToken] = refreshPayload.exp;

  // log the blacklisted refresh token
  log(`${LOG_PREFIX}: Blacklisted refresh token. Token: ${refreshToken}`);

  // delete the refresh token from cookie
  res.setHeader('Set-Cookie', 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT');

  sendResponse({
    res,
    status: EnumHttpStatus.OK,
    success: true,
    message: 'Logout successful'
  });

  // log the success
  log(`${LOG_PREFIX}: Logout successful for user id: ${payload.user_id}`);
}

export default logout;