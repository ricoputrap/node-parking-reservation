import { ServerResponse } from 'http';
import create from "./create";
import getByAdmin from "./getByAdmin";
import { IGarageModel } from '../../../models/garage-model/index.types';
import getAll from './getAll';

export interface IGarageQueryParams {
  name?: string;
  location?: string;
  startPrice?: number;
  endPrice?: number;
}

interface IGarageHandlers {
  getAll: (res: ServerResponse, garageModel: IGarageModel, queryParams: IGarageQueryParams) => Promise<void>;
  getByAdmin: (res: ServerResponse, userID: number, garageModel: IGarageModel, queryParams: IGarageQueryParams) => Promise<void>;
  create: (res: ServerResponse, userID: number, body: string, garageModel: IGarageModel) => Promise<void>;
}

const handlers: IGarageHandlers = {
  getAll,
  getByAdmin,
  create
};

export default handlers;