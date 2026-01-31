import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { RegistroEnergia, getMesAbreviado } from '@/types/energia';

interface GraficoCustokWhProps {
  registros: RegistroEnergia[];
  registrosComparacao?: RegistroEnergia[];
}

export const GraficoCustokWh = ({ registros, registrosComparacao = [] }: GraficoCustokWhProps) => {
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
    
    let fill = '#a855f7';
    if (payload.isVermelho) fill = '#ef4444';
    else if (payload.isAmarelo) fill = '#eab308';
    
    return (
      <circle 
        cx={cx} 
        cy={cy} 
        r={4} 
        fill={fill} 
        stroke="#1e293b" 
        strokeWidth={2}
      />
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-xl">
          <p className="text-sm font-semibold text-foreground mb-1">{label}</p>
          <p className="text-lg font-bold text-purple-400">
            R$ {data.custo.toFixed(2)}/kWh
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-card border-border transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30 group">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold transition-colors group-hover:text-primary">Evolução do Custo por kWh</CardTitle>
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
              <LineChart data={dados} margin={{ top: 10, right: 50, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis 
                  dataKey="periodo" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  interval="preserveStartEnd"
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis 
                  tickFormatter={(value) => `R$ ${value.toFixed(2)}`}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  domain={[(dataMin: number) => Math.floor((dataMin - 0.05) * 100) / 100, (dataMax: number) => Math.ceil((dataMax + 0.05) * 100) / 100]}
                  tickCount={6}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--primary))', strokeOpacity: 0.2, strokeWidth: 2 }} />
                <ReferenceLine 
                  y={mediaCusto} 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeDasharray="8 4"
                  strokeWidth={1}
                  label={{ 
                    value: 'Média', 
                    fill: 'hsl(var(--muted-foreground))', 
                    fontSize: 11, 
                    position: 'right',
                    offset: 10
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="custo" 
                  stroke="#a855f7" 
                  strokeWidth={2.5}
                  dot={<CustomDot />}
                  activeDot={{ r: 8, stroke: '#a855f7', strokeWidth: 3, fill: '#fff', className: 'drop-shadow-lg' }}
                  animationDuration={1000}
                  animationEasing="ease-out"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="flex items-center justify-center gap-8 mt-4">
          <div className="flex items-center gap-2 transition-transform hover:scale-105 cursor-pointer">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-sm text-muted-foreground">Custo por kWh</span>
          </div>
          <div className="flex items-center gap-2 transition-transform hover:scale-105 cursor-pointer">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-sm text-muted-foreground">Bandeira Amarela</span>
          </div>
          <div className="flex items-center gap-2 transition-transform hover:scale-105 cursor-pointer">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-sm text-muted-foreground">Bandeira Vermelha</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
