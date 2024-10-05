import { IncomingMessage, ServerResponse } from 'http';
import { EnumHttpMethod, EnumUserRole } from '../../../config/enums';
import { methodNotAllowedHandler } from '../../utils/http';
import GarageController from './controller';
import authMiddleware from '../../middlewares/auth';

const garageController = new GarageController();

const garageRoute = (req: IncomingMessage, res: ServerResponse) => {
  switch (req.method) {
    // Get All Garages (can be filtered by name, location, or by the admin)
    case EnumHttpMethod.GET:
        garageController.getGarages(req, res);
      break;

    // Open New Garage - by Garage Admin
    case EnumHttpMethod.POST:
      authMiddleware([EnumUserRole.GARAGE_ADMIN])(req, res, (user) => {
        garageController.createGarage(req, res, user.user_id);
      })
      break;

    // Update Garage - by Garage Admin
    case EnumHttpMethod.PUT:
      // TODO
      res.end();
      break;

    // Delete Garage - by Garage Admin
    case EnumHttpMethod.DELETE:
      // TODO
      res.end();
      break;

    default:
      methodNotAllowedHandler(req, res);
      break;
  }
}

export default garageRoute;