export type BandeiraTarifaria = 'verde' | 'amarela' | 'vermelha_1' | 'vermelha_2';

export interface RegistroEnergia {
  id: string;
  mes: number;
  ano: number;
  consumo_kwh: number;
  valor_faturado: number;
  valor_pago: number;
  observacoes: string | null;
  user_id: string | null;
  bandeira_tarifaria: BandeiraTarifaria | null;
  valor_bandeira: number | null;
  preco_te: number | null;
  preco_tusd: number | null;
  preco_bandeira: number | null;
  cosip_faturado: number | null;
  cosip_arrecadado: number | null;
  cosip_clientes: number | null;
  inadimplencia: number | null;
  created_at: string;
  updated_at: string;
}

export interface RegistroEnergiaInsert {
  mes: number;
  ano: number;
  consumo_kwh: number;
  valor_faturado: number;
  valor_pago: number;
  observacoes?: string | null;
  bandeira_tarifaria?: BandeiraTarifaria;
  valor_bandeira?: number;
  preco_te?: number;
  preco_tusd?: number;
  preco_bandeira?: number;
  cosip_faturado?: number;
  cosip_arrecadado?: number;
  cosip_clientes?: number;
  inadimplencia?: number;
}

export interface DadosKPI {
  consumoTotalAnual: number;
  gastoTotalAnual: number;
  mediaConsumoMensal: number;
}

export const BANDEIRAS = [
  { valor: 'verde' as const, nome: 'Verde', cor: '#22c55e', descricao: 'Sem custo adicional' },
  { valor: 'amarela' as const, nome: 'Amarela', cor: '#eab308', descricao: 'Custo baixo' },
  { valor: 'vermelha_1' as const, nome: 'Vermelha', cor: '#ef4444', descricao: 'Custo moderado' },
  { valor: 'vermelha_2' as const, nome: 'Vermelha P2', cor: '#dc2626', descricao: 'Custo alto' },
] as const;

export const getNomeBandeira = (bandeira: BandeiraTarifaria | null): string => {
  if (!bandeira) return 'Verde';
  return BANDEIRAS.find(b => b.valor === bandeira)?.nome || 'Verde';
};

export const getCorBandeira = (bandeira: BandeiraTarifaria | null): string => {
  if (!bandeira) return '#22c55e';
  return BANDEIRAS.find(b => b.valor === bandeira)?.cor || '#22c55e';
};

export const MESES = [
  { valor: 1, nome: 'Janeiro' },
  { valor: 2, nome: 'Fevereiro' },
  { valor: 3, nome: 'Março' },
  { valor: 4, nome: 'Abril' },
  { valor: 5, nome: 'Maio' },
  { valor: 6, nome: 'Junho' },
  { valor: 7, nome: 'Julho' },
  { valor: 8, nome: 'Agosto' },
  { valor: 9, nome: 'Setembro' },
  { valor: 10, nome: 'Outubro' },
  { valor: 11, nome: 'Novembro' },
  { valor: 12, nome: 'Dezembro' },
] as const;

export const getNomeMes = (mes: number): string => {
  return MESES.find(m => m.valor === mes)?.nome || '';
};

export const getMesAbreviado = (mes: number): string => {
  const nomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return nomes[mes - 1] || '';
};

export const isBandeiraComCusto = (bandeira: BandeiraTarifaria | null): boolean => {
  return bandeira === 'amarela' || bandeira === 'vermelha_1' || bandeira === 'vermelha_2';
};
