import IUser from "../../entity/user.entity";
import IUserModel from "./index.types";

const users: IUser[] = [];

class UserModel implements IUserModel {

  async getUser(email: string): Promise<IUser | undefined> {
    return users.find(user => user.email === email);
  }

  async createUser(name: string, email: string, password: string): Promise<Omit<IUser, 'password'>> {
    const newUser: IUser = {
      id: users.length + 1,
      name,
      email,
      password
    }

    users.push(newUser);
    
    return {
      id: newUser.id,
      name,
      email
    }
  }
}

export default UserModel;