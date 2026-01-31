import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RegistroEnergia } from '@/types/energia';

export const useAllRegistros = () => {
  return useQuery({
    queryKey: ['registros-energia-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('registros_energia')
        .select('*')
        .order('ano', { ascending: true })
        .order('mes', { ascending: true });

      if (error) throw error;
      return data as RegistroEnergia[];
    },
  });
};

export const useUltimoRegistro = () => {
  return useQuery({
    queryKey: ['ultimo-registro'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('registros_energia')
        .select('*')
        .order('ano', { ascending: false })
        .order('mes', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as RegistroEnergia | null;
    },
  });
};

export const usePeriodoSelecionado = (registros: RegistroEnergia[], filtro: string) => {
  if (filtro === 'todos') return registros;
  
  const ano = parseInt(filtro);
  return registros.filter(r => r.ano === ano);
};
