import { Client } from "pg";

export async function connectToDatabase(
  databaseName: string | null = null,
  host: string = "badger-postgres",
  port: number = 5432,
  user: string = "postgres",
  password: string = "postgres"
): Promise<Client> {
  const connectionConfig = {
    host,
    port,
    user,
    password,
    database: databaseName || "postgres", // Default to 'postgres' database if none specified
  };

  const client = new Client(connectionConfig);

  try {
    await client.connect();
    console.log(
      `Connected to PostgreSQL database${
        databaseName ? ` '${databaseName}'` : ""
      }`
    );
    return client;
  } catch (error) {
    console.error("Failed to connect to the database", error);
    throw error;
  }
}

export async function listDatabases(): Promise<string[]> {
  const client = await connectToDatabase();

  try {
    const res = await client.query(
      "SELECT datname FROM pg_database WHERE datistemplate = false;"
    );
    return res.rows.map((row) => row.datname);
  } catch (error) {
    console.error("Error fetching databases:", error);
    throw error;
  } finally {
    await client.end();
  }
}

export async function listTables(databaseName: string): Promise<string[]> {
  const client = await connectToDatabase(databaseName);

  try {
    const res = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
    );
    return res.rows.map((row) => row.table_name);
  } catch (error) {
    console.error(
      `Error fetching tables from database '${databaseName}':`,
      error
    );
    throw error;
  } finally {
    await client.end();
  }
}
