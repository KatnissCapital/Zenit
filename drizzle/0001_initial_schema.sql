CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS properties (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  asset_type TEXT NOT NULL,
  status TEXT NOT NULL,
  cadastral_reference TEXT,
  drive_folder_url TEXT,
  market_value_cents INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  tax_id TEXT,
  email TEXT,
  phone TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leases (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL REFERENCES properties(id),
  tenant_id TEXT REFERENCES tenants(id),
  start_date TEXT NOT NULL,
  end_date TEXT,
  current_rent_cents INTEGER NOT NULL DEFAULT 0,
  deposit_cents INTEGER NOT NULL DEFAULT 0,
  rent_index TEXT NOT NULL DEFAULT 'pending',
  status TEXT NOT NULL,
  next_review_date TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS property_costs (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL REFERENCES properties(id),
  period_year INTEGER NOT NULL,
  home_insurance_cents INTEGER NOT NULL DEFAULT 0,
  ibi_cents INTEGER NOT NULL DEFAULT 0,
  waste_tax_cents INTEGER NOT NULL DEFAULT 0,
  community_cents INTEGER NOT NULL DEFAULT 0,
  rent_insurance_cents INTEGER NOT NULL DEFAULT 0,
  financing_cents INTEGER NOT NULL DEFAULT 0,
  maintenance_cents INTEGER NOT NULL DEFAULT 0,
  debt_balance_cents INTEGER NOT NULL DEFAULT 0,
  utilities_assumed_by_tenant INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  property_id TEXT REFERENCES properties(id),
  lease_id TEXT REFERENCES leases(id),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  drive_url TEXT,
  status TEXT NOT NULL,
  expires_at TEXT,
  sensitive INTEGER NOT NULL DEFAULT 0,
  extracted_json TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alerts (
  id TEXT PRIMARY KEY,
  property_id TEXT REFERENCES properties(id),
  alert_type TEXT NOT NULL,
  title TEXT NOT NULL,
  detail TEXT NOT NULL,
  status TEXT NOT NULL,
  due_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  changes_json TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_leases_property_id ON leases(property_id);
CREATE INDEX IF NOT EXISTS idx_property_costs_property_year ON property_costs(property_id, period_year);
CREATE INDEX IF NOT EXISTS idx_documents_property_status ON documents(property_id, status);
CREATE INDEX IF NOT EXISTS idx_alerts_status_due_at ON alerts(status, due_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id);
PRAGMA optimize;
