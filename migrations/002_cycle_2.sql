-- ONI Generated Migration — Cycle 2
-- Generated: 2026-04-05T11:12:08.159Z

-- Schema for: AI-Powered Business Insights and Analytics Dashboard
CREATE TABLE IF NOT EXISTS organizations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    slug varchar(100) NOT NULL UNIQUE,
    industry varchar(100),
    size_category varchar(50),
    timezone varchar(100) DEFAULT 'UTC',
    settings jsonb DEFAULT '{}',
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_is_active ON organizations(is_active);

CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email varchar(255) NOT NULL UNIQUE,
    full_name varchar(255) NOT NULL,
    role varchar(50) NOT NULL DEFAULT 'viewer',
    preferences jsonb DEFAULT '{}',
    last_login_at timestamptz,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE TABLE IF NOT EXISTS data_sources (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name varchar(255) NOT NULL,
    source_type varchar(100) NOT NULL,
    category varchar(100) NOT NULL,
    connection_config jsonb NOT NULL DEFAULT '{}',
    credentials_ref varchar(500),
    sync_frequency_minutes integer DEFAULT 60,
    last_synced_at timestamptz,
    last_sync_status varchar(50),
    last_sync_error text,
    is_active boolean DEFAULT true,
    is_verified boolean DEFAULT false,
    row_count bigint,
    schema_definition jsonb DEFAULT '{}',
    created_by uuid REFERENCES users(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_data_sources_organization_id ON data_sources(organization_id);
CREATE INDEX IF NOT EXISTS idx_data_sources_source_type ON data_sources(source_type);
CREATE INDEX IF NOT EXISTS idx_data_sources_is_active ON data_sources(is_active);
CREATE INDEX IF NOT EXISTS idx_data_sources_last_synced_at ON data_sources(last_synced_at);

CREATE TABLE IF NOT EXISTS data_sync_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    data_source_id uuid NOT NULL REFERENCES data_sources(id) ON DELETE CASCADE,
    sync_started_at timestamptz NOT NULL DEFAULT now(),
    sync_completed_at timestamptz,
    status varchar(50) NOT NULL DEFAULT 'running',
    records_processed bigint DEFAULT 0,
    records_inserted bigint DEFAULT 0,
    records_updated bigint DEFAULT 0,
    records_failed bigint DEFAULT 0,
    error_message text,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_data_sync_logs_data_source_id ON data_sync_logs(data_source_id);
CREATE INDEX IF NOT EXISTS idx_data_sync_logs_status ON data_sync_logs(status);
CREATE INDEX IF NOT EXISTS idx_data_sync_logs_sync_started_at ON data_sync_logs(sync_started_at DESC);

CREATE TABLE IF NOT EXISTS dashboards (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by uuid REFERENCES users(id) ON DELETE SET NULL,
    name varchar(255) NOT NULL,
    description text,
    is_default boolean DEFAULT false,
    is_public boolean DEFAULT false,
    layout_config jsonb DEFAULT '{}',
    filters_config jsonb DEFAULT '{}',
    date_range_preset varchar(50) DEFAULT '30d',
    refresh_interval_seconds integer DEFAULT 300,
    tags text[] DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dashboards_organization_id ON dashboards(organization_id);
CREATE INDEX IF NOT EXISTS idx_dashboards_created_by ON dashboards(created_by);
CREATE INDEX IF NOT EXISTS idx_dashboards_is_default ON dashboards(is_default);
CREATE INDEX IF NOT EXISTS idx_dashboards_tags ON dashboards USING GIN(tags);

CREATE TABLE IF NOT EXISTS dashboard_shares (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    dashboard_id uuid NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,
    shared_with_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    permission_level varchar(50) NOT NULL DEFAULT 'view',
    share_token varchar(255) UNIQUE,
    token_expires_at timestamptz,
    created_by uuid REFERENCES users(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dashboard_shares_dashboard_id ON dashboard_shares(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_shares_shared_with_user_id ON dashboard_shares(shared_with_user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_shares_share_token ON dashboard_shares(share_token);

CREATE TABLE IF NOT EXISTS kpi_definitions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    data_source_id uuid REFERENCES data_sources(id) ON DELETE SET NULL,
    name varchar(255) NOT NULL,
    description text,
    category varchar(100),
    unit varchar(50),
    unit_prefix varchar(20),
    unit_suffix varchar(20),
    calculation_type varchar(100) NOT NULL,
    calculation_query text,
    calculation_config jsonb DEFAULT '{}',
    aggregation_method varchar(50) DEFAULT 'sum',
    comparison_period varchar(50) DEFAULT 'previous_period',
    target_value numeric(20, 4),
    target_type varchar(50),
    warning_threshold numeric(20, 4),
    critical_threshold numeric(20, 4),
    higher_is_better boolean DEFAULT true,
    display_format varchar(100),
    decimal_places integer DEFAULT 2,
    is_active boolean DEFAULT true,
    is_featured boolean DEFAULT false,
    refresh_frequency_minutes integer DEFAULT 60,
    last_calculated_at timestamptz,
    created_by uuid REFERENCES users(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_kpi_definitions_organization_id ON kpi_definitions(organization_id);
CREATE INDEX IF NOT EXISTS idx_kpi_definitions_data_source_id ON kpi_definitions(data_source_id);
CREATE INDEX IF NOT EXISTS idx_kpi_definitions_category ON kpi_definitions(category);
CREATE INDEX IF NOT EXISTS idx_kpi_definitions_is_active ON kpi_definitions(is_active);
CREATE INDEX IF NOT EXISTS idx_kpi_definitions_is_featured ON kpi_definitions(is_featured);

CREATE TABLE IF NOT EXISTS kpi_snapshots (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    kpi_definition_id uuid NOT NULL REFERENCES kpi_definitions(id) ON DELETE CASCADE,
    snapshot_timestamp timestamptz NOT NULL DEFAULT now(),
    period_start timestamptz NOT NULL,
    period_end timestamptz NOT NULL,
    value numeric(20, 4),
    previous_value numeric(20, 4),
    change_absolute numeric(20, 4),
    change_percentage numeric(10, 4),
    target_value numeric(20, 4),
    target_variance numeric(20, 4),
    target_variance_percentage numeric(10, 4),
    status varchar(50),
    data_quality_score numeric(5, 2),
    sample_size bigint,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now()
);