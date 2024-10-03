import { IncomingMessage, ServerResponse } from 'http';
import { EnumHttpStatus } from '../../../../config/enums';
import { sendResponse } from '../../../utils/http';
import { verifyAccessToken, verifyRefreshToken } from '../../../utils/token';
import { IPayload } from '../../../utils/token/index.types';

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
    return;
  }

  // blacklist the access token
  blacklistedAccessTokens[token] = payload.exp;

  // read the refresh token from cookie httpOnly
  const cookies = req.headers.cookie;

  if (!cookies) {
    sendResponse({
      res,
      status: EnumHttpStatus.UNAUTHORIZED,
      success: false,
      message: 'Authorization cookie is missing'
    });
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
    return;
  }

  // blacklist the refresh token
  blacklistedRefreshTokens[refreshToken] = refreshPayload.exp;

  // delete the refresh token from cookie
  res.setHeader('Set-Cookie', 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT');

  sendResponse({
    res,
    status: EnumHttpStatus.OK,
    success: true,
    message: 'Logout successful'
  });
}

export default logout;