import { IncomingMessage, ServerResponse } from 'http';
import UserModel from "../../models/user-model";
import IUserModel, { ICreateUserResult } from "../../models/user-model/index.types";
import { UserLogin, UserRegistration, userLoginSchema, userRegistrationSchema } from './auth.validation';
import log from '../../utils/logger';
import { encrypt } from '../../utils/passwordHashing';
import { generateAccessToken, generateRefreshToken, setHttpOnlyCookie, verifyAccessToken, verifyRefreshToken } from '../../utils/token';
import { EnumHttpStatus, EnumUserRole } from '../../../config/enums';
import { ONE_DAY_IN_SECONDS } from '../../../config/constants';
import { IPayload } from '../../utils/token/index.types';
import { handleSchemaValidationError, parseData } from '../../utils/validations';
import { sendResponse } from '../../utils/http';

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
    const LOG_PREFIX = "[AuthController] handleLogin";

    try {
      let body: string = '';

      req.on('data', (chunk) => {
        body += chunk;
      });

      req.on('end', async () => {
        // Parse the incoming JSON body
        const loginData = parseData(res, body, LOG_PREFIX);
        if (!loginData) return;

        // Validate the incoming data using Zod
        const parsedResult = userLoginSchema.safeParse(loginData);

        // validation failed
        if (!parsedResult.success) {
          handleSchemaValidationError(res, parsedResult.error.errors, LOG_PREFIX);
          return;
        }

        // Extract the validated data
        const validatedUser: UserLogin = parsedResult.data;

        // check if user exists
        const existingUser = await this.userModel.getUser(validatedUser.email);
        if (!existingUser) {
          sendResponse({
            res,
            status: EnumHttpStatus.NOT_FOUND,
            success: false,
            message: 'User not found'
          })
          log(`[AuthController] hanldeLogin: User not found with email "${validatedUser.email}"`);

          return;
        }

        // check if password is correct
        const hashedPassword = encrypt(validatedUser.password);

        // password doesn't match
        if (hashedPassword !== existingUser.password) {
          sendResponse({
            res,
            status: EnumHttpStatus.UNAUTHORIZED,
            success: false,
            message: 'Incorrect password'
          })
          log(`[AuthController] hanldeLogin: Incorrect password for email "${validatedUser.email}"`);

          return;
        }

        // generate access and refresh tokens
        const accessToken = generateAccessToken(existingUser);
        const refreshToken = generateRefreshToken(existingUser);

        // Set the refresh token in an HTTP-only cookie
        const maxAge = ONE_DAY_IN_SECONDS * 30; // 30 days
        setHttpOnlyCookie(res, 'refreshToken', refreshToken, { maxAge });

        // send response
        sendResponse({
          res,
          status: EnumHttpStatus.OK,
          success: true,
          message: 'Login successful',
          data: { accessToken }
        });

        // log the success
        log(`[AuthController] hanldeLogin: Login successful for email "${validatedUser.email}"`);

        return;
      });
    }
    catch (error: any) {
      sendResponse({
        res,
        status: EnumHttpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        message: error.message
      });

      // log the error
      log(`[AuthController] hanldeLogin: ${error.message}`);
    }
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