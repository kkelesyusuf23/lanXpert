-- LanXpert Database Schema

-- Types
CREATE TYPE usage_type_enum AS ENUM ('formal', 'informal', 'street', 'academic', 'slang');
CREATE TYPE difficulty_level_enum AS ENUM ('A1', 'A2', 'B1', 'B2', 'C1', 'C2');
CREATE TYPE question_status_enum AS ENUM ('open', 'community_answered', 'ai_answered');
CREATE TYPE subscription_tier_enum AS ENUM ('free', 'basic', 'pro');

-- Users Table
-- Note: Reference auth.users for Auth integration
CREATE TABLE public.users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  native_language TEXT[], -- stored as array, e.g. ['TR', 'EN']
  learning_language TEXT, -- e.g. 'ES'
  xp_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  subscription_tier subscription_tier_enum DEFAULT 'free',
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questions Table
CREATE TABLE public.questions (
  question_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asked_by UUID REFERENCES public.users(user_id) ON DELETE CASCADE NOT NULL,
  source_text TEXT NOT NULL,
  source_language TEXT NOT NULL,
  target_language TEXT NOT NULL,
  usage_type usage_type_enum,
  difficulty_level difficulty_level_enum,
  status question_status_enum DEFAULT 'open',
  ai_fallback_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Answers Table
CREATE TABLE public.answers (
  answer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES public.questions(question_id) ON DELETE CASCADE,
  answered_by UUID REFERENCES public.users(user_id) ON DELETE SET NULL,
  translated_text TEXT NOT NULL,
  confidence_score FLOAT DEFAULT 0.0,
  is_accepted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Votes Table
CREATE TABLE public.votes (
  vote_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  answer_id UUID REFERENCES public.answers(answer_id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(user_id) ON DELETE CASCADE,
  vote_type INTEGER CHECK (vote_type IN (1, -1)),
  UNIQUE(answer_id, user_id)
);

-- Usage Tracking Logs
CREATE TABLE public.usage_logs (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(user_id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  questions_asked INTEGER DEFAULT 0,
  articles_written INTEGER DEFAULT 0,
  UNIQUE(user_id, date)
);

-- RLS (Row Level Security) Policies (Basic Examples)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone for questions and answers
CREATE POLICY "Public questions are viewable by everyone" ON public.questions FOR SELECT USING (true);
CREATE POLICY "Public answers are viewable by everyone" ON public.answers FOR SELECT USING (true);

-- Allow authenticated users to insert questions
CREATE POLICY "Users can create questions" ON public.questions FOR INSERT WITH CHECK (auth.uid() = asked_by);

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = user_id);
-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = user_id);

-- Usage logs policies
CREATE POLICY "Users can view own usage logs" ON public.usage_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own usage logs" ON public.usage_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own usage logs" ON public.usage_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trigger to create user profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (user_id, email, username)
  VALUES (new.id, new.email, split_part(new.email, '@', 1));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

