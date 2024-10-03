import { IncomingMessage, ServerResponse } from 'http';
import UserModel from "../../models/user-model";
import IUserModel from "../../models/user-model/index.types";
import log from '../../utils/logger';
import { verifyAccessToken, verifyRefreshToken } from '../../utils/token';
import { EnumHttpStatus } from '../../../config/enums';
import { IPayload } from '../../utils/token/index.types';
import { sendResponse } from '../../utils/http';
import login from './handlers/login';
import register from './handlers/register';

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

class AuthController {
  private userModel: IUserModel;

  constructor() {
    this.userModel = new UserModel();
  }

  /**
   * Handle the incoming registration request.
   * 
   * This function parses the incoming JSON body, validates the data using Zod,
   * and creates a new user in the database if the data is valid.
   * 
   * @param req - The incoming HTTP request.
   * @param res - The outgoing HTTP response.
   * 
   * @throws {Error} - If there is an error while parsing the JSON body or
   * validating the data.
   */
  async handleRegister(req: IncomingMessage, res: ServerResponse) {
    let body: string = '';

    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', async () => {
      try {
        await register(res, body, this.userModel);
      }
      catch (error: any) {
        sendResponse({
          res,
          status: EnumHttpStatus.INTERNAL_SERVER_ERROR,
          success: false,
          message: error.message || 'An unexpected error occurred'
        });

        // log the error
        log(`[AuthController] hanldeRegister: ${error.message}`);
      }
    });
  }

  handleLogin(req: IncomingMessage, res: ServerResponse) {
    let body: string = '';

    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', async () => {
      try {
        await login(res, body, this.userModel);
      }
      catch (error: any) {
        log(`[AuthController] hanldeLogin: ${error.message}`);

        sendResponse({
          res,
          status: EnumHttpStatus.INTERNAL_SERVER_ERROR,
          success: false,
          message: error.message
        });
      }
    });
  }

  async handleLogout(req: IncomingMessage, res: ServerResponse) {
    try {
      const authHeader = req.headers['authorization'];

      // auth header not found
      if (!authHeader) {
        res.statusCode = 401;
        res.write(JSON.stringify({
          success: false,
          message: 'Authorization header not found'
        }));
        res.end();
        return;
      }

      // extract token from auth header
      const token = authHeader.split(' ')[1];

      // token not found in auth header
      if (!token) {
        res.statusCode = 401;
        res.write(JSON.stringify({
          success: false,
          message: 'Authorization token not found'
        }));
        res.end();
        return;
      }

      // check if token is blacklisted
      if (blacklistedAccessTokens[token]) {
        res.statusCode = 401;
        res.write(JSON.stringify({
          success: false,
          message: 'Access token is blacklisted already'
        }));
        res.end();
        return;
      }

      // verify token
      const decoded: IPayload = verifyAccessToken(token) as IPayload;

      // access token is invalid
      if (!decoded) {
        res.statusCode = 401;
        res.write(JSON.stringify({
          success: false,
          message: 'Invalid access token'
        }));
        res.end();
        return;
      }

      // blacklist the access token
      blacklistedAccessTokens[token] = decoded.exp

      // read the refresh token from cookie httpOnly
      const cookies = req.headers.cookie;

      if (!cookies) {
        res.statusCode = 401;
        res.write(JSON.stringify({
          success: false,
          message: 'Authorization cookie is missing'
        }));
        res.end();
        return;
      }

      const refreshTokenCookie = cookies.split(';').find((cookie) => cookie.trim().startsWith('refreshToken='));
      if (!refreshTokenCookie) {
        res.statusCode = 401;
        res.write(JSON.stringify({
          success: false,
          message: 'Refresh token not found'
        }));
        res.end();
        return;
      }

      const refreshToken = refreshTokenCookie.split('=')[1];

      // check if refresh token is blacklisted
      if (blacklistedRefreshTokens[refreshToken]) {
        res.statusCode = 401;
        res.write(JSON.stringify({
          success: false,
          message: 'Refresh token is blacklisted already'
        }));
        res.end();
        return;
      }

      const decodedRefreshToken = verifyRefreshToken(refreshToken) as IPayload;

      // blacklist the refresh token
      blacklistedRefreshTokens[refreshToken] = decodedRefreshToken.exp

      // remove refreshToken from the cookie
      res.setHeader('Set-Cookie', 'refreshToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;');

      res.statusCode = 200;
      res.write(JSON.stringify({
        success: true,
        message: "Logout successful"
      }));
      res.end();
    }
    catch (error: any) {
      res.statusCode = 500;
      res.write(JSON.stringify({
        success: false,
        message: error.message || 'Something went wrong'
      }));
      res.end();
    }
  }

  async handleRefresh(req: IncomingMessage, res: ServerResponse) {}
}

export default AuthController;