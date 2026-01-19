-- Tabela principal para registros de energia de iluminação pública
CREATE TABLE public.registros_energia (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    mes INTEGER NOT NULL CHECK (mes >= 1 AND mes <= 12),
    ano INTEGER NOT NULL CHECK (ano >= 2000 AND ano <= 2100),
    consumo_kwh DECIMAL(12, 2) NOT NULL CHECK (consumo_kwh >= 0),
    valor_faturado DECIMAL(12, 2) NOT NULL CHECK (valor_faturado >= 0),
    valor_pago DECIMAL(12, 2) NOT NULL CHECK (valor_pago >= 0),
    observacoes TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(mes, ano)
);

-- Habilitar RLS
ALTER TABLE public.registros_energia ENABLE ROW LEVEL SECURITY;

-- Política de leitura pública (transparência para cidadãos)
CREATE POLICY "Dados públicos para visualização" 
ON public.registros_energia 
FOR SELECT 
USING (true);

-- Políticas de escrita apenas para usuários autenticados
CREATE POLICY "Usuários autenticados podem inserir" 
ON public.registros_energia 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem atualizar" 
ON public.registros_energia 
FOR UPDATE 
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem deletar" 
ON public.registros_energia 
FOR DELETE 
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_registros_energia_updated_at
BEFORE UPDATE ON public.registros_energia
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();