import { useState } from 'react';
import { Header } from '@/components/dashboard/Header';
import { KPICard } from '@/components/dashboard/KPICard';
import { GraficoConsumo } from '@/components/dashboard/GraficoConsumo';
import { GraficoComparativo } from '@/components/dashboard/GraficoComparativo';
import { FiltroAno } from '@/components/dashboard/FiltroAno';
import { useRegistrosEnergia, useKPIs } from '@/hooks/useRegistrosEnergia';
import { Zap, DollarSign, TrendingUp, ArrowRightLeft, Loader2, Flag, Download, FileSpreadsheet, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { exportToExcel, exportToPDF } from '@/utils/exportData';

const Index = () => {
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());
  const { data: registros = [], isLoading } = useRegistrosEnergia(anoSelecionado);
  const kpis = useKPIs(anoSelecionado);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Título e Filtros */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold">Dashboard de Consumo</h2>
            <p className="text-muted-foreground">
              Acompanhe o consumo e gastos com iluminação pública
            </p>
          </div>
          <div className="flex items-center gap-2">
            <FiltroAno anoSelecionado={anoSelecionado} onAnoChange={setAnoSelecionado} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" disabled={registros.length === 0}>
                  <Download className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => exportToExcel(registros, anoSelecionado)}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Exportar Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToPDF(registros, anoSelecionado)}>
                  <FileText className="mr-2 h-4 w-4" />
                  Exportar PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <KPICard
                titulo="Consumo Total Anual"
                valor={`${formatNumber(kpis.consumoTotalAnual)} kWh`}
                subtitulo={`${registros.length} meses registrados`}
                icon={Zap}
                variante="default"
              />
              <KPICard
                titulo="Gasto Total Anual"
                valor={formatCurrency(kpis.gastoTotalAnual)}
                subtitulo="Valor efetivamente pago"
                icon={DollarSign}
                variante="success"
              />
              <KPICard
                titulo="Média Mensal"
                valor={`${formatNumber(kpis.mediaConsumoMensal)} kWh`}
                subtitulo="Consumo médio por mês"
                icon={TrendingUp}
                variante="default"
              />
              <KPICard
                titulo="Diferença Fat./Pago"
                valor={formatCurrency(kpis.diferencaFaturadoPago)}
                subtitulo={kpis.diferencaFaturadoPago >= 0 ? 'Economia' : 'Acréscimo'}
                icon={ArrowRightLeft}
                variante={kpis.diferencaFaturadoPago >= 0 ? 'success' : 'warning'}
              />
              <KPICard
                titulo="Custo Bandeira"
                valor={formatCurrency(kpis.totalBandeira)}
                subtitulo="Adicional por bandeira"
                icon={Flag}
                variante={kpis.totalBandeira > 0 ? 'warning' : 'success'}
              />
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GraficoConsumo registros={registros} />
              <GraficoComparativo registros={registros} />
            </div>

            {/* Footer de Transparência */}
            <footer className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
              <p>Portal de Transparência - Iluminação Pública Municipal</p>
              <p className="mt-1">Dados atualizados mensalmente pela administração municipal</p>
            </footer>
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
