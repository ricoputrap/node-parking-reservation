import { EnumUserRole } from "../../config/enums";

interface IUser {
  id: number;
  name: string;
  email: string;
  password: string;
  role: EnumUserRole;
  active: boolean;
}

export default IUser;