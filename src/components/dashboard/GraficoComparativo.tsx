import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { RegistroEnergia, getNomeMes } from '@/types/energia';

interface GraficoComparativoProps {
  registros: RegistroEnergia[];
}

export const GraficoComparativo = ({ registros }: GraficoComparativoProps) => {
  const dadosOrdenados = [...registros]
    .sort((a, b) => a.mes - b.mes)
    .map(r => ({
      mes: getNomeMes(r.mes).substring(0, 3),
      faturado: Number(r.valor_faturado),
      pago: Number(r.valor_pago),
    }));

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg">Comparativo: Faturado vs Pago</CardTitle>
        <CardDescription>Valores em R$ por mês</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {dadosOrdenados.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Nenhum dado disponível para exibição
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosOrdenados}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="mes" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 
                    name === 'faturado' ? 'Valor Faturado' : 'Valor Pago'
                  ]}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend 
                  formatter={(value) => value === 'faturado' ? 'Valor Faturado' : 'Valor Pago'}
                />
                <Bar dataKey="faturado" fill="hsl(25, 95%, 53%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pago" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
