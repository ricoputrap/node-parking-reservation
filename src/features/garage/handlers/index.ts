import { IncomingMessage, ServerResponse } from 'http';
import create from "./create";
import getByAdmin from "./getByAdmin";
import { IGarageModel } from '../../../models/garage-model/index.types';

interface IGarageHandlers {
  create: (req: IncomingMessage, res: ServerResponse, body: string, garageModel: IGarageModel) => Promise<void>;
  getByAdmin: (req: IncomingMessage, res: ServerResponse, garageModel: IGarageModel) => Promise<void>;
}

const handlers: IGarageHandlers = {
  create,
  getByAdmin
};

export default handlers;