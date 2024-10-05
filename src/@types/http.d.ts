import { IUserData } from '../middlewares/auth';

declare module 'http' {
    interface IncomingMessage {
        user?: IUserData;
    }
}
