-- =============================================
-- COMANDOS ÚTEIS PARA GERENCIAR USUÁRIOS
-- Execute no Supabase SQL Editor
-- =============================================

-- =============================================
-- 1. VER TODOS OS USUÁRIOS
-- =============================================
SELECT 
  email,
  full_name,
  role,
  subscription_plan as plano,
  subscription_expires_at as expira,
  created_at
FROM public.profiles
ORDER BY created_at DESC;

-- =============================================
-- 2. PROMOVER PARA ADMIN
-- =============================================
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'EMAIL_DO_USUARIO_AQUI';

-- =============================================
-- 3. REMOVER ADMIN (voltar para user)
-- =============================================
UPDATE public.profiles
SET role = 'user'
WHERE email = 'EMAIL_DO_USUARIO_AQUI';

-- =============================================
-- 4. DEFINIR PLANO FREE
-- =============================================
UPDATE public.profiles
SET 
  subscription_plan = 'free',
  subscription_expires_at = NULL
WHERE email = 'EMAIL_DO_USUARIO_AQUI';

-- =============================================
-- 5. DEFINIR PLANO BASIC (por 1 ano)
-- =============================================
UPDATE public.profiles
SET 
  subscription_plan = 'basic',
  subscription_expires_at = NOW() + INTERVAL '1 year'
WHERE email = 'EMAIL_DO_USUARIO_AQUI';

-- =============================================
-- 6. DEFINIR PLANO PRO (por 1 ano)
-- =============================================
UPDATE public.profiles
SET 
  subscription_plan = 'pro',
  subscription_expires_at = NOW() + INTERVAL '1 year'
WHERE email = 'EMAIL_DO_USUARIO_AQUI';

-- =============================================
-- 7. VER USUÁRIOS POR PLANO
-- =============================================
SELECT 
  subscription_plan as plano,
  COUNT(*) as quantidade
FROM public.profiles
GROUP BY subscription_plan;

-- =============================================
-- 8. VER USUÁRIOS COM PLANO PRÓXIMO DE EXPIRAR (30 dias)
-- =============================================
SELECT 
  email,
  full_name,
  subscription_plan as plano,
  subscription_expires_at as expira
FROM public.profiles
WHERE 
  subscription_expires_at IS NOT NULL 
  AND subscription_expires_at < NOW() + INTERVAL '30 days'
ORDER BY subscription_expires_at;

-- =============================================
-- 9. VER ADMINS
-- =============================================
SELECT email, full_name, subscription_plan
FROM public.profiles
WHERE role = 'admin';

-- =============================================
-- 10. CRIAR FUNÇÃO PARA PROMOVER ADMIN (mais fácil)
-- =============================================
CREATE OR REPLACE FUNCTION public.set_admin(user_email TEXT)
RETURNS TEXT AS $$
BEGIN
  UPDATE public.profiles
  SET role = 'admin'
  WHERE email = user_email;
  
  RETURN 'Usuário ' || user_email || ' agora é admin!';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Uso: SELECT set_admin('email@exemplo.com');

-- =============================================
-- 11. CRIAR FUNÇÃO PARA DEFINIR PLANO
-- =============================================
CREATE OR REPLACE FUNCTION public.set_plan(user_email TEXT, plan TEXT, duration_months INTEGER DEFAULT 12)
RETURNS TEXT AS $$
BEGIN
  UPDATE public.profiles
  SET 
    subscription_plan = plan,
    subscription_expires_at = NOW() + (duration_months || ' months')::INTERVAL
  WHERE email = user_email;
  
  RETURN 'Plano ' || plan || ' definido para ' || user_email || ' por ' || duration_months || ' meses!';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Uso: SELECT set_plan('email@exemplo.com', 'pro', 12);
-- Uso: SELECT set_plan('email@exemplo.com', 'basic', 6);



