import { ServerResponse } from 'http';
import { handleSchemaValidationError, parseData } from "../../../utils/validations";
import { UserLogin, userLoginSchema } from '../auth.validation';
import { sendResponse } from '../../../utils/http';
import { EnumHttpStatus } from '../../../../config/enums';
import { encrypt } from '../../../utils/passwordHashing';
import { generateAccessToken, generateRefreshToken, setHttpOnlyCookie } from '../../../utils/token';
import { ONE_DAY_IN_SECONDS, REFRESH_TOKEN_PATH } from '../../../../config/constants';
import log from '../../../utils/logger';
import IUserModel from '../../../models/user-model/index.types';

const LOG_PREFIX = "[AuthController] handleLogin";

/**
 * Handles the incoming login request.
 * 
 * This function parses the incoming JSON body, validates the data using Zod,
 * and checks if the user exists and the password is correct.
 * 
 * If the user is found and the password is correct, it generates a new access
 * token and refresh token, and sets the refresh token in an HTTP-only cookie
 * with a maximum age of 30 days. The access token is sent in the response.
 * 
 * If the user is not found or the password is incorrect, it sends a 404 or 401
 * response, respectively, with an appropriate error message.
 * 
 * @param res - The outgoing HTTP response.
 * @param body - The incoming JSON body.
 * @param userModel - The instance of the user model.
 */
const login = async (res: ServerResponse, body: string, userModel: IUserModel) => {
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
  const existingUser = await userModel.getUser(validatedUser.email);
  if (!existingUser) {
    sendResponse({
      res,
      status: EnumHttpStatus.NOT_FOUND,
      success: false,
      message: 'User not found'
    })
    log(`${LOG_PREFIX}: User not found with email "${validatedUser.email}"`);

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
    log(`${LOG_PREFIX}: Incorrect password for email "${validatedUser.email}"`);

    return;
  }

  // generate access and refresh tokens
  const accessToken = generateAccessToken(existingUser);
  const refreshToken = generateRefreshToken(existingUser);

  // Set the refresh token in an HTTP-only cookie
  const maxAge = ONE_DAY_IN_SECONDS * 30; // 30 days
  setHttpOnlyCookie(res, 'refreshToken', refreshToken, {
    maxAge,
    path: REFRESH_TOKEN_PATH
  });

  // send response
  sendResponse({
    res,
    status: EnumHttpStatus.OK,
    success: true,
    message: 'Login successful',
    data: { accessToken }
  });

  // log the success
  log(`${LOG_PREFIX}: Login successful for email "${validatedUser.email}"`);
}

export default login;