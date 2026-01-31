import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { RegistroEnergia, getMesAbreviado } from '@/types/energia';

interface GraficoCustokWhProps {
  registros: RegistroEnergia[];
}

export const GraficoCustokWh = ({ registros }: GraficoCustokWhProps) => {
  const dados = registros.map(r => {
    const custo = Number(r.valor_pago) / Number(r.consumo_kwh);
    return {
      periodo: `${getMesAbreviado(r.mes)}/${String(r.ano).slice(2)}`,
      custo: custo,
      bandeira: r.bandeira_tarifaria,
      isVermelho: r.bandeira_tarifaria === 'vermelha_1' || r.bandeira_tarifaria === 'vermelha_2',
      isAmarelo: r.bandeira_tarifaria === 'amarela',
    };
  });

  const mediaCusto = dados.length > 0 
    ? dados.reduce((acc, d) => acc + d.custo, 0) / dados.length 
    : 0;

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!payload) return null;
    
    let fill = '#a855f7'; // roxo para custo normal
    if (payload.isVermelho) fill = '#ef4444';
    else if (payload.isAmarelo) fill = '#eab308';
    
    return (
      <circle cx={cx} cy={cy} r={4} fill={fill} stroke="#1e293b" strokeWidth={2} />
    );
  };

  return (
    <Card className="animate-fade-in bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Evolução do Custo por kWh</CardTitle>
        <CardDescription>Custo médio por kWh (com impostos)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {dados.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Nenhum dado disponível
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dados} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="periodo" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tickFormatter={(value) => `R$ ${value.toFixed(2)}`}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  domain={['dataMin - 0.1', 'dataMax + 0.1']}
                />
                <Tooltip 
                  formatter={(value: number) => [
                    `R$ ${value.toFixed(2)}`,
                    'Custo/kWh'
                  ]}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))'
                  }}
                />
                <ReferenceLine 
                  y={mediaCusto} 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeDasharray="5 5"
                  label={{ value: 'Média', fill: 'hsl(var(--muted-foreground))', fontSize: 10, position: 'right' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="custo" 
                  stroke="#a855f7" 
                  strokeWidth={2}
                  dot={<CustomDot />}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-xs text-muted-foreground">Custo por kWh</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-xs text-muted-foreground">Bandeira Amarela</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-xs text-muted-foreground">Bandeira Vermelha</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
