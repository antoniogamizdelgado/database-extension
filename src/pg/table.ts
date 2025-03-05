import { Client } from "pg";
import { connectToDatabase } from "./client";

/**
 * Represents metadata for a database column
 */
export interface ColumnMetadata {
  name: string;
  dataType: string;
  isNullable: boolean;
  defaultValue: string | null;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  referencedTable?: string;
  referencedColumn?: string;
}

/**
 * Represents metadata for a database table
 */
export interface TableMetadata {
  tableName: string;
  schema: string;
  columns: ColumnMetadata[];
}

/**
 * Get metadata for a specific table including column information
 * @param databaseName The name of the database
 * @param tableName The name of the table
 * @param schema The schema name (defaults to 'public')
 * @returns Promise with table metadata
 */
export async function getTableMetadata(
  databaseName: string,
  tableName: string,
  schema: string = "public"
): Promise<TableMetadata> {
  const client = await connectToDatabase(databaseName);

  try {
    const columnQuery = `
      SELECT 
        c.column_name, 
        c.data_type, 
        c.is_nullable = 'YES' as is_nullable,
        c.column_default as default_value,
        CASE WHEN pk.constraint_name IS NOT NULL THEN true ELSE false END as is_primary_key,
        CASE WHEN fk.constraint_name IS NOT NULL THEN true ELSE false END as is_foreign_key,
        fk.referenced_table_name,
        fk.referenced_column_name
      FROM 
        information_schema.columns c
      LEFT JOIN (
        SELECT 
          tc.constraint_name, 
          kcu.column_name
        FROM 
          information_schema.table_constraints tc
        JOIN 
          information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE 
          tc.constraint_type = 'PRIMARY KEY' AND
          tc.table_schema = $1 AND
          tc.table_name = $2
      ) pk ON c.column_name = pk.column_name
      LEFT JOIN (
        SELECT 
          tc.constraint_name, 
          kcu.column_name,
          ccu.table_name as referenced_table_name,
          ccu.column_name as referenced_column_name
        FROM 
          information_schema.table_constraints tc
        JOIN 
          information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        JOIN 
          information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
        WHERE 
          tc.constraint_type = 'FOREIGN KEY' AND
          tc.table_schema = $1 AND
          tc.table_name = $2
      ) fk ON c.column_name = fk.column_name
      WHERE 
        c.table_schema = $1 AND
        c.table_name = $2
      ORDER BY 
        c.ordinal_position;
    `;

    const result = await client.query(columnQuery, [schema, tableName]);

    const columns: ColumnMetadata[] = result.rows.map((row) => ({
      name: row.column_name,
      dataType: row.data_type,
      isNullable: row.is_nullable,
      defaultValue: row.default_value,
      isPrimaryKey: row.is_primary_key,
      isForeignKey: row.is_foreign_key,
      referencedTable: row.referenced_table_name,
      referencedColumn: row.referenced_column_name,
    }));

    return {
      tableName,
      schema,
      columns,
    };
  } catch (error) {
    console.error(`Error fetching metadata for table '${tableName}':`, error);
    throw error;
  } finally {
    await client.end();
  }
}
