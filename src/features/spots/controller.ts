import { IncomingMessage, ServerResponse } from 'http';
import ParkingSpotModel from "../../models/parking-spot-model";
import { IParkingSpotModel } from "../../models/parking-spot-model/index.types";
import authorize from '../../decorators/authorize';
import { EnumLogLevel, EnumUserRole } from '../../../config/enums';
import ForbiddenError from '../../errors/ForbiddenError';
import handlers from './handlers';
import { IGarageModel } from '../../models/garage-model/index.types';
import GarageModel from '../../models/garage-model';
import { errorHandler } from '../../utils/http';

class ParkingSpotController {
  private garageModel: IGarageModel;
  private parkingSpotModel: IParkingSpotModel;

  constructor() {
    this.garageModel = new GarageModel();
    this.parkingSpotModel = new ParkingSpotModel();
  }

  @authorize([EnumUserRole.GARAGE_ADMIN])
  async createParkingSpot(req: IncomingMessage, res: ServerResponse) {
    let body: string = '';

    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', async () => {
      try {
        if (!req.user) {
          const message = `The user is not allowed to access this resource.`;
          throw new ForbiddenError(message);
        }

        await handlers.create({
          res,
          userID: req.user.user_id,
          body,
          garageModel: this.garageModel,
          parkingSpotModel: this.parkingSpotModel
        });
      }
      catch (error: any) {
        const logPrefix = `${EnumLogLevel.ERROR} [ParkingSpotController] createParkingSpot`;
        errorHandler(error, res, logPrefix);
      }
    });
  }
}

export default ParkingSpotController;