import { EnumUserRole } from "../../../config/enums";
import IUser from "../../entity/user.entity";
import { IOperationResult } from "../types";

export type INewUser = Omit<IUser, "active" | "id">;

export interface ICreateUserResult extends IOperationResult<Omit<IUser, 'password' | 'active'>> {};

interface IUserModel {
  getUser(email: string): Promise<IUser | undefined>;
  createUser(data: INewUser): Promise<ICreateUserResult>;
}

export default IUserModel;