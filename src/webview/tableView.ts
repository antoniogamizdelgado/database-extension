/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

// TableView webview script

// Define Tabulator type
declare class Tabulator {
  constructor(selector: string, options: TabulatorOptions);
}

interface TabulatorOptions {
  data: any[];
  columns: Column[];
  layout: string;
  pagination: string;
  paginationSize: number;
  initialSort: { column: string; dir: string }[];
  placeholder: string;
}

interface Column {
  title: string;
  field: string;
  sorter: string;
}

// This will be populated by the extension
declare const tableColumns: Column[];
declare const tableData: any[];

// Initialize Tabulator when the document is ready
document.addEventListener("DOMContentLoaded", function () {
  new Tabulator("#table-container", {
    data: tableData,
    columns: tableColumns,
    layout: "fitColumns",
    pagination: "local",
    paginationSize: 10,
    initialSort:
      tableColumns.length > 0
        ? [{ column: tableColumns[0].field, dir: "asc" }]
        : [],
    placeholder: "No Data Available",
  });
});

// Add message handling if needed
window.addEventListener("message", (event: MessageEvent) => {
  const message = event.data;
  // Handle messages from the extension
  console.log("Received message from extension:", message);
});

// Function to send messages back to the extension
function sendMessageToExtension(message: any): void {
  if (acquireVsCodeApi) {
    const vscode = acquireVsCodeApi();
    vscode.postMessage(message);
  }
}

// Declare the acquireVsCodeApi function which is provided by VS Code
declare function acquireVsCodeApi(): any;
