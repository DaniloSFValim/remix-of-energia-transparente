import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { RegistroEnergia, getNomeMes } from '@/types/energia';

interface GraficoConsumoProps {
  registros: RegistroEnergia[];
}

export const GraficoConsumo = ({ registros }: GraficoConsumoProps) => {
  const dadosOrdenados = [...registros]
    .sort((a, b) => a.mes - b.mes)
    .map(r => ({
      mes: getNomeMes(r.mes).substring(0, 3),
      consumo: Number(r.consumo_kwh),
    }));

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg">Evolução do Consumo Mensal</CardTitle>
        <CardDescription>Consumo de energia em kWh ao longo do ano</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {dadosOrdenados.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Nenhum dado disponível para exibição
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dadosOrdenados}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="mes" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(value) => `${value.toLocaleString('pt-BR')}`}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value.toLocaleString('pt-BR')} kWh`, 'Consumo']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="consumo" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
