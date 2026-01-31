import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { RegistroEnergia, getNomeMes, getNomeBandeira, isBandeiraComCusto } from '@/types/energia';

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
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(value);
};

export const exportToExcel = (registros: RegistroEnergia[], ano: number | null) => {
  const data = registros.map(r => ({
    'Mês': getNomeMes(r.mes),
    'Ano': r.ano,
    'Consumo (kWh)': Number(r.consumo_kwh),
    'Valor Pago (R$)': Number(r.valor_pago),
    'Custo/kWh (R$)': (Number(r.valor_pago) / Number(r.consumo_kwh)).toFixed(4),
    'TE (R$/kWh)': Number(r.preco_te || 0),
    'TUSD (R$/kWh)': Number(r.preco_tusd || 0),
    'Bandeira': getNomeBandeira(r.bandeira_tarifaria),
    'Preço Bandeira (R$/kWh)': isBandeiraComCusto(r.bandeira_tarifaria) ? Number(r.preco_bandeira || 0) : 0,
    'COSIP Faturado (R$)': Number(r.cosip_faturado || 0),
    'COSIP Arrecadado (R$)': Number(r.cosip_arrecadado || 0),
    'Clientes': Number(r.cosip_clientes || 0),
    'Inadimplência (%)': Number(r.inadimplencia || 0),
    'Observações': r.observacoes || '',
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  const sheetName = ano ? `Consumo ${ano}` : 'Todos os Dados';
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  
  // Auto-width columns
  const maxWidth = data.reduce((acc, row) => {
    Object.keys(row).forEach((key, i) => {
      const len = String(row[key as keyof typeof row]).length;
      acc[i] = Math.max(acc[i] || 10, len);
    });
    return acc;
  }, {} as Record<number, number>);
  
  ws['!cols'] = Object.values(maxWidth).map(w => ({ wch: Math.min(w + 2, 30) }));
  
  const fileName = ano ? `iluminacao-publica-${ano}.xlsx` : `iluminacao-publica-completo.xlsx`;
  XLSX.writeFile(wb, fileName);
};

export const exportToPDF = (registros: RegistroEnergia[], ano: number | null) => {
  const doc = new jsPDF('landscape');
  
  // Title
  doc.setFontSize(18);
  doc.text('Relatório de Iluminação Pública - Niterói/RJ', 14, 22);
  
  doc.setFontSize(12);
  doc.text(ano ? `Ano: ${ano}` : 'Período: Todos os dados', 14, 32);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 40);
  
  // Table data
  const sortedRegistros = [...registros].sort((a, b) => 
    (b.ano * 100 + b.mes) - (a.ano * 100 + a.mes)
  );

  const tableData = sortedRegistros.map(r => [
    `${getNomeMes(r.mes)}/${r.ano}`,
    formatNumber(Number(r.consumo_kwh)),
    formatCurrency(Number(r.valor_pago)),
    `R$ ${(Number(r.valor_pago) / Number(r.consumo_kwh)).toFixed(2)}`,
    getNomeBandeira(r.bandeira_tarifaria),
    formatPreco(Number(r.preco_tusd || 0)),
    formatPreco(Number(r.preco_te || 0)),
    isBandeiraComCusto(r.bandeira_tarifaria) ? formatPreco(Number(r.preco_bandeira || 0)) : '-',
    r.cosip_arrecadado ? formatCurrency(Number(r.cosip_arrecadado)) : '-',
    r.inadimplencia !== null ? `${Number(r.inadimplencia).toFixed(1)}%` : '-',
  ]);

  // Summary
  const totalConsumo = registros.reduce((acc, r) => acc + Number(r.consumo_kwh), 0);
  const totalPago = registros.reduce((acc, r) => acc + Number(r.valor_pago), 0);
  const totalCOSIP = registros.reduce((acc, r) => acc + Number(r.cosip_arrecadado || 0), 0);

  tableData.push([
    'TOTAL',
    formatNumber(totalConsumo),
    formatCurrency(totalPago),
    `R$ ${(totalPago / totalConsumo).toFixed(2)}`,
    '-',
    '-',
    '-',
    '-',
    formatCurrency(totalCOSIP),
    '-',
  ]);

  autoTable(doc, {
    head: [['Período', 'Consumo', 'Valor Pago', 'R$/kWh', 'Bandeira', 'TUSD', 'TE', 'Band.', 'COSIP', 'Inadimpl.']],
    body: tableData,
    startY: 50,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    footStyles: { fillColor: [229, 231, 235], textColor: [0, 0, 0], fontStyle: 'bold' },
    styles: { fontSize: 7 },
  });

  const fileName = ano ? `iluminacao-publica-${ano}.pdf` : `iluminacao-publica-completo.pdf`;
  doc.save(fileName);
};
