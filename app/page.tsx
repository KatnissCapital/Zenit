"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";

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

type PropertyForm = {
  name: string;
  address: string;
  rent: string;
  value: string;
  driveFolder: string;
};

type DocumentForm = {
  propertyId: string;
  label: string;
  detail: string;
  status: DocumentStatus;
};

type PortfolioResponse = {
  properties: Property[];
  documentsByProperty: Record<string, DocumentRequirement[]>;
  persisted: boolean;
  message: string;
  created?: {
    id?: string;
    propertyId?: string;
    label?: string;
  };
};

type UserRole = "Administrador" | "Gestor" | "Financiero" | "Auditor" | "Invitado";

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

const roleRows = [
  ["Administrador", "Usuarios, reglas, integraciones y auditoria", "Completo"],
  ["Gestor", "Inmuebles, contratos, documentos e incidencias", "Edicion"],
  ["Financiero", "Facturas, financiacion, rentabilidad e informes", "Validacion"],
  ["Auditor", "Expedientes, evidencias y trazabilidad", "Solo lectura"],
  ["Invitado", "Vista de cartera y documentos con importes ocultos", "Importes ocultos"],
];

const storageRows = [
  ["Base de datos", "D1 / DB", "Lectura y escritura"],
  ["Migracion inicial", "8 tablas e indices", "Aplicada al iniciar"],
  ["Drive", "Carpeta raiz vinculada", "Pendiente API"],
  ["Documentos sensibles", "Metadatos primero", "Sin copiar archivos"],
];

const navigation = ["Dashboard", "Inmuebles", "Documentos", "Acciones", "Finanzas", "Mercado", "Configuracion"];
const userRoles: UserRole[] = ["Administrador", "Gestor", "Financiero", "Auditor", "Invitado"];

const euro = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeView, setActiveView] = useState("Dashboard");
  const [activeRole, setActiveRole] = useState<UserRole>("Administrador");
  const [portfolio, setPortfolio] = useState<Property[]>(properties);
  const [documentsByProperty, setDocumentsByProperty] = useState(documentRequirements);
  const [selectedId, setSelectedId] = useState(properties[0].id);
  const [propertyForm, setPropertyForm] = useState<PropertyForm>({
    name: "",
    address: "",
    rent: "",
    value: "",
    driveFolder: "",
  });
  const [documentForm, setDocumentForm] = useState<DocumentForm>({
    propertyId: properties[0].id,
    label: "Seguro vivienda",
    detail: "",
    status: "review",
  });
  const [actionLog, setActionLog] = useState<string[]>([
    "Base de datos preparada para persistir altas y documentos.",
  ]);
  const [syncState, setSyncState] = useState("Pendiente de cargar");
  const [isSaving, setIsSaving] = useState(false);
  const hideAmounts = activeRole === "Invitado";
  const visibleNavigation = hideAmounts
    ? navigation.filter((item) => item !== "Acciones")
    : navigation;
  const mobileNavigation = hideAmounts
    ? ["Dashboard", "Inmuebles", "Documentos", "Finanzas"]
    : ["Dashboard", "Inmuebles", "Documentos", "Acciones"];
  const selected = portfolio.find((property) => property.id === selectedId) ?? portfolio[0];
  const selectedDocuments = documentsByProperty[selected.id] ?? [];
  const selectedAnnualCosts = Object.values(selected.annualCosts).reduce(
    (sum, value) => sum + value,
    0,
  );

  const totals = useMemo(() => {
    const rent = portfolio.reduce((sum, property) => sum + property.rent, 0);
    const value = portfolio.reduce((sum, property) => sum + property.value, 0);
    const cashflow = portfolio.reduce((sum, property) => sum + property.cashflow, 0);
    const pendingDocs = portfolio.reduce((sum, property) => sum + property.pendingDocs, 0);
    const annualCosts = portfolio.reduce(
      (sum, property) =>
        sum + Object.values(property.annualCosts).reduce((costs, value) => costs + value, 0),
      0,
    );

    return { rent, value, cashflow, pendingDocs, annualCosts };
  }, [portfolio]);

  const documentTotals = useMemo(() => {
    const allDocuments = portfolio.flatMap((property) => documentsByProperty[property.id] ?? []);

    return {
      ok: allDocuments.filter((document) => document.status === "ok").length,
      pending: allDocuments.filter((document) => document.status === "pending").length,
      review: allDocuments.filter((document) => document.status === "review").length,
      locked: allDocuments.filter((document) => document.status === "locked").length,
    };
  }, [documentsByProperty, portfolio]);

  const amount = (value: number) => (hideAmounts ? "Importe oculto" : euro.format(value));
  const rate = (value: number) => (hideAmounts ? "Importe oculto" : `${value}%`);
  const trend = (value: string) => (hideAmounts && /[0-9]|EUR|€/.test(value) ? "Oculto" : value);

  const changeRole = (role: UserRole) => {
    setActiveRole(role);

    if (role === "Invitado" && activeView === "Acciones") {
      setActiveView("Dashboard");
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let ignore = false;

    async function loadPortfolio() {
      try {
        setSyncState("Cargando D1");
        const response = await fetch("/api/portfolio", { cache: "no-store" });

        if (!response.ok) {
          throw new Error("No se pudo cargar la cartera.");
        }

        const data = (await response.json()) as PortfolioResponse;

        if (ignore || data.properties.length === 0) {
          return;
        }

        setPortfolio(data.properties);
        setDocumentsByProperty(data.documentsByProperty);
        setSelectedId((current) =>
          data.properties.some((property) => property.id === current)
            ? current
            : data.properties[0].id,
        );
        setDocumentForm((current) => ({
          ...current,
          propertyId: data.properties.some((property) => property.id === current.propertyId)
            ? current.propertyId
            : data.properties[0].id,
        }));
        setSyncState(data.persisted ? "D1 activo" : "Demo local");
        setActionLog((current) => [data.message, ...current]);
      } catch {
        if (!ignore) {
          setSyncState("Demo sin conexion");
          setActionLog((current) => [
            "No se pudo leer D1; se mantienen los datos demo de la sesion.",
            ...current,
          ]);
        }
      }
    }

    void loadPortfolio();

    return () => {
      ignore = true;
    };
  }, [isAuthenticated]);

  const addProperty = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "createProperty", payload: propertyForm }),
      });

      if (!response.ok) {
        throw new Error("No se pudo guardar el inmueble.");
      }

      const data = (await response.json()) as PortfolioResponse;

      setPortfolio(data.properties);
      setDocumentsByProperty(data.documentsByProperty);
      if (data.created?.id) {
        setSelectedId(data.created.id);
        setDocumentForm((current) => ({ ...current, propertyId: data.created?.id ?? current.propertyId }));
      }
      setPropertyForm({ name: "", address: "", rent: "", value: "", driveFolder: "" });
      setSyncState("D1 activo");
      setActionLog((current) => [
        `Inmueble ${data.created?.id ?? ""} guardado en D1.`,
        ...current,
      ]);
      setIsSaving(false);
      return;
    } catch {
      setSyncState("Demo sin conexion");
    }

    const nextIndex = portfolio.length + 1;
    const rent = Number(propertyForm.rent || 0);
    const value = Number(propertyForm.value || 0);
    const id = `NEW-${String(nextIndex).padStart(3, "0")}`;
    const newProperty: Property = {
      id,
      name: propertyForm.name || `Nuevo inmueble ${nextIndex}`,
      address: propertyForm.address || "Direccion pendiente",
      type: "Residencial",
      status: "En alta",
      tenant: "Pendiente",
      rent,
      yieldNet: value > 0 ? Number((((rent * 12) / value) * 100).toFixed(1)) : 0,
      cashflow: Math.max(0, Math.round(rent * 0.42)),
      documents: 12,
      pendingDocs: 7,
      nextReview: "Pendiente",
      risk: "Medio",
      value,
      annualCosts: {
        homeInsurance: 0,
        ibi: 0,
        wasteTax: 0,
        community: 0,
        rentInsurance: 0,
        financing: 0,
      },
      utilitiesAssumedByTenant: false,
      driveFolder: propertyForm.driveFolder || `Drive / ${id}`,
      tags: ["Alta pendiente", "Checklist generado"],
    };

    setPortfolio((current) => [...current, newProperty]);
    setDocumentsByProperty((current) => ({
      ...current,
      [id]: [
        { label: "Contrato alquiler", status: "pending", detail: "Pendiente de cargar" },
        { label: "Seguro vivienda", status: "pending", detail: "Pendiente de cargar" },
        { label: "IBI", status: "pending", detail: "Pendiente de cargar" },
        { label: "Basuras", status: "pending", detail: "Pendiente de cargar" },
        { label: "Comunidad", status: "pending", detail: "Pendiente de cargar" },
        { label: "Seguro alquiler", status: "pending", detail: "Pendiente de confirmar" },
        { label: "Suministros", status: "review", detail: "Confirmar titularidad" },
        { label: "Financiacion", status: "locked", detail: "Requiere login" },
      ],
    }));
    setSelectedId(id);
    setDocumentForm((current) => ({ ...current, propertyId: id }));
    setPropertyForm({ name: "", address: "", rent: "", value: "", driveFolder: "" });
    setActionLog((current) => [
      `Inmueble ${id} creado solo en la sesion demo.`,
      ...current,
    ]);
    setIsSaving(false);
  };

  const addDocument = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "createDocument", payload: documentForm }),
      });

      if (!response.ok) {
        throw new Error("No se pudo guardar el documento.");
      }

      const data = (await response.json()) as PortfolioResponse;

      setPortfolio(data.properties);
      setDocumentsByProperty(data.documentsByProperty);
      if (data.created?.propertyId) {
        setSelectedId(data.created.propertyId);
      }
      setDocumentForm((current) => ({ ...current, detail: "" }));
      setSyncState("D1 activo");
      setActionLog((current) => [
        `Documento "${data.created?.label ?? documentForm.label}" guardado en D1.`,
        ...current,
      ]);
      setIsSaving(false);
      return;
    } catch {
      setSyncState("Demo sin conexion");
    }

    const targetId = documentForm.propertyId;
    const newDocument: DocumentRequirement = {
      label: documentForm.label || "Documento",
      status: documentForm.status,
      detail: documentForm.detail || "Pendiente de revisar metadatos",
    };

    setDocumentsByProperty((current) => ({
      ...current,
      [targetId]: [...(current[targetId] ?? []), newDocument],
    }));
    setSelectedId(targetId);
    setDocumentForm((current) => ({ ...current, detail: "" }));
    setActionLog((current) => [
      `Documento "${newDocument.label}" registrado para ${targetId}.`,
      ...current,
    ]);
    setIsSaving(false);
  };

  return (
    <main className="min-h-screen bg-[#f7f8f5] text-[#17211c]">
      {!isAuthenticated ? (
        <section className="login-shell" aria-label="Acceso a Katniss Real Estate">
          <div className="login-panel">
            <div className="brand-block">
              <div className="brand-mark">K</div>
              <div>
                <p className="eyebrow">Katniss</p>
                <h1>Real Estate</h1>
              </div>
            </div>

            <div className="login-copy">
              <span className="security-pill">Demo protegida</span>
              <h2>Accede a tu cartera inmobiliaria con control documental.</h2>
              <p>
                El siguiente paso separa la demo publica de los expedientes: contratos,
                seguros, IBI, financiacion y documentos de Drive quedan dentro del area
                privada.
              </p>
            </div>

            <div className="login-checks">
              <span>Drive vinculado</span>
              <span>Documentos sensibles aislados</span>
              <span>Preparado para usuarios y roles</span>
            </div>

            <button className="login-button" onClick={() => setIsAuthenticated(true)}>
              Entrar a la demo
            </button>
          </div>

          <aside className="login-preview">
            <div>
              <p className="eyebrow">Vista privada</p>
              <h3>Dashboard, inmuebles e indice documental.</h3>
            </div>
            <div className="login-preview-grid">
              <Metric label="Valor cartera" value={euro.format(totals.value)} trend="Privado" />
              <Metric label="Docs sensibles" value={`${documentTotals.locked}`} trend="Login" />
              <Metric label="Pendientes" value={`${documentTotals.pending}`} trend="Accion" />
              <Metric label="Costes anuales" value={euro.format(totals.annualCosts)} trend="Control" />
            </div>
          </aside>
        </section>
      ) : (
      <>
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
            {visibleNavigation.map((item) => (
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

          {!hideAmounts && (
            <div className="sidebar-panel">
              <span className="panel-icon">+</span>
              <p>Alta rapida</p>
              <button onClick={() => setActiveView("Acciones")}>Nuevo inmueble</button>
            </div>
          )}
        </aside>

        <section className="workspace">
          <header className="topbar">
            <div>
              <p className="eyebrow">Demo funcional</p>
              <h2>{activeView}</h2>
            </div>
            <div className="topbar-actions">
              <div className="user-badge">
                <span>{syncState}</span>
                <strong>{activeRole}</strong>
              </div>
              <label className="profile-select">
                <span>Perfil</span>
                <select
                  value={activeRole}
                  onChange={(event) => changeRole(event.target.value as UserRole)}
                >
                  {userRoles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </label>
              <label className="search-box">
                <span>Buscar</span>
                <input placeholder="Inmueble, contrato, factura..." />
              </label>
              <button className="secondary-action" onClick={() => setIsAuthenticated(false)}>
                Salir
              </button>
              {!hideAmounts && (
                <button className="primary-action" onClick={() => setActiveView("Acciones")}>
                  Subir documento
                </button>
              )}
            </div>
          </header>

          <section className="hero-band" aria-label="Resumen de cartera">
            <div className="hero-copy">
              <p className="eyebrow">Cartera activa</p>
              <h3>{portfolio.length} activos, trazabilidad documental y rentabilidad en una vista.</h3>
              <p>
                Controla contratos, vencimientos, facturas e incidencias desde un panel
                preparado para crecer hacia integraciones con Drive, Catastro, INE e Idealista.
              </p>
            </div>
            <div className="hero-metrics">
              <Metric label="Valor cartera" value={amount(totals.value)} trend={trend("+3,1%")} />
              <Metric label="Renta mensual" value={amount(totals.rent)} trend={trend("+4,2%")} />
              <Metric label="Cash flow" value={amount(totals.cashflow)} trend={trend("+310 EUR")} />
              <Metric label="Costes anuales" value={amount(totals.annualCosts)} trend="Incluye deuda" />
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
                {portfolio.map((property) => {
                  const documents = documentsByProperty[property.id] ?? [];
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

          {activeView === "Configuracion" && (
            <section className="settings-view" aria-label="Configuracion de seguridad y datos">
              <div className="settings-hero">
                <div>
                  <p className="eyebrow">Base de producto</p>
                  <h3>Usuarios, roles y datos persistentes preparados para la siguiente fase.</h3>
                </div>
                <span>DB activa en despliegue</span>
              </div>

              <div className="settings-grid">
                <section className="settings-panel">
                  <div>
                    <p className="eyebrow">Permisos</p>
                    <h3>Roles previstos</h3>
                  </div>
                  <div className="role-list">
                    {roleRows.map(([role, scope, access]) => (
                      <article key={role}>
                        <strong>{role}</strong>
                        <p>{scope}</p>
                        <span>{access}</span>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="settings-panel">
                  <div>
                    <p className="eyebrow">Persistencia</p>
                    <h3>Estado tecnico</h3>
                  </div>
                  <div className="storage-list">
                    {storageRows.map(([label, detail, state]) => (
                      <article key={label}>
                        <div>
                          <strong>{label}</strong>
                          <p>{detail}</p>
                        </div>
                        <span>{state}</span>
                      </article>
                    ))}
                  </div>
                </section>
              </div>
            </section>
          )}

          {activeView === "Acciones" && (
            <section className="actions-view" aria-label="Acciones de cartera">
              <div className="actions-hero">
                <div>
                  <p className="eyebrow">Operativa</p>
                  <h3>Altas y documentos guardados en la base de datos de la app.</h3>
                </div>
                <span>{portfolio.length} inmuebles en cartera</span>
              </div>

              <div className="actions-grid">
                <form className="action-form" onSubmit={addProperty}>
                  <div>
                    <p className="eyebrow">Nuevo inmueble</p>
                    <h3>Crear ficha</h3>
                  </div>

                  <label>
                    <span>Nombre</span>
                    <input
                      value={propertyForm.name}
                      onChange={(event) =>
                        setPropertyForm((current) => ({ ...current, name: event.target.value }))
                      }
                      placeholder="Piso Centro"
                    />
                  </label>

                  <label>
                    <span>Direccion</span>
                    <input
                      value={propertyForm.address}
                      onChange={(event) =>
                        setPropertyForm((current) => ({ ...current, address: event.target.value }))
                      }
                      placeholder="Calle, ciudad"
                    />
                  </label>

                  <div className="form-pair">
                    <label>
                      <span>Renta mensual</span>
                      <input
                        type="number"
                        min="0"
                        inputMode="numeric"
                        value={propertyForm.rent}
                        onChange={(event) =>
                          setPropertyForm((current) => ({ ...current, rent: event.target.value }))
                        }
                        placeholder="950"
                      />
                    </label>
                    <label>
                      <span>Valor estimado</span>
                      <input
                        type="number"
                        min="0"
                        inputMode="numeric"
                        value={propertyForm.value}
                        onChange={(event) =>
                          setPropertyForm((current) => ({ ...current, value: event.target.value }))
                        }
                        placeholder="210000"
                      />
                    </label>
                  </div>

                  <label>
                    <span>Carpeta Drive</span>
                    <input
                      value={propertyForm.driveFolder}
                      onChange={(event) =>
                        setPropertyForm((current) => ({
                          ...current,
                          driveFolder: event.target.value,
                        }))
                      }
                      placeholder="Drive / Inmuebles / Piso Centro"
                    />
                  </label>

                  <button type="submit" disabled={isSaving}>
                    {isSaving ? "Guardando..." : "Crear inmueble"}
                  </button>
                </form>

                <form className="action-form" onSubmit={addDocument}>
                  <div>
                    <p className="eyebrow">Documento</p>
                    <h3>Registrar control</h3>
                  </div>

                  <label>
                    <span>Inmueble</span>
                    <select
                      value={documentForm.propertyId}
                      onChange={(event) =>
                        setDocumentForm((current) => ({
                          ...current,
                          propertyId: event.target.value,
                        }))
                      }
                    >
                      {portfolio.map((property) => (
                        <option key={property.id} value={property.id}>
                          {property.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span>Tipo documental</span>
                    <select
                      value={documentForm.label}
                      onChange={(event) =>
                        setDocumentForm((current) => ({ ...current, label: event.target.value }))
                      }
                    >
                      <option>Seguro vivienda</option>
                      <option>IBI</option>
                      <option>Basuras</option>
                      <option>Suministros</option>
                      <option>Comunidad</option>
                      <option>Seguro alquiler</option>
                      <option>Financiacion</option>
                      <option>Contrato alquiler</option>
                    </select>
                  </label>

                  <label>
                    <span>Estado</span>
                    <select
                      value={documentForm.status}
                      onChange={(event) =>
                        setDocumentForm((current) => ({
                          ...current,
                          status: event.target.value as DocumentStatus,
                        }))
                      }
                    >
                      <option value="ok">Completo</option>
                      <option value="pending">Pendiente</option>
                      <option value="review">Revisar</option>
                      <option value="locked">Sensible</option>
                    </select>
                  </label>

                  <label>
                    <span>Detalle</span>
                    <input
                      value={documentForm.detail}
                      onChange={(event) =>
                        setDocumentForm((current) => ({ ...current, detail: event.target.value }))
                      }
                      placeholder="Poliza 2026 cargada en Drive"
                    />
                  </label>

                  <button type="submit" disabled={isSaving}>
                    {isSaving ? "Guardando..." : "Registrar documento"}
                  </button>
                </form>
              </div>

              <section className="action-log" aria-label="Registro de actividad">
                <div>
                  <p className="eyebrow">Actividad</p>
                  <h3>Ultimas acciones</h3>
                </div>
                {actionLog.map((item) => (
                  <article key={item}>
                    <span />
                    <p>{item}</p>
                  </article>
                ))}
              </section>
            </section>
          )}

          {activeView !== "Configuracion" && activeView !== "Acciones" && (
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
                {portfolio.map((property) => (
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
                      <strong>{amount(property.rent)}</strong>
                    </div>
                    <div className="property-stat">
                      <span>Neta</span>
                      <strong>{rate(property.yieldNet)}</strong>
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
                      <strong>{hideAmounts ? "Importe oculto" : value}</strong>
                      <small>{hideAmounts ? "Oculto" : trend}</small>
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
                  <Detail label="Cash flow" value={amount(selected.cashflow)} />
                </div>

                <section className="cost-panel" aria-label="Costes reales del inmueble">
                  <div className="cost-total">
                    <span>Costes anuales controlados</span>
                    <strong>{amount(selectedAnnualCosts)}</strong>
                  </div>
                  <Cost label="Seguro vivienda" value={selected.annualCosts.homeInsurance} hideAmounts={hideAmounts} />
                  <Cost label="IBI" value={selected.annualCosts.ibi} hideAmounts={hideAmounts} />
                  <Cost label="Basuras" value={selected.annualCosts.wasteTax} hideAmounts={hideAmounts} />
                  <Cost label="Comunidad" value={selected.annualCosts.community} hideAmounts={hideAmounts} />
                  <Cost label="Seguro alquiler" value={selected.annualCosts.rentInsurance} hideAmounts={hideAmounts} />
                  <Cost label="Financiacion" value={selected.annualCosts.financing} hideAmounts={hideAmounts} />
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
          )}
        </section>
      </div>

      <nav className="mobile-nav" aria-label="Navegacion movil">
        {mobileNavigation.map((item) => (
          <button
            key={item}
            className={item === activeView ? "active" : ""}
            onClick={() => setActiveView(item)}
          >
            <span />
            {item}
          </button>
        ))}
      </nav>
      </>
      )}
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

function Cost({
  label,
  value,
  hideAmounts,
}: {
  label: string;
  value: number;
  hideAmounts: boolean;
}) {
  return (
    <div className="cost-row">
      <span>{label}</span>
      <strong>{hideAmounts ? "Importe oculto" : value > 0 ? euro.format(value) : "No consta"}</strong>
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
