import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAnosDisponiveis } from '@/hooks/useRegistrosEnergia';
import { Calendar } from 'lucide-react';

interface FiltroAnoProps {
  anoSelecionado: number;
  onAnoChange: (ano: number) => void;
}

export const FiltroAno = ({ anoSelecionado, onAnoChange }: FiltroAnoProps) => {
  const { data: anos = [], isLoading } = useAnosDisponiveis();

  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-muted-foreground" />
      <Select 
        value={String(anoSelecionado)} 
        onValueChange={(value) => onAnoChange(Number(value))}
        disabled={isLoading}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Selecione o ano" />
        </SelectTrigger>
        <SelectContent>
          {anos.map((ano) => (
            <SelectItem key={ano} value={String(ano)}>
              {ano}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
