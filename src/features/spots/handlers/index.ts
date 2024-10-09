import { ServerResponse } from "http";
import create from "./create";
import { IGarageModel } from "../../../models/garage-model/index.types";
import { IParkingSpotModel } from "../../../models/parking-spot-model/index.types";

interface ICreateParams {
  res: ServerResponse,
  userID: number,
  body: string,
  garageModel: IGarageModel,
  parkingSpotModel: IParkingSpotModel
}

interface IParkingSpotHandlers {
  create: (params: ICreateParams) => Promise<void>
}

const handlers: IParkingSpotHandlers = {
  create
}

export default handlers;