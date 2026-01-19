import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useRegistrosEnergia, useDeleteRegistro } from '@/hooks/useRegistrosEnergia';
import { RegistroEnergia, getNomeMes } from '@/types/energia';
import { Pencil, Trash2, Loader2 } from 'lucide-react';
import { FiltroAno } from '@/components/dashboard/FiltroAno';

interface RegistrosListProps {
  onEdit: (registro: RegistroEnergia) => void;
}

export const RegistrosList = ({ onEdit }: RegistrosListProps) => {
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());
  const { data: registros = [], isLoading } = useRegistrosEnergia(anoSelecionado);
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

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  const registrosOrdenados = [...registros].sort((a, b) => b.mes - a.mes);

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Registros Mensais</CardTitle>
            <CardDescription>Gerencie os dados de consumo e valores</CardDescription>
          </div>
          <FiltroAno anoSelecionado={anoSelecionado} onAnoChange={setAnoSelecionado} />
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
                  <TableHead className="text-right">Valor Faturado</TableHead>
                  <TableHead className="text-right">Valor Pago</TableHead>
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
                      {formatCurrency(Number(registro.valor_faturado))}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(Number(registro.valor_pago))}
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
