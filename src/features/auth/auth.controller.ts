import { IncomingMessage, ServerResponse } from 'http';
import UserModel from "../../models/user-model";
import IUserModel from "../../models/user-model/index.types";
import { UserRegistration, userRegistrationSchema } from './auth.validation';
import log from '../../utils/logger';
import { encrypt } from '../../utils/passwordHashing';

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

        // TODO handle race-condition when two users try to create new account
        // using the same email (validated in DB level)
        // store the new user in the database
        const createdUser = await this.userModel.createUser(
          validatedUser.name,
          validatedUser.email,
          hashedPassword
        );
        
        res.statusCode = 201;
        res.write(JSON.stringify({
          success: true,
          message: "User created successfully",
          data: {
            id: createdUser.id,
            name: createdUser.name,
            email: createdUser.email,
          }
        }));

        // log the success
        log(`[AuthController] hanldeRegister: User created successfully with id ${createdUser.id}`);

        res.end();
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
      log(`[AuthController] hanldeRegister: ${error.message}`);
    }
  }
}

export default AuthController;