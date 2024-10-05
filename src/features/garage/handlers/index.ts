import { ServerResponse } from 'http';
import create from "./create";
import getByAdmin from "./getByAdmin";
import { IGarageModel } from '../../../models/garage-model/index.types';

export interface IGarageQueryParams {
  name?: string;
  location?: string;
  startPrice?: number;
  endPrice?: number;
}

interface IGarageHandlers {
  create: (res: ServerResponse, userID: number, body: string, garageModel: IGarageModel) => Promise<void>;
  getByAdmin: (res: ServerResponse, userID: number, garageModel: IGarageModel, queryParams: IGarageQueryParams) => Promise<void>;
}

const handlers: IGarageHandlers = {
  create,
  getByAdmin
};

export default handlers;