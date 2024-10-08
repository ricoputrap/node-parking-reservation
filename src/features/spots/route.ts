import { IncomingMessage, ServerResponse } from 'http';
import { EnumHttpMethod } from '../../../config/enums';
import { methodNotAllowedHandler } from '../../utils/http';

const spotsRoute = (req: IncomingMessage, res: ServerResponse) => {
  switch (req.method) {
    // Get All Garages (can be filtered by name, location, or by the admin)
    case EnumHttpMethod.GET:
      // garageController.getGarages(req, res);
      break;

    // Open New Garage - by Garage Admin
    case EnumHttpMethod.POST:
      // garageController.createGarage(req, res);
      break;

    // Update Garage - by Garage Admin
    case EnumHttpMethod.PUT:
      // garageController.updateGarage(req, res);
      break;

    // Delete Garage - by Garage Admin
    case EnumHttpMethod.DELETE:
      // garageController.deleteGarage(req, res);
      break;

    default:
      methodNotAllowedHandler(req, res);
      break;
  }
}

export default spotsRoute;