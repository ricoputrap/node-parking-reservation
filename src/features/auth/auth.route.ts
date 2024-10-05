import { IncomingMessage, ServerResponse } from 'http';
import { EnumPaths } from '../../../config/enums';
import AuthController from './auth.controller';
import { notFoundHandler } from '../../utils/http';

const authController = new AuthController();

const authRoute = (req: IncomingMessage, res: ServerResponse) => {
  if (req.method === 'POST') {
    const path = req.url?.split('/').pop();

    switch (path) {
      case EnumPaths.REGISTER:
        authController.handleRegister(req, res);
        break;

      case EnumPaths.LOGIN:
        authController.handleLogin(req, res);
        break;

      case EnumPaths.LOGOUT:
        authController.handleLogout(req, res);
        break;

      case EnumPaths.REFRESH:
        authController.handleRefresh(req, res);
        break;

      default:
        notFoundHandler(req, res);
        break;
    }
  }
  else {
    notFoundHandler(req, res);
  }
}

export default authRoute;