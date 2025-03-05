import { WebviewPanel } from "vscode";
import { ViewColumn, Uri, window } from "vscode";
import { TableMetadata } from "../pg/table";

export interface TableData {
  columns: string[];
  rows: any[];
}

export class TableView {
  private static panel: WebviewPanel | undefined;

  public static render(tableName: string, tableData: TableData) {
    if (this.panel) {
      this.panel.dispose();
    }

    this.panel = TableView.createWebviewPanel(tableName);
    this.panel.webview.html = TableView.getHtmlContent(tableName, tableData);
    this.panel.reveal();

    // Handle messages from the webview
    this.panel.webview.onDidReceiveMessage((message) => {
      console.log("Received message:", message);
    });
  }

  /**
   * Creates new webview panel for the given data source document Uri.
   *
   * @returns New webview panel instance.
   */
  private static createWebviewPanel(tableName: string): WebviewPanel {
    // create new webview panel for the table view
    return window.createWebviewPanel(
      "database.tableView",
      `Table: ${tableName}`,
      {
        viewColumn: ViewColumn.Active,
        preserveFocus: true,
      },
      {
        enableScripts: true,
        enableCommandUris: true,
        enableFindWidget: true,
        retainContextWhenHidden: true,
      }
    );
  }

  private static getHtmlContent(
    tableName: string,
    tableData: TableData
  ): string {
    // Convert table data to JSON string for use in the HTML
    const columnsJson = JSON.stringify(
      tableData.columns.map((col) => ({
        title: col,
        field: col,
        sorter: "string",
      }))
    );

    const rowsJson = JSON.stringify(tableData.rows);

    return /*html*/ `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Tabular Data View</title>
        
        <!-- Tabulator CSS -->
        <link href="https://unpkg.com/tabulator-tables@5.5.0/dist/css/tabulator.min.css" rel="stylesheet">
        
        <!-- Tabulator JS -->
        <script type="text/javascript" src="https://unpkg.com/tabulator-tables@5.5.0/dist/js/tabulator.min.js"></script>
        
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            padding: 20px;
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
          }
          
          h1 {
            color: var(--vscode-editor-foreground);
            margin-bottom: 20px;
          }
          
          #table-container {
            margin-top: 20px;
            height: 400px;
            width: 100%;
          }
          
          /* Tabulator theme customization to match VS Code */
          .tabulator {
            background-color: var(--vscode-editor-background);
            border: 1px solid var(--vscode-panel-border);
          }
          
          .tabulator .tabulator-header {
            background-color: var(--vscode-editor-background);
            border-bottom: 1px solid var(--vscode-panel-border);
            color: var(--vscode-editor-foreground);
          }
          
          .tabulator .tabulator-header .tabulator-col {
            background-color: var(--vscode-editor-background);
            border-right: 1px solid var(--vscode-panel-border);
          }
          
          .tabulator .tabulator-tableHolder .tabulator-table .tabulator-row {
            background-color: var(--vscode-editor-background);
            border-bottom: 1px solid var(--vscode-panel-border);
            color: var(--vscode-editor-foreground);
          }
          
          .tabulator .tabulator-tableHolder .tabulator-table .tabulator-row.tabulator-row-even {
            background-color: var(--vscode-list-hoverBackground);
          }
          
          .tabulator .tabulator-tableHolder .tabulator-table .tabulator-row.tabulator-selected {
            background-color: var(--vscode-list-activeSelectionBackground);
            color: var(--vscode-list-activeSelectionForeground);
          }
          
          .tabulator .tabulator-tableHolder .tabulator-table .tabulator-row:hover {
            background-color: var(--vscode-list-hoverBackground);
          }
          
          .metadata-panel {
            margin-top: 20px;
            padding: 10px;
            background-color: var(--vscode-editor-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
          }
          
          .metadata-title {
            font-weight: bold;
            margin-bottom: 10px;
          }
          
          .metadata-item {
            margin-bottom: 5px;
          }
        </style>
      </head>
      <body>
        <h1>Table: ${tableName}</h1>
        <div id="table-container"></div>
        
        <script>
          // Table data from the server
          const tableColumns = ${columnsJson};
          const tableData = ${rowsJson};
          
          // Initialize Tabulator when the document is ready
          document.addEventListener("DOMContentLoaded", function() {
            new Tabulator("#table-container", {
              data: tableData,
              columns: tableColumns,
              layout: "fitColumns",
              pagination: "local",
              paginationSize: 10,
              initialSort: tableColumns.length > 0 ? [{column: tableColumns[0].field, dir: "asc"}] : [],
              placeholder: "No Data Available"
            });
          });
        </script>
      </body>
    </html>
  `;
  }

  /**
   * Convert TableMetadata to TableData format for display
   */
  public static convertMetadataToTableData(
    metadata: TableMetadata,
    rows: any[]
  ): TableData {
    const columns = metadata.columns.map((col) => col.name);
    console.log("Converting metadata to table data");
    console.log(columns);
    console.log(rows);
    return {
      columns,
      rows,
    };
  }
}
