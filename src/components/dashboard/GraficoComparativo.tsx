import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart, Line } from 'recharts';
import { RegistroEnergia, getNomeMes, isBandeiraComCusto } from '@/types/energia';

interface GraficoComparativoProps {
  registros: RegistroEnergia[];
}

export const GraficoComparativo = ({ registros }: GraficoComparativoProps) => {
  const dadosOrdenados = [...registros]
    .sort((a, b) => a.mes - b.mes)
    .map(r => ({
      mes: getNomeMes(r.mes).substring(0, 3),
      te: Number(r.preco_te || 0),
      tusd: Number(r.preco_tusd || 0),
      bandeira: isBandeiraComCusto(r.bandeira_tarifaria) ? Number(r.preco_bandeira || 0) : 0,
    }));

  const temDadosPreco = dadosOrdenados.some(d => d.te > 0 || d.tusd > 0);

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg">Evolução Preços Unitários</CardTitle>
        <CardDescription>Preços R$/kWh com tributos por mês</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {dadosOrdenados.length === 0 || !temDadosPreco ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Nenhum dado de preços disponível
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={dadosOrdenados}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="mes" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(value) => `R$ ${value.toFixed(4)}`}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 6 })}`, 
                    name === 'te' ? 'TE' : name === 'tusd' ? 'TUSD' : 'Bandeira'
                  ]}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend 
                  formatter={(value) => value === 'te' ? 'TE' : value === 'tusd' ? 'TUSD' : 'Bandeira'}
                />
                <Bar dataKey="te" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="tusd" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="bandeira" stroke="hsl(0, 84%, 60%)" strokeWidth={2} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
