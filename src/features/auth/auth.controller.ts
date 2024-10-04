import { IncomingMessage, ServerResponse } from 'http';
import UserModel from "../../models/user-model";
import IUserModel from "../../models/user-model/index.types";
import log from '../../utils/logger';
import { EnumHttpStatus } from '../../../config/enums';
import { sendResponse } from '../../utils/http';
import login from './handlers/login';
import register from './handlers/register';
import logout from './handlers/logout';
import refresh from './handlers/refresh';

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
  handleRegister(req: IncomingMessage, res: ServerResponse) {
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
          message: error.message || 'An unexpected error occurred'
        });
      }
    });
  }

  async handleLogout(req: IncomingMessage, res: ServerResponse) {
    try {
      await logout(req, res);
    }
    catch (error: any) {
      log(`[AuthController] hanldeLogout: ${error.message}`);

      sendResponse({
        res,
        status: EnumHttpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        message: error.message || 'An unexpected error occurred'
      });
    }
  }

  async handleRefresh(req: IncomingMessage, res: ServerResponse) {
    try {
      await refresh(req, res, this.userModel);
    }
    catch (error: any) {
      log(`[AuthController] hanldeRefresh: ${error.message}`);

      sendResponse({
        res,
        status: EnumHttpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        message: error.message || 'An unexpected error occurred'
      });
    }
  }
}

export default AuthController;