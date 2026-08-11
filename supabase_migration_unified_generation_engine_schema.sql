-- STREAMING_CHUNK: Enabling UUID extension...
-- ==============================================================================
-- BRAND BOX AI — PHASE 6 UNIFIED GENERATION ENGINE DATABASE SCHEMA & POLICIES
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- STREAMING_CHUNK: Creating profiles table...
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'Pro Member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- STREAMING_CHUNK: Creating subscriptions table...
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL DEFAULT 'starter',
  status TEXT NOT NULL DEFAULT 'active',
  billing_cycle TEXT NOT NULL DEFAULT 'monthly',
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 days',
  credits_limit INT NOT NULL DEFAULT 1000,
  credits_used INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_sub_status CHECK (status IN ('active', 'canceled', 'past_due', 'trialing'))
);

-- STREAMING_CHUNK: Creating credit balances table...
CREATE TABLE IF NOT EXISTS public.credit_balances (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance INT NOT NULL DEFAULT 340 CHECK (balance >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- STREAMING_CHUNK: Creating credit transactions table...
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  type TEXT NOT NULL,
  reference_id TEXT,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_tx_type CHECK (type IN ('generation', 'refund', 'purchase', 'subscription', 'bonus', 'admin_adjustment'))
);

-- STREAMING_CHUNK: Creating credit idempotency table...
CREATE TABLE IF NOT EXISTS public.credit_idempotency (
  idempotency_key TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES public.credit_transactions(id) ON DELETE CASCADE,
  cost INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- STREAMING_CHUNK: Creating projects and activities tables...
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'متعدد الوسائط',
  description TEXT NOT NULL DEFAULT '',
  industry TEXT NOT NULL DEFAULT 'عام',
  target_audience TEXT NOT NULL DEFAULT 'جمهور عام',
  language TEXT NOT NULL DEFAULT 'العربية',
  tone TEXT NOT NULL DEFAULT 'احترافي وحماسي',
  thumbnail_url TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- STREAMING_CHUNK: Creating chat sessions and messages tables...
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'محادثة جديدة',
  model TEXT NOT NULL DEFAULT 'openai/gpt-4o-mini',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  sender TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_chat_sender CHECK (sender IN ('user', 'ai'))
);

-- STREAMING_CHUNK: Creating unified generations table...
CREATE TABLE IF NOT EXISTS public.generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  idempotency_key TEXT UNIQUE,
  type TEXT NOT NULL, -- 'text', 'image', 'video'
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  prompt TEXT NOT NULL,
  negative_prompt TEXT,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'queued', -- 'queued', 'validating', 'processing', 'streaming', 'completed', 'failed', 'cancelled', 'refunded'
  result_url TEXT,
  thumbnail_url TEXT,
  error_code TEXT,
  error_message TEXT,
  credits_used INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  CONSTRAINT chk_gen_status CHECK (status IN ('queued', 'validating', 'processing', 'streaming', 'completed', 'failed', 'cancelled', 'refunded'))
);

-- STREAMING_CHUNK: Creating assets table...
CREATE TABLE IF NOT EXISTS public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  generation_id UUID REFERENCES public.generations(id) ON DELETE SET NULL,
  type TEXT NOT NULL, -- 'image', 'video', 'logo', 'document', 'other'
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  thumbnail_path TEXT,
  mime_type TEXT NOT NULL DEFAULT 'image/png',
  width INT,
  height INT,
  duration INT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- STREAMING_CHUNK: Creating brand kits, templates, and audit logs...
CREATE TABLE IF NOT EXISTS public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  thumbnail TEXT NOT NULL,
  prompt TEXT NOT NULL,
  is_premium BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.brand_kits (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  brand_name TEXT NOT NULL DEFAULT '',
  logo_url TEXT,
  primary_color TEXT NOT NULL DEFAULT '#FF2E4C',
  secondary_color TEXT NOT NULL DEFAULT '#E50914',
  font_family TEXT NOT NULL DEFAULT 'Tajawal',
  brand_tone TEXT NOT NULL DEFAULT '',
  brand_description TEXT NOT NULL DEFAULT '',
  target_audience TEXT NOT NULL DEFAULT '',
  language TEXT NOT NULL DEFAULT 'العربية',
  writing_style TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- STREAMING_CHUNK: Defining PostgreSQL atomic operations...
CREATE OR REPLACE FUNCTION public.consume_credits_atomic(
  p_user_id UUID,
  p_cost INT,
  p_idempotency_key TEXT,
  p_description TEXT
) RETURNS JSONB AS $$
DECLARE
  v_current_balance INT;
  v_tx_id UUID;
  v_existing_tx UUID;
BEGIN
  SELECT transaction_id INTO v_existing_tx 
  FROM public.credit_idempotency 
  WHERE idempotency_key = p_idempotency_key;

  IF v_existing_tx IS NOT NULL THEN
    RETURN jsonb_build_object('success', true, 'idempotent', true, 'transaction_id', v_existing_tx);
  END IF;

  SELECT balance INTO v_current_balance 
  FROM public.credit_balances 
  WHERE user_id = p_user_id 
  FOR UPDATE;

  IF v_current_balance IS NULL OR v_current_balance < p_cost THEN
    RAISE EXCEPTION 'INSUFFICIENT_CREDITS';
  END IF;

  UPDATE public.credit_balances 
  SET balance = balance - p_cost, updated_at = NOW() 
  WHERE user_id = p_user_id;

  INSERT INTO public.credit_transactions (user_id, amount, type, description)
  VALUES (p_user_id, -p_cost, 'generation', p_description)
  RETURNING id INTO v_tx_id;

  INSERT INTO public.credit_idempotency (idempotency_key, user_id, transaction_id, cost)
  VALUES (p_idempotency_key, p_user_id, v_tx_id, p_cost);

  RETURN jsonb_build_object('success', true, 'idempotent', false, 'transaction_id', v_tx_id, 'new_balance', v_current_balance - p_cost);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.refund_credits_atomic(
  p_user_id UUID,
  p_cost INT,
  p_reason TEXT
) RETURNS JSONB AS $$
DECLARE
  v_current_balance INT;
  v_tx_id UUID;
BEGIN
  UPDATE public.credit_balances 
  SET balance = balance + p_cost, updated_at = NOW() 
  WHERE user_id = p_user_id
  RETURNING balance INTO v_current_balance;

  INSERT INTO public.credit_transactions (user_id, amount, type, description)
  VALUES (p_user_id, p_cost, 'refund', p_reason)
  RETURNING id INTO v_tx_id;

  RETURN jsonb_build_object('success', true, 'transaction_id', v_tx_id, 'new_balance', v_current_balance);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STREAMING_CHUNK: Enabling Row Level Security (RLS)...
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_kits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles self access" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Subscriptions viewable by owner" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Credit balances isolated" ON public.credit_balances FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Credit transactions viewable by owner" ON public.credit_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Projects isolated" ON public.projects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Project activity isolated" ON public.project_activity FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Chat sessions isolated" ON public.chat_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Generations isolated" ON public.generations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Assets isolated" ON public.assets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Brand kits isolated" ON public.brand_kits FOR ALL USING (auth.uid() = user_id);

-- STREAMING_CHUNK: Adding performance indexes...
CREATE INDEX IF NOT EXISTS idx_generations_user_proj_idemp ON public.generations(user_id, project_id, idempotency_key);
CREATE INDEX IF NOT EXISTS idx_assets_user_proj ON public.assets(user_id, project_id);