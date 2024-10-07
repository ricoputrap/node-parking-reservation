import IGarage from "../../entity/garage.entity";
import { IGarageQueryParams } from "../../features/garage/handlers";
import { GarageRegistration } from "../../features/garage/validation";
import { IOperationResult } from "../types";

export type INewGarage = Omit<IGarage, "id" | "active">;

export interface IGetAllGaragesResult extends IOperationResult<IGarage[]> {
  totalCount: number;
};
export interface ICreateGarageResult extends IOperationResult<Omit<IGarage, "active">> {};
export interface IUpdateGarageResult extends IOperationResult<Omit<IGarage, "active" | "adminID">> {};

export interface IGarageModel {
  getAllGarages: (queryParams: IGarageQueryParams) => Promise<IGetAllGaragesResult>
  getMyGarages: (adminID: number, queryParams: IGarageQueryParams) => Promise<IGetAllGaragesResult>;
  getGarageAdmin: (garageID: number) => Promise<number>;
  createGarage: (adminID: number, data: GarageRegistration) => Promise<ICreateGarageResult>;
  updateGarage: (adminID: number, garageID: number, data: GarageRegistration) => Promise<IUpdateGarageResult>;
  deleteGarage: (garageID: number) => Promise<IOperationResult<undefined>>;
}