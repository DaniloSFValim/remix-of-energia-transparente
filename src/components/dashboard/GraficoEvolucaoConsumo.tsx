import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ComposedChart, Brush } from 'recharts';
import { RegistroEnergia, getMesAbreviado } from '@/types/energia';
import { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FullscreenChart } from './FullscreenChart';

interface GraficoEvolucaoConsumoProps {
  registros: RegistroEnergia[];
  registrosComparacao?: RegistroEnergia[];
}

export const GraficoEvolucaoConsumo = ({ registros, registrosComparacao = [] }: GraficoEvolucaoConsumoProps) => {
  const [brushIndex, setBrushIndex] = useState<{ startIndex?: number; endIndex?: number }>({});
  
  const dados = registros.map(r => ({
    periodo: `${getMesAbreviado(r.mes)}/${String(r.ano).slice(2)}`,
    consumo: Number(r.consumo_kwh),
    bandeira: r.bandeira_tarifaria,
    isVermelho: r.bandeira_tarifaria === 'vermelha_1' || r.bandeira_tarifaria === 'vermelha_2',
    isAmarelo: r.bandeira_tarifaria === 'amarela',
  }));

  const mediaConsumo = dados.length > 0 
    ? dados.reduce((acc, d) => acc + d.consumo, 0) / dados.length 
    : 0;

  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${Math.round(value / 1000)}k`;
    return value.toString();
  };

  const handleBrushChange = (newIndex: { startIndex?: number; endIndex?: number }) => {
    setBrushIndex(newIndex);
  };

  const handleZoomIn = () => {
    const dataLength = dados.length;
    const currentStart = brushIndex.startIndex ?? 0;
    const currentEnd = brushIndex.endIndex ?? dataLength - 1;
    const range = currentEnd - currentStart;
    const newRange = Math.max(2, Math.floor(range * 0.5));
    const center = Math.floor((currentStart + currentEnd) / 2);
    const newStart = Math.max(0, center - Math.floor(newRange / 2));
    const newEnd = Math.min(dataLength - 1, newStart + newRange);
    setBrushIndex({ startIndex: newStart, endIndex: newEnd });
  };

  const handleZoomOut = () => {
    const dataLength = dados.length;
    const currentStart = brushIndex.startIndex ?? 0;
    const currentEnd = brushIndex.endIndex ?? dataLength - 1;
    const range = currentEnd - currentStart;
    const newRange = Math.min(dataLength - 1, Math.floor(range * 2));
    const center = Math.floor((currentStart + currentEnd) / 2);
    const newStart = Math.max(0, center - Math.floor(newRange / 2));
    const newEnd = Math.min(dataLength - 1, newStart + newRange);
    setBrushIndex({ startIndex: newStart, endIndex: newEnd });
  };

  const handleReset = () => {
    setBrushIndex({});
  };

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!payload) return null;
    
    let fill = '#3b82f6';
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
          <p className="text-lg font-bold text-blue-400">
            {new Intl.NumberFormat('pt-BR').format(data.consumo)} kWh
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-card border-border transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30 group">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold transition-colors group-hover:text-primary">Evolução do Consumo</CardTitle>
            <CardDescription>Consumo mensal em kWh</CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomIn} title="Zoom In">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomOut} title="Zoom Out">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleReset} title="Resetar Zoom">
              <RotateCcw className="h-4 w-4" />
            </Button>
            <FullscreenChart 
              title="Evolução do Consumo" 
              icon={<Zap className="h-5 w-5 text-blue-500" />}
            >
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={dados} margin={{ top: 20, right: 60, left: 20, bottom: 40 }}>
                  <defs>
                    <linearGradient id="colorConsumoFull" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                  <XAxis 
                    dataKey="periodo" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis 
                    tickFormatter={formatYAxis}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--primary))', strokeDasharray: '5 5' }} />
                  <ReferenceLine 
                    y={mediaConsumo} 
                    stroke="hsl(var(--muted-foreground))" 
                    strokeDasharray="5 5" 
                    label={{ value: `Média: ${formatYAxis(mediaConsumo)}`, fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="consumo" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={<CustomDot />}
                    activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </FullscreenChart>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {dados.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Nenhum dado disponível
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={dados} margin={{ top: 10, right: 50, left: 10, bottom: 30 }}>
                <defs>
                  <linearGradient id="colorConsumo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis 
                  dataKey="periodo" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  interval="preserveStartEnd"
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis 
                  tickFormatter={formatYAxis}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  domain={[(dataMin: number) => Math.floor(dataMin * 0.95), (dataMax: number) => Math.ceil(dataMax * 1.05)]}
                  tickCount={6}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--primary))', strokeOpacity: 0.2, strokeWidth: 2 }} />
                <ReferenceLine 
                  y={mediaConsumo} 
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
                  dataKey="consumo" 
                  stroke="#3b82f6" 
                  strokeWidth={2.5}
                  dot={<CustomDot />}
                  activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 3, fill: '#fff', className: 'drop-shadow-lg' }}
                  animationDuration={1000}
                  animationEasing="ease-out"
                />
                <Brush
                  dataKey="periodo"
                  height={25}
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--muted))"
                  startIndex={brushIndex.startIndex}
                  endIndex={brushIndex.endIndex}
                  onChange={handleBrushChange}
                  tickFormatter={() => ''}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="flex items-center justify-center gap-8 mt-4">
          <div className="flex items-center gap-2 transition-transform hover:scale-105 cursor-pointer">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-sm text-muted-foreground">Do Consumo</span>
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
