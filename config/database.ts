import { DatabaseSync } from 'node:sqlite';

class Database {
  private static db: DatabaseSync;

  public static getDatabase(): DatabaseSync {
    if (!Database.db) {
      Database.db = new DatabaseSync('database.db');
    }

    return Database.db;
  }
}

const db = Database.getDatabase();

export default db