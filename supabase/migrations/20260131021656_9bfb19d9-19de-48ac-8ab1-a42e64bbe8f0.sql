-- Adicionar campos COSIP na tabela registros_energia
ALTER TABLE public.registros_energia 
ADD COLUMN IF NOT EXISTS cosip_faturado numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS cosip_arrecadado numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS cosip_clientes integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS inadimplencia numeric DEFAULT 0;