-- Create enum for bandeira tarifária
CREATE TYPE public.bandeira_tarifaria AS ENUM ('verde', 'amarela', 'vermelha_1', 'vermelha_2');

-- Add bandeira_tarifaria column to registros_energia
ALTER TABLE public.registros_energia 
ADD COLUMN bandeira_tarifaria public.bandeira_tarifaria DEFAULT 'verde';

-- Add valor_bandeira column for the additional cost
ALTER TABLE public.registros_energia 
ADD COLUMN valor_bandeira numeric DEFAULT 0;