import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateRegistro, useUpdateRegistro, useUltimoRegistro } from '@/hooks/useRegistrosEnergia';
import { RegistroEnergia, MESES, BANDEIRAS, isBandeiraComCusto } from '@/types/energia';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

const registroSchema = z.object({
  mes: z.number().min(1).max(12),
  ano: z.number().min(2000).max(2100),
  consumo_kwh: z.number().min(0, 'Consumo deve ser positivo'),
  valor_pago: z.number().min(0, 'Valor deve ser positivo'),
  bandeira_tarifaria: z.enum(['verde', 'amarela', 'vermelha_1', 'vermelha_2']),
  preco_te: z.number().min(0, 'Valor deve ser positivo'),
  preco_tusd: z.number().min(0, 'Valor deve ser positivo'),
  preco_bandeira: z.number().min(0, 'Valor deve ser positivo').optional(),
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
  const { data: ultimoRegistro } = useUltimoRegistro();
  const isEditing = !!registro;

  // Calcular próximo mês/ano baseado no último registro
  const getProximoMesAno = () => {
    if (ultimoRegistro) {
      const proximoMes = ultimoRegistro.mes === 12 ? 1 : ultimoRegistro.mes + 1;
      const proximoAno = ultimoRegistro.mes === 12 ? ultimoRegistro.ano + 1 : ultimoRegistro.ano;
      return { mes: proximoMes, ano: proximoAno };
    }
    return { mes: new Date().getMonth() + 1, ano: new Date().getFullYear() };
  };

  const proximoMesAno = getProximoMesAno();

  const form = useForm<RegistroFormData>({
    resolver: zodResolver(registroSchema),
    defaultValues: {
      mes: registro?.mes || proximoMesAno.mes,
      ano: registro?.ano || proximoMesAno.ano,
      consumo_kwh: registro ? Number(registro.consumo_kwh) : 0,
      valor_pago: registro ? Number(registro.valor_pago) : 0,
      bandeira_tarifaria: registro?.bandeira_tarifaria || 'verde',
      preco_te: registro ? Number(registro.preco_te || 0) : 0,
      preco_tusd: registro ? Number(registro.preco_tusd || 0) : 0,
      preco_bandeira: registro ? Number(registro.preco_bandeira || 0) : 0,
      observacoes: registro?.observacoes || '',
    },
  });

  // Atualizar valores padrão quando ultimoRegistro carregar
  useEffect(() => {
    if (!isEditing && ultimoRegistro) {
      const proximo = getProximoMesAno();
      form.setValue('mes', proximo.mes);
      form.setValue('ano', proximo.ano);
    }
  }, [ultimoRegistro, isEditing]);

  const onSubmit = async (data: RegistroFormData) => {
    const payload = {
      mes: data.mes,
      ano: data.ano,
      consumo_kwh: data.consumo_kwh,
      valor_faturado: 0, // Campo mantido para compatibilidade com banco
      valor_pago: data.valor_pago,
      bandeira_tarifaria: data.bandeira_tarifaria,
      preco_te: data.preco_te,
      preco_tusd: data.preco_tusd,
      preco_bandeira: isBandeiraComCusto(data.bandeira_tarifaria) ? data.preco_bandeira : undefined,
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
  const selectedBandeira = form.watch('bandeira_tarifaria');
  const bandeiraInfo = BANDEIRAS.find(b => b.valor === selectedBandeira);
  const mostrarPrecoBandeira = isBandeiraComCusto(selectedBandeira);

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

            {/* Preços Unitários */}
            <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
              <h4 className="font-medium text-sm">Preços Unitários (R$ com tributos)</h4>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="preco_te"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Energia Ativa TE (R$)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.000001"
                          placeholder="0.000000"
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>Tarifa de Energia</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="preco_tusd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Energia Ativa TUSD (R$)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.000001"
                          placeholder="0.000000"
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>Tarifa de Uso do Sistema</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Bandeira Tarifária Section */}
            <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
              <h4 className="font-medium text-sm">Bandeira Tarifária</h4>
              <FormField
                control={form.control}
                name="bandeira_tarifaria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bandeira</FormLabel>
                    <Select 
                      value={field.value} 
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BANDEIRAS.map((bandeira) => (
                          <SelectItem key={bandeira.valor} value={bandeira.valor}>
                            <div className="flex items-center gap-2">
                              <span 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: bandeira.cor }}
                              />
                              {bandeira.nome}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {bandeiraInfo && (
                      <FormDescription>{bandeiraInfo.descricao}</FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {mostrarPrecoBandeira && (
                <FormField
                  control={form.control}
                  name="preco_bandeira"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço Unit. Bandeira (R$ com tributos)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.000001"
                          placeholder="0.000000"
                          {...field} 
                          value={field.value || 0}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>Preço unitário por kWh devido à bandeira</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
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