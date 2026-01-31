import { useState, useMemo } from 'react';
import { NewHeader } from '@/components/dashboard/NewHeader';
import { KPICardNew } from '@/components/dashboard/KPICardNew';
import { IndicadoresCOSIP } from '@/components/dashboard/IndicadoresCOSIP';
import { GraficoEvolucaoConsumo } from '@/components/dashboard/GraficoEvolucaoConsumo';
import { GraficoCOSIP } from '@/components/dashboard/GraficoCOSIP';
import { GraficoCustokWh } from '@/components/dashboard/GraficoCustokWh';
import { GraficoValores } from '@/components/dashboard/GraficoValores';
import { AnalisesCOSIP } from '@/components/dashboard/AnalisesCOSIP';
import { AnalisesAutomaticas } from '@/components/dashboard/AnalisesAutomaticas';
import { TabelaDadosDetalhados } from '@/components/dashboard/TabelaDadosDetalhados';
import { FiltrosPeriodo } from '@/components/dashboard/FiltrosPeriodo';
import { PrintHeader } from '@/components/dashboard/PrintHeader';
import { PrintFooter } from '@/components/dashboard/PrintFooter';
import { useAllRegistros, useUltimoRegistro } from '@/hooks/useAllRegistros';
import { getNomeBandeira, getCorBandeira, isBandeiraComCusto } from '@/types/energia';
import { DollarSign, Zap, Calculator, Flag, BarChart3, Loader2, Calendar, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const Index = () => {
  const { data: allRegistros = [], isLoading } = useAllRegistros();
  const { data: ultimoRegistro } = useUltimoRegistro();
  const [filtro, setFiltro] = useState<string>('todos');

  // Anos disponíveis
  const anosDisponiveis = useMemo(() => {
    const anos = [...new Set(allRegistros.map(r => r.ano))].sort((a, b) => b - a);
    return anos;
  }, [allRegistros]);

  // Registros filtrados
  const registrosFiltrados = useMemo(() => {
    if (filtro === 'todos') return allRegistros;
    const ano = parseInt(filtro);
    return allRegistros.filter(r => r.ano === ano);
  }, [allRegistros, filtro]);

  // Último registro para KPIs
  const ultimoReg = registrosFiltrados.length > 0 
    ? [...registrosFiltrados].sort((a, b) => (b.ano * 100 + b.mes) - (a.ano * 100 + a.mes))[0]
    : null;

  // Registro anterior para comparação
  const registroAnterior = useMemo(() => {
    if (!ultimoReg) return null;
    const idx = registrosFiltrados.findIndex(r => r.id === ultimoReg.id);
    return idx > 0 ? registrosFiltrados[idx - 1] : null;
  }, [ultimoReg, registrosFiltrados]);

  // Registro do mesmo mês ano anterior
  const mesmoMesAnoAnterior = useMemo(() => {
    if (!ultimoReg) return null;
    return allRegistros.find(r => r.mes === ultimoReg.mes && r.ano === ultimoReg.ano - 1);
  }, [ultimoReg, allRegistros]);

  // Cálculos de variação
  const calcVariacao = (atual: number, anterior: number | undefined) => {
    if (!anterior || anterior === 0) return null;
    return ((atual - anterior) / anterior) * 100;
  };

  const variacaoGasto = registroAnterior 
    ? calcVariacao(Number(ultimoReg?.valor_pago), Number(registroAnterior.valor_pago))
    : null;

  const variacaoConsumo = registroAnterior 
    ? calcVariacao(Number(ultimoReg?.consumo_kwh), Number(registroAnterior.consumo_kwh))
    : null;

  const custokWhAtual = ultimoReg 
    ? Number(ultimoReg.valor_pago) / Number(ultimoReg.consumo_kwh)
    : 0;

  const custokWhAnterior = registroAnterior 
    ? Number(registroAnterior.valor_pago) / Number(registroAnterior.consumo_kwh)
    : 0;

  const variacaoCusto = custokWhAnterior > 0 
    ? calcVariacao(custokWhAtual, custokWhAnterior)
    : null;

  const variacaoAnual = mesmoMesAnoAnterior 
    ? Number(ultimoReg?.valor_pago) - Number(mesmoMesAnoAnterior.valor_pago)
    : null;

  const variacaoAnualPercent = mesmoMesAnoAnterior 
    ? calcVariacao(Number(ultimoReg?.valor_pago), Number(mesmoMesAnoAnterior.valor_pago))
    : null;

  const custoAdicionalBandeira = ultimoReg && isBandeiraComCusto(ultimoReg.bandeira_tarifaria)
    ? Number(ultimoReg.preco_bandeira || 0) * Number(ultimoReg.consumo_kwh)
    : 0;

  // Data de atualização
  const dataAtualizacao = ultimoReg 
    ? new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : '';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NewHeader />
      
      <main className="container mx-auto px-4 py-6">
        {/* Cabeçalho de Impressão */}
        <PrintHeader filtro={filtro} />
        {/* Título */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6 no-print">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl md:text-3xl font-bold text-primary">
                Dashboard de Iluminação Pública - Niterói/RJ
              </h2>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Portal de Transparência da Iluminação Pública Municipal</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-muted-foreground">Consumo de Energia e Custos Mensais</p>
            {ultimoReg && (
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <Calendar className="h-3 w-3" />
                Última atualização: {dataAtualizacao}
              </p>
            )}
          </div>
          <FiltrosPeriodo 
            filtro={filtro} 
            onFiltroChange={setFiltro} 
            anosDisponiveis={anosDisponiveis}
            registros={registrosFiltrados}
          />
        </div>

        {ultimoReg && (
          <>
            {/* KPIs Principais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <KPICardNew
                icon={DollarSign}
                titulo="Gasto do Mês"
                valor={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(ultimoReg.valor_pago))}
                variacao={variacaoGasto}
                variacaoLabel="vs mês anterior"
              />
              <KPICardNew
                icon={Zap}
                titulo="Consumo do Mês"
                valor={`${new Intl.NumberFormat('pt-BR').format(Number(ultimoReg.consumo_kwh))} kWh`}
                variacao={variacaoConsumo}
                variacaoLabel="vs mês anterior"
              />
              <KPICardNew
                icon={Calculator}
                titulo="Custo Real por kWh"
                valor={`R$ ${custokWhAtual.toFixed(2)}`}
                subtitulo="Com impostos inclusos"
                variacao={variacaoCusto}
              />
              <KPICardNew
                icon={Flag}
                titulo="Bandeira Tarifária"
                valor={isBandeiraComCusto(ultimoReg.bandeira_tarifaria) 
                  ? `+R$ ${Number(ultimoReg.preco_bandeira || 0).toFixed(4)}/kWh`
                  : 'Sem custo adicional'
                }
                subtitulo={custoAdicionalBandeira > 0 
                  ? `Custo adicional: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(custoAdicionalBandeira)}`
                  : undefined
                }
                badge={getNomeBandeira(ultimoReg.bandeira_tarifaria).toUpperCase()}
                badgeColor={getCorBandeira(ultimoReg.bandeira_tarifaria)}
                destaque={isBandeiraComCusto(ultimoReg.bandeira_tarifaria)}
                destaqueColor={ultimoReg.bandeira_tarifaria === 'amarela' ? 'yellow' : 'red'}
              />
              <KPICardNew
                icon={BarChart3}
                titulo="Comparação Anual"
                valor={variacaoAnual !== null 
                  ? `${variacaoAnual >= 0 ? '+' : '-'}R$ ${new Intl.NumberFormat('pt-BR').format(Math.abs(variacaoAnual))}`
                  : 'N/A'
                }
                subtitulo="vs mesmo mês ano anterior"
                variacao={variacaoAnualPercent}
              />
            </div>

            {/* Indicadores COSIP */}
            <div className="mb-8">
              <IndicadoresCOSIP registros={registrosFiltrados} />
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <GraficoEvolucaoConsumo registros={registrosFiltrados} />
              <GraficoCOSIP registros={registrosFiltrados} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <GraficoCustokWh registros={registrosFiltrados} />
              <GraficoValores registros={registrosFiltrados} />
            </div>

            {/* Análises COSIP */}
            <div className="mb-8">
              <AnalisesCOSIP registros={registrosFiltrados} />
            </div>

            {/* Análises Automáticas */}
            <div className="mb-8">
              <AnalisesAutomaticas registros={registrosFiltrados} />
            </div>

            {/* Tabela de Dados */}
            <div className="mb-8">
              <TabelaDadosDetalhados registros={registrosFiltrados} />
            </div>
          </>
        )}

        {/* Footer */}
        <footer className="mt-8 pt-6 border-t border-border text-center text-sm text-muted-foreground no-print">
          <p>Portal de Transparência - Iluminação Pública Municipal de Niterói</p>
          <p className="mt-1">Dados atualizados mensalmente pela Secretaria de Conservação e Serviços Públicos - SECONSER</p>
        </footer>

        {/* Rodapé de Impressão */}
        <PrintFooter />
      </main>
    </div>
  );
};

export default Index;
