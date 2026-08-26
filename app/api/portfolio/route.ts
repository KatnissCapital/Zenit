import { env } from "cloudflare:workers";
import { schemaStatements } from "@/db/schema";

export const dynamic = "force-dynamic";

type DocumentStatus = "ok" | "pending" | "review" | "locked";

type Property = {
  id: string;
  name: string;
  address: string;
  type: string;
  status: string;
  tenant: string;
  rent: number;
  yieldNet: number;
  cashflow: number;
  documents: number;
  pendingDocs: number;
  nextReview: string;
  risk: "Bajo" | "Medio" | "Alto";
  value: number;
  annualCosts: {
    homeInsurance: number;
    ibi: number;
    wasteTax: number;
    community: number;
    rentInsurance: number;
    financing: number;
  };
  utilitiesAssumedByTenant: boolean;
  driveFolder: string;
  tags: string[];
};

type DocumentRequirement = {
  label: string;
  status: DocumentStatus;
  detail: string;
};

type PortfolioResponse = {
  properties: Property[];
  documentsByProperty: Record<string, DocumentRequirement[]>;
  persisted: boolean;
  message: string;
};

type PropertyInput = {
  name?: string;
  address?: string;
  rent?: string;
  value?: string;
  driveFolder?: string;
};

type DocumentInput = {
  propertyId?: string;
  label?: string;
  detail?: string;
  status?: DocumentStatus;
};

type PropertyRow = {
  id: string;
  name: string;
  address: string;
  asset_type: string;
  status: string;
  drive_folder_url: string | null;
  market_value_cents: number;
  current_rent_cents: number | null;
  tenant_name: string | null;
  next_review_date: string | null;
  home_insurance_cents: number | null;
  ibi_cents: number | null;
  waste_tax_cents: number | null;
  community_cents: number | null;
  rent_insurance_cents: number | null;
  financing_cents: number | null;
  utilities_assumed_by_tenant: number | null;
  document_count: number;
  pending_document_count: number;
};

type DocumentRow = {
  property_id: string;
  category: string;
  title: string;
  status: DocumentStatus;
  extracted_json: string | null;
};

const seedProperties: Property[] = [
  {
    id: "MAD-014",
    name: "Piso Salamanca",
    address: "Calle Lagasca 42, Madrid",
    type: "Residencial",
    status: "Ocupado",
    tenant: "Laura Medina",
    rent: 1725,
    yieldNet: 5.8,
    cashflow: 685,
    documents: 92,
    pendingDocs: 2,
    nextReview: "15 sep",
    risk: "Bajo",
    value: 428000,
    annualCosts: {
      homeInsurance: 410,
      ibi: 780,
      wasteTax: 68,
      community: 1560,
      rentInsurance: 285,
      financing: 7440,
    },
    utilitiesAssumedByTenant: true,
    driveFolder: "Drive / MAD-014 Piso Salamanca",
    tags: ["IPC revisable", "Contrato firmado"],
  },
  {
    id: "VAL-003",
    name: "Atico Ruzafa",
    address: "Carrer de Sueca 18, Valencia",
    type: "Residencial",
    status: "Ocupado",
    tenant: "Nexo Studio SL",
    rent: 1360,
    yieldNet: 6.4,
    cashflow: 742,
    documents: 76,
    pendingDocs: 5,
    nextReview: "02 oct",
    risk: "Medio",
    value: 286000,
    annualCosts: {
      homeInsurance: 355,
      ibi: 520,
      wasteTax: 62,
      community: 1040,
      rentInsurance: 0,
      financing: 4320,
    },
    utilitiesAssumedByTenant: false,
    driveFolder: "Drive / VAL-003 Atico Ruzafa",
    tags: ["Seguro caduca", "Factura pendiente"],
  },
  {
    id: "BCN-021",
    name: "Local Gracia",
    address: "Travessera de Gracia 91, Barcelona",
    type: "Local",
    status: "En revision",
    tenant: "Cafe Nord",
    rent: 2180,
    yieldNet: 4.9,
    cashflow: 518,
    documents: 84,
    pendingDocs: 3,
    nextReview: "28 ago",
    risk: "Medio",
    value: 512000,
    annualCosts: {
      homeInsurance: 690,
      ibi: 1380,
      wasteTax: 180,
      community: 2220,
      rentInsurance: 0,
      financing: 11880,
    },
    utilitiesAssumedByTenant: true,
    driveFolder: "Drive / BCN-021 Local Gracia",
    tags: ["IRAV pendiente", "Presupuesto abierto"],
  },
  {
    id: "SEV-009",
    name: "Apartamento Triana",
    address: "Calle Pureza 11, Sevilla",
    type: "Residencial",
    status: "Disponible",
    tenant: "Sin inquilino",
    rent: 980,
    yieldNet: 3.7,
    cashflow: 120,
    documents: 61,
    pendingDocs: 8,
    nextReview: "Vacante",
    risk: "Alto",
    value: 238000,
    annualCosts: {
      homeInsurance: 330,
      ibi: 460,
      wasteTax: 54,
      community: 890,
      rentInsurance: 210,
      financing: 3960,
    },
    utilitiesAssumedByTenant: false,
    driveFolder: "Drive / SEV-009 Apartamento Triana",
    tags: ["Vacancia", "Cedula pendiente"],
  },
];

const seedDocuments: Record<string, DocumentRequirement[]> = {
  "MAD-014": [
    { label: "Contrato alquiler", status: "ok", detail: "Firmado y vigente" },
    { label: "Seguro vivienda", status: "ok", detail: "Poliza activa" },
    { label: "IBI", status: "ok", detail: "Recibo anual archivado" },
    { label: "Basuras", status: "ok", detail: "Tasa vinculada" },
    { label: "Comunidad", status: "review", detail: "Pendiente validar cuota 2026" },
    { label: "Seguro alquiler", status: "ok", detail: "Existe garantia" },
    { label: "Suministros", status: "ok", detail: "Asumidos por inquilino" },
    { label: "Financiacion", status: "locked", detail: "Requiere login" },
  ],
  "VAL-003": [
    { label: "Contrato alquiler", status: "ok", detail: "Firmado y vigente" },
    { label: "Seguro vivienda", status: "review", detail: "Caduca proximamente" },
    { label: "IBI", status: "ok", detail: "Recibo anual archivado" },
    { label: "Basuras", status: "pending", detail: "No localizada" },
    { label: "Comunidad", status: "ok", detail: "Cuotas cargadas" },
    { label: "Seguro alquiler", status: "pending", detail: "No consta" },
    { label: "Suministros", status: "review", detail: "Confirmar titularidad" },
    { label: "Financiacion", status: "locked", detail: "Requiere login" },
  ],
  "BCN-021": [
    { label: "Contrato alquiler", status: "review", detail: "Revision IRAV pendiente" },
    { label: "Seguro vivienda", status: "ok", detail: "Poliza activa" },
    { label: "IBI", status: "ok", detail: "Recibo anual archivado" },
    { label: "Basuras", status: "ok", detail: "Tasa vinculada" },
    { label: "Comunidad", status: "ok", detail: "Cuotas cargadas" },
    { label: "Seguro alquiler", status: "pending", detail: "No aplica o no consta" },
    { label: "Suministros", status: "ok", detail: "Asumidos por inquilino" },
    { label: "Financiacion", status: "locked", detail: "Requiere login" },
  ],
  "SEV-009": [
    { label: "Contrato alquiler", status: "pending", detail: "Activo vacante" },
    { label: "Seguro vivienda", status: "ok", detail: "Poliza activa" },
    { label: "IBI", status: "pending", detail: "Falta ultimo recibo" },
    { label: "Basuras", status: "pending", detail: "Falta tasa municipal" },
    { label: "Comunidad", status: "ok", detail: "Cuotas cargadas" },
    { label: "Seguro alquiler", status: "review", detail: "Revisar al alquilar" },
    { label: "Suministros", status: "review", detail: "Preparar cambio titular" },
    { label: "Financiacion", status: "locked", detail: "Requiere login" },
  ],
};

const checklistLabels = [
  "Contrato alquiler",
  "Seguro vivienda",
  "IBI",
  "Basuras",
  "Comunidad",
  "Seguro alquiler",
  "Suministros",
  "Financiacion",
];

export async function GET() {
  try {
    const database = getDatabase();

    if (!database) {
      return json({
        properties: seedProperties,
        documentsByProperty: seedDocuments,
        persisted: false,
        message: "Modo demo local",
      });
    }

    await initializeDatabase(database);
    await seedDatabaseIfEmpty(database);

    return json({
      ...(await readPortfolio(database)),
      persisted: true,
      message: "Datos persistidos",
    });
  } catch {
    return json({
      properties: seedProperties,
      documentsByProperty: seedDocuments,
      persisted: false,
      message: "Modo demo sin conexion a D1",
    });
  }
}

export async function POST(request: Request) {
  try {
    const database = getDatabase();

    if (!database) {
      return json({ error: "La base de datos no esta disponible en este entorno." }, 503);
    }

    await initializeDatabase(database);
    await seedDatabaseIfEmpty(database);

    const body = (await request.json()) as
      | { action: "createProperty"; payload: PropertyInput }
      | { action: "createDocument"; payload: DocumentInput };

    if (body.action === "createProperty") {
      const created = await createProperty(database, body.payload);
      return json({ ...(await readPortfolio(database)), created, persisted: true });
    }

    if (body.action === "createDocument") {
      const created = await createDocument(database, body.payload);
      return json({ ...(await readPortfolio(database)), created, persisted: true });
    }

    return json({ error: "Accion no soportada." }, 400);
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : "Error al guardar." },
      500,
    );
  }
}

function getDatabase() {
  return "DB" in env ? (env.DB as D1Database) : null;
}

async function initializeDatabase(database: D1Database) {
  await database.batch(schemaStatements.map((statement) => database.prepare(statement)));
}

async function seedDatabaseIfEmpty(database: D1Database) {
  const result = await database.prepare("SELECT COUNT(*) AS count FROM properties").first<{
    count: number;
  }>();

  if ((result?.count ?? 0) > 0) {
    return;
  }

  const statements: D1PreparedStatement[] = [];

  for (const property of seedProperties) {
    statements.push(
      database
        .prepare(
          `INSERT INTO properties (
            id, name, address, asset_type, status, drive_folder_url, market_value_cents
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          property.id,
          property.name,
          property.address,
          property.type,
          property.status,
          property.driveFolder,
          toCents(property.value),
        ),
      database
        .prepare(
          `INSERT INTO property_costs (
            id, property_id, period_year, home_insurance_cents, ibi_cents,
            waste_tax_cents, community_cents, rent_insurance_cents, financing_cents,
            utilities_assumed_by_tenant
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          `cost-${property.id}`,
          property.id,
          2026,
          toCents(property.annualCosts.homeInsurance),
          toCents(property.annualCosts.ibi),
          toCents(property.annualCosts.wasteTax),
          toCents(property.annualCosts.community),
          toCents(property.annualCosts.rentInsurance),
          toCents(property.annualCosts.financing),
          property.utilitiesAssumedByTenant ? 1 : 0,
        ),
    );

    if (property.tenant !== "Sin inquilino" && property.tenant !== "Pendiente") {
      const tenantId = `tenant-${property.id}`;
      statements.push(
        database
          .prepare("INSERT INTO tenants (id, display_name) VALUES (?, ?)")
          .bind(tenantId, property.tenant),
        database
          .prepare(
            `INSERT INTO leases (
              id, property_id, tenant_id, start_date, current_rent_cents, status,
              next_review_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          )
          .bind(
            `lease-${property.id}`,
            property.id,
            tenantId,
            "2025-01-01",
            toCents(property.rent),
            property.status,
            property.nextReview,
          ),
      );
    } else {
      statements.push(
        database
          .prepare(
            `INSERT INTO leases (
              id, property_id, start_date, current_rent_cents, status, next_review_date
            ) VALUES (?, ?, ?, ?, ?, ?)`,
          )
          .bind(
            `lease-${property.id}`,
            property.id,
            "2025-01-01",
            toCents(property.rent),
            property.status,
            property.nextReview,
          ),
      );
    }

    for (const document of seedDocuments[property.id] ?? []) {
      statements.push(
        database
          .prepare(
            `INSERT INTO documents (
              id, property_id, category, title, status, sensitive, extracted_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          )
          .bind(
            `doc-${property.id}-${slugify(document.label)}`,
            property.id,
            document.label,
            document.label,
            document.status,
            document.status === "locked" ? 1 : 0,
            JSON.stringify({ detail: document.detail }),
          ),
      );
    }
  }

  await database.batch(statements);
}

async function readPortfolio(database: D1Database): Promise<Omit<PortfolioResponse, "persisted" | "message">> {
  const propertiesResult = await database
    .prepare(
      `SELECT
        p.id,
        p.name,
        p.address,
        p.asset_type,
        p.status,
        p.drive_folder_url,
        p.market_value_cents,
        l.current_rent_cents,
        l.status AS lease_status,
        l.next_review_date,
        t.display_name AS tenant_name,
        c.home_insurance_cents,
        c.ibi_cents,
        c.waste_tax_cents,
        c.community_cents,
        c.rent_insurance_cents,
        c.financing_cents,
        c.utilities_assumed_by_tenant,
        COUNT(d.id) AS document_count,
        SUM(CASE WHEN d.status IN ('pending', 'review') THEN 1 ELSE 0 END) AS pending_document_count
      FROM properties p
      LEFT JOIN leases l ON l.property_id = p.id
      LEFT JOIN tenants t ON t.id = l.tenant_id
      LEFT JOIN property_costs c ON c.property_id = p.id
      LEFT JOIN documents d ON d.property_id = p.id
      GROUP BY p.id
      ORDER BY p.created_at ASC`,
    )
    .all<PropertyRow>();

  const documentResult = await database
    .prepare(
      `SELECT property_id, category, title, status, extracted_json
      FROM documents
      ORDER BY updated_at ASC`,
    )
    .all<DocumentRow>();

  const documentsByProperty: Record<string, DocumentRequirement[]> = {};

  for (const document of documentResult.results ?? []) {
    documentsByProperty[document.property_id] ??= [];
    documentsByProperty[document.property_id].push({
      label: document.title || document.category,
      status: document.status,
      detail: readDocumentDetail(document.extracted_json),
    });
  }

  const properties = (propertiesResult.results ?? []).map((row) => mapProperty(row));

  return { properties, documentsByProperty };
}

async function createProperty(database: D1Database, input: PropertyInput) {
  const rent = Number(input.rent || 0);
  const value = Number(input.value || 0);
  const id = `ALT-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const name = sanitizeText(input.name, "Nuevo inmueble");
  const address = sanitizeText(input.address, "Direccion pendiente");
  const driveFolder = sanitizeText(input.driveFolder, `Drive / ${id}`);
  const documents = checklistLabels.map((label) => ({
    label,
    status: label === "Suministros" ? "review" : label === "Financiacion" ? "locked" : "pending",
    detail: label === "Suministros" ? "Confirmar titularidad" : "Pendiente de cargar",
  })) satisfies DocumentRequirement[];

  await database.batch([
    database
      .prepare(
        `INSERT INTO properties (
          id, name, address, asset_type, status, drive_folder_url, market_value_cents
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(id, name, address, "Residencial", "En alta", driveFolder, toCents(value)),
    database
      .prepare(
        `INSERT INTO leases (
          id, property_id, start_date, current_rent_cents, status, next_review_date
        ) VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .bind(`lease-${id}`, id, new Date().toISOString().slice(0, 10), toCents(rent), "En alta", "Pendiente"),
    database
      .prepare(
        `INSERT INTO property_costs (
          id, property_id, period_year, utilities_assumed_by_tenant
        ) VALUES (?, ?, ?, ?)`,
      )
      .bind(`cost-${id}`, id, new Date().getFullYear(), 0),
    ...documents.map((document) =>
      database
        .prepare(
          `INSERT INTO documents (
            id, property_id, category, title, status, sensitive, extracted_json
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          `doc-${id}-${slugify(document.label)}`,
          id,
          document.label,
          document.label,
          document.status,
          document.status === "locked" ? 1 : 0,
          JSON.stringify({ detail: document.detail }),
        ),
    ),
    database
      .prepare(
        `INSERT INTO audit_log (id, entity_type, entity_id, action, changes_json)
        VALUES (?, ?, ?, ?, ?)`,
      )
      .bind(`audit-${crypto.randomUUID()}`, "property", id, "create", JSON.stringify(input)),
  ]);

  return { id, name };
}

async function createDocument(database: D1Database, input: DocumentInput) {
  const propertyId = sanitizeText(input.propertyId, "");
  const label = sanitizeText(input.label, "Documento");
  const status = input.status ?? "review";
  const detail = sanitizeText(input.detail, "Pendiente de revisar metadatos");
  const property = await database
    .prepare("SELECT id FROM properties WHERE id = ?")
    .bind(propertyId)
    .first<{ id: string }>();

  if (!property) {
    throw new Error("Inmueble no encontrado.");
  }

  const id = `doc-${propertyId}-${slugify(label)}-${crypto.randomUUID().slice(0, 6)}`;

  await database.batch([
    database
      .prepare(
        `INSERT INTO documents (
          id, property_id, category, title, status, sensitive, extracted_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(id, propertyId, label, label, status, status === "locked" ? 1 : 0, JSON.stringify({ detail })),
    database
      .prepare(
        `INSERT INTO audit_log (id, entity_type, entity_id, action, changes_json)
        VALUES (?, ?, ?, ?, ?)`,
      )
      .bind(`audit-${crypto.randomUUID()}`, "document", id, "create", JSON.stringify(input)),
  ]);

  return { propertyId, label, status, detail };
}

function mapProperty(row: PropertyRow): Property {
  const rent = fromCents(row.current_rent_cents);
  const value = fromCents(row.market_value_cents);
  const annualCosts = {
    homeInsurance: fromCents(row.home_insurance_cents),
    ibi: fromCents(row.ibi_cents),
    wasteTax: fromCents(row.waste_tax_cents),
    community: fromCents(row.community_cents),
    rentInsurance: fromCents(row.rent_insurance_cents),
    financing: fromCents(row.financing_cents),
  };
  const annualCostsTotal = Object.values(annualCosts).reduce((sum, cost) => sum + cost, 0);
  const completedDocuments = Math.max(0, row.document_count - row.pending_document_count);
  const documentScore =
    row.document_count > 0 ? Math.round((completedDocuments / row.document_count) * 100) : 0;
  const yieldNet = value > 0 ? Number((((rent * 12 - annualCostsTotal) / value) * 100).toFixed(1)) : 0;

  return {
    id: row.id,
    name: row.name,
    address: row.address,
    type: row.asset_type,
    status: row.status,
    tenant: row.tenant_name ?? "Pendiente",
    rent,
    yieldNet,
    cashflow: Math.max(0, Math.round(rent - annualCostsTotal / 12)),
    documents: documentScore,
    pendingDocs: row.pending_document_count,
    nextReview: row.next_review_date ?? "Pendiente",
    risk: row.pending_document_count >= 6 ? "Alto" : row.pending_document_count >= 3 ? "Medio" : "Bajo",
    value,
    annualCosts,
    utilitiesAssumedByTenant: row.utilities_assumed_by_tenant === 1,
    driveFolder: row.drive_folder_url ?? `Drive / ${row.id}`,
    tags: [
      row.pending_document_count > 0 ? "Documentos pendientes" : "Expediente al dia",
      row.status,
    ],
  };
}

function readDocumentDetail(value: string | null) {
  if (!value) {
    return "Sin detalle";
  }

  try {
    const parsed = JSON.parse(value) as { detail?: string };
    return parsed.detail || "Sin detalle";
  } catch {
    return "Sin detalle";
  }
}

function sanitizeText(value: string | undefined, fallback: string) {
  const text = value?.trim();
  return text ? text.slice(0, 240) : fallback;
}

function toCents(value: number) {
  return Math.round(value * 100);
}

function fromCents(value: number | null) {
  return Math.round((value ?? 0) / 100);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function json(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
