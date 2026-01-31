import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download, Printer, Filter, X, GitCompare } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { FileSpreadsheet, FileText } from 'lucide-react';
import { RegistroEnergia } from '@/types/energia';
import { exportToExcel, exportToPDF } from '@/utils/exportData';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const MESES = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' },
];

const BANDEIRAS = [
  { value: 'todas', label: 'Todas', color: 'bg-muted' },
  { value: 'verde', label: 'Verde', color: 'bg-emerald-500' },
  { value: 'amarela', label: 'Amarela', color: 'bg-yellow-500' },
  { value: 'vermelha_1', label: 'Vermelha 1', color: 'bg-red-400' },
  { value: 'vermelha_2', label: 'Vermelha 2', color: 'bg-red-600' },
];

export interface FiltroAvancado {
  anoInicio: number | null;
  mesInicio: number | null;
  anoFim: number | null;
  mesFim: number | null;
  bandeira: string;
  compararCom: {
    ativo: boolean;
    anoInicio: number | null;
    mesInicio: number | null;
    anoFim: number | null;
    mesFim: number | null;
  };
}

interface FiltrosAvancadosProps {
  filtro: FiltroAvancado;
  onFiltroChange: (filtro: FiltroAvancado) => void;
  anosDisponiveis: number[];
  registros: RegistroEnergia[];
  onLimparFiltros: () => void;
}

export const FiltrosAvancados = ({ 
  filtro, 
  onFiltroChange, 
  anosDisponiveis, 
  registros,
  onLimparFiltros 
}: FiltrosAvancadosProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const temFiltroAtivo = filtro.anoInicio !== null || 
    filtro.bandeira !== 'todas' || 
    filtro.compararCom.ativo;

  const getResumoFiltro = () => {
    const partes: string[] = [];
    
    if (filtro.anoInicio && filtro.mesInicio) {
      const mesInicioLabel = MESES.find(m => m.value === filtro.mesInicio)?.label?.slice(0, 3);
      const mesFimLabel = filtro.mesFim ? MESES.find(m => m.value === filtro.mesFim)?.label?.slice(0, 3) : mesInicioLabel;
      partes.push(`${mesInicioLabel}/${filtro.anoInicio} - ${mesFimLabel}/${filtro.anoFim || filtro.anoInicio}`);
    } else if (filtro.anoInicio) {
      partes.push(`${filtro.anoInicio}`);
    }
    
    if (filtro.bandeira !== 'todas') {
      partes.push(`Bandeira ${BANDEIRAS.find(b => b.value === filtro.bandeira)?.label}`);
    }
    
    return partes.length > 0 ? partes.join(' • ') : 'Todos os dados';
  };

  return (
    <div className="flex flex-wrap items-center gap-3 no-print">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant={temFiltroAtivo ? "default" : "outline"} 
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
            {temFiltroAtivo && (
              <Badge variant="secondary" className="ml-1 bg-primary-foreground/20 text-primary-foreground">
                {(filtro.anoInicio ? 1 : 0) + (filtro.bandeira !== 'todas' ? 1 : 0) + (filtro.compararCom.ativo ? 1 : 0)}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[420px] p-0" align="end">
          <Card className="border-0 shadow-none">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Filtros Avançados</h3>
              <p className="text-sm text-muted-foreground">Defina o período e critérios de análise</p>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Período Principal */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Período de Análise</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <span className="text-xs text-muted-foreground">De</span>
                    <div className="flex gap-2">
                      <Select
                        value={filtro.mesInicio?.toString() || ''}
                        onValueChange={(v) => onFiltroChange({ ...filtro, mesInicio: v ? parseInt(v) : null })}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Mês" />
                        </SelectTrigger>
                        <SelectContent>
                          {MESES.map((mes) => (
                            <SelectItem key={mes.value} value={mes.value.toString()}>
                              {mes.label.slice(0, 3)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={filtro.anoInicio?.toString() || ''}
                        onValueChange={(v) => onFiltroChange({ ...filtro, anoInicio: v ? parseInt(v) : null })}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue placeholder="Ano" />
                        </SelectTrigger>
                        <SelectContent>
                          {anosDisponiveis.map((ano) => (
                            <SelectItem key={ano} value={ano.toString()}>
                              {ano}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs text-muted-foreground">Até</span>
                    <div className="flex gap-2">
                      <Select
                        value={filtro.mesFim?.toString() || ''}
                        onValueChange={(v) => onFiltroChange({ ...filtro, mesFim: v ? parseInt(v) : null })}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Mês" />
                        </SelectTrigger>
                        <SelectContent>
                          {MESES.map((mes) => (
                            <SelectItem key={mes.value} value={mes.value.toString()}>
                              {mes.label.slice(0, 3)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={filtro.anoFim?.toString() || ''}
                        onValueChange={(v) => onFiltroChange({ ...filtro, anoFim: v ? parseInt(v) : null })}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue placeholder="Ano" />
                        </SelectTrigger>
                        <SelectContent>
                          {anosDisponiveis.map((ano) => (
                            <SelectItem key={ano} value={ano.toString()}>
                              {ano}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bandeira Tarifária */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Bandeira Tarifária</Label>
                <div className="flex flex-wrap gap-2">
                  {BANDEIRAS.map((bandeira) => (
                    <Button
                      key={bandeira.value}
                      variant={filtro.bandeira === bandeira.value ? "default" : "outline"}
                      size="sm"
                      className="gap-2"
                      onClick={() => onFiltroChange({ ...filtro, bandeira: bandeira.value })}
                    >
                      <div className={`w-2 h-2 rounded-full ${bandeira.color}`} />
                      {bandeira.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Modo Comparação */}
              <div className="space-y-3 pt-3 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GitCompare className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm font-medium">Comparar Períodos</Label>
                  </div>
                  <Switch
                    checked={filtro.compararCom.ativo}
                    onCheckedChange={(checked) => 
                      onFiltroChange({ 
                        ...filtro, 
                        compararCom: { ...filtro.compararCom, ativo: checked } 
                      })
                    }
                  />
                </div>
                
                {filtro.compararCom.ativo && (
                  <div className="grid grid-cols-2 gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="space-y-2">
                      <span className="text-xs text-muted-foreground">De</span>
                      <div className="flex gap-2">
                        <Select
                          value={filtro.compararCom.mesInicio?.toString() || ''}
                          onValueChange={(v) => onFiltroChange({ 
                            ...filtro, 
                            compararCom: { ...filtro.compararCom, mesInicio: v ? parseInt(v) : null }
                          })}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Mês" />
                          </SelectTrigger>
                          <SelectContent>
                            {MESES.map((mes) => (
                              <SelectItem key={mes.value} value={mes.value.toString()}>
                                {mes.label.slice(0, 3)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={filtro.compararCom.anoInicio?.toString() || ''}
                          onValueChange={(v) => onFiltroChange({ 
                            ...filtro, 
                            compararCom: { ...filtro.compararCom, anoInicio: v ? parseInt(v) : null }
                          })}
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue placeholder="Ano" />
                          </SelectTrigger>
                          <SelectContent>
                            {anosDisponiveis.map((ano) => (
                              <SelectItem key={ano} value={ano.toString()}>
                                {ano}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <span className="text-xs text-muted-foreground">Até</span>
                      <div className="flex gap-2">
                        <Select
                          value={filtro.compararCom.mesFim?.toString() || ''}
                          onValueChange={(v) => onFiltroChange({ 
                            ...filtro, 
                            compararCom: { ...filtro.compararCom, mesFim: v ? parseInt(v) : null }
                          })}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Mês" />
                          </SelectTrigger>
                          <SelectContent>
                            {MESES.map((mes) => (
                              <SelectItem key={mes.value} value={mes.value.toString()}>
                                {mes.label.slice(0, 3)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={filtro.compararCom.anoFim?.toString() || ''}
                          onValueChange={(v) => onFiltroChange({ 
                            ...filtro, 
                            compararCom: { ...filtro.compararCom, anoFim: v ? parseInt(v) : null }
                          })}
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue placeholder="Ano" />
                          </SelectTrigger>
                          <SelectContent>
                            {anosDisponiveis.map((ano) => (
                              <SelectItem key={ano} value={ano.toString()}>
                                {ano}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-border flex justify-between">
              <Button variant="ghost" size="sm" onClick={onLimparFiltros}>
                <X className="h-4 w-4 mr-2" />
                Limpar
              </Button>
              <Button size="sm" onClick={() => setIsOpen(false)}>
                Aplicar Filtros
              </Button>
            </div>
          </Card>
        </PopoverContent>
      </Popover>

      {/* Resumo do filtro ativo */}
      <div className="text-sm text-muted-foreground hidden md:block">
        {getResumoFiltro()}
      </div>

      {temFiltroAtivo && (
        <Button variant="ghost" size="sm" onClick={onLimparFiltros} className="h-8 px-2">
          <X className="h-4 w-4" />
        </Button>
      )}

      <div className="flex-1" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => exportToExcel(registros, null)}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Exportar Excel
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => exportToPDF(registros, null)}>
            <FileText className="mr-2 h-4 w-4" />
            Exportar PDF
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button variant="outline" className="gap-2" onClick={handlePrint}>
        <Printer className="h-4 w-4" />
        <span className="hidden sm:inline">Imprimir</span>
      </Button>
    </div>
  );
};
