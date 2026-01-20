import { BandeiraTarifaria, getNomeBandeira, getCorBandeira } from '@/types/energia';
import { Badge } from '@/components/ui/badge';

interface BandeiraBadgeProps {
  bandeira: BandeiraTarifaria | null;
  size?: 'sm' | 'md';
}

export const BandeiraBadge = ({ bandeira, size = 'md' }: BandeiraBadgeProps) => {
  const cor = getCorBandeira(bandeira);
  const nome = getNomeBandeira(bandeira);
  
  return (
    <Badge 
      className={`${size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'}`}
      style={{ 
        backgroundColor: cor,
        color: bandeira === 'amarela' ? '#000' : '#fff'
      }}
    >
      {nome}
    </Badge>
  );
};
