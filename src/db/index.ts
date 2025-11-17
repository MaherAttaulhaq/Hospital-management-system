import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

// You can specify any property from the libsql connection options
const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

const db = drizzle(client);

export default db;
