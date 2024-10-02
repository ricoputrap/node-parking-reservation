import { IncomingMessage, ServerResponse } from 'http';

const notFoundHandler = (req: IncomingMessage, res: ServerResponse) => {
  res.statusCode = 404;
  res.write(JSON.stringify({ error: 'Route not found' }));
  res.end();
}

const reservationsRoute = (req: IncomingMessage, res: ServerResponse) => {
  // TODO implement correct routing
  notFoundHandler(req, res);
}

export default reservationsRoute;