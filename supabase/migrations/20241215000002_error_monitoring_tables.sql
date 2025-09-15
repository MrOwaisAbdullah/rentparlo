-- Error Monitoring and Logging Tables Migration
-- Creates tables for error logging, performance alerts, and monitoring data

-- Create error_logs table
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  error_id TEXT NOT NULL UNIQUE,
  component_name TEXT NOT NULL,
  error_name TEXT NOT NULL,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  component_stack TEXT,
  user_agent TEXT,
  url TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  build_version TEXT,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create performance_alerts table
CREATE TABLE IF NOT EXISTS performance_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric TEXT NOT NULL,
  threshold NUMERIC,
  operator TEXT CHECK (operator IN ('gt', 'lt', 'eq')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message TEXT NOT NULL,
  url TEXT,
  user_agent TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  value NUMERIC,
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create alert_suppressions table
CREATE TABLE IF NOT EXISTS alert_suppressions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric TEXT NOT NULL,
  suppressed_until TIMESTAMP WITH TIME ZONE NOT NULL,
  reason TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create performance_metrics table for storing dashboard performance data
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  page_url TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_unit TEXT,
  user_agent TEXT,
  connection_type TEXT,
  device_type TEXT,
  viewport_width INTEGER,
  viewport_height INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create system_health_logs table
CREATE TABLE IF NOT EXISTS system_health_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  memory_usage BIGINT,
  connection_type TEXT,
  is_online BOOLEAN,
  battery_level NUMERIC,
  device_pixel_ratio NUMERIC,
  viewport_width INTEGER,
  viewport_height INTEGER,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_interactions table
CREATE TABLE IF NOT EXISTS user_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('click', 'scroll', 'input', 'navigation')),
  target_element TEXT,
  page_url TEXT NOT NULL,
  duration NUMERIC,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_component_name ON error_logs (component_name);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON error_logs (severity);
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON error_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_resolved ON error_logs (resolved);

CREATE INDEX IF NOT EXISTS idx_performance_alerts_created_at ON performance_alerts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_performance_alerts_metric ON performance_alerts (metric);
CREATE INDEX IF NOT EXISTS idx_performance_alerts_severity ON performance_alerts (severity);
CREATE INDEX IF NOT EXISTS idx_performance_alerts_acknowledged ON performance_alerts (acknowledged);

CREATE INDEX IF NOT EXISTS idx_alert_suppressions_metric ON alert_suppressions (metric);
CREATE INDEX IF NOT EXISTS idx_alert_suppressions_suppressed_until ON alert_suppressions (suppressed_until);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_created_at ON performance_metrics (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_metric_name ON performance_metrics (metric_name);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_id ON performance_metrics (user_id);

CREATE INDEX IF NOT EXISTS idx_system_health_logs_created_at ON system_health_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_health_logs_user_id ON system_health_logs (user_id);

CREATE INDEX IF NOT EXISTS idx_user_interactions_created_at ON user_interactions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions (user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_type ON user_interactions (interaction_type);

-- Create views for monitoring dashboards

-- Error summary view
CREATE OR REPLACE VIEW error_summary AS
SELECT 
  component_name,
  error_name,
  COUNT(*) as error_count,
  COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical_count,
  COUNT(CASE WHEN severity = 'high' THEN 1 END) as high_count,
  COUNT(CASE WHEN severity = 'medium' THEN 1 END) as medium_count,
  COUNT(CASE WHEN severity = 'low' THEN 1 END) as low_count,
  COUNT(CASE WHEN resolved = true THEN 1 END) as resolved_count,
  MAX(created_at) as last_occurrence,
  MIN(created_at) as first_occurrence
FROM error_logs
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY component_name, error_name
ORDER BY error_count DESC;

-- Performance alerts summary view
CREATE OR REPLACE VIEW alerts_summary AS
SELECT 
  metric,
  severity,
  COUNT(*) as alert_count,
  COUNT(CASE WHEN acknowledged = true THEN 1 END) as acknowledged_count,
  AVG(value) as avg_value,
  MAX(value) as max_value,
  MIN(value) as min_value,
  MAX(created_at) as last_alert,
  MIN(created_at) as first_alert
FROM performance_alerts
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY metric, severity
ORDER BY alert_count DESC;

-- System health summary view
CREATE OR REPLACE VIEW system_health_summary AS
SELECT 
  DATE_TRUNC('hour', created_at) as hour,
  AVG(memory_usage) as avg_memory_usage,
  MAX(memory_usage) as max_memory_usage,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT session_id) as unique_sessions,
  AVG(viewport_width) as avg_viewport_width,
  AVG(viewport_height) as avg_viewport_height,
  COUNT(CASE WHEN is_online = false THEN 1 END) as offline_count
FROM system_health_logs
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', created_at)
ORDER BY hour DESC;

-- User interaction summary view
CREATE OR REPLACE VIEW interaction_summary AS
SELECT 
  interaction_type,
  COUNT(*) as interaction_count,
  COUNT(DISTINCT user_id) as unique_users,
  AVG(duration) as avg_duration,
  MAX(duration) as max_duration,
  DATE_TRUNC('hour', created_at) as hour
FROM user_interactions
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY interaction_type, DATE_TRUNC('hour', created_at)
ORDER BY hour DESC, interaction_count DESC;

-- Functions for monitoring operations

-- Function to get error statistics
CREATE OR REPLACE FUNCTION get_error_statistics(
  time_range INTERVAL DEFAULT INTERVAL '24 hours'
)
RETURNS TABLE(
  total_errors BIGINT,
  critical_errors BIGINT,
  high_errors BIGINT,
  medium_errors BIGINT,
  low_errors BIGINT,
  resolved_errors BIGINT,
  resolution_rate NUMERIC,
  top_components TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_errors,
    COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical_errors,
    COUNT(CASE WHEN severity = 'high' THEN 1 END) as high_errors,
    COUNT(CASE WHEN severity = 'medium' THEN 1 END) as medium_errors,
    COUNT(CASE WHEN severity = 'low' THEN 1 END) as low_errors,
    COUNT(CASE WHEN resolved = true THEN 1 END) as resolved_errors,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        ROUND((COUNT(CASE WHEN resolved = true THEN 1 END)::NUMERIC / COUNT(*)) * 100, 2)
      ELSE 0 
    END as resolution_rate,
    ARRAY(
      SELECT component_name 
      FROM error_logs 
      WHERE created_at >= NOW() - time_range
      GROUP BY component_name 
      ORDER BY COUNT(*) DESC 
      LIMIT 5
    ) as top_components
  FROM error_logs
  WHERE created_at >= NOW() - time_range;
END;
$$ LANGUAGE plpgsql;

-- Function to get performance alert statistics
CREATE OR REPLACE FUNCTION get_alert_statistics(
  time_range INTERVAL DEFAULT INTERVAL '24 hours'
)
RETURNS TABLE(
  total_alerts BIGINT,
  critical_alerts BIGINT,
  high_alerts BIGINT,
  medium_alerts BIGINT,
  low_alerts BIGINT,
  acknowledged_alerts BIGINT,
  acknowledgment_rate NUMERIC,
  top_metrics TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_alerts,
    COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical_alerts,
    COUNT(CASE WHEN severity = 'high' THEN 1 END) as high_alerts,
    COUNT(CASE WHEN severity = 'medium' THEN 1 END) as medium_alerts,
    COUNT(CASE WHEN severity = 'low' THEN 1 END) as low_alerts,
    COUNT(CASE WHEN acknowledged = true THEN 1 END) as acknowledged_alerts,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        ROUND((COUNT(CASE WHEN acknowledged = true THEN 1 END)::NUMERIC / COUNT(*)) * 100, 2)
      ELSE 0 
    END as acknowledgment_rate,
    ARRAY(
      SELECT metric 
      FROM performance_alerts 
      WHERE created_at >= NOW() - time_range
      GROUP BY metric 
      ORDER BY COUNT(*) DESC 
      LIMIT 5
    ) as top_metrics
  FROM performance_alerts
  WHERE created_at >= NOW() - time_range;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old monitoring data
CREATE OR REPLACE FUNCTION cleanup_monitoring_data(
  retention_days INTEGER DEFAULT 30
)
RETURNS TABLE(
  errors_deleted BIGINT,
  alerts_deleted BIGINT,
  metrics_deleted BIGINT,
  health_logs_deleted BIGINT,
  interactions_deleted BIGINT
) AS $$
DECLARE
  cutoff_date TIMESTAMP WITH TIME ZONE;
  errors_count BIGINT;
  alerts_count BIGINT;
  metrics_count BIGINT;
  health_count BIGINT;
  interactions_count BIGINT;
BEGIN
  cutoff_date := NOW() - (retention_days || ' days')::INTERVAL;
  
  -- Delete old error logs (keep resolved ones longer)
  DELETE FROM error_logs 
  WHERE created_at < cutoff_date AND (resolved = true OR created_at < NOW() - INTERVAL '7 days');
  GET DIAGNOSTICS errors_count = ROW_COUNT;
  
  -- Delete old performance alerts (keep acknowledged ones longer)
  DELETE FROM performance_alerts 
  WHERE created_at < cutoff_date AND (acknowledged = true OR created_at < NOW() - INTERVAL '7 days');
  GET DIAGNOSTICS alerts_count = ROW_COUNT;
  
  -- Delete old performance metrics
  DELETE FROM performance_metrics 
  WHERE created_at < cutoff_date;
  GET DIAGNOSTICS metrics_count = ROW_COUNT;
  
  -- Delete old system health logs
  DELETE FROM system_health_logs 
  WHERE created_at < cutoff_date;
  GET DIAGNOSTICS health_count = ROW_COUNT;
  
  -- Delete old user interactions
  DELETE FROM user_interactions 
  WHERE created_at < cutoff_date;
  GET DIAGNOSTICS interactions_count = ROW_COUNT;
  
  RETURN QUERY SELECT errors_count, alerts_count, metrics_count, health_count, interactions_count;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_suppressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_health_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Error logs policies
CREATE POLICY "Users can view their own error logs" ON error_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all error logs" ON error_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "System can insert error logs" ON error_logs
  FOR INSERT WITH CHECK (true);

-- Performance alerts policies
CREATE POLICY "Users can view their own alerts" ON performance_alerts
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all alerts" ON performance_alerts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "System can insert alerts" ON performance_alerts
  FOR INSERT WITH CHECK (true);

-- Performance metrics policies
CREATE POLICY "Users can view their own metrics" ON performance_metrics
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert metrics" ON performance_metrics
  FOR INSERT WITH CHECK (true);

-- System health logs policies
CREATE POLICY "Users can view their own health logs" ON system_health_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert health logs" ON system_health_logs
  FOR INSERT WITH CHECK (true);

-- User interactions policies
CREATE POLICY "Users can view their own interactions" ON user_interactions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert interactions" ON user_interactions
  FOR INSERT WITH CHECK (true);

-- Add comments for documentation
COMMENT ON TABLE error_logs IS 'Stores application error logs with context and resolution tracking';
COMMENT ON TABLE performance_alerts IS 'Stores performance alerts triggered by monitoring thresholds';
COMMENT ON TABLE alert_suppressions IS 'Manages alert suppression to prevent alert storms';
COMMENT ON TABLE performance_metrics IS 'Stores detailed performance metrics from dashboard usage';
COMMENT ON TABLE system_health_logs IS 'Stores system health information from client devices';
COMMENT ON TABLE user_interactions IS 'Stores user interaction data for behavior analysis';

COMMENT ON FUNCTION get_error_statistics IS 'Returns comprehensive error statistics for a given time range';
COMMENT ON FUNCTION get_alert_statistics IS 'Returns comprehensive alert statistics for a given time range';
COMMENT ON FUNCTION cleanup_monitoring_data IS 'Cleans up old monitoring data based on retention policy';