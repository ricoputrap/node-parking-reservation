import { IUserData } from "../utils/token/index.types";

declare module 'http' {
    interface IncomingMessage {
        user?: IUserData;
    }
}
