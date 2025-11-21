import { useState } from 'react';
import { senhaService } from '../services/api';
import './Totem.css';

function Totem() {
  const [senhaEmitida, setSenhaEmitida] = useState(null);
  const [loading, setLoading] = useState(false);

  const emitirSenha = async (tipo) => {
    setLoading(true);
    try {
      const { data } = await senhaService.emitir(tipo);
      setSenhaEmitida(data);
      setTimeout(() => setSenhaEmitida(null), 5000);
    } catch (error) {
      alert('Erro ao emitir senha');
    }
    setLoading(false);
  };

  const getTipoLabel = (tipo) => {
    const labels = { SP: 'Prioritária', SG: 'Geral', SE: 'Exames' };
    return labels[tipo];
  };

  return (
    <div className="totem-container">
      <h1>Totem de Senhas</h1>
      <p>Selecione o tipo de atendimento:</p>

      {senhaEmitida ? (
        <div className="senha-emitida">
          <h2>Sua Senha</h2>
          <div className="senha-codigo">{senhaEmitida.codigo}</div>
          <p>{getTipoLabel(senhaEmitida.tipo)}</p>
          <p>Aguarde ser chamado no painel</p>
        </div>
      ) : (
        <div className="botoes-tipo">
          <button
            className="btn-tipo btn-sp"
            onClick={() => emitirSenha('SP')}
            disabled={loading}
          >
            <span className="tipo-codigo">SP</span>
            <span className="tipo-label">Prioritária</span>
          </button>

          <button
            className="btn-tipo btn-sg"
            onClick={() => emitirSenha('SG')}
            disabled={loading}
          >
            <span className="tipo-codigo">SG</span>
            <span className="tipo-label">Geral</span>
          </button>

          <button
            className="btn-tipo btn-se"
            onClick={() => emitirSenha('SE')}
            disabled={loading}
          >
            <span className="tipo-codigo">SE</span>
            <span className="tipo-label">Retirada de Exames</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default Totem;
