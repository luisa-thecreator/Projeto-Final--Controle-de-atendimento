import { useState, useEffect } from 'react';
import { senhaService, guicheService } from '../services/api';
import './Atendente.css';

function Atendente() {
  const [guiches, setGuiches] = useState([]);
  const [guicheSelecionado, setGuicheSelecionado] = useState(null);
  const [senhaAtual, setSenhaAtual] = useState(null);
  const [fila, setFila] = useState([]);
  const [ultimoTipo, setUltimoTipo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGuiches();
    fetchFila();
    const interval = setInterval(fetchFila, 5000);
    return () => clearInterval(interval);
  }, []);

  // Recuperar senha atual quando selecionar um guichê ocupado ou limpar quando selecionar um livre
  useEffect(() => {
    const atualizarSenhaAtual = async () => {
      if (!guicheSelecionado) {
        setSenhaAtual(null);
        return;
      }

      if (guicheSelecionado.status === 'ocupado') {
        try {
          const { data } = await senhaService.getSenhaAtualGuiche(guicheSelecionado.id);
          if (data) {
            setSenhaAtual(data);
            setUltimoTipo(data.tipo);
          } else {
            setSenhaAtual(null);
          }
        } catch (error) {
          console.error('Erro ao recuperar senha atual:', error);
          setSenhaAtual(null);
        }
      } else {
        setSenhaAtual(null);
      }
    };
    atualizarSenhaAtual();
  }, [guicheSelecionado]);

  const fetchGuiches = async () => {
    const { data } = await guicheService.getAll();
    setGuiches(data);
  };

  const fetchFila = async () => {
    const { data } = await senhaService.getFila();
    setFila(data);
  };

  const chamarProxima = async () => {
    if (!guicheSelecionado) {
      alert('Selecione um guichê');
      return;
    }
    setLoading(true);
    try {
      const { data } = await senhaService.chamar(guicheSelecionado.id, ultimoTipo);
      setSenhaAtual(data);
      setUltimoTipo(data.tipo);
      fetchFila();
    } catch (error) {
      alert(error.response?.data?.error || 'Nenhuma senha na fila');
    }
    setLoading(false);
  };

  const iniciarAtendimento = async () => {
    if (!senhaAtual) return;
    setLoading(true);
    try {
      const { data } = await senhaService.iniciar(senhaAtual.id);
      setSenhaAtual(data);
    } catch (error) {
      alert('Erro ao iniciar atendimento');
    }
    setLoading(false);
  };

  const finalizarAtendimento = async () => {
    if (!senhaAtual) return;
    setLoading(true);
    try {
      const tempoBase = senhaAtual.tipo === 'SP' ? 15 : senhaAtual.tipo === 'SE' ? 1 : 5;
      const variacao = (Math.random() - 0.5) * (senhaAtual.tipo === 'SG' ? 6 : 10);
      const tempo = Math.max(0.5, tempoBase + variacao);

      await senhaService.finalizar(senhaAtual.id, tempo.toFixed(2));
      setSenhaAtual(null);
      fetchGuiches();
    } catch (error) {
      alert('Erro ao finalizar atendimento');
    }
    setLoading(false);
  };

  const descartarSenha = async () => {
    if (!senhaAtual) return;
    setLoading(true);
    try {
      await senhaService.descartar(senhaAtual.id);
      setSenhaAtual(null);
      fetchGuiches();
    } catch (error) {
      alert('Erro ao descartar senha');
    }
    setLoading(false);
  };

  const getFilaCount = (tipo) => fila.filter(s => s.tipo === tipo).length;

  return (
    <div className="atendente-container">
      <h1>Painel do Atendente</h1>

      <div className="guiche-selector">
        <h3>Selecione seu Guichê:</h3>
        <div className="guiches-list">
          {guiches.map(g => (
            <button
              key={g.id}
              className={`guiche-btn ${guicheSelecionado?.id === g.id ? 'selecionado' : ''} ${g.status}`}
              onClick={() => setGuicheSelecionado(g)}
            >
              Guichê {g.numero}
              <span className="status">{g.status}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="fila-resumo">
        <h3>Fila de Espera:</h3>
        <div className="fila-tipos">
          <span className="fila-tipo sp">SP: {getFilaCount('SP')}</span>
          <span className="fila-tipo sg">SG: {getFilaCount('SG')}</span>
          <span className="fila-tipo se">SE: {getFilaCount('SE')}</span>
        </div>
      </div>

      {senhaAtual ? (
        <div className="senha-atendimento">
          <h2>Atendendo:</h2>
          <div className="senha-atual">
            <span className="codigo">{senhaAtual.codigo}</span>
            <span className={`tipo tipo-${senhaAtual.tipo.toLowerCase()}`}>{senhaAtual.tipo}</span>
            <span className="status">{senhaAtual.status}</span>
          </div>

          <div className="acoes">
            {senhaAtual.status === 'chamada' && (
              <button className="btn-iniciar" onClick={iniciarAtendimento} disabled={loading}>
                Iniciar Atendimento
              </button>
            )}
            {senhaAtual.status === 'em_atendimento' && (
              <button className="btn-finalizar" onClick={finalizarAtendimento} disabled={loading}>
                Finalizar Atendimento
              </button>
            )}
            <button className="btn-descartar" onClick={descartarSenha} disabled={loading}>
              Descartar (Não Compareceu)
            </button>
          </div>
        </div>
      ) : (
        <button
          className="btn-chamar"
          onClick={chamarProxima}
          disabled={loading || !guicheSelecionado}
        >
          Chamar Próxima Senha
        </button>
      )}
    </div>
  );
}

export default Atendente;
