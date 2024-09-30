import { IncomingMessage, ServerResponse, createServer } from 'http';
import dotenv from 'dotenv';
import authRoute from './features/auth/auth.route';
import log from './utils/logger';

dotenv.config();

const PORT = process.env.PORT || 3000;

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  res.setHeader('Content-Type', 'application/json');

  // Log the incoming request
  const loggedMessage = `${req.method} ${req.url}`;
  console.log(loggedMessage);
  log(loggedMessage);


  if (req.url?.startsWith("/api/auth")) authRoute(req, res);
  else res.end();
});

server.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
})