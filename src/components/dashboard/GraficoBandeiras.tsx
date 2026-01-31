import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Sector } from 'recharts';
import { RegistroEnergia, BANDEIRAS, getNomeBandeira, getCorBandeira } from '@/types/energia';
import { Flag } from 'lucide-react';

interface GraficoBandeirasProps {
  registros: RegistroEnergia[];
}

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;

  return (
    <g>
      <text x={cx} y={cy - 10} textAnchor="middle" fill="currentColor" className="text-sm font-semibold">
        {payload.nome}
      </text>
      <text x={cx} y={cy + 15} textAnchor="middle" fill="currentColor" className="text-xs text-muted-foreground">
        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
      </text>
      <text x={cx} y={cy + 35} textAnchor="middle" fill="currentColor" className="text-xs text-muted-foreground">
        ({(percent * 100).toFixed(1)}%)
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        className="drop-shadow-lg"
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 10}
        outerRadius={outerRadius + 14}
        fill={fill}
      />
    </g>
  );
};

export const GraficoBandeiras = ({ registros }: GraficoBandeirasProps) => {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  const dadosBandeiras = useMemo(() => {
    const totaisPorBandeira = registros.reduce((acc, registro) => {
      const bandeira = registro.bandeira_tarifaria || 'verde';
      if (!acc[bandeira]) {
        acc[bandeira] = {
          valor: 0,
          consumo: 0,
          meses: 0,
        };
      }
      acc[bandeira].valor += Number(registro.valor_pago);
      acc[bandeira].consumo += Number(registro.consumo_kwh);
      acc[bandeira].meses += 1;
      return acc;
    }, {} as Record<string, { valor: number; consumo: number; meses: number }>);

    return BANDEIRAS.map(b => ({
      nome: b.nome,
      bandeira: b.valor,
      valor: totaisPorBandeira[b.valor]?.valor || 0,
      consumo: totaisPorBandeira[b.valor]?.consumo || 0,
      meses: totaisPorBandeira[b.valor]?.meses || 0,
      cor: b.cor,
    })).filter(d => d.valor > 0);
  }, [registros]);

  const totalGeral = useMemo(() => {
    return dadosBandeiras.reduce((sum, d) => sum + d.valor, 0);
  }, [dadosBandeiras]);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(undefined);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentual = ((data.valor / totalGeral) * 100).toFixed(1);
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: data.cor }}
            />
            <span className="font-semibold">{data.nome}</span>
          </div>
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground">Valor Total: </span>
              <span className="font-medium">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.valor)}
              </span>
            </p>
            <p>
              <span className="text-muted-foreground">Consumo: </span>
              <span className="font-medium">
                {new Intl.NumberFormat('pt-BR').format(data.consumo)} kWh
              </span>
            </p>
            <p>
              <span className="text-muted-foreground">Meses: </span>
              <span className="font-medium">{data.meses}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Percentual: </span>
              <span className="font-medium">{percentual}%</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div 
            key={`legend-${index}`}
            className="flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-80"
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(undefined)}
          >
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-muted-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  if (dadosBandeiras.length === 0) {
    return (
      <Card className="transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Flag className="h-5 w-5 text-primary" />
            Distribuição por Bandeira Tarifária
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Nenhum dado disponível para o período selecionado
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Flag className="h-5 w-5 text-primary" />
          Distribuição por Bandeira Tarifária
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Pizza */}
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={dadosBandeiras}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="valor"
                  nameKey="nome"
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                  animationBegin={0}
                  animationDuration={800}
                >
                  {dadosBandeiras.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.cor}
                      className="transition-all duration-200"
                      style={{
                        filter: activeIndex === index ? 'brightness(1.1)' : 'brightness(1)',
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend content={renderLegend} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Detalhes */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Detalhamento por Bandeira
            </h4>
            {dadosBandeiras.map((bandeira, index) => {
              const percentual = ((bandeira.valor / totalGeral) * 100).toFixed(1);
              return (
                <div 
                  key={bandeira.bandeira}
                  className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                    activeIndex === index 
                      ? 'bg-accent border-primary/50 shadow-md' 
                      : 'bg-muted/30 hover:bg-accent/50'
                  }`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(undefined)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: bandeira.cor }}
                      />
                      <span className="font-semibold">{bandeira.nome}</span>
                    </div>
                    <span className="text-sm font-medium text-primary">
                      {percentual}%
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Valor: </span>
                      <span className="font-medium">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(bandeira.valor)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Meses: </span>
                      <span className="font-medium">{bandeira.meses}</span>
                    </div>
                  </div>
                  {/* Barra de progresso */}
                  <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${percentual}%`,
                        backgroundColor: bandeira.cor,
                      }}
                    />
                  </div>
                </div>
              );
            })}
            
            {/* Total */}
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Geral</span>
                <span className="font-bold text-lg">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalGeral)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
