import { WebviewPanel } from "vscode";
import { ViewColumn, Uri, window } from "vscode";
import { TableMetadata } from "../pg/table";
import * as fs from "fs";
import * as path from "path";

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
    this.panel.webview.html = TableView.getHtmlContent(
      tableName,
      tableData,
      this.panel
    );
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
    tableData: TableData,
    panel: WebviewPanel
  ): string {
    // Get path to the HTML template
    const extensionPath = path.resolve(__dirname, "../");
    const htmlPath = path.join(
      extensionPath,
      "src",
      "webview",
      "tableView.html"
    );

    // Read the HTML template
    let html = fs.readFileSync(htmlPath, "utf8");

    // Convert table data to JSON string for use in the HTML
    const columnsJson = JSON.stringify(
      tableData.columns.map((col) => ({
        title: col,
        field: col,
        sorter: "string",
      }))
    );

    const rowsJson = JSON.stringify(tableData.rows);

    // Get the URI for the webview script
    const scriptPath = Uri.file(
      path.join(extensionPath, "dist", "webview", "tableView.js")
    );
    const scriptUri = panel.webview.asWebviewUri(scriptPath);

    // Replace placeholders in the HTML template
    html = html.replace("{{tableName}}", tableName);
    html = html.replace(/{\/\*COLUMNS_JSON_PLACEHOLDER\*\/}/g, columnsJson);
    html = html.replace(/{\/\*ROWS_JSON_PLACEHOLDER\*\/}/g, rowsJson);
    html = html.replace("{{webviewScriptUri}}", scriptUri.toString());

    return html;
  }

  /**
   * Convert TableMetadata to TableData format for display
   */
  public static convertMetadataToTableData(
    metadata: TableMetadata,
    rows: any[]
  ): TableData {
    return {
      columns: metadata.columns.map((col) => col.name),
      rows,
    };
  }
}
