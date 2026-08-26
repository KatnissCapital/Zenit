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
  tags: string[];
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

  const totals = useMemo(() => {
    const rent = properties.reduce((sum, property) => sum + property.rent, 0);
    const value = properties.reduce((sum, property) => sum + property.value, 0);
    const cashflow = properties.reduce((sum, property) => sum + property.cashflow, 0);
    const pendingDocs = properties.reduce((sum, property) => sum + property.pendingDocs, 0);

    return { rent, value, cashflow, pendingDocs };
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
              <Metric label="Docs pendientes" value={`${totals.pendingDocs}`} trend="Prioridad" />
            </div>
          </section>

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
