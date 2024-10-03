import { IncomingMessage, ServerResponse } from 'http';
import { EnumPaths } from '../../../config/enums';
import AuthController from './auth.controller';

const notFoundHandler = (req: IncomingMessage, res: ServerResponse) => {
  res.statusCode = 404;
  res.write(JSON.stringify({ error: 'Route not found' }));
  res.end();
}

const authController = new AuthController();

const authRoute = (req: IncomingMessage, res: ServerResponse) => {
  if (req.method === 'POST') {
    const path = req.url?.split('/').pop();

    switch (path) {
      case EnumPaths.REGISTER:
        authController.handleRegister(req, res);
        return;

      case EnumPaths.LOGIN:
        authController.handleLogin(req, res);
        break;

      case EnumPaths.LOGOUT:
        authController.handleLogout(req, res);
        break;

      case EnumPaths.REFRESH:
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