-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT
);

-- Create user_permissions junction table
CREATE TABLE IF NOT EXISTS user_permissions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, permission_id)
);

-- Insert default permissions
INSERT INTO permissions (code, name, description) VALUES
  ('VIEW_DASHBOARD', 'Voir le tableau de bord', 'Accès au tableau de bord principal'),
  ('VIEW_REPORTS', 'Voir les rapports', 'Accès aux rapports mensuels/annuels'),
  ('VIEW_INVOICES', 'Voir les factures', 'Accès aux factures et facturation'),
  ('VIEW_ALERTS', 'Voir les alertes', 'Voir les alertes et anomalies'),
  ('MANAGE_THRESHOLDS', 'Gérer les seuils', 'Modifier les seuils d''alerte'),
  ('MANAGE_ASSETS', 'Gérer les équipements', 'Créer/modifier/supprimer les équipements'),
  ('MANAGE_USERS', 'Gérer les utilisateurs', 'Créer/modifier/supprimer les utilisateurs'),
  ('VIEW_CONSUMPTION', 'Voir la consommation', 'Voir les données temps réel et historiques'),
  ('EXPORT_DATA', 'Exporter les données', 'Exporter les données en CSV/PDF'),
  ('VIEW_BILLING', 'Voir la facturation', 'Accès aux détails de facturation'),
ON CONFLICT (code) DO NOTHING;
