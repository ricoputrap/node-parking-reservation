import IParkingSpot from "../../entity/spot.entity";
import { CreateSpot } from "../../features/spots/validation";
import { IOperationResult } from "../types";

export interface ICreateUpdateSpotResult extends IOperationResult<Omit<IParkingSpot, "active" | "reserved">> {};

export interface IParkingSpotModel {
  createParkingSpot: (data: CreateSpot) => Promise<ICreateUpdateSpotResult>;
}