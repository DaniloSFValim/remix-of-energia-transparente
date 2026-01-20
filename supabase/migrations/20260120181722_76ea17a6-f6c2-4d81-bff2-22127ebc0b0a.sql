-- Adicionar novos campos para preços unitários
ALTER TABLE public.registros_energia
ADD COLUMN IF NOT EXISTS preco_te numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS preco_tusd numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS preco_bandeira numeric DEFAULT NULL;