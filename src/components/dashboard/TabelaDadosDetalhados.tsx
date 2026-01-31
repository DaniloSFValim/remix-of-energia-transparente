import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RegistroEnergia, getNomeMes, getNomeBandeira, getCorBandeira } from '@/types/energia';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface TabelaDadosDetalhadosProps {
  registros: RegistroEnergia[];
}

type SortField = 'periodo' | 'consumo' | 'valor' | 'custo' | 'tusd' | 'te' | 'bandeira' | 'cosip' | 'inadimplencia';
type SortDirection = 'asc' | 'desc';

export const TabelaDadosDetalhados = ({ registros }: TabelaDadosDetalhadosProps) => {
  const [sortField, setSortField] = useState<SortField>('periodo');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedRegistros = [...registros].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'periodo':
        comparison = (a.ano * 100 + a.mes) - (b.ano * 100 + b.mes);
        break;
      case 'consumo':
        comparison = Number(a.consumo_kwh) - Number(b.consumo_kwh);
        break;
      case 'valor':
        comparison = Number(a.valor_pago) - Number(b.valor_pago);
        break;
      case 'custo':
        comparison = (Number(a.valor_pago) / Number(a.consumo_kwh)) - (Number(b.valor_pago) / Number(b.consumo_kwh));
        break;
      case 'tusd':
        comparison = Number(a.preco_tusd || 0) - Number(b.preco_tusd || 0);
        break;
      case 'te':
        comparison = Number(a.preco_te || 0) - Number(b.preco_te || 0);
        break;
      case 'bandeira':
        comparison = Number(a.preco_bandeira || 0) - Number(b.preco_bandeira || 0);
        break;
      case 'cosip':
        comparison = Number(a.cosip_arrecadado || 0) - Number(b.cosip_arrecadado || 0);
        break;
      case 'inadimplencia':
        comparison = Number(a.inadimplencia || 0) - Number(b.inadimplencia || 0);
        break;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 ml-1" />;
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-3 w-3 ml-1" /> 
      : <ArrowDown className="h-3 w-3 ml-1" />;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(Math.round(value));
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg">Dados Detalhados</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>
                  <Button variant="ghost" size="sm" onClick={() => handleSort('periodo')} className="h-auto p-0 font-medium">
                    Mês/Ano <SortIcon field="periodo" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" onClick={() => handleSort('consumo')} className="h-auto p-0 font-medium">
                    Consumo (kWh) <SortIcon field="consumo" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" onClick={() => handleSort('valor')} className="h-auto p-0 font-medium">
                    Valor Total (R$) <SortIcon field="valor" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" onClick={() => handleSort('custo')} className="h-auto p-0 font-medium">
                    Custo/kWh <SortIcon field="custo" />
                  </Button>
                </TableHead>
                <TableHead>Bandeira</TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" onClick={() => handleSort('tusd')} className="h-auto p-0 font-medium">
                    TUSD <SortIcon field="tusd" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" onClick={() => handleSort('te')} className="h-auto p-0 font-medium">
                    TE <SortIcon field="te" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" onClick={() => handleSort('bandeira')} className="h-auto p-0 font-medium">
                    Adic. Band. <SortIcon field="bandeira" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" onClick={() => handleSort('cosip')} className="h-auto p-0 font-medium">
                    COSIP Arrec. <SortIcon field="cosip" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" onClick={() => handleSort('inadimplencia')} className="h-auto p-0 font-medium">
                    Inadimpl. <SortIcon field="inadimplencia" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRegistros.map((r) => {
                const custokWh = Number(r.valor_pago) / Number(r.consumo_kwh);
                return (
                  <TableRow key={r.id} className="border-border">
                    <TableCell className="font-medium">
                      {getNomeMes(r.mes)}/{r.ano}
                    </TableCell>
                    <TableCell>{formatNumber(Number(r.consumo_kwh))}</TableCell>
                    <TableCell className="text-primary">{formatCurrency(Number(r.valor_pago))}</TableCell>
                    <TableCell>R$ {custokWh.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge 
                        style={{ 
                          backgroundColor: getCorBandeira(r.bandeira_tarifaria),
                          color: r.bandeira_tarifaria === 'amarela' ? '#000' : '#fff'
                        }}
                      >
                        {getNomeBandeira(r.bandeira_tarifaria)}
                      </Badge>
                    </TableCell>
                    <TableCell>R$ {Number(r.preco_tusd || 0).toFixed(4)}</TableCell>
                    <TableCell>R$ {Number(r.preco_te || 0).toFixed(4)}</TableCell>
                    <TableCell>
                      {Number(r.preco_bandeira || 0) > 0 
                        ? `R$ ${Number(r.preco_bandeira).toFixed(4)}` 
                        : '-'}
                    </TableCell>
                    <TableCell className="text-emerald-400">
                      {Number(r.cosip_arrecadado || 0) > 0 
                        ? formatCurrency(Number(r.cosip_arrecadado)) 
                        : '-'}
                    </TableCell>
                    <TableCell className={Number(r.inadimplencia || 0) > 0 ? 'text-red-400' : 'text-emerald-400'}>
                      {r.inadimplencia !== null && r.inadimplencia !== undefined
                        ? `${Number(r.inadimplencia).toFixed(1)}%`
                        : '-'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
