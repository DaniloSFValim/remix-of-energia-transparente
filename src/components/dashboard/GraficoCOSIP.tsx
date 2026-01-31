import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import { RegistroEnergia, getMesAbreviado } from '@/types/energia';

interface GraficoCOSIPProps {
  registros: RegistroEnergia[];
}

export const GraficoCOSIP = ({ registros }: GraficoCOSIPProps) => {
  const [activeTab, setActiveTab] = useState('faturamento');

  const dadosFaturamento = registros
    .filter(r => r.cosip_faturado && r.cosip_arrecadado)
    .map(r => ({
      periodo: `${getMesAbreviado(r.mes)}/${String(r.ano).slice(2)}`,
      faturado: Number(r.cosip_faturado),
      arrecadado: Number(r.cosip_arrecadado),
    }));

  const dadosClientes = registros
    .filter(r => r.cosip_clientes && r.cosip_clientes > 0)
    .map(r => ({
      periodo: `${getMesAbreviado(r.mes)}/${String(r.ano).slice(2)}`,
      clientes: Number(r.cosip_clientes),
    }));

  const mediaFaturado = dadosFaturamento.length > 0 
    ? dadosFaturamento.reduce((acc, d) => acc + d.faturado, 0) / dadosFaturamento.length 
    : 0;

  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${Math.round(value / 1000)}k`;
    return value.toString();
  };

  const CustomTooltipFaturamento = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-xl">
          <p className="text-sm font-semibold text-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className={`text-sm font-medium ${entry.dataKey === 'faturado' ? 'text-blue-400' : 'text-emerald-400'}`}>
              {entry.dataKey === 'faturado' ? 'Faturado: ' : 'Arrecadado: '}
              R$ {new Intl.NumberFormat('pt-BR').format(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomTooltipClientes = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-xl">
          <p className="text-sm font-semibold text-foreground mb-1">{label}</p>
          <p className="text-lg font-bold text-purple-400">
            {new Intl.NumberFormat('pt-BR').format(payload[0].value)} clientes
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="animate-fade-in bg-card border-border hover:border-primary/30 transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Contribuição COSIP</CardTitle>
        <CardDescription>Evolução da Contribuição para Custeio do Serviço de Iluminação Pública</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 bg-muted/50">
            <TabsTrigger value="faturamento" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Faturamento e Arrecadação
            </TabsTrigger>
            <TabsTrigger value="clientes" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Clientes Faturados
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="faturamento">
            <div className="h-[280px]">
              {dadosFaturamento.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Nenhum dado disponível
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dadosFaturamento} margin={{ top: 10, right: 40, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
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
                    <Tooltip content={<CustomTooltipFaturamento />} />
                    <ReferenceLine 
                      y={mediaFaturado} 
                      stroke="hsl(var(--muted-foreground))" 
                      strokeDasharray="8 4"
                      strokeWidth={1.5}
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
                      dataKey="faturado" 
                      stroke="#3b82f6" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: '#3b82f6', stroke: '#1e293b', strokeWidth: 2 }}
                      activeDot={{ r: 7, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="arrecadado" 
                      stroke="#22c55e" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: '#22c55e', stroke: '#1e293b', strokeWidth: 2 }}
                      activeDot={{ r: 7, stroke: '#22c55e', strokeWidth: 2, fill: '#fff' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="flex items-center justify-center gap-8 mt-3 pt-3 border-t border-border">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-blue-500 shadow-sm" />
                <span className="text-sm text-muted-foreground">Faturado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-sm" />
                <span className="text-sm text-muted-foreground">Arrecadado</span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="clientes">
            <div className="h-[280px]">
              {dadosClientes.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Nenhum dado disponível
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dadosClientes} margin={{ top: 10, right: 40, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis 
                      dataKey="periodo" 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                      interval="preserveStartEnd"
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <YAxis 
                      tickFormatter={formatYAxis}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                      domain={[(dataMin: number) => Math.floor(dataMin * 0.98), (dataMax: number) => Math.ceil(dataMax * 1.02)]}
                      tickCount={6}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <Tooltip content={<CustomTooltipClientes />} />
                    <Line 
                      type="monotone" 
                      dataKey="clientes" 
                      stroke="#8b5cf6" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: '#8b5cf6', stroke: '#1e293b', strokeWidth: 2 }}
                      activeDot={{ r: 7, stroke: '#8b5cf6', strokeWidth: 2, fill: '#fff' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="flex items-center justify-center gap-8 mt-3 pt-3 border-t border-border">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-purple-500 shadow-sm" />
                <span className="text-sm text-muted-foreground">Clientes Faturados</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
