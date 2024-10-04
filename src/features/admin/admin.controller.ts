import { IncomingMessage, ServerResponse } from 'http';
import UserModel from "../../models/user-model";
import IUserModel from "../../models/user-model/index.types";
import { UserRegistration, userRegistrationSchema } from './admin.validation';
import log from '../../utils/logger';
import { encrypt } from '../../utils/passwordHashing';
import { generateAccessToken, generateRefreshToken } from '../../utils/token';

class AdminController {
  private userModel: IUserModel;

  constructor() {
    this.userModel = new UserModel();
  }

  async createGarageAdminAccount(req: IncomingMessage, res: ServerResponse) {
    try {
      let body: string = '';

      req.on('data', (chunk) => {
        body += chunk;
      });

      req.on('end', async () => {
        // Parse the incoming JSON body
        let newUser: unknown; // Using unknown to enforce validation
        try {
          newUser = JSON.parse(body);
        }
        catch (error) {
          res.statusCode = 400;
          res.write(JSON.stringify({
            success: false,
            message: 'Invalid JSON format'
          }));

          res.end();

          // log the error
          log("[AdminController] createGarageAdminAccount: Invalid JSON format");

          return;
        }

        // Validate the incoming data using Zod
        const parsedResult = userRegistrationSchema.safeParse(newUser);

        // validation failed
        if (!parsedResult.success) {
          const errors: {
            name?: string;
            email?: string;
            password?: string;
          } = {};

          // Extract the validation errors
          for (const error of parsedResult.error.errors) {
            errors[error.path[0] as keyof typeof errors] = error.message;
          }

          // Return the validation errors
          res.statusCode = 400;
          res.write(JSON.stringify({
            success: false,
            message: 'Validation failed',
            errors
          }));
          res.end();

          // log the error
          log("[AdminController] createGarageAdminAccount: Validation failed");

          return;
        }


      });
    }
    catch (error: any) {

    }
  }
}