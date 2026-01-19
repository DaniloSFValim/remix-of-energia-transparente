export interface RegistroEnergia {
  id: string;
  mes: number;
  ano: number;
  consumo_kwh: number;
  valor_faturado: number;
  valor_pago: number;
  observacoes: string | null;
  user_id: string | null;
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
}

export interface DadosKPI {
  consumoTotalAnual: number;
  gastoTotalAnual: number;
  mediaConsumoMensal: number;
  diferencaFaturadoPago: number;
}

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
