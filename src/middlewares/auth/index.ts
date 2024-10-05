import { IncomingMessage, ServerResponse } from 'http';
import { EnumHttpStatus, EnumUserRole } from "../../../config/enums";
import { sendResponse } from '../../utils/http';
import log from '../../utils/logger';
import { verifyAccessToken } from '../../utils/token';
import { blacklistedAccessTokens } from '../../stores/tokens';
import { IPayload } from '../../utils/token/index.types';

const LOG_PREFIX = "[AuthMiddleware]"

const authMiddleware = (role: EnumUserRole) => {
  return (req: IncomingMessage, res: ServerResponse, next: () => void) => {
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

    // verify the token
    const payload = verifyAccessToken(token) as IPayload;

    // invalid token
    if (!payload) {
      sendResponse({
        res,
        status: EnumHttpStatus.UNAUTHORIZED,
        success: false,
        message: 'Invalid token'
      });

      // log the error
      log(`${LOG_PREFIX}: Invalid access token. Token: ${token}`);

      return;
    }

    // check if user has required role
    if (payload.role !== role) {
      const message = `The user '${payload.email}' does not have the required role as '${role}'`;

      sendResponse({
        res,
        status: EnumHttpStatus.UNAUTHORIZED,
        success: false,
        message
      });

      // log the error
      log(`${LOG_PREFIX}: ${message}`);

      return;
    }

    // continue to next processes
    next();
  }
}

export const userAuthMiddleware = authMiddleware(EnumUserRole.USER);
export const garageAdminAuthMiddleware = authMiddleware(EnumUserRole.GARAGE_ADMIN);
export const superAdminAuthMiddleware = authMiddleware(EnumUserRole.SUPER_ADMIN);