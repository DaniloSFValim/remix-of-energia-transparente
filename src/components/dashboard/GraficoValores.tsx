import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { RegistroEnergia, getMesAbreviado } from '@/types/energia';

interface GraficoValoresProps {
  registros: RegistroEnergia[];
}

export const GraficoValores = ({ registros }: GraficoValoresProps) => {
  const dados = registros.map(r => ({
    periodo: `${getMesAbreviado(r.mes)}/${String(r.ano).slice(2)}`,
    valor: Number(r.valor_pago),
    bandeira: r.bandeira_tarifaria,
    isVermelho: r.bandeira_tarifaria === 'vermelha_1' || r.bandeira_tarifaria === 'vermelha_2',
    isAmarelo: r.bandeira_tarifaria === 'amarela',
  }));

  const mediaValor = dados.length > 0 
    ? dados.reduce((acc, d) => acc + d.valor, 0) / dados.length 
    : 0;

  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return value.toString();
  };

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!payload) return null;
    
    let fill = '#22c55e';
    if (payload.isVermelho) fill = '#ef4444';
    else if (payload.isAmarelo) fill = '#eab308';
    
    return (
      <circle cx={cx} cy={cy} r={4} fill={fill} stroke="#1e293b" strokeWidth={2} />
    );
  };

  return (
    <Card className="animate-fade-in bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Evolução dos Valores</CardTitle>
        <CardDescription>Valor pago mensalmente em R$</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          {dados.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Nenhum dado disponível
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dados} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="periodo" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tickFormatter={formatYAxis}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  domain={[(dataMin: number) => Math.floor(dataMin * 0.95), (dataMax: number) => Math.ceil(dataMax * 1.05)]}
                  tickCount={8}
                />
                <Tooltip 
                  formatter={(value: number) => [
                    `R$ ${new Intl.NumberFormat('pt-BR').format(value)}`,
                    'Valor Pago'
                  ]}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))'
                  }}
                />
                <ReferenceLine 
                  y={mediaValor} 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeDasharray="5 5"
                  label={{ value: 'Média', fill: 'hsl(var(--muted-foreground))', fontSize: 10, position: 'right' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="valor" 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  dot={<CustomDot />}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-xs text-muted-foreground">Dos Valores</span>
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
