import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { RegistroEnergia, getNomeMes, getNomeBandeira } from '@/types/energia';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('pt-BR').format(value);
};

export const exportToExcel = (registros: RegistroEnergia[], ano: number) => {
  const data = registros.map(r => ({
    'Mês': getNomeMes(r.mes),
    'Ano': r.ano,
    'Consumo (kWh)': Number(r.consumo_kwh),
    'Valor Faturado (R$)': Number(r.valor_faturado),
    'Valor Pago (R$)': Number(r.valor_pago),
    'Bandeira': getNomeBandeira(r.bandeira_tarifaria),
    'Valor Bandeira (R$)': Number(r.valor_bandeira || 0),
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
      formatCurrency(Number(r.valor_faturado)),
      formatCurrency(Number(r.valor_pago)),
      getNomeBandeira(r.bandeira_tarifaria),
      formatCurrency(Number(r.valor_bandeira || 0)),
    ]);

  // Summary
  const totalConsumo = registros.reduce((acc, r) => acc + Number(r.consumo_kwh), 0);
  const totalFaturado = registros.reduce((acc, r) => acc + Number(r.valor_faturado), 0);
  const totalPago = registros.reduce((acc, r) => acc + Number(r.valor_pago), 0);
  const totalBandeira = registros.reduce((acc, r) => acc + Number(r.valor_bandeira || 0), 0);

  tableData.push([
    'TOTAL',
    formatNumber(totalConsumo),
    formatCurrency(totalFaturado),
    formatCurrency(totalPago),
    '-',
    formatCurrency(totalBandeira),
  ]);

  autoTable(doc, {
    head: [['Mês', 'Consumo (kWh)', 'Faturado', 'Pago', 'Bandeira', 'Valor Bandeira']],
    body: tableData,
    startY: 50,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    footStyles: { fillColor: [229, 231, 235], textColor: [0, 0, 0], fontStyle: 'bold' },
    styles: { fontSize: 9 },
  });

  doc.save(`iluminacao-publica-${ano}.pdf`);
};
