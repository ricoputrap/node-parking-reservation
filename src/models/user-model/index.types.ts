import IUser from "../../entity/user.entity";

export type INewUser = Omit<IUser, "active" | "id">;

export interface IOperationResult<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string>;
}

export interface ICreateUserResult extends IOperationResult<Omit<IUser, 'password' | 'active'>> {};

interface IUserModel {
  getUser(email: string): Promise<IUser | undefined>;
  createUser(data: INewUser): Promise<ICreateUserResult>;
}

export default IUserModel;