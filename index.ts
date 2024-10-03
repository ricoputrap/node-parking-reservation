import { IncomingMessage, ServerResponse, createServer } from 'http';

import authRoute from './src/features/auth/auth.route';
import log from './src/utils/logger';
import { PORT } from './config/constants';
import spotsRoute from './src/features/spots/spots.route';
import reservationsRoute from './src/features/reservations/reservations.route';
import paymentsRoute from './src/features/payments/payments.route';

const notFoundHandler = (req: IncomingMessage, res: ServerResponse) => {
  res.statusCode = 404;
  res.write(JSON.stringify({ error: 'Route not found' }));
  res.end();
}

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  res.setHeader('Content-Type', 'application/json');

  // Log the incoming request
  const loggedMessage = `${req.method} ${req.url}`;
  console.log(loggedMessage);
  log(loggedMessage);

  if (req.url?.startsWith("/api/auth"))
    authRoute(req, res);
  else if (req.url?.startsWith("/api/spots"))
    spotsRoute(req, res);
  else if (req.url?.startsWith("/api/reservations"))
    reservationsRoute(req, res);
  else if (req.url?.startsWith("/api/payments"))
    paymentsRoute(req, res);
  else
    notFoundHandler(req, res);
});

server.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
})