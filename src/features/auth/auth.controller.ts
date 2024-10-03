import { IncomingMessage, ServerResponse } from 'http';
import UserModel from "../../models/user-model";
import IUserModel, { ICreateUserResult } from "../../models/user-model/index.types";
import { UserLogin, UserRegistration, userLoginSchema, userRegistrationSchema } from './auth.validation';
import log from '../../utils/logger';
import { encrypt } from '../../utils/passwordHashing';
import { generateAccessToken, generateRefreshToken } from '../../utils/token';
import { EnumUserRole } from '../../../config/enums';

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
          log("[AuthController] hanldeRegister: Invalid JSON format");

          return;
        }

        // Validate the incoming data using Zod
        const parsedResult = userRegistrationSchema.safeParse(newUser);

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

          res.statusCode = 400;
          res.write(JSON.stringify({
            success: false,
            message: "Validation failed",
            errors
          }));
          res.end();

          // log the error
          log(`[AuthController] hanldeRegister: Validation failed ${JSON.stringify(errors)}`);

          return;
        }

        // Extract the validated data
        const validatedUser: UserRegistration = parsedResult.data;

        // check if user already exists
        const existingUser = await this.userModel.getUser(validatedUser.email);
        if (existingUser) {
          res.statusCode = 409;
          res.write(JSON.stringify({
            success: false,
            message: 'User already exists'
          }));
          res.end();

          // log the error
          log(`[AuthController] hanldeRegister: User already exists with email "${validatedUser.email}"`);

          return;
        }

        // hash the password
        const hashedPassword = encrypt(validatedUser.password);

        // create the user
        const result: ICreateUserResult = await this.userModel.createUser({
          name: validatedUser.name,
          email: validatedUser.email,
          password: hashedPassword,
          role: EnumUserRole.USER
        });

        if (result.success && result.data) {
          res.statusCode = 201;
          res.write(JSON.stringify({
            success: true,
            message: "User created successfully",
            data: {
              id: result.data.id,
              name: result.data.name,
              email: result.data.email,
              role: result.data.role
            }
          }));
          res.end();

          // log the success
          log(`[AuthController] hanldeRegister: User created successfully with id ${result.data.id}`);
          return;
        }

        // error while creating user
        res.statusCode = 400;
        res.write(JSON.stringify({
          success: false,
          message: result.message || "Failed to create user",
          errors: result.errors
        }));
        res.end();
      });
    }
    catch (error: any) {
      res.statusCode = 500;
      res.write(JSON.stringify({
        success: false,
        message: error.message || 'An unexpected error occurred'
      }));
      res.end();

      // log the error
      log(`[AuthController] hanldeRegister: ${error.message}`);
    }
  }

  async handleLogin(req: IncomingMessage, res: ServerResponse) {
    try {
      let body: string = '';

      req.on('data', (chunk) => {
        body += chunk;
      });

      req.on('end', async () => {
        // Parse the incoming JSON body
        let loginData: unknown; // Using unknown to enforce validation
        try {
          loginData = JSON.parse(body);
        }
        catch (error) {
          res.statusCode = 400;
          res.write(JSON.stringify({
            success: false,
            message: 'Invalid JSON format'
          }));
          res.end();

          // log the error
          log("[AuthController] hanldeLogin: Invalid JSON format");

          return;
        }

        // Validate the incoming data using Zod
        const parsedResult = userLoginSchema.safeParse(loginData);

        if (!parsedResult.success) {
          const errors: {
            email?: string;
            password?: string;
          } = {};

          // Extract the validation errors
          for (const error of parsedResult.error.errors) {
            errors[error.path[0] as keyof typeof errors] = error.message;
          }

          res.statusCode = 400;
          res.write(JSON.stringify({
            success: false,
            message: "Validation failed",
            errors
          }));
          res.end();

          // log the error
          log(`[AuthController] hanldeLogin: Validation failed ${JSON.stringify(errors)}`);

          return;
        }

        // Extract the validated data
        const validatedUser: UserLogin = parsedResult.data;

        // check if user exists
        const existingUser = await this.userModel.getUser(validatedUser.email);
        if (!existingUser) {
          res.statusCode = 404;
          res.write(JSON.stringify({
            success: false,
            message: 'User not found'
          }));
          res.end();

          // log the error
          log(`[AuthController] hanldeLogin: User not found with email "${validatedUser.email}"`);

          return;
        }

        // check if password is correct
        const hashedPassword = encrypt(validatedUser.password);

        // password doesn't match
        if (hashedPassword !== existingUser.password) {
          res.statusCode = 401;
          res.write(JSON.stringify({
            success: false,
            message: 'Incorrect password'
          }));
          res.end();

          // log the error
          log(`[AuthController] hanldeLogin: Incorrect password for email "${validatedUser.email}"`);

          return;
        }

        // generate access and refresh tokens
        const accessToken = generateAccessToken(existingUser);
        const refreshToken = generateRefreshToken(existingUser);

        res.statusCode = 200;
        res.write(JSON.stringify({
          success: true,
          message: "Login successful",
          data: {
            accessToken,
            refreshToken
          }
        }));
        res.end();

        // log the success
        log(`[AuthController] hanldeLogin: Login successful for email "${validatedUser.email}"`);

        return;
      });
    }
    catch (error: any) {
      res.statusCode = 500;
      res.write(JSON.stringify({
        success: false,
        message: error.message
      }));
      res.end();

      // log the error
      log(`[AuthController] hanldeLogin: ${error.message}`);
    }
  }

  async handleLogout(req: IncomingMessage, res: ServerResponse) {}

  async handleRefresh(req: IncomingMessage, res: ServerResponse) {}
}

export default AuthController;