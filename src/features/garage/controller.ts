import { IncomingMessage, ServerResponse } from 'http';
import { URL } from 'url';
import { IGarageModel } from '../../models/garage-model/index.types';
import GarageModel from '../../models/garage-model';
import log from '../../utils/logger';
import { EnumHttpStatus, EnumLogLevel, EnumUserRole } from '../../../config/enums';
import { errorHandler, sendResponse } from '../../utils/http';
import handlers, { IGarageQueryParams } from './handlers';
import authorize from '../../decorators/authorize';
import ForbiddenError from '../../errors/ForbiddenError';

class GarageController {
  private garageModel: IGarageModel;

  constructor() {
    this.garageModel = new GarageModel();
  }

  @authorize([EnumUserRole.USER, EnumUserRole.GARAGE_ADMIN])
  async getGarages(req: IncomingMessage, res: ServerResponse) {
    try {
      if (!req.user) {
        const message = `The user is not allowed to access this resource.`;
        throw new ForbiddenError(message);
      }

      // Access query parameters
      const url = new URL(req.url!, `http://${req.headers.host}`);
      const name: string = url.searchParams.get('name') || "";
      const location: string = url.searchParams.get('location') || "";
      const startPrice: number = Number(url.searchParams.get('startPrice')) || 0;
      const endPrice: number = Number(url.searchParams.get('endPrice')) || 0;

      // prepare query params
      const queryParams: IGarageQueryParams = {
        name,
        location,
        startPrice,
        endPrice
      };

      // TODO: add pagination

      // get all garages
      if (req.user.role == EnumUserRole.USER) {
        // TODO
        res.end();
        return;
      }

      // get all garages owned by admin
      await handlers.getByAdmin(res, req.user.user_id, this.garageModel, queryParams);
    }
    catch (error: any) {
      const logPrefix = `${EnumLogLevel.ERROR} [GarageController] getGarages`;
      errorHandler(error, res, logPrefix);
    }
  }

  createGarage(req: IncomingMessage, res: ServerResponse, userID: number) {
    let body: string = '';

    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', async () => {
      try {
        await handlers.create(res, userID, body, this.garageModel);
      }
      catch (error: any) {
        log(`${EnumLogLevel.ERROR} [GarageController] createGarage: ${error.message}`);

        sendResponse({
          res,
          status: EnumHttpStatus.INTERNAL_SERVER_ERROR,
          success: false,
          message: error.message || 'An unexpected error occurred'
        });
      }
    });
  }
}

export default GarageController;