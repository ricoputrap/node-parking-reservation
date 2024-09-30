import IUser from "../../entity/user.entity";

interface IUserModel {
  getUser(email: string): Promise<IUser | undefined>;
  createUser(name: string, email: string, password: string): Promise<Omit<IUser, 'password'>>;
}

export default IUserModel;