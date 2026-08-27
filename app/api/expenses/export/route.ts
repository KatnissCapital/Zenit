import { env } from "cloudflare:workers";
import { schemaStatements } from "@/db/schema";

export const dynamic = "force-dynamic";

type ExpenseExportRow = {
  property_id: string;
  property_name: string | null;
  invoice_date: string;
  payment_date: string | null;
  category: string;
  supplier_name: string;
  supplier_tax_id: string | null;
  concept: string;
  tax_base_cents: number;
  vat_cents: number;
  withholding_cents: number;
  total_cents: number;
  status: string;
  document_url: string | null;
};

const headers = [
  "Inmueble",
  "Codigo inmueble",
  "Fecha factura",
  "Fecha pago",
  "Categoria",
  "Proveedor",
  "NIF proveedor",
  "Concepto",
  "Base imponible",
  "IVA",
  "Retencion",
  "Total",
  "Estado",
  "Factura/documento",
];

export async function GET() {
  const database = "DB" in env ? (env.DB as D1Database) : null;

  if (!database) {
    return new Response("La base de datos no esta disponible.", { status: 503 });
  }

  await database.batch(schemaStatements.map((statement) => database.prepare(statement)));

  const result = await database
    .prepare(
      `SELECT
        e.property_id,
        p.name AS property_name,
        e.invoice_date,
        e.payment_date,
        e.category,
        e.supplier_name,
        e.supplier_tax_id,
        e.concept,
        e.tax_base_cents,
        e.vat_cents,
        e.withholding_cents,
        e.total_cents,
        e.status,
        e.document_url
      FROM expenses e
      LEFT JOIN properties p ON p.id = e.property_id
      ORDER BY e.invoice_date ASC, p.name ASC`,
    )
    .all<ExpenseExportRow>();

  const rows = (result.results ?? []).map((row) => [
    row.property_name ?? row.property_id,
    row.property_id,
    row.invoice_date,
    row.payment_date ?? "",
    row.category,
    row.supplier_name,
    row.supplier_tax_id ?? "",
    row.concept,
    formatEuro(row.tax_base_cents),
    formatEuro(row.vat_cents),
    formatEuro(row.withholding_cents),
    formatEuro(row.total_cents),
    row.status,
    row.document_url ?? "",
  ]);
  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      table { border-collapse: collapse; font-family: Arial, sans-serif; }
      th { background: #17211c; color: #ffffff; }
      th, td { border: 1px solid #dde4dc; padding: 6px 8px; }
      td.amount { mso-number-format:"0.00"; }
    </style>
  </head>
  <body>
    <table>
      <thead>
        <tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (row) =>
              `<tr>${row
                .map((cell, index) => `<td${index >= 8 && index <= 11 ? ' class="amount"' : ""}>${escapeHtml(cell)}</td>`)
                .join("")}</tr>`,
          )
          .join("")}
      </tbody>
    </table>
  </body>
</html>`;

  return new Response(html, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": 'attachment; filename="katniss-gastos-aeat.xls"',
      "Content-Type": "application/vnd.ms-excel; charset=utf-8",
    },
  });
}

function formatEuro(value: number) {
  return ((value ?? 0) / 100).toFixed(2);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
