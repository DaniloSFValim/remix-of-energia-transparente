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
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return value.toString();
  };

  return (
    <Card className="animate-fade-in bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Contribuição COSIP</CardTitle>
        <CardDescription>Evolução da Contribuição para Custeio do Serviço de Iluminação Pública</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="faturamento">Faturamento e Arrecadação</TabsTrigger>
            <TabsTrigger value="clientes">Clientes Faturados</TabsTrigger>
          </TabsList>
          
          <TabsContent value="faturamento">
            <div className="h-[350px]">
              {dadosFaturamento.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Nenhum dado disponível
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dadosFaturamento} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
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
                      formatter={(value: number, name: string) => [
                        `R$ ${new Intl.NumberFormat('pt-BR').format(value)}`,
                        name === 'faturado' ? 'Faturado' : 'Arrecadado'
                      ]}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))'
                      }}
                    />
                    <Legend formatter={(value) => value === 'faturado' ? 'Faturado' : 'Arrecadado'} />
                    <ReferenceLine 
                      y={mediaFaturado} 
                      stroke="hsl(var(--muted-foreground))" 
                      strokeDasharray="5 5"
                      label={{ value: 'Média', fill: 'hsl(var(--muted-foreground))', fontSize: 10, position: 'right' }}
                    />
                    <Line type="monotone" dataKey="faturado" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} />
                    <Line type="monotone" dataKey="arrecadado" stroke="#22c55e" strokeWidth={2} dot={{ r: 3, fill: '#22c55e' }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="clientes">
            <div className="h-[350px]">
              {dadosClientes.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Nenhum dado disponível
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dadosClientes} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="periodo" 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      tickFormatter={formatYAxis}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                      domain={[(dataMin: number) => Math.floor(dataMin * 0.98), (dataMax: number) => Math.ceil(dataMax * 1.02)]}
                      tickCount={8}
                    />
                    <Tooltip 
                      formatter={(value: number) => [
                        new Intl.NumberFormat('pt-BR').format(value),
                        'Clientes'
                      ]}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))'
                      }}
                    />
                    <Line type="monotone" dataKey="clientes" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3, fill: '#8b5cf6' }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
