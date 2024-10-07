import { ServerResponse } from 'http';
import { IGarageModel } from '../../../models/garage-model/index.types';
import create from "./create";
import getByAdmin from "./getByAdmin";
import getAll from './getAll';
import update from './update';
import deleteGarage from './delete';

export interface IGarageQueryParams {
  name?: string;
  location?: string;
  startPrice?: number;
  endPrice?: number;
  page: number;
  size: number;
}

interface IGarageHandlers {
  getAll: (
    res: ServerResponse,
    garageModel: IGarageModel,
    queryParams: IGarageQueryParams
  ) => Promise<void>;

  getByAdmin: (
    res: ServerResponse,
    userID: number,
    garageModel: IGarageModel,
    queryParams: IGarageQueryParams
  ) => Promise<void>;

  create: (
    res: ServerResponse,
    userID: number,
    body: string,
    garageModel: IGarageModel
  ) => Promise<void>;

  update: (
    res: ServerResponse,
    userID: number,
    garageID: number,
    body: string,
    garageModel: IGarageModel
  ) => Promise<void>;

  delete: (res: ServerResponse,
    userID: number,
    garageID: number,
    garageModel: IGarageModel
  ) => Promise<void>;
}

const handlers: IGarageHandlers = {
  getAll,
  getByAdmin,
  create,
  update,
  delete: deleteGarage
};

export default handlers;