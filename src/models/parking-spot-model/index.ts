import db from "../../../config/database";
import { CreateSpot } from "../../features/spots/validation";
import { ICreateUpdateSpotResult, IParkingSpotModel } from "./index.types";

class ParkingSpotModel implements IParkingSpotModel {

  async createParkingSpot(data: CreateSpot): Promise<ICreateUpdateSpotResult> {
    const QUERY_CREATE_SPOT = `
      INSERT INTO PARKING_SPOT (garage_id, name)
      VALUES (?, ?)
    `;

    const { garageID, name } = data;

    const queryCreateSpot = db.prepare(QUERY_CREATE_SPOT);

    // execute the query
    const createSpotResult = queryCreateSpot.run(garageID, name);

    return {
      success: true,
      data: {
        id: createSpotResult.lastInsertRowid as number,
        name,
        garageID
      }
    }
  }
}

export default ParkingSpotModel;