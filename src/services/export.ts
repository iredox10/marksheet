import ExcelJS from "exceljs";
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  AlignmentType,
  HeadingLevel,
} from "docx";
import type { ExtractedData } from "../types";

export async function generateExcel(data: ExtractedData): Promise<Blob> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Extracted Data");

  let currentRow = 1;

  if (data.metadata && Object.keys(data.metadata).length > 0) {
    Object.entries(data.metadata).forEach(([key, value]) => {
      sheet.getCell(`A${currentRow}`).value = key;
      sheet.getCell(`A${currentRow}`).font = { bold: true };
      sheet.getCell(`B${currentRow}`).value = value;
      currentRow++;
    });
    currentRow += 2;
  }

  if (data.tableHeaders.length > 0) {
    const headerRow = sheet.getRow(currentRow);
    data.tableHeaders.forEach((header, idx) => {
      const cell = headerRow.getCell(idx + 1);
      cell.value = header;
      cell.font = { bold: true, color: { argb: "FFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "4472C4" },
      };
      cell.alignment = { horizontal: "center" };
      cell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };
    });
    currentRow++;

    data.tableData.forEach((rowData) => {
      const row = sheet.getRow(currentRow);
      data.tableHeaders.forEach((header, idx) => {
        const cell = row.getCell(idx + 1);
        cell.value = rowData[header] ?? "-";
        cell.border = {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = { horizontal: "center" };
      });
      currentRow++;
    });
    currentRow += 2;
  }

  if (data.summary && Object.keys(data.summary).length > 0) {
    Object.entries(data.summary).forEach(([key, value]) => {
      sheet.getCell(`A${currentRow}`).value = key;
      sheet.getCell(`A${currentRow}`).font = { bold: true };
      sheet.getCell(`B${currentRow}`).value = value;
      currentRow++;
    });
    currentRow += 2;
  }

  if (data.remarks && Object.keys(data.remarks).length > 0) {
    Object.entries(data.remarks).forEach(([key, value]) => {
      sheet.getCell(`A${currentRow}`).value = key;
      sheet.getCell(`A${currentRow}`).font = { bold: true };
      currentRow++;
      sheet.getCell(`A${currentRow}`).value = value;
      currentRow += 2;
    });
  }

  sheet.columns.forEach((column, idx) => {
    column.width = idx === 0 ? 20 : 15;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

export function generateCSV(data: ExtractedData): Blob {
  const lines: string[] = [];

  if (data.metadata && Object.keys(data.metadata).length > 0) {
    Object.entries(data.metadata).forEach(([key, value]) => {
      lines.push(`${escapeCSV(key)},${escapeCSV(String(value))}`);
    });
    lines.push("");
  }

  if (data.tableHeaders.length > 0) {
    lines.push(data.tableHeaders.map(escapeCSV).join(","));
    data.tableData.forEach((rowData) => {
      const row = data.tableHeaders.map((header) =>
        escapeCSV(String(rowData[header] ?? ""))
      );
      lines.push(row.join(","));
    });
    lines.push("");
  }

  if (data.summary && Object.keys(data.summary).length > 0) {
    Object.entries(data.summary).forEach(([key, value]) => {
      lines.push(`${escapeCSV(key)},${escapeCSV(String(value))}`);
    });
    lines.push("");
  }

  if (data.remarks && Object.keys(data.remarks).length > 0) {
    Object.entries(data.remarks).forEach(([key, value]) => {
      lines.push(`${escapeCSV(key)},${escapeCSV(String(value))}`);
    });
  }

  return new Blob([lines.join("\n")], { type: "text/csv" });
}

function escapeCSV(str: string): string {
  if (!str) return "";
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function generateWord(data: ExtractedData): Promise<Blob> {
  const children: (Paragraph | Table)[] = [];

  if (data.metadata && Object.keys(data.metadata).length > 0) {
    Object.entries(data.metadata).forEach(([key, value]) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${key}: `, bold: true }),
            new TextRun({ text: String(value) }),
          ],
          spacing: { after: 100 },
        })
      );
    });
    children.push(new Paragraph({ text: "", spacing: { after: 200 } }));
  }

  if (data.tableHeaders.length > 0) {
    const tableRows: TableRow[] = [];

    tableRows.push(
      new TableRow({
        children: data.tableHeaders.map(
          (header) =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: header, bold: true })],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              shading: { fill: "4472C4" },
            })
        ),
      })
    );

    data.tableData.forEach((rowData) => {
      tableRows.push(
        new TableRow({
          children: data.tableHeaders.map(
            (header) =>
              new TableCell({
                children: [
                  new Paragraph({
                    text: String(rowData[header] ?? "-"),
                    alignment: AlignmentType.CENTER,
                  }),
                ],
              })
          ),
        })
      );
    });

    children.push(
      new Table({
        rows: tableRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
      })
    );
    children.push(new Paragraph({ text: "", spacing: { after: 300 } }));
  }

  if (data.summary && Object.keys(data.summary).length > 0) {
    children.push(
      new Paragraph({
        text: "Summary",
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 200 },
      })
    );
    Object.entries(data.summary).forEach(([key, value]) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${key}: `, bold: true }),
            new TextRun({ text: String(value) }),
          ],
          spacing: { after: 100 },
        })
      );
    });
    children.push(new Paragraph({ text: "", spacing: { after: 200 } }));
  }

  if (data.remarks && Object.keys(data.remarks).length > 0) {
    children.push(
      new Paragraph({
        text: "Remarks",
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 200 },
      })
    );
    Object.entries(data.remarks).forEach(([key, value]) => {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: `${key}:`, bold: true })],
          spacing: { after: 100 },
        })
      );
      children.push(
        new Paragraph({
          text: String(value),
          spacing: { after: 200 },
        })
      );
    });
  }

  const doc = new Document({
    sections: [{ children }],
  });

  const buffer = await Packer.toBlob(doc);
  return buffer;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
