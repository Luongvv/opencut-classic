import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { webEnv } from "@/env/web";

let _db: ReturnType<typeof drizzle> | null = null;

function getDb() {
	if (!_db) {
		if (!webEnv.DATABASE_URL) {
			throw new Error(
				"DATABASE_URL is not set. Database features require a Postgres connection string.",
			);
		}
		const client = postgres(webEnv.DATABASE_URL);
		_db = drizzle(client, { schema });
	}

	return _db;
}

export const db = getDb();

export * from "./schema";
