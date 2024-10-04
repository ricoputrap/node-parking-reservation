import { IncomingMessage, ServerResponse } from 'http';
import { EnumAdminPaths } from '../../../config/enums';

const notFoundHandler = (req: IncomingMessage, res: ServerResponse) => {
  res.statusCode = 404;
  res.write(JSON.stringify({ error: 'Route not found' }));
  res.end();
}

const adminRoute = (req: IncomingMessage, res: ServerResponse) => {
  if (req.method === 'POST') {
    const path = req.url?.split('/').pop();

    switch (path) {
      case EnumAdminPaths.GARAGES:
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

export default adminRoute;