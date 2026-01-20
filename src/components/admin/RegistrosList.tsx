import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useRegistrosEnergia, useDeleteRegistro, useUltimoRegistro } from '@/hooks/useRegistrosEnergia';
import { RegistroEnergia, getNomeMes, isBandeiraComCusto } from '@/types/energia';
import { Pencil, Trash2, Loader2, Download, FileSpreadsheet, FileText } from 'lucide-react';
import { FiltroAno } from '@/components/dashboard/FiltroAno';
import { BandeiraBadge } from '@/components/dashboard/BandeiraBadge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { exportToExcel, exportToPDF } from '@/utils/exportData';

interface RegistrosListProps {
  onEdit: (registro: RegistroEnergia) => void;
}

export const RegistrosList = ({ onEdit }: RegistrosListProps) => {
  const { data: ultimoRegistro, isLoading: loadingUltimo } = useUltimoRegistro();
  const [anoSelecionado, setAnoSelecionado] = useState<number | null>(null);
  
  // Definir ano baseado no último registro quando carregar
  useEffect(() => {
    if (!loadingUltimo && anoSelecionado === null) {
      if (ultimoRegistro) {
        setAnoSelecionado(ultimoRegistro.ano);
      } else {
        setAnoSelecionado(new Date().getFullYear());
      }
    }
  }, [ultimoRegistro, loadingUltimo, anoSelecionado]);

  const { data: registros = [], isLoading } = useRegistrosEnergia(anoSelecionado || new Date().getFullYear());
  const deleteMutation = useDeleteRegistro();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const formatPreco = (value: number | null) => {
    if (value === null || value === 0) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 6,
      maximumFractionDigits: 6,
    }).format(value);
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  const registrosOrdenados = [...registros].sort((a, b) => b.mes - a.mes);

  if (anoSelecionado === null || loadingUltimo) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Registros Mensais</CardTitle>
            <CardDescription>Gerencie os dados de consumo e valores</CardDescription>
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
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : registrosOrdenados.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum registro encontrado para {anoSelecionado}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mês</TableHead>
                  <TableHead className="text-right">Consumo (kWh)</TableHead>
                  <TableHead className="text-right">Valor Pago</TableHead>
                  <TableHead className="text-right">TE (R$/kWh)</TableHead>
                  <TableHead className="text-right">TUSD (R$/kWh)</TableHead>
                  <TableHead className="text-center">Bandeira</TableHead>
                  <TableHead className="text-right">Preço Band.</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrosOrdenados.map((registro) => (
                  <TableRow key={registro.id}>
                    <TableCell className="font-medium">
                      {getNomeMes(registro.mes)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNumber(Number(registro.consumo_kwh))}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(Number(registro.valor_pago))}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {formatPreco(Number(registro.preco_te || 0))}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {formatPreco(Number(registro.preco_tusd || 0))}
                    </TableCell>
                    <TableCell className="text-center">
                      <BandeiraBadge bandeira={registro.bandeira_tarifaria} size="sm" />
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {isBandeiraComCusto(registro.bandeira_tarifaria) 
                        ? formatPreco(Number(registro.preco_bandeira || 0))
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(registro)}
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              title="Excluir"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Deseja realmente excluir o registro de {getNomeMes(registro.mes)}/{registro.ano}? 
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(registro.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
