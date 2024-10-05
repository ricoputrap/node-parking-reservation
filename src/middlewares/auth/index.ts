import { IncomingMessage, ServerResponse } from 'http';
import { EnumHttpStatus, EnumUserRole } from "../../../config/enums";
import { sendResponse } from '../../utils/http';
import log from '../../utils/logger';
import { verifyAccessToken } from '../../utils/token';
import { blacklistedAccessTokens } from '../../stores/tokens';
import { IPayload } from '../../utils/token/index.types';

export type IUserData = Omit<IPayload, "iat" | "exp">

const LOG_PREFIX = "[AuthMiddleware]"

const authMiddleware = (roles: EnumUserRole[]) => {
  return (req: IncomingMessage, res: ServerResponse, next: (user: IUserData) => void) => {
    try {
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
      if (!roles.includes(payload.role)) {
        const message = `The user '${payload.email}' does not have the required role.`;

        sendResponse({
          res,
          status: EnumHttpStatus.FORBIDDEN,
          success: false,
          message
        });

        // log the error
        log(`${LOG_PREFIX}: ${message}`);

        return;
      }

      // continue to next processes
      next({
        user_id: payload.user_id,
        email: payload.email,
        role: payload.role
      });
    }
    catch (error: any) {
      if (error.name === "TokenExpiredError") {
        sendResponse({
          res,
          status: EnumHttpStatus.UNAUTHORIZED,
          success: false,
          message: "Access token expired"
        });

        return;
      }

      sendResponse({
        res,
        status: EnumHttpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        message: error.message
      });
    }
  }
}

export default authMiddleware