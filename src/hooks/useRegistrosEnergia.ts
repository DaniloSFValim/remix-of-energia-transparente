import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RegistroEnergia, RegistroEnergiaInsert, DadosKPI } from '@/types/energia';
import { toast } from 'sonner';

export const useRegistrosEnergia = (ano?: number) => {
  return useQuery({
    queryKey: ['registros-energia', ano],
    queryFn: async (): Promise<RegistroEnergia[]> => {
      let query = supabase
        .from('registros_energia')
        .select('*')
        .order('ano', { ascending: false })
        .order('mes', { ascending: true });

      if (ano) {
        query = query.eq('ano', ano);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    },
  });
};

export const useAnosDisponiveis = () => {
  return useQuery({
    queryKey: ['anos-disponiveis'],
    queryFn: async (): Promise<number[]> => {
      const { data, error } = await supabase
        .from('registros_energia')
        .select('ano')
        .order('ano', { ascending: false });
      
      if (error) throw error;
      
      const anosUnicos = [...new Set(data?.map(r => r.ano) || [])];
      
      // Se não houver dados, retorna o ano atual
      if (anosUnicos.length === 0) {
        return [new Date().getFullYear()];
      }
      
      return anosUnicos;
    },
  });
};

export const useKPIs = (ano: number): DadosKPI => {
  const { data: registros = [] } = useRegistrosEnergia(ano);

  const consumoTotalAnual = registros.reduce((acc, r) => acc + Number(r.consumo_kwh), 0);
  const gastoTotalAnual = registros.reduce((acc, r) => acc + Number(r.valor_pago), 0);
  const mediaConsumoMensal = registros.length > 0 ? consumoTotalAnual / registros.length : 0;
  const totalFaturado = registros.reduce((acc, r) => acc + Number(r.valor_faturado), 0);
  const diferencaFaturadoPago = totalFaturado - gastoTotalAnual;

  return {
    consumoTotalAnual,
    gastoTotalAnual,
    mediaConsumoMensal,
    diferencaFaturadoPago,
  };
};

export const useCreateRegistro = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (registro: RegistroEnergiaInsert) => {
      const { data, error } = await supabase
        .from('registros_energia')
        .insert(registro)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registros-energia'] });
      queryClient.invalidateQueries({ queryKey: ['anos-disponiveis'] });
      toast.success('Registro criado com sucesso!');
    },
    onError: (error: Error) => {
      if (error.message.includes('duplicate key')) {
        toast.error('Já existe um registro para este mês/ano.');
      } else {
        toast.error('Erro ao criar registro: ' + error.message);
      }
    },
  });
};

export const useUpdateRegistro = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...registro }: RegistroEnergiaInsert & { id: string }) => {
      const { data, error } = await supabase
        .from('registros_energia')
        .update(registro)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registros-energia'] });
      toast.success('Registro atualizado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao atualizar registro: ' + error.message);
    },
  });
};

export const useDeleteRegistro = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('registros_energia')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registros-energia'] });
      queryClient.invalidateQueries({ queryKey: ['anos-disponiveis'] });
      toast.success('Registro excluído com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao excluir registro: ' + error.message);
    },
  });
};
