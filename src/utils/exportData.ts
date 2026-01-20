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
    minimumFractionDigits: 6,
    maximumFractionDigits: 6,
  }).format(value);
};

export const exportToExcel = (registros: RegistroEnergia[], ano: number) => {
  const data = registros.map(r => ({
    'Mês': getNomeMes(r.mes),
    'Ano': r.ano,
    'Consumo (kWh)': Number(r.consumo_kwh),
    'Valor Pago (R$)': Number(r.valor_pago),
    'TE (R$/kWh)': Number(r.preco_te || 0),
    'TUSD (R$/kWh)': Number(r.preco_tusd || 0),
    'Bandeira': getNomeBandeira(r.bandeira_tarifaria),
    'Preço Bandeira (R$/kWh)': isBandeiraComCusto(r.bandeira_tarifaria) ? Number(r.preco_bandeira || 0) : 0,
    'Observações': r.observacoes || '',
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `Consumo ${ano}`);
  
  // Auto-width columns
  const maxWidth = data.reduce((acc, row) => {
    Object.keys(row).forEach((key, i) => {
      const len = String(row[key as keyof typeof row]).length;
      acc[i] = Math.max(acc[i] || 10, len);
    });
    return acc;
  }, {} as Record<number, number>);
  
  ws['!cols'] = Object.values(maxWidth).map(w => ({ wch: w + 2 }));
  
  XLSX.writeFile(wb, `iluminacao-publica-${ano}.xlsx`);
};

export const exportToPDF = (registros: RegistroEnergia[], ano: number) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(18);
  doc.text('Relatório de Iluminação Pública', 14, 22);
  
  doc.setFontSize(12);
  doc.text(`Ano: ${ano}`, 14, 32);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 40);
  
  // Table data
  const tableData = registros
    .sort((a, b) => a.mes - b.mes)
    .map(r => [
      getNomeMes(r.mes),
      formatNumber(Number(r.consumo_kwh)),
      formatCurrency(Number(r.valor_pago)),
      formatPreco(Number(r.preco_te || 0)),
      formatPreco(Number(r.preco_tusd || 0)),
      getNomeBandeira(r.bandeira_tarifaria),
      isBandeiraComCusto(r.bandeira_tarifaria) ? formatPreco(Number(r.preco_bandeira || 0)) : '-',
    ]);

  // Summary
  const totalConsumo = registros.reduce((acc, r) => acc + Number(r.consumo_kwh), 0);
  const totalPago = registros.reduce((acc, r) => acc + Number(r.valor_pago), 0);

  tableData.push([
    'TOTAL',
    formatNumber(totalConsumo),
    formatCurrency(totalPago),
    '-',
    '-',
    '-',
    '-',
  ]);

  autoTable(doc, {
    head: [['Mês', 'Consumo (kWh)', 'Pago', 'TE', 'TUSD', 'Bandeira', 'Preço Band.']],
    body: tableData,
    startY: 50,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    footStyles: { fillColor: [229, 231, 235], textColor: [0, 0, 0], fontStyle: 'bold' },
    styles: { fontSize: 8 },
  });

  doc.save(`iluminacao-publica-${ano}.pdf`);
};
