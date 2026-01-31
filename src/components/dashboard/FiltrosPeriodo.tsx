import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { FileSpreadsheet, FileText } from 'lucide-react';
import { RegistroEnergia } from '@/types/energia';
import { exportToExcel, exportToPDF } from '@/utils/exportData';

interface FiltrosPeriodoProps {
  filtro: string;
  onFiltroChange: (value: string) => void;
  anosDisponiveis: number[];
  registros: RegistroEnergia[];
}

export const FiltrosPeriodo = ({ filtro, onFiltroChange, anosDisponiveis, registros }: FiltrosPeriodoProps) => {
  return (
    <div className="flex items-center gap-3">
      <Select value={filtro} onValueChange={onFiltroChange}>
        <SelectTrigger className="w-[180px] bg-card border-border">
          <SelectValue placeholder="Selecione o período" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos os dados</SelectItem>
          {anosDisponiveis.map((ano) => (
            <SelectItem key={ano} value={String(ano)}>
              {ano}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => exportToExcel(registros, filtro === 'todos' ? null : parseInt(filtro))}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Exportar Excel
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => exportToPDF(registros, filtro === 'todos' ? null : parseInt(filtro))}>
            <FileText className="mr-2 h-4 w-4" />
            Exportar PDF
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
