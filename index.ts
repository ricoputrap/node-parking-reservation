import { IncomingMessage, ServerResponse, createServer } from 'http';

import authRoute from './src/features/auth/route';
import log from './src/utils/logger';
import { PORT } from './config/constants';
import spotsRoute from './src/features/spots/route';
import reservationsRoute from './src/features/reservations/reservations.route';
import paymentsRoute from './src/features/payments/payments.route';
import { notFoundHandler } from './src/utils/http';
import garageRoute from './src/features/garage/route';

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  res.setHeader('Content-Type', 'application/json');

  // Log the incoming request
  const loggedMessage = `${req.method} ${req.url}`;
  console.log(loggedMessage);
  log(loggedMessage);

  const routes = [
    { url: "/api/auth", handler: authRoute },
    { url: "/api/reservations", handler: reservationsRoute },
    { url: "/api/payments", handler: paymentsRoute },
    { url: "/api/garages", handler: garageRoute },
    { url: "/api/spots", handler: spotsRoute },
  ];

  const matchedRoute = routes.find((route) => req.url?.startsWith(route.url));

  if (matchedRoute) {
    matchedRoute.handler(req, res);
  }
  else {
    notFoundHandler(req, res);
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
})