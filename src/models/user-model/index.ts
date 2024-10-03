import db from "../../../config/database";
import IUser from "../../entity/user.entity";
import log from "../../utils/logger";
import IUserModel, { ICreateUserResult, INewUser } from "./index.types";

const users: IUser[] = [];

class UserModel implements IUserModel {

  async getUser(email: string): Promise<IUser | undefined> {
    const QUERY_GET_USER_BY_EMAIL = `
      SELECT * FROM USER
      WHERE email = ?
    `;

    const queryGetUserByEmail = db.prepare(QUERY_GET_USER_BY_EMAIL);
    const result = queryGetUserByEmail.get(email);

    return result as IUser;
  }

  async createUser(data: INewUser): Promise<ICreateUserResult> {
    try {
      const QUERY_INSERT_USER = `
        INSERT INTO USER (name, email, password, role)
        VALUES (?, ?, ?, ?)
      `;
      const { name, email, password, role } = data;

      const queryInserUser = db.prepare(QUERY_INSERT_USER);

      // execute the query
      const result = queryInserUser.run(name, email, password, role);

      return {
        success: true,
        data: {
          id: result.lastInsertRowid as number,
          name,
          email,
          role
        }
      }
    }
    catch (error: any) {
      if (error.code === 'ERR_SQLITE_ERROR') {
        // email already exists
        if (error.message.includes('UNIQUE constraint failed')) {
          log("[UserModel] createUser: Email already exists");

          return {
            success: false,
            message: "DB Error: Failed to create user",
            errors: {
              email: "Email already exists"
            }
          }
        }
      }

      log("[UserModel] createUser: Failed to create user");
      
      return {
        success: false,
        message: "DB Error: Failed to create user"
      }
    }
  }
}

export default UserModel;