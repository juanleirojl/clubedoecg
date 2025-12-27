-- =============================================
-- MIGRAÇÃO: Sistema de Email Profissional
-- Data: 2024-12-27
-- Descrição: Tabelas para controle de envio de emails,
--            logs, campanhas e anti-spam
-- =============================================

-- =============================================
-- 1. ATUALIZAR TABELA USER_SETTINGS
-- =============================================

-- Adicionar colunas de frequência e controle de envio
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS reminder_frequency TEXT DEFAULT 'weekly' 
  CHECK (reminder_frequency IN ('daily', 'weekly', 'monthly', 'never'));

ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS weekly_summary BOOLEAN DEFAULT true;

ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS last_reminder_sent TIMESTAMPTZ DEFAULT NULL;

ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT NOW();

-- =============================================
-- 2. TABELA DE LOG DE EMAILS
-- =============================================

CREATE TABLE IF NOT EXISTS public.email_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Referência ao usuário (pode ser null para emails de sistema)
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Informações do email
  email_to TEXT NOT NULL,
  email_type TEXT NOT NULL CHECK (email_type IN (
    'reminder',           -- Lembrete de estudo
    'new_content',        -- Novo conteúdo disponível
    'weekly_summary',     -- Resumo semanal
    'welcome',            -- Boas-vindas
    'password_reset',     -- Reset de senha
    'campaign',           -- Campanha manual
    'achievement',        -- Conquista desbloqueada
    'course_complete'     -- Curso concluído
  )),
  
  -- Conteúdo
  subject TEXT NOT NULL,
  template_id TEXT,
  template_data JSONB DEFAULT '{}',
  
  -- Status e tracking (do Resend)
  resend_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',
    'sent',
    'delivered',
    'opened',
    'clicked',
    'bounced',
    'complained',
    'failed'
  )),
  
  -- Timestamps de tracking
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  
  -- Erro (se houver)
  error_message TEXT,
  
  -- Metadata
  campaign_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Índices serão criados abaixo
  CONSTRAINT fk_campaign FOREIGN KEY (campaign_id) 
    REFERENCES public.notification_campaigns(id) ON DELETE SET NULL
    DEFERRABLE INITIALLY DEFERRED
);

-- =============================================
-- 3. TABELA DE CAMPANHAS
-- =============================================

CREATE TABLE IF NOT EXISTS public.notification_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Informações da campanha
  name TEXT NOT NULL,
  description TEXT,
  
  -- Email
  subject TEXT NOT NULL,
  preview_text TEXT, -- Texto de preview no cliente de email
  template_id TEXT NOT NULL,
  template_data JSONB DEFAULT '{}',
  
  -- Segmentação de audiência
  target_audience JSONB DEFAULT '{"type": "all"}',
  -- Exemplos de target_audience:
  -- {"type": "all"} - todos os usuários
  -- {"type": "pro"} - só PRO
  -- {"type": "free"} - só free
  -- {"type": "inactive", "days": 7} - inativos há X dias
  -- {"type": "course", "course_id": "xxx", "condition": "not_completed"} - não completaram curso X
  -- {"type": "custom", "user_ids": ["xxx", "yyy"]} - usuários específicos
  
  -- Agendamento
  scheduled_for TIMESTAMPTZ,
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN (
    'draft',
    'scheduled',
    'sending',
    'sent',
    'cancelled'
  )),
  
  -- Estatísticas
  total_recipients INTEGER DEFAULT 0,
  total_sent INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  total_bounced INTEGER DEFAULT 0,
  
  -- Quem criou
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ
);

-- =============================================
-- 4. TABELA DE CONFIGURAÇÕES GLOBAIS DE EMAIL
-- =============================================

CREATE TABLE IF NOT EXISTS public.email_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Configurações
  emails_enabled BOOLEAN DEFAULT true,
  daily_limit INTEGER DEFAULT 500,
  
  -- Horários permitidos para envio (UTC)
  send_start_hour INTEGER DEFAULT 12 CHECK (send_start_hour >= 0 AND send_start_hour <= 23),
  send_end_hour INTEGER DEFAULT 21 CHECK (send_end_hour >= 0 AND send_end_hour <= 23),
  
  -- Dias permitidos (array de 0-6, onde 0 = domingo)
  send_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5], -- seg-sex por padrão
  
  -- Contadores
  emails_sent_today INTEGER DEFAULT 0,
  last_reset_date DATE DEFAULT CURRENT_DATE,
  
  -- Timestamps
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Inserir configuração padrão
INSERT INTO public.email_config (id) 
VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- =============================================
-- 5. ÍNDICES PARA PERFORMANCE
-- =============================================

-- Índices para email_log
CREATE INDEX IF NOT EXISTS idx_email_log_user_id ON public.email_log(user_id);
CREATE INDEX IF NOT EXISTS idx_email_log_email_type ON public.email_log(email_type);
CREATE INDEX IF NOT EXISTS idx_email_log_status ON public.email_log(status);
CREATE INDEX IF NOT EXISTS idx_email_log_created_at ON public.email_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_log_campaign_id ON public.email_log(campaign_id);

-- Índice composto para verificar último envio por tipo
CREATE INDEX IF NOT EXISTS idx_email_log_user_type_date 
  ON public.email_log(user_id, email_type, created_at DESC);

-- Índices para campanhas
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.notification_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_scheduled ON public.notification_campaigns(scheduled_for) 
  WHERE status = 'scheduled';

-- Índice para user_settings (último lembrete)
CREATE INDEX IF NOT EXISTS idx_user_settings_last_reminder 
  ON public.user_settings(last_reminder_sent);

-- =============================================
-- 6. POLÍTICAS DE SEGURANÇA (RLS)
-- =============================================

-- Email Log - Usuários podem ver seus próprios emails
ALTER TABLE public.email_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own emails" ON public.email_log
  FOR SELECT USING (auth.uid() = user_id);

-- Admins podem ver todos os emails
CREATE POLICY "Admins can view all emails" ON public.email_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Só o sistema (service role) pode inserir/atualizar emails
CREATE POLICY "System can insert emails" ON public.email_log
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update emails" ON public.email_log
  FOR UPDATE USING (true);

-- Campanhas - Só admins
ALTER TABLE public.notification_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage campaigns" ON public.notification_campaigns
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Config - Só admins podem ver/editar
ALTER TABLE public.email_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage email config" ON public.email_config
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- =============================================
-- 7. FUNÇÕES AUXILIARES
-- =============================================

-- Função para verificar se pode enviar email para usuário
CREATE OR REPLACE FUNCTION public.can_send_email_to_user(
  p_user_id UUID,
  p_email_type TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_settings RECORD;
  v_last_email TIMESTAMPTZ;
  v_min_interval INTERVAL;
BEGIN
  -- Buscar configurações do usuário
  SELECT * INTO v_settings FROM public.user_settings WHERE user_id = p_user_id;
  
  -- Se não tem settings ou email desabilitado, não envia
  IF v_settings IS NULL OR NOT v_settings.email_notifications THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar tipo específico
  IF p_email_type = 'reminder' THEN
    IF NOT v_settings.progress_reminders THEN
      RETURN FALSE;
    END IF;
    
    -- Definir intervalo mínimo baseado na frequência
    v_min_interval := CASE v_settings.reminder_frequency
      WHEN 'daily' THEN INTERVAL '1 day'
      WHEN 'weekly' THEN INTERVAL '7 days'
      WHEN 'monthly' THEN INTERVAL '30 days'
      WHEN 'never' THEN INTERVAL '100 years'
      ELSE INTERVAL '7 days'
    END;
    
    -- Verificar último envio desse tipo
    SELECT MAX(created_at) INTO v_last_email
    FROM public.email_log
    WHERE user_id = p_user_id AND email_type = 'reminder';
    
    IF v_last_email IS NOT NULL AND v_last_email > (NOW() - v_min_interval) THEN
      RETURN FALSE;
    END IF;
    
  ELSIF p_email_type = 'new_content' THEN
    IF NOT v_settings.new_content_alerts THEN
      RETURN FALSE;
    END IF;
    
    -- Máximo 1 email de novo conteúdo por dia
    SELECT MAX(created_at) INTO v_last_email
    FROM public.email_log
    WHERE user_id = p_user_id AND email_type = 'new_content';
    
    IF v_last_email IS NOT NULL AND v_last_email > (NOW() - INTERVAL '1 day') THEN
      RETURN FALSE;
    END IF;
    
  ELSIF p_email_type = 'weekly_summary' THEN
    IF NOT v_settings.weekly_summary THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter usuários elegíveis para lembrete
CREATE OR REPLACE FUNCTION public.get_users_for_reminder()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  full_name TEXT,
  last_activity TIMESTAMPTZ,
  days_inactive INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as user_id,
    p.email,
    p.full_name,
    COALESCE(us.last_activity_at, p.created_at) as last_activity,
    EXTRACT(DAY FROM NOW() - COALESCE(us.last_activity_at, p.created_at))::INTEGER as days_inactive
  FROM public.profiles p
  JOIN public.user_settings us ON us.user_id = p.id
  WHERE 
    -- Email habilitado
    us.email_notifications = true
    AND us.progress_reminders = true
    AND us.reminder_frequency != 'never'
    -- Inativo há pelo menos 2 dias
    AND COALESCE(us.last_activity_at, p.created_at) < NOW() - INTERVAL '2 days'
    -- Pode receber email
    AND public.can_send_email_to_user(p.id, 'reminder') = true
  ORDER BY last_activity ASC
  LIMIT 100; -- Processar em lotes
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para resetar contador diário
CREATE OR REPLACE FUNCTION public.reset_daily_email_counter()
RETURNS void AS $$
BEGIN
  UPDATE public.email_config
  SET 
    emails_sent_today = 0,
    last_reset_date = CURRENT_DATE
  WHERE last_reset_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 8. TRIGGER PARA ATUALIZAR ATIVIDADE
-- =============================================

-- Atualizar last_activity_at quando usuário completa aula
CREATE OR REPLACE FUNCTION public.update_user_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.user_settings
  SET last_activity_at = NOW()
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para lesson_progress
DROP TRIGGER IF EXISTS on_lesson_progress_update_activity ON public.lesson_progress;
CREATE TRIGGER on_lesson_progress_update_activity
  AFTER INSERT OR UPDATE ON public.lesson_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_user_activity();

-- =============================================
-- 9. GRANT PARA SERVICE ROLE
-- =============================================

-- Service role precisa de acesso total para o cron job
GRANT ALL ON public.email_log TO service_role;
GRANT ALL ON public.notification_campaigns TO service_role;
GRANT ALL ON public.email_config TO service_role;
GRANT EXECUTE ON FUNCTION public.can_send_email_to_user TO service_role;
GRANT EXECUTE ON FUNCTION public.get_users_for_reminder TO service_role;
GRANT EXECUTE ON FUNCTION public.reset_daily_email_counter TO service_role;

