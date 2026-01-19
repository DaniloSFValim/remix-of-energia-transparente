import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateRegistro, useUpdateRegistro } from '@/hooks/useRegistrosEnergia';
import { RegistroEnergia, MESES } from '@/types/energia';
import { Loader2 } from 'lucide-react';

const registroSchema = z.object({
  mes: z.number().min(1).max(12),
  ano: z.number().min(2000).max(2100),
  consumo_kwh: z.number().min(0, 'Consumo deve ser positivo'),
  valor_faturado: z.number().min(0, 'Valor deve ser positivo'),
  valor_pago: z.number().min(0, 'Valor deve ser positivo'),
  observacoes: z.string().max(1000, 'Máximo de 1000 caracteres').optional(),
});

type RegistroFormData = z.infer<typeof registroSchema>;

interface RegistroFormProps {
  registro?: RegistroEnergia | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const RegistroForm = ({ registro, onSuccess, onCancel }: RegistroFormProps) => {
  const createMutation = useCreateRegistro();
  const updateMutation = useUpdateRegistro();
  const isEditing = !!registro;

  const form = useForm<RegistroFormData>({
    resolver: zodResolver(registroSchema),
    defaultValues: {
      mes: registro?.mes || new Date().getMonth() + 1,
      ano: registro?.ano || new Date().getFullYear(),
      consumo_kwh: registro ? Number(registro.consumo_kwh) : 0,
      valor_faturado: registro ? Number(registro.valor_faturado) : 0,
      valor_pago: registro ? Number(registro.valor_pago) : 0,
      observacoes: registro?.observacoes || '',
    },
  });

  const onSubmit = async (data: RegistroFormData) => {
    const payload = {
      mes: data.mes,
      ano: data.ano,
      consumo_kwh: data.consumo_kwh,
      valor_faturado: data.valor_faturado,
      valor_pago: data.valor_pago,
      observacoes: data.observacoes,
    };

    try {
      if (isEditing && registro) {
        await updateMutation.mutateAsync({ id: registro.id, ...payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onSuccess();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>{isEditing ? 'Editar Registro' : 'Novo Registro'}</CardTitle>
        <CardDescription>
          {isEditing 
            ? 'Atualize os dados do registro mensal'
            : 'Insira os dados de consumo e valores do mês'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="mes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mês</FormLabel>
                    <Select 
                      value={String(field.value)} 
                      onValueChange={(v) => field.onChange(Number(v))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MESES.map((mes) => (
                          <SelectItem key={mes.valor} value={String(mes.valor)}>
                            {mes.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ano"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ano</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="consumo_kwh"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Consumo de Energia (kWh)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01"
                      placeholder="0.00"
                      {...field} 
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="valor_faturado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Faturado (R$)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="0.00"
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="valor_pago"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Pago (R$)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="0.00"
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações (opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Notas adicionais sobre este mês..."
                      className="resize-none"
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Salvar Alterações' : 'Criar Registro'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
