import { drizzle } from "drizzle-orm/better-sqlite3";

// You can specify any property from the libsql connection options
const db = drizzle(process.env.DATABASE_URL!);

export default db;
