import { IncomingMessage, ServerResponse } from 'http';
import { IGarageModel } from '../../models/garage-model/index.types';
import GarageModel from '../../models/garage-model';
import log from '../../utils/logger';
import { EnumHttpStatus, EnumLogLevel } from '../../../config/enums';
import { sendResponse } from '../../utils/http';
import handlers from './handlers';

class GarageController {
  private garageModel: IGarageModel;

  constructor() {
    this.garageModel = new GarageModel();
  }

  async getGarages(req: IncomingMessage, res: ServerResponse) {
    try {
      await handlers.getByAdmin(req, res, this.garageModel);
    }
    catch (error: any) {
      log(`${EnumLogLevel.ERROR} [GarageController] getGarage: ${error.message}`);

      sendResponse({
        res,
        status: EnumHttpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        message: error.message || 'An unexpected error occurred'
      });
    }
  }

  createGarage(req: IncomingMessage, res: ServerResponse) {
    let body: string = '';

    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', async () => {
      try {
        await handlers.create(req, res, body, this.garageModel);
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