import { EnumUserRole } from "../../../config/enums";

export interface IPayload {
  iat: number; // issued at time in ms
  exp: number; // expiration time in ms
  user_id: number;
  email: string;
  role: EnumUserRole;
}