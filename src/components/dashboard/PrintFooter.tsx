export const PrintFooter = () => {
  const dataAtual = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="hidden print:block print-footer">
      <p>
        Documento gerado automaticamente pelo Sistema de Gestão de Iluminação Pública - SECONSER
      </p>
      <p className="mt-1">
        Prefeitura Municipal de Niterói | {dataAtual}
      </p>
      <p className="mt-2 text-xs">
        Este documento é parte integrante do Portal de Transparência Municipal
      </p>
    </div>
  );
};
