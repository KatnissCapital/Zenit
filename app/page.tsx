"use client";

import { useMemo, useState } from "react";

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

type DocumentStatus = "ok" | "pending" | "review" | "locked";

type DocumentRequirement = {
  label: string;
  status: DocumentStatus;
  detail: string;
};

const properties: Property[] = [
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

const alerts = [
  {
    title: "Revision de renta disponible",
    detail: "Local Gracia puede actualizar renta con evidencia IRAV.",
    tone: "amber",
    due: "Hoy",
  },
  {
    title: "Documentos obligatorios faltantes",
    detail: "Atico Ruzafa necesita seguro actualizado y justificante de fianza.",
    tone: "rose",
    due: "2 dias",
  },
  {
    title: "Factura duplicada probable",
    detail: "Proveedor Fontacasa, factura F-1027, importe 386,40 EUR.",
    tone: "blue",
    due: "Revision",
  },
];

const financialRows = [
  ["Ingresos mensuales", "6.245 EUR", "+4,2%"],
  ["NOI estimado", "4.190 EUR", "+2,8%"],
  ["Cash flow neto", "2.065 EUR", "+310 EUR"],
  ["Vacancia prevista", "5,5%", "-1,1 pp"],
];

const driveRootUrl =
  "https://drive.google.com/drive/folders/1IIVJkg4ZqdLXN81cKrYaRE3Ofp_ZTkOp";

const driveChecklist = [
  ["Carpeta raiz", "Vinculada"],
  ["Estructura ordenada", "Confirmada"],
  ["Indice documental", "Siguiente paso"],
  ["Datos sensibles", "Requiere login"],
];

const documentRequirements: Record<string, DocumentRequirement[]> = {
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

const navigation = ["Dashboard", "Inmuebles", "Documentos", "Finanzas", "Mercado"];

const euro = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export default function Home() {
  const [activeView, setActiveView] = useState("Dashboard");
  const [selectedId, setSelectedId] = useState(properties[0].id);
  const selected = properties.find((property) => property.id === selectedId) ?? properties[0];
  const selectedDocuments = documentRequirements[selected.id] ?? [];
  const selectedAnnualCosts = Object.values(selected.annualCosts).reduce(
    (sum, value) => sum + value,
    0,
  );

  const totals = useMemo(() => {
    const rent = properties.reduce((sum, property) => sum + property.rent, 0);
    const value = properties.reduce((sum, property) => sum + property.value, 0);
    const cashflow = properties.reduce((sum, property) => sum + property.cashflow, 0);
    const pendingDocs = properties.reduce((sum, property) => sum + property.pendingDocs, 0);
    const annualCosts = properties.reduce(
      (sum, property) =>
        sum + Object.values(property.annualCosts).reduce((costs, value) => costs + value, 0),
      0,
    );

    return { rent, value, cashflow, pendingDocs, annualCosts };
  }, []);

  const documentTotals = useMemo(() => {
    const allDocuments = properties.flatMap((property) => documentRequirements[property.id] ?? []);

    return {
      ok: allDocuments.filter((document) => document.status === "ok").length,
      pending: allDocuments.filter((document) => document.status === "pending").length,
      review: allDocuments.filter((document) => document.status === "review").length,
      locked: allDocuments.filter((document) => document.status === "locked").length,
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#f7f8f5] text-[#17211c]">
      <div className="app-shell">
        <aside className="sidebar" aria-label="Navegacion principal">
          <div className="brand-block">
            <div className="brand-mark">K</div>
            <div>
              <p className="eyebrow">Katniss</p>
              <h1>Real Estate</h1>
            </div>
          </div>

          <nav className="nav-list">
            {navigation.map((item) => (
              <button
                key={item}
                className={item === activeView ? "nav-item active" : "nav-item"}
                onClick={() => setActiveView(item)}
              >
                <span className="nav-dot" />
                {item}
              </button>
            ))}
          </nav>

          <div className="sidebar-panel">
            <span className="panel-icon">+</span>
            <p>Alta rapida</p>
            <button>Nuevo inmueble</button>
          </div>
        </aside>

        <section className="workspace">
          <header className="topbar">
            <div>
              <p className="eyebrow">Demo funcional</p>
              <h2>{activeView}</h2>
            </div>
            <div className="topbar-actions">
              <label className="search-box">
                <span>Buscar</span>
                <input placeholder="Inmueble, contrato, factura..." />
              </label>
              <button className="primary-action">Subir documento</button>
            </div>
          </header>

          <section className="hero-band" aria-label="Resumen de cartera">
            <div className="hero-copy">
              <p className="eyebrow">Cartera activa</p>
              <h3>4 activos, trazabilidad documental y rentabilidad en una vista.</h3>
              <p>
                Controla contratos, vencimientos, facturas e incidencias desde un panel
                preparado para crecer hacia integraciones con Drive, Catastro, INE e Idealista.
              </p>
            </div>
            <div className="hero-metrics">
              <Metric label="Valor cartera" value={euro.format(totals.value)} trend="+3,1%" />
              <Metric label="Renta mensual" value={euro.format(totals.rent)} trend="+4,2%" />
              <Metric label="Cash flow" value={euro.format(totals.cashflow)} trend="+310 EUR" />
              <Metric label="Costes anuales" value={euro.format(totals.annualCosts)} trend="Incluye deuda" />
            </div>
          </section>

          {activeView === "Documentos" && (
            <section className="document-index" aria-label="Indice documental">
              <div className="document-index-head">
                <div>
                  <p className="eyebrow">Indice documental</p>
                  <h3>Carpeta Drive preparada para clasificar expedientes por inmueble.</h3>
                </div>
                <a href={driveRootUrl} target="_blank" rel="noreferrer">
                  Abrir carpeta raiz
                </a>
              </div>

              <div className="doc-summary-grid">
                <DocSummary label="Completos" value={documentTotals.ok} status="ok" />
                <DocSummary label="Pendientes" value={documentTotals.pending} status="pending" />
                <DocSummary label="A revisar" value={documentTotals.review} status="review" />
                <DocSummary label="Sensibles" value={documentTotals.locked} status="locked" />
              </div>

              <div className="document-matrix">
                {properties.map((property) => {
                  const documents = documentRequirements[property.id] ?? [];
                  const pendingCount = documents.filter(
                    (document) => document.status === "pending" || document.status === "review",
                  ).length;

                  return (
                    <button
                      key={property.id}
                      className={
                        property.id === selected.id ? "document-row selected" : "document-row"
                      }
                      onClick={() => setSelectedId(property.id)}
                    >
                      <div className="doc-property">
                        <strong>{property.name}</strong>
                        <span>{property.driveFolder}</span>
                      </div>
                      <div className="doc-mini-list">
                        {documents.slice(0, 4).map((document) => (
                          <span key={document.label} className={`doc-chip ${document.status}`}>
                            {document.label}
                          </span>
                        ))}
                      </div>
                      <div className="doc-progress">
                        <span>{property.documents}%</span>
                        <strong>
                          {pendingCount === 0
                            ? "Sin bloqueos"
                            : `${pendingCount} puntos pendientes`}
                        </strong>
                      </div>
                    </button>
                  );
                })}
              </div>

              <aside className="selected-documents">
                <div>
                  <p className="eyebrow">Expediente seleccionado</p>
                  <h3>{selected.name}</h3>
                </div>
                <div className="selected-doc-list">
                  {selectedDocuments.map((document) => (
                    <article key={document.label}>
                      <span className={`doc-chip ${document.status}`}>
                        {statusLabel(document.status)}
                      </span>
                      <div>
                        <strong>{document.label}</strong>
                        <p>{document.detail}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </aside>
            </section>
          )}

          <section className="content-grid">
            <div className="main-column">
              <section className="section-head">
                <div>
                  <p className="eyebrow">Gestion diaria</p>
                  <h3>Inmuebles prioritarios</h3>
                </div>
                <div className="segmented" role="tablist" aria-label="Filtro de inmuebles">
                  <button className="selected">Todos</button>
                  <button>Revisar</button>
                  <button>Vacantes</button>
                </div>
              </section>

              <div className="property-list">
                {properties.map((property) => (
                  <button
                    key={property.id}
                    className={property.id === selected.id ? "property-row selected" : "property-row"}
                    onClick={() => setSelectedId(property.id)}
                  >
                    <div className="property-title">
                      <span className={`risk-dot ${property.risk.toLowerCase()}`} />
                      <div>
                        <strong>{property.name}</strong>
                        <span>{property.address}</span>
                      </div>
                    </div>
                    <div className="property-stat">
                      <span>Renta</span>
                      <strong>{euro.format(property.rent)}</strong>
                    </div>
                    <div className="property-stat">
                      <span>Neta</span>
                      <strong>{property.yieldNet}%</strong>
                    </div>
                    <div className="property-stat">
                      <span>Documentos</span>
                      <strong>{property.documents}%</strong>
                    </div>
                    <span className={`status-pill ${property.status === "Disponible" ? "warn" : ""}`}>
                      {property.status}
                    </span>
                  </button>
                ))}
              </div>

              <section className="finance-panel">
                <div>
                  <p className="eyebrow">Finanzas</p>
                  <h3>Presupuesto vs real</h3>
                </div>
                <div className="finance-grid">
                  {financialRows.map(([label, value, trend]) => (
                    <div key={label} className="finance-item">
                      <span>{label}</span>
                      <strong>{value}</strong>
                      <small>{trend}</small>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <aside className="insight-column">
              <section className="detail-card">
                <div className="detail-top">
                  <div>
                    <p className="eyebrow">Ficha seleccionada</p>
                    <h3>{selected.name}</h3>
                  </div>
                  <span className="asset-code">{selected.id}</span>
                </div>
                <p className="address">{selected.address}</p>

                <div className="score-ring" aria-label={`Documentacion ${selected.documents}% completa`}>
                  <span>{selected.documents}%</span>
                  <small>documentacion</small>
                </div>

                <div className="detail-stats">
                  <Detail label="Inquilino" value={selected.tenant} />
                  <Detail label="Revision" value={selected.nextReview} />
                  <Detail label="Riesgo" value={selected.risk} />
                  <Detail label="Cash flow" value={euro.format(selected.cashflow)} />
                </div>

                <section className="cost-panel" aria-label="Costes reales del inmueble">
                  <div className="cost-total">
                    <span>Costes anuales controlados</span>
                    <strong>{euro.format(selectedAnnualCosts)}</strong>
                  </div>
                  <Cost label="Seguro vivienda" value={selected.annualCosts.homeInsurance} />
                  <Cost label="IBI" value={selected.annualCosts.ibi} />
                  <Cost label="Basuras" value={selected.annualCosts.wasteTax} />
                  <Cost label="Comunidad" value={selected.annualCosts.community} />
                  <Cost label="Seguro alquiler" value={selected.annualCosts.rentInsurance} />
                  <Cost label="Financiacion" value={selected.annualCosts.financing} />
                  <div className={selected.utilitiesAssumedByTenant ? "utility-ok" : "utility-risk"}>
                    <span>Suministros</span>
                    <strong>
                      {selected.utilitiesAssumedByTenant
                        ? "Asumidos por inquilino"
                        : "Pendiente de confirmar"}
                    </strong>
                  </div>
                </section>

                <div className="tag-list">
                  {selected.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>

                <div className="action-stack">
                  <button>Ver expediente</button>
                  <button>Registrar incidencia</button>
                  <button>Aprobar factura</button>
                </div>
              </section>

              <section className="drive-panel">
                <div>
                  <p className="eyebrow">Google Drive</p>
                  <h3>Carpeta raiz vinculada</h3>
                </div>
                <p>{selected.driveFolder}</p>
                <div className="drive-actions">
                  <a href={driveRootUrl} target="_blank" rel="noreferrer">
                    Abrir Drive
                  </a>
                  <button>Preparar indice</button>
                </div>
                <div className="drive-checks">
                  {driveChecklist.map(([label, state]) => (
                    <div key={label}>
                      <span>{label}</span>
                      <strong>{state}</strong>
                    </div>
                  ))}
                </div>
              </section>

              <section className="alerts-panel">
                <div className="section-head compact">
                  <div>
                    <p className="eyebrow">Siguiente bandeja</p>
                    <h3>Alertas</h3>
                  </div>
                  <span>{alerts.length}</span>
                </div>
                {alerts.map((alert) => (
                  <article key={alert.title} className={`alert-item ${alert.tone}`}>
                    <div>
                      <strong>{alert.title}</strong>
                      <p>{alert.detail}</p>
                    </div>
                    <span>{alert.due}</span>
                  </article>
                ))}
              </section>
            </aside>
          </section>
        </section>
      </div>

      <nav className="mobile-nav" aria-label="Navegacion movil">
        {["Dashboard", "Inmuebles", "Alertas", "Mas"].map((item) => (
          <button
            key={item}
            className={item === activeView ? "active" : ""}
            onClick={() => setActiveView(item === "Mas" ? "Documentos" : item)}
          >
            <span />
            {item}
          </button>
        ))}
      </nav>
    </main>
  );
}

function Metric({ label, value, trend }: { label: string; value: string; trend: string }) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{trend}</small>
    </article>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Cost({ label, value }: { label: string; value: number }) {
  return (
    <div className="cost-row">
      <span>{label}</span>
      <strong>{value > 0 ? euro.format(value) : "No consta"}</strong>
    </div>
  );
}

function DocSummary({
  label,
  value,
  status,
}: {
  label: string;
  value: number;
  status: DocumentStatus;
}) {
  return (
    <article className={`doc-summary-card ${status}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function statusLabel(status: DocumentStatus) {
  const labels: Record<DocumentStatus, string> = {
    ok: "Completo",
    pending: "Pendiente",
    review: "Revisar",
    locked: "Sensible",
  };

  return labels[status];
}
