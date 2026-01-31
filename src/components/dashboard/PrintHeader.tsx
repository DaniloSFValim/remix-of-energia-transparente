interface PrintHeaderProps {
  filtro: string;
}

export const PrintHeader = ({ filtro }: PrintHeaderProps) => {
  const dataAtual = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const periodoTexto = filtro === 'todos' 
    ? 'Todos os períodos disponíveis' 
    : `Ano de ${filtro}`;

  return (
    <div className="hidden print:flex print-header">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6A4.997 4.997 0 0 1 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"/>
          </svg>
        </div>
        <div>
          <h1>PREFEITURA MUNICIPAL DE NITERÓI</h1>
          <h2>Secretaria de Conservação e Serviços Públicos - SECONSER</h2>
          <h2>Diretoria de Iluminação Pública</h2>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-border">
        <p className="font-semibold text-lg">Relatório de Consumo e Custos de Energia Elétrica</p>
        <p className="text-sm mt-1">Iluminação Pública Municipal</p>
      </div>
      <div className="flex justify-between mt-4 text-sm">
        <p><strong>Período:</strong> {periodoTexto}</p>
        <p><strong>Emitido em:</strong> {dataAtual}</p>
      </div>
    </div>
  );
};
