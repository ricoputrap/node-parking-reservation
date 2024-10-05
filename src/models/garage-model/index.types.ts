import IGarage from "../../entity/garage.entity";
import { IGarageQueryParams } from "../../features/garage/handlers";
import { GarageRegistration } from "../../features/garage/validation";
import { IOperationResult } from "../types";

export type INewGarage = Omit<IGarage, "id" | "active">;

export interface ICreateGarageResult extends IOperationResult<Omit<IGarage, "active">> {};

export interface IGarageModel {
  getMyGarages: (adminID: number, queryParams: IGarageQueryParams) => Promise<IGarage[]>;
  createGarage: (adminID: number, data: GarageRegistration) => Promise<ICreateGarageResult>;
}