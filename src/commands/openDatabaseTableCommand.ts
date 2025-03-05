import * as vscode from "vscode";
import { listDatabases, listTables, connectToDatabase } from "../pg/client";
import { getTableMetadata } from "../pg/table";
import { TableView } from "../TableView/TableView";

export const openDatabaseTableCommand = vscode.commands.registerCommand(
  "database-extension.openDatabaseTable",
  async () => {
    try {
      // Get list of databases
      const databases = await listDatabases();
      const selectedDatabase = await vscode.window.showQuickPick(databases, {
        placeHolder: "Select a database",
      });
      if (!selectedDatabase) {
        return;
      }

      // Get list of tables in the selected database
      const tables = await listTables(selectedDatabase);
      const selectedTable = await vscode.window.showQuickPick(tables, {
        placeHolder: "Select a table",
      });

      if (!selectedTable) {
        return;
      }

      // Get table metadata
      const tableMetadata = await getTableMetadata(
        selectedDatabase,
        selectedTable
      );

      // Get table data (rows)
      const client = await connectToDatabase(selectedDatabase);
      try {
        const result = await client.query(
          `SELECT * FROM "${selectedTable}" LIMIT 100`
        );
        const rows = result.rows;

        // Convert metadata and rows to TableData format
        const tableData = TableView.convertMetadataToTableData(
          tableMetadata,
          rows
        );

        // Render the table view
        TableView.render(selectedTable, tableData);
      } finally {
        await client.end();
      }
    } catch (error: any) {
      vscode.window.showErrorMessage(`Error opening table: ${error.message}`);
      console.error(error);
    }
  }
);
