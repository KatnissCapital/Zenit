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
  debtBalance: number;
  equity: number;
  roe: number;
  ltv: number;
  cashflowAnnual: number;
  homeInsuranceCompany: string;
  annualCosts: {
    homeInsurance: number;
    ibi: number;
    wasteTax: number;
    community: number;
    rentInsurance: number;
    financing: number;
    maintenance: number;
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

type ImportRow = {
  name: string;
  address: string;
  type: string;
  status: string;
  tenant: string;
  rent: number;
  value: number;
  homeInsurance: number;
  ibi: number;
  wasteTax: number;
  community: number;
  rentInsurance: number;
  financing: number;
  maintenance: number;
  debtBalance: number;
  homeInsuranceCompany: string;
  utilitiesAssumedByTenant: boolean;
  driveFolder: string;
  nextReview: string;
};

type PropertyEditForm = ImportRow & {
  id: string;
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
  imported?: {
    count: number;
    ids: string[];
  };
  updated?: {
    id: string;
  };
  deactivated?: {
    id: string;
  };
  deleted?: {
    id: string;
  };
  purged?: {
    count: number;
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
    debtBalance: 248000,
    equity: 180000,
    roe: 4.6,
    ltv: 57.9,
    cashflowAnnual: 8280,
    homeInsuranceCompany: "Mapfre",
    annualCosts: {
      homeInsurance: 410,
      ibi: 780,
      wasteTax: 68,
      community: 1560,
      rentInsurance: 285,
      financing: 7440,
      maintenance: 900,
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
    debtBalance: 154000,
    equity: 132000,
    roe: 5.3,
    ltv: 53.8,
    cashflowAnnual: 7004,
    homeInsuranceCompany: "Mutua Madrilena",
    annualCosts: {
      homeInsurance: 355,
      ibi: 520,
      wasteTax: 62,
      community: 1040,
      rentInsurance: 0,
      financing: 4320,
      maintenance: 1020,
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
    debtBalance: 310000,
    equity: 202000,
    roe: 3.8,
    ltv: 60.5,
    cashflowAnnual: 7650,
    homeInsuranceCompany: "Allianz",
    annualCosts: {
      homeInsurance: 690,
      ibi: 1380,
      wasteTax: 180,
      community: 2220,
      rentInsurance: 0,
      financing: 11880,
      maintenance: 2160,
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
    debtBalance: 118000,
    equity: 120000,
    roe: 1.5,
    ltv: 49.6,
    cashflowAnnual: 1756,
    homeInsuranceCompany: "Linea Directa",
    annualCosts: {
      homeInsurance: 330,
      ibi: 460,
      wasteTax: 54,
      community: 890,
      rentInsurance: 210,
      financing: 3960,
      maintenance: 760,
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

const navigation = ["Dashboard", "Inmuebles", "Documentos", "Importacion", "Acciones", "Finanzas", "Mercado", "Configuracion"];
const userRoles: UserRole[] = ["Administrador", "Gestor", "Financiero", "Auditor", "Invitado"];

const importTemplateUrl = "/katniss-import-template.csv";
const importHeaders = [
  "nombre",
  "direccion",
  "tipo",
  "estado",
  "inquilino",
  "renta_mensual",
  "valor_estimado",
  "seguro_vivienda",
  "ibi",
  "basuras",
  "comunidad",
  "seguro_alquiler",
  "financiacion",
  "suministros_inquilino",
  "carpeta_drive",
  "proxima_revision",
];
const importSample = `${importHeaders.join(";")}
Piso Centro;Calle Mayor 12, Madrid;Residencial;Ocupado;Ana Lopez;1200;260000;360;610;65;980;240;4200;si;Drive / Piso Centro;2026-09-15
Local Norte;Avenida Industria 8, Valencia;Local;En revision;Taller Norte SL;1800;340000;520;920;140;1320;0;7800;si;Drive / Local Norte;2026-10-01`;

const emptyEditForm: PropertyEditForm = {
  id: "",
  name: "",
  address: "",
  type: "Residencial",
  status: "En revision",
  tenant: "Sin inquilino",
  rent: 0,
  value: 0,
  debtBalance: 0,
  homeInsurance: 0,
  ibi: 0,
  wasteTax: 0,
  community: 0,
  rentInsurance: 0,
  financing: 0,
  maintenance: 0,
  utilitiesAssumedByTenant: false,
  homeInsuranceCompany: "Pendiente",
  driveFolder: "",
  nextReview: "Pendiente",
};

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
  const [importText, setImportText] = useState(importSample);
  const [importMessage, setImportMessage] = useState("Plantilla lista para pegar datos reales.");
  const [importFileName, setImportFileName] = useState("Sin archivo seleccionado");
  const [editForm, setEditForm] = useState<PropertyEditForm>(emptyEditForm);
  const [editMessage, setEditMessage] = useState("Selecciona un inmueble para editarlo.");
  const hideAmounts = activeRole === "Invitado";
  const visibleNavigation = hideAmounts
    ? navigation.filter((item) => item !== "Acciones" && item !== "Importacion")
    : navigation;
  const mobileNavigation = hideAmounts
    ? ["Dashboard", "Inmuebles", "Documentos", "Finanzas"]
    : ["Dashboard", "Inmuebles", "Documentos", "Importacion"];
  const activePortfolio = useMemo(
    () => portfolio.filter((property) => property.status !== "Baja"),
    [portfolio],
  );
  const selected =
    activePortfolio.find((property) => property.id === selectedId) ??
    activePortfolio[0] ??
    portfolio[0] ??
    properties[0];
  const selectedDocuments = documentsByProperty[selected.id] ?? [];
  const selectedAnnualCosts = Object.values(selected.annualCosts).reduce(
    (sum, value) => sum + value,
    0,
  );
  const editBaseline = editForm.id
    ? activePortfolio.find((property) => property.id === editForm.id)
    : null;
  const hasUnsavedChanges = editBaseline
    ? JSON.stringify(editForm) !== JSON.stringify(propertyToEditForm(editBaseline))
    : false;

  const totals = useMemo(() => {
    const rent = activePortfolio.reduce((sum, property) => sum + property.rent, 0);
    const value = activePortfolio.reduce((sum, property) => sum + property.value, 0);
    const debt = activePortfolio.reduce((sum, property) => sum + property.debtBalance, 0);
    const equity = Math.max(0, value - debt);
    const cashflowAnnual = activePortfolio.reduce((sum, property) => sum + property.cashflowAnnual, 0);
    const cashflow = Math.round(cashflowAnnual / 12);
    const pendingDocs = activePortfolio.reduce((sum, property) => sum + property.pendingDocs, 0);
    const mortgageAnnual = activePortfolio.reduce(
      (sum, property) => sum + property.annualCosts.financing,
      0,
    );
    const annualCosts = activePortfolio.reduce(
      (sum, property) =>
        sum + Object.values(property.annualCosts).reduce((costs, value) => costs + value, 0),
      0,
    );
    const operatingCostsAnnual = Math.max(0, annualCosts - mortgageAnnual);
    const deductionsMonthly = Math.round(annualCosts / 12);
    const roe = equity > 0 ? Number(((cashflowAnnual / equity) * 100).toFixed(1)) : 0;
    const ltv = value > 0 ? Number(((debt / value) * 100).toFixed(1)) : 0;

    return {
      rent,
      value,
      debt,
      equity,
      cashflow,
      cashflowAnnual,
      pendingDocs,
      annualCosts,
      mortgageAnnual,
      operatingCostsAnnual,
      deductionsMonthly,
      roe,
      ltv,
    };
  }, [activePortfolio]);

  const documentTotals = useMemo(() => {
    const allDocuments = activePortfolio.flatMap((property) => documentsByProperty[property.id] ?? []);

    return {
      ok: allDocuments.filter((document) => document.status === "ok").length,
      pending: allDocuments.filter((document) => document.status === "pending").length,
      review: allDocuments.filter((document) => document.status === "review").length,
      locked: allDocuments.filter((document) => document.status === "locked").length,
    };
  }, [activePortfolio, documentsByProperty]);

  const importPreview = useMemo(() => parseImportRows(importText), [importText]);
  const readyImportRows = importPreview.filter((row) => row.name && row.address);
  const annualImportAmount = readyImportRows.reduce(
    (sum, row) =>
      sum +
      row.homeInsurance +
      row.ibi +
      row.wasteTax +
      row.community +
      row.rentInsurance +
      row.financing,
    0,
  );
  const amount = (value: number) => euro.format(value);
  const rate = (value: number) => `${value}%`;

  const changeRole = (role: UserRole) => {
    setActiveRole(role);

    if (role === "Invitado" && (activeView === "Acciones" || activeView === "Importacion")) {
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
        const activeProperties = data.properties.filter((property) => property.status !== "Baja");
        setSelectedId((current) =>
          activeProperties.some((property) => property.id === current)
            ? current
            : activeProperties[0]?.id ?? data.properties[0].id,
        );
        setDocumentForm((current) => ({
          ...current,
          propertyId: activeProperties.some((property) => property.id === current.propertyId)
            ? current.propertyId
            : activeProperties[0]?.id ?? data.properties[0].id,
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
      cashflowAnnual: Math.round(rent * 12),
      documents: 12,
      pendingDocs: 7,
      nextReview: "Pendiente",
      risk: "Medio",
      value,
      debtBalance: 0,
      equity: value,
      roe: value > 0 ? Number(((rent * 12 / value) * 100).toFixed(1)) : 0,
      ltv: 0,
      annualCosts: {
        homeInsurance: 0,
        ibi: 0,
        wasteTax: 0,
        community: 0,
        rentInsurance: 0,
        financing: 0,
        maintenance: 0,
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

  const previewImport = () => {
    setImportMessage(
      readyImportRows.length === 0
        ? "No hay filas listas: revisa que existan columnas nombre y direccion."
        : `${readyImportRows.length} inmueble${readyImportRows.length === 1 ? "" : "s"} listo${readyImportRows.length === 1 ? "" : "s"} para importar.`,
    );
  };

  const loadImportFile = async (file: File | undefined) => {
    if (!file) {
      return;
    }

    const text = await file.text();
    setImportText(text);
    setImportFileName(file.name);
    setImportMessage(`Archivo "${file.name}" cargado para revisar.`);
  };

  const importProperties = async () => {
    previewImport();

    if (readyImportRows.length === 0) {
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "importProperties", payload: { rows: readyImportRows } }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "No se pudo importar la plantilla.");
      }

      const data = (await response.json()) as PortfolioResponse;

      setPortfolio(data.properties);
      setDocumentsByProperty(data.documentsByProperty);
      if (data.imported?.ids[0]) {
        setSelectedId(data.imported.ids[0]);
      }
      setSyncState("D1 activo");
      setImportMessage(`${data.imported?.count ?? readyImportRows.length} inmuebles importados en D1.`);
      setActionLog((current) => [
        `${data.imported?.count ?? readyImportRows.length} inmuebles reales importados desde plantilla.`,
        ...current,
      ]);
    } catch (error) {
      setSyncState("Demo sin conexion");
      setImportMessage(
        error instanceof Error
          ? `No se pudo guardar en D1: ${error.message}`
          : "No se pudo guardar en D1; la plantilla queda preparada para reintentar.",
      );
    }

    setIsSaving(false);
  };

  const startEditProperty = (property: Property) => {
    setSelectedId(property.id);
    setEditForm(propertyToEditForm(property));
    setEditMessage(`Editando ${property.name}.`);
  };

  const cancelEditProperty = () => {
    setEditForm(emptyEditForm);
    setEditMessage("Selecciona un inmueble para editarlo.");
  };

  const savePropertyEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editForm.id) {
      setEditMessage("Selecciona primero un inmueble.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateProperty", payload: editForm }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "No se pudo guardar el inmueble.");
      }

      const data = (await response.json()) as PortfolioResponse;
      const activeProperties = data.properties.filter((property) => property.status !== "Baja");

      setPortfolio(data.properties);
      setDocumentsByProperty(data.documentsByProperty);
      setSelectedId(editForm.id);
      setDocumentForm((current) => ({ ...current, propertyId: editForm.id }));
      setSyncState("D1 activo");
      setEditMessage("Cambios guardados en D1.");
      setActionLog((current) => [`Inmueble ${editForm.id} actualizado.`, ...current]);
      setEditForm(propertyToEditForm(activeProperties.find((property) => property.id === editForm.id) ?? selected));
    } catch (error) {
      setSyncState("Demo sin conexion");
      setEditMessage(error instanceof Error ? error.message : "No se pudo guardar el inmueble.");
    }

    setIsSaving(false);
  };

  const deactivateProperty = async (property: Property) => {
    const confirmed = window.confirm(
      `Dar de baja ${property.name} lo ocultara del listado operativo, pero conservara sus datos historicos.`,
    );

    if (!confirmed) {
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deactivateProperty", payload: { id: property.id } }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "No se pudo dar de baja el inmueble.");
      }

      const data = (await response.json()) as PortfolioResponse;
      const activeProperties = data.properties.filter((item) => item.status !== "Baja");

      setPortfolio(data.properties);
      setDocumentsByProperty(data.documentsByProperty);
      setSelectedId(activeProperties[0]?.id ?? data.properties[0]?.id ?? properties[0].id);
      setEditForm(emptyEditForm);
      setSyncState("D1 activo");
      setEditMessage(`${property.name} dado de baja.`);
      setActionLog((current) => [`Inmueble ${property.id} dado de baja.`, ...current]);
    } catch (error) {
      setSyncState("Demo sin conexion");
      setEditMessage(error instanceof Error ? error.message : "No se pudo dar de baja.");
    }

    setIsSaving(false);
  };

  const deleteProperty = async (property: Property) => {
    const confirmed = window.confirm(
      `Eliminar ${property.name} borrara el inmueble, sus documentos, costes y contrato. No se puede deshacer.`,
    );

    if (!confirmed) {
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteProperty", payload: { id: property.id } }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "No se pudo eliminar el inmueble.");
      }

      const data = (await response.json()) as PortfolioResponse;
      const activeProperties = data.properties.filter((item) => item.status !== "Baja");

      setPortfolio(data.properties);
      setDocumentsByProperty(data.documentsByProperty);
      setSelectedId(activeProperties[0]?.id ?? data.properties[0]?.id ?? properties[0].id);
      setEditForm(emptyEditForm);
      setSyncState("D1 activo");
      setEditMessage(`${property.name} eliminado.`);
      setActionLog((current) => [`Inmueble ${property.id} eliminado definitivamente.`, ...current]);
    } catch (error) {
      setSyncState("Demo sin conexion");
      setEditMessage(error instanceof Error ? error.message : "No se pudo eliminar.");
    }

    setIsSaving(false);
  };

  const deleteDemoData = async () => {
    const confirmed = window.confirm(
      "Eliminar datos demo borrara los inmuebles de ejemplo iniciales y sus datos asociados. No afectara a inmuebles importados.",
    );

    if (!confirmed) {
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteDemoData", payload: {} }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "No se pudieron eliminar los datos demo.");
      }

      const data = (await response.json()) as PortfolioResponse;
      const activeProperties = data.properties.filter((item) => item.status !== "Baja");

      setPortfolio(data.properties);
      setDocumentsByProperty(data.documentsByProperty);
      setSelectedId(activeProperties[0]?.id ?? data.properties[0]?.id ?? properties[0].id);
      setEditForm(emptyEditForm);
      setSyncState("D1 activo");
      setActionLog((current) => ["Datos demo eliminados de D1.", ...current]);
    } catch (error) {
      setSyncState("Demo sin conexion");
      setActionLog((current) => [
        error instanceof Error ? error.message : "No se pudieron eliminar los datos demo.",
        ...current,
      ]);
    }

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
      <div className={hideAmounts ? "app-shell guest-mode" : "app-shell"}>
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

          {activeView === "Dashboard" && (
          <section className="hero-band" aria-label="Resumen de cartera">
            <div className="hero-copy">
              <p className="eyebrow">Cartera activa</p>
            </div>
            <div className="hero-metrics">
              <Metric label="Valor cartera" value={amount(totals.value)} trend={`${activePortfolio.length} activos`} />
              <Metric label="Renta mensual" value={amount(totals.rent)} trend="Ingresos" />
              <Metric label="Cash flow mensual" value={amount(totals.cashflow)} trend="Renta menos restas" />
              <Metric label="Restas mensuales" value={amount(totals.deductionsMonthly)} trend="Gastos + cuota" />
              <Metric label="Equity total" value={amount(totals.equity)} trend={`LTV ${rate(totals.ltv)}`} />
            </div>
          </section>
          )}

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
                {activePortfolio.map((property) => {
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
                  {!hideAmounts && (
                    <div className="danger-zone">
                      <div>
                        <strong>Limpiar datos demo</strong>
                        <p>Elimina solo los inmuebles de ejemplo iniciales y sus datos asociados.</p>
                      </div>
                      <button type="button" onClick={deleteDemoData} disabled={isSaving}>
                        {isSaving ? "Eliminando..." : "Eliminar datos demo"}
                      </button>
                    </div>
                  )}
                </section>
              </div>
            </section>
          )}

          {activeView === "Importacion" && (
            <section className="import-view" aria-label="Importacion de datos reales">
              <div className="import-hero">
                <div>
                  <p className="eyebrow">Datos reales</p>
                  <h3>Importa tu cartera desde una plantilla antes de automatizar Google Drive.</h3>
                </div>
                <a href={importTemplateUrl} download>
                  Descargar plantilla
                </a>
              </div>

              <div className="import-grid">
                <section className="import-panel">
                  <div>
                    <p className="eyebrow">Plantilla CSV</p>
                    <h3>Seleccionar archivo o pegar datos</h3>
                  </div>
                  <label className="import-file">
                    <span>Archivo CSV</span>
                    <input
                      type="file"
                      accept=".csv,text/csv,.txt"
                      onChange={(event) => void loadImportFile(event.target.files?.[0])}
                    />
                    <strong>{importFileName}</strong>
                  </label>
                  <textarea
                    value={importText}
                    onChange={(event) => setImportText(event.target.value)}
                    spellCheck={false}
                    aria-label="Datos CSV de inmuebles"
                  />
                  <div className="import-actions">
                    <button type="button" className="secondary-action" onClick={previewImport}>
                      Previsualizar
                    </button>
                    <button
                      type="button"
                      className="primary-action"
                      onClick={importProperties}
                      disabled={isSaving}
                    >
                      {isSaving ? "Importando..." : "Importar a D1"}
                    </button>
                  </div>
                  <p className="import-note">{importMessage}</p>
                </section>

                <section className="import-panel">
                  <div>
                    <p className="eyebrow">Revision previa</p>
                    <h3>{readyImportRows.length} inmuebles listos</h3>
                  </div>
                  <div className="import-summary">
                    <Metric label="Renta mensual" value={amount(readyImportRows.reduce((sum, row) => sum + row.rent, 0))} trend="Plantilla" />
                    <Metric label="Valor estimado" value={amount(readyImportRows.reduce((sum, row) => sum + row.value, 0))} trend="Plantilla" />
                    <Metric label="Costes anuales" value={amount(annualImportAmount)} trend="Completo" />
                  </div>
                  <div className="import-table" role="table" aria-label="Previsualizacion de inmuebles importados">
                    <div role="row">
                      <span>Inmueble</span>
                      <span>Renta</span>
                      <span>Costes</span>
                      <span>Suministros</span>
                    </div>
                    {readyImportRows.slice(0, 6).map((row) => {
                      const costs =
                        row.homeInsurance +
                        row.ibi +
                        row.wasteTax +
                        row.community +
                        row.rentInsurance +
                        row.financing;

                      return (
                        <div key={`${row.name}-${row.address}`} role="row">
                          <strong>{row.name}</strong>
                          <span>{amount(row.rent)}</span>
                          <span>{amount(costs)}</span>
                          <span>{row.utilitiesAssumedByTenant ? "Inquilino" : "Revisar"}</span>
                        </div>
                      );
                    })}
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
                <span>{activePortfolio.length} inmuebles en cartera</span>
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
                      {activePortfolio.map((property) => (
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

          {activeView === "Finanzas" && (
            <section className="finance-panel finance-only">
              <div>
                <p className="eyebrow">Finanzas</p>
                <h3>Lectura financiera</h3>
              </div>
              <div className="finance-grid">
                <FinanceItem label="Valor cartera" value={amount(totals.value)} detail={`${activePortfolio.length} activos`} />
                <FinanceItem label="Deuda total" value={amount(totals.debt)} detail={`LTV ${rate(totals.ltv)}`} />
                <FinanceItem label="Equity total" value={amount(totals.equity)} detail="Valor menos deuda" />
                <FinanceItem label="Cash flow anual" value={amount(totals.cashflowAnnual)} detail="Rentas menos gastos y deuda" />
                <FinanceItem label="ROE cartera" value={rate(totals.roe)} detail="Cash flow / equity" />
                <FinanceItem label="LTV cartera" value={rate(totals.ltv)} detail="Deuda / valor" />
              </div>
              <div className="finance-property-grid">
                {activePortfolio.map((property) => (
                  <article key={property.id}>
                    <div>
                      <span>{property.id}</span>
                      <strong>{property.name}</strong>
                    </div>
                    <FinanceItem label="Valor" value={amount(property.value)} detail="Actual estimado" />
                    <FinanceItem label="Deuda" value={amount(property.debtBalance)} detail={`LTV ${rate(property.ltv)}`} />
                    <FinanceItem label="Equity" value={amount(property.equity)} detail="Capital propio" />
                    <FinanceItem label="Cash flow anual" value={amount(property.cashflowAnnual)} detail="Despues de gastos" />
                    <FinanceItem label="ROE" value={rate(property.roe)} detail="Sobre equity" />
                  </article>
                ))}
              </div>
            </section>
          )}

          {(activeView === "Dashboard" || activeView === "Inmuebles") && (
          <section className={activeView === "Inmuebles" ? "content-grid property-management-grid" : "content-grid"}>
            <div className="main-column">
              <section className="section-head">
                <div>
                  <p className="eyebrow">Gestion diaria</p>
                  <h3>Inmuebles</h3>
                </div>
                <div className="segmented" role="tablist" aria-label="Filtro de inmuebles">
                  <button className="selected">Todos</button>
                  <button>Revisar</button>
                  <button>Vacantes</button>
                </div>
              </section>

              <div className="property-list">
                {activePortfolio.map((property) => (
                  <article
                    key={property.id}
                    className={property.id === selected.id ? "property-row selected" : "property-row"}
                  >
                    <button className="property-main" onClick={() => setSelectedId(property.id)}>
                      <div className="property-title">
                        <span className={`risk-dot ${property.risk.toLowerCase()}`} />
                        <div>
                          <strong>{property.name}</strong>
                          <span>{property.address}</span>
                        </div>
                      </div>
                      <div className="property-stat">
                        <span>Renta</span>
                        <strong className="sensitive-value">{amount(property.rent)}</strong>
                      </div>
                      <div className="property-stat">
                        <span>Neta</span>
                        <strong className="sensitive-value">{rate(property.yieldNet)}</strong>
                      </div>
                      <div className="property-stat">
                        <span>Documentos</span>
                        <strong>{property.documents}%</strong>
                      </div>
                      <span className={`status-pill ${property.status === "Disponible" ? "warn" : ""}`}>
                        {property.status}
                      </span>
                    </button>
                    {!hideAmounts && activeView === "Inmuebles" && property.id === selected.id && (
                      <div className="property-actions">
                        <button type="button" onClick={() => startEditProperty(property)}>
                          Editar ficha
                        </button>
                        <button type="button" className="danger" onClick={() => deactivateProperty(property)}>
                          Baja
                        </button>
                        <button type="button" className="danger solid" onClick={() => deleteProperty(property)}>
                          Eliminar
                        </button>
                      </div>
                    )}
                    {activeView === "Inmuebles" && property.id === selected.id && (
                      editForm.id === property.id ? (
                        <form className="edit-property-panel inline-edit-panel" onSubmit={savePropertyEdit}>
                          <div className="section-head compact">
                            <div>
                              <p className="eyebrow">Modo edicion</p>
                              <h3>Editando: {property.id} · {property.name}</h3>
                            </div>
                            <span>{hasUnsavedChanges ? "!" : property.id}</span>
                          </div>

                          {hasUnsavedChanges && (
                            <p className="edit-state">Cambios sin guardar</p>
                          )}

                          <div className="form-pair">
                            <label>
                              <span>Nombre</span>
                              <input
                                value={editForm.name}
                                onChange={(event) => setEditForm((current) => ({ ...current, name: event.target.value }))}
                                placeholder="Nombre del inmueble"
                              />
                            </label>
                            <label>
                              <span>Direccion</span>
                              <input
                                value={editForm.address}
                                onChange={(event) => setEditForm((current) => ({ ...current, address: event.target.value }))}
                                placeholder="Direccion"
                              />
                            </label>
                          </div>

                          <div className="form-pair">
                            <label>
                              <span>Tipo</span>
                              <select
                                value={editForm.type}
                                onChange={(event) => setEditForm((current) => ({ ...current, type: event.target.value }))}
                              >
                                <option>Residencial</option>
                                <option>Local</option>
                                <option>Oficina</option>
                                <option>Garaje</option>
                                <option>Trastero</option>
                              </select>
                            </label>
                            <label>
                              <span>Estado</span>
                              <select
                                value={editForm.status}
                                onChange={(event) => setEditForm((current) => ({ ...current, status: event.target.value }))}
                              >
                                <option>Ocupado</option>
                                <option>Disponible</option>
                                <option>En revision</option>
                                <option>En alta</option>
                              </select>
                            </label>
                          </div>

                          <div className="form-pair">
                            <label>
                              <span>Inquilino</span>
                              <input
                                value={editForm.tenant}
                                onChange={(event) => setEditForm((current) => ({ ...current, tenant: event.target.value }))}
                                placeholder="Sin inquilino"
                              />
                            </label>
                            <label>
                              <span>Proxima revision</span>
                              <input
                                value={editForm.nextReview}
                                onChange={(event) => setEditForm((current) => ({ ...current, nextReview: event.target.value }))}
                                placeholder="2026-09-15"
                              />
                            </label>
                          </div>

                          <div className="form-pair">
                            <NumberField label="Renta mensual" value={editForm.rent} onChange={(value) => setEditForm((current) => ({ ...current, rent: value }))} />
                            <NumberField label="Valor estimado" value={editForm.value} onChange={(value) => setEditForm((current) => ({ ...current, value }))} />
                          </div>

                          <div className="form-pair">
                            <NumberField label="Deuda pendiente" value={editForm.debtBalance} onChange={(value) => setEditForm((current) => ({ ...current, debtBalance: value }))} />
                            <NumberField label="Cuota hipotecaria anual" value={editForm.financing} onChange={(value) => setEditForm((current) => ({ ...current, financing: value }))} />
                          </div>

                          <div className="form-pair">
                            <NumberField label="Seguro vivienda anual" value={editForm.homeInsurance} onChange={(value) => setEditForm((current) => ({ ...current, homeInsurance: value }))} />
                            <NumberField label="IBI anual" value={editForm.ibi} onChange={(value) => setEditForm((current) => ({ ...current, ibi: value }))} />
                          </div>

                          <label className="wide-label">
                            <span>Aseguradora hogar</span>
                            <input
                              value={editForm.homeInsuranceCompany}
                              onChange={(event) =>
                                setEditForm((current) => ({ ...current, homeInsuranceCompany: event.target.value }))
                              }
                              placeholder="Mapfre, Mutua, Allianz..."
                            />
                          </label>

                          <div className="form-pair">
                            <NumberField label="Basuras anual" value={editForm.wasteTax} onChange={(value) => setEditForm((current) => ({ ...current, wasteTax: value }))} />
                            <NumberField label="Comunidad anual" value={editForm.community} onChange={(value) => setEditForm((current) => ({ ...current, community: value }))} />
                          </div>

                          <div className="form-pair">
                            <NumberField label="Seguro alquiler anual" value={editForm.rentInsurance} onChange={(value) => setEditForm((current) => ({ ...current, rentInsurance: value }))} />
                            <NumberField label="Reparaciones/mantenimiento" value={editForm.maintenance} onChange={(value) => setEditForm((current) => ({ ...current, maintenance: value }))} />
                          </div>

                          <label className="wide-label">
                            <span>Carpeta Drive</span>
                            <input
                              value={editForm.driveFolder}
                              onChange={(event) => setEditForm((current) => ({ ...current, driveFolder: event.target.value }))}
                              placeholder="Drive / Inmuebles / ..."
                            />
                          </label>

                          <label className="check-label">
                            <input
                              type="checkbox"
                              checked={editForm.utilitiesAssumedByTenant}
                              onChange={(event) =>
                                setEditForm((current) => ({
                                  ...current,
                                  utilitiesAssumedByTenant: event.target.checked,
                                }))
                              }
                            />
                            <span>Suministros asumidos por inquilino</span>
                          </label>

                          <div className="edit-actions">
                            <button type="submit" disabled={isSaving || !editForm.id}>
                              {isSaving ? "Guardando..." : "Guardar cambios"}
                            </button>
                            <button type="button" className="secondary-action" onClick={cancelEditProperty}>
                              Cancelar
                            </button>
                          </div>
                          <p className="import-note">{editMessage}</p>
                        </form>
                      ) : (
                        <section className="selected-property-panel" aria-label={`Ficha de ${property.name}`}>
                          <div className="section-head compact">
                            <div>
                              <p className="eyebrow">Modo consulta</p>
                              <h3>{property.id} · {property.name}</h3>
                            </div>
                            {!hideAmounts && (
                              <button type="button" onClick={() => startEditProperty(property)}>
                                Editar ficha
                              </button>
                            )}
                          </div>
                          <div className="detail-stats">
                            <Detail label="Direccion" value={property.address} />
                            <Detail label="Inquilino" value={property.tenant} />
                            <Detail label="Estado" value={property.status} />
                            <Detail label="Aseguradora hogar" value={property.homeInsuranceCompany} />
                            <Detail label="Revision" value={property.nextReview} />
                            <Detail label="Cash flow anual" value={amount(property.cashflowAnnual)} />
                          </div>
                          <section className="cost-panel" aria-label="Costes del inmueble seleccionado">
                            <div className="cost-total">
                              <span>Costes anuales controlados</span>
                              <strong className="sensitive-value">{amount(Object.values(property.annualCosts).reduce((sum, value) => sum + value, 0))}</strong>
                            </div>
                            <div className="cost-total compact-cost">
                              <span>Restas mensuales</span>
                              <strong className="sensitive-value">{amount(Math.round(Object.values(property.annualCosts).reduce((sum, value) => sum + value, 0) / 12))}</strong>
                            </div>
                          </section>
                        </section>
                      )
                    )}
                  </article>
                ))}
              </div>

              {activeView === "Dashboard" && (
              <section className="finance-panel">
                <div>
                  <p className="eyebrow">Finanzas</p>
                  <h3>Lectura financiera</h3>
                </div>
                <div className="finance-grid">
                  <FinanceItem label="Valor cartera" value={amount(totals.value)} detail={`${activePortfolio.length} activos`} />
                  <FinanceItem label="Deuda total" value={amount(totals.debt)} detail={`LTV ${rate(totals.ltv)}`} />
                  <FinanceItem label="Equity total" value={amount(totals.equity)} detail="Valor menos deuda" />
                  <FinanceItem label="Cash flow anual" value={amount(totals.cashflowAnnual)} detail="Rentas menos gastos y deuda" />
                  <FinanceItem label="ROE cartera" value={rate(totals.roe)} detail="Cash flow / equity" />
                  <FinanceItem label="LTV cartera" value={rate(totals.ltv)} detail="Deuda / valor" />
                </div>
                <div className="finance-property-grid">
                  {activePortfolio.map((property) => (
                    <article key={property.id}>
                      <div>
                        <span>{property.id}</span>
                        <strong>{property.name}</strong>
                      </div>
                      <FinanceItem label="Valor" value={amount(property.value)} detail="Actual estimado" />
                      <FinanceItem label="Deuda" value={amount(property.debtBalance)} detail={`LTV ${rate(property.ltv)}`} />
                      <FinanceItem label="Equity" value={amount(property.equity)} detail="Capital propio" />
                      <FinanceItem label="Cash flow anual" value={amount(property.cashflowAnnual)} detail="Despues de gastos" />
                      <FinanceItem label="ROE" value={rate(property.roe)} detail="Sobre equity" />
                    </article>
                  ))}
                </div>
              </section>
              )}
            </div>

            {activeView === "Dashboard" && (
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
                  <Detail label="Aseguradora hogar" value={selected.homeInsuranceCompany} />
                  <Detail label="Cash flow anual" value={amount(selected.cashflowAnnual)} />
                </div>

                <section className="cost-panel" aria-label="Costes reales del inmueble">
                  <div className="cost-total">
                    <span>Costes anuales controlados</span>
                    <strong className="sensitive-value">{amount(selectedAnnualCosts)}</strong>
                  </div>
                  <div className="cost-total compact-cost">
                    <span>Restas mensuales</span>
                    <strong className="sensitive-value">{amount(Math.round(selectedAnnualCosts / 12))}</strong>
                  </div>
                  <Cost label="Seguro vivienda" value={selected.annualCosts.homeInsurance} hideAmounts={hideAmounts} />
                  <Cost label="IBI" value={selected.annualCosts.ibi} hideAmounts={hideAmounts} />
                  <Cost label="Basuras" value={selected.annualCosts.wasteTax} hideAmounts={hideAmounts} />
                  <Cost label="Comunidad" value={selected.annualCosts.community} hideAmounts={hideAmounts} />
                  <Cost label="Seguro alquiler" value={selected.annualCosts.rentInsurance} hideAmounts={hideAmounts} />
                  <Cost label="Mantenimiento" value={selected.annualCosts.maintenance} hideAmounts={hideAmounts} />
                  <Cost label="Cuota hipotecaria" value={selected.annualCosts.financing} hideAmounts={hideAmounts} />
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
            )}
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

function parseImportRows(text: string): ImportRow[] {
  const [headerLine, ...lines] = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!headerLine) {
    return [];
  }

  const separator = detectSeparator(headerLine);
  const headers = splitCsvLine(headerLine, separator).map(normalizeHeader);

  return lines.map((line) => {
    const values = splitCsvLine(line, separator);
    const row = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));

    return {
      name: row.nombre ?? "",
      address: row.direccion ?? "",
      type: row.tipo || "Residencial",
      status: row.estado || "En revision",
      tenant: row.inquilino || "Sin inquilino",
      rent: parseEuro(row.renta_mensual),
      value: parseEuro(row.valor_estimado),
      homeInsurance: parseEuro(row.seguro_vivienda),
      ibi: parseEuro(row.ibi),
      wasteTax: parseEuro(row.basuras),
      community: parseEuro(row.comunidad),
      rentInsurance: parseEuro(row.seguro_alquiler),
      financing: parseEuro(row.financiacion),
      maintenance: 0,
      debtBalance: 0,
      homeInsuranceCompany: "Pendiente",
      utilitiesAssumedByTenant: parseYes(row.suministros_inquilino),
      driveFolder: row.carpeta_drive || "",
      nextReview: row.proxima_revision || "Pendiente",
    };
  });
}

function propertyToEditForm(property: Property): PropertyEditForm {
  return {
    id: property.id,
    name: property.name,
    address: property.address,
    type: property.type,
    status: property.status,
    tenant: property.tenant,
    rent: property.rent,
    value: property.value,
    debtBalance: property.debtBalance,
    homeInsurance: property.annualCosts.homeInsurance,
    ibi: property.annualCosts.ibi,
    wasteTax: property.annualCosts.wasteTax,
    community: property.annualCosts.community,
    rentInsurance: property.annualCosts.rentInsurance,
    financing: property.annualCosts.financing,
    maintenance: property.annualCosts.maintenance,
    homeInsuranceCompany: property.homeInsuranceCompany,
    utilitiesAssumedByTenant: property.utilitiesAssumedByTenant,
    driveFolder: property.driveFolder,
    nextReview: property.nextReview,
  };
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label>
      <span>{label}</span>
      <input
        type="number"
        min="0"
        inputMode="decimal"
        value={String(value)}
        onChange={(event) => onChange(Number(event.target.value || 0))}
      />
    </label>
  );
}

function detectSeparator(line: string) {
  const candidates = [";", "\t", ","];
  return candidates.reduce((best, candidate) =>
    line.split(candidate).length > line.split(best).length ? candidate : best,
  );
}

function normalizeHeader(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function splitCsvLine(line: string, separator: string) {
  const values: string[] = [];
  let current = "";
  let quoted = false;

  for (const character of line) {
    if (character === '"') {
      quoted = !quoted;
      continue;
    }

    if (character === separator && !quoted) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += character;
  }

  values.push(current.trim());
  return values;
}

function parseEuro(value?: string) {
  const normalized = (value ?? "")
    .replace(/\s/g, "")
    .replace(/EUR|€/gi, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseYes(value?: string) {
  return ["si", "sí", "yes", "true", "1"].includes((value ?? "").trim().toLowerCase());
}

function Metric({ label, value, trend }: { label: string; value: string; trend: string }) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong className={isSensitiveDisplay(label, value) ? "sensitive-value" : undefined}>{value}</strong>
      <small>{trend}</small>
    </article>
  );
}

function FinanceItem({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="finance-item">
      <span>{label}</span>
      <strong className={isSensitiveDisplay(label, value) ? "sensitive-value" : undefined}>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong className={isSensitiveDisplay(label, value) ? "sensitive-value" : undefined}>{value}</strong>
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
      <strong className={hideAmounts ? "sensitive-value" : undefined}>
        {value > 0 ? euro.format(value) : "No consta"}
      </strong>
    </div>
  );
}

function isSensitiveDisplay(label: string, value: string) {
  if (/document/i.test(label)) {
    return false;
  }

  return /€|%/.test(value);
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
