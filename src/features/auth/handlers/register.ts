import { ServerResponse } from 'http';
import IUserModel, { ICreateUserResult } from '../../../models/user-model/index.types';
import { handleSchemaValidationError, parseData } from '../../../utils/validations';
import { UserRegistration, userRegistrationSchema } from '../auth.validation';
import { sendResponse } from '../../../utils/http';
import { EnumHttpStatus, EnumUserRole } from '../../../../config/enums';
import log from '../../../utils/logger';
import { encrypt } from '../../../utils/passwordHashing';

const LOG_PREFIX = "[AuthController] handleRegister";

/**
 * Handles the incoming registration request.
 * 
 * This function parses the incoming JSON body, validates the data using Zod,
 * and creates a new user in the database if the data is valid.
 * 
 * If the user already exists, it sends a 409 response with an appropriate error
 * message. If there is an error while creating the user, it sends a 500 response
 * with an appropriate error message. If the user is created successfully, it
 * sends a 201 response with the created user data.
 * 
 * @param res - The outgoing HTTP response.
 * @param body - The incoming JSON body.
 * @param userModel - The instance of the user model.
 */
const register = async (res: ServerResponse, body: string, userModel: IUserModel) => {
  // Parse the incoming JSON body
  const newUserData = parseData(res, body, LOG_PREFIX);
  if (!newUserData) return;

  // Validate the incoming data using Zod
  const parsedResult = userRegistrationSchema.safeParse(newUserData);

  if (!parsedResult.success) {
    handleSchemaValidationError(res, parsedResult.error.issues, LOG_PREFIX);
    return;
  }

  // Extract the validated data
  const validatedUser: UserRegistration = parsedResult.data;

  // check if user already exists
  const existingUser = await userModel.getUser(validatedUser.email);
  if (existingUser) {
    sendResponse({
      res,
      status: EnumHttpStatus.CONFLICT,
      success: false,
      message: 'User already exists'
    })
    log(`${LOG_PREFIX}: User already exists with email "${validatedUser.email}"`);

    return;
  }

  // hash the password
  const hashedPassword = encrypt(validatedUser.password);

  // create the user
  const result: ICreateUserResult = await userModel.createUser({
    name: validatedUser.name,
    email: validatedUser.email,
    password: hashedPassword,
    role: EnumUserRole.USER
  });

  // user registration is successful
  if (result.success && result.data) {
    sendResponse({
      res,
      status: EnumHttpStatus.CREATED,
      success: true,
      message: "User created successfully",
      data: {
        id: result.data.id,
        name: result.data.name,
        email: result.data.email,
        role: result.data.role
      }
    })

    // log the success
    log(`${LOG_PREFIX}: User created successfully with id ${result.data.id}`);
    return;
  }

  // error while creating user
  sendResponse({
    res,
    status: EnumHttpStatus.INTERNAL_SERVER_ERROR,
    success: false,
    message: result.message || "Failed to create user",
    errors: result.errors
  })

  // log the error
  log(`${LOG_PREFIX}: Failed to create user with email "${validatedUser.email}"`);
}

export default register;