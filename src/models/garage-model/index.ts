import { SupportedValueType } from "node:sqlite";
import db from "../../../config/database";
import IGarage from "../../entity/garage.entity";
import { IGarageQueryParams } from "../../features/garage/handlers";
import { GarageRegistration } from "../../features/garage/validation";
import { IGarageModel } from "./index.types";

class GarageModel implements IGarageModel {

  async getMyGarages(adminID: number, queryParams: IGarageQueryParams) {

    const args: SupportedValueType[] = [adminID];
    let query = `
      SELECT GARAGE.*, GARAGE_ADMIN.user_id AS adminID FROM GARAGE
      INNER JOIN GARAGE_ADMIN ON GARAGE_ADMIN.garage_id = GARAGE.id
      WHERE
        GARAGE_ADMIN.user_id = ?
        AND GARAGE.active = 1
    `;

    if (queryParams.name) {
      query += ` AND GARAGE.name LIKE ?`;
      args.push(queryParams.name);
    }
    if (queryParams.location) {
      query += ` AND GARAGE.location LIKE ?`;
      args.push(queryParams.location);
    }
    if (queryParams.startPrice) {
      query += ` AND GARAGE.price_per_hour >= ?`;
      args.push(queryParams.startPrice);
    }
    if (queryParams.endPrice) {
      query += ` AND GARAGE.price_per_hour <= ?`;
      args.push(queryParams.endPrice);
    }

    // create the prepared statement for the query
    const queryGetGarages = db.prepare(query);

    // execute the query
    const result = queryGetGarages.all(...args);

    return result as IGarage[];
  }

  async createGarage(adminID: number, data: GarageRegistration) {

    const QUERY_INSERT_GARAGE = `
      INSERT INTO GARAGE (name, location, price_per_hour)
      VALUES (?, ?, ?)
    `;

    const { name, location, pricePerHour } = data;

    const queryInsertGarage = db.prepare(QUERY_INSERT_GARAGE);

    // execute the query
    const createNewGarageResult = queryInsertGarage.run(name, location, pricePerHour);

    const QUERY_INSERT_GARAGE_ADMIN = `
      INSERT INTO GARAGE_ADMIN (garage_id, user_id)
      VALUES (?, ?)
    `;

    const queryInsertGarageAdmin = db.prepare(QUERY_INSERT_GARAGE_ADMIN);

    // execute the query
    queryInsertGarageAdmin.run(createNewGarageResult.lastInsertRowid, adminID);

    return {
      success: true,
      data: {
        id: createNewGarageResult.lastInsertRowid as number,
        name,
        location,
        pricePerHour,
        adminID
      }
    }
  }
}

export default GarageModel;