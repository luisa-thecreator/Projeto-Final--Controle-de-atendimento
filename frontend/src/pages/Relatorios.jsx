import { useState } from 'react';
import { relatorioService } from '../services/api';
import './Relatorios.css';

function Relatorios() {
  const [tipoRelatorio, setTipoRelatorio] = useState('diario');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [relatorio, setRelatorio] = useState(null);
  const [loading, setLoading] = useState(false);

  const buscarRelatorio = async () => {
    setLoading(true);
    try {
      let response;
      if (tipoRelatorio === 'diario') {
        response = await relatorioService.getDiario(data);
      } else {
        response = await relatorioService.getMensal(ano, mes);
      }
      setRelatorio(response.data);
    } catch (error) {
      alert('Erro ao buscar relatório');
    }
    setLoading(false);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('pt-BR');
  };

  return (
    <div className="relatorios-container">
      <h1>Relatórios</h1>

      <div className="filtros">
        <div className="tipo-selector">
          <button
            className={tipoRelatorio === 'diario' ? 'active' : ''}
            onClick={() => setTipoRelatorio('diario')}
          >
            Diário
          </button>
          <button
            className={tipoRelatorio === 'mensal' ? 'active' : ''}
            onClick={() => setTipoRelatorio('mensal')}
          >
            Mensal
          </button>
        </div>

        {tipoRelatorio === 'diario' ? (
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
          />
        ) : (
          <div className="mes-ano">
            <select value={mes} onChange={(e) => setMes(e.target.value)}>
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2000, i).toLocaleString('pt-BR', { month: 'long' })}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={ano}
              onChange={(e) => setAno(e.target.value)}
              min="2020"
              max="2030"
            />
          </div>
        )}

        <button className="btn-buscar" onClick={buscarRelatorio} disabled={loading}>
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      {relatorio && (
        <div className="resultado">
          <div className="resumo">
            <div className="card">
              <h3>Total Emitidas</h3>
              <span className="valor">{relatorio.totalEmitidas}</span>
            </div>
            <div className="card">
              <h3>Total Atendidas</h3>
              <span className="valor">{relatorio.totalAtendidas}</span>
            </div>
            <div className="card">
              <h3>Taxa de Atendimento</h3>
              <span className="valor">
                {relatorio.totalEmitidas > 0
                  ? ((relatorio.totalAtendidas / relatorio.totalEmitidas) * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
          </div>

          <div className="secao">
            <h3>Por Tipo de Senha</h3>
            <table>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Emitidas</th>
                  <th>Atendidas</th>
                </tr>
              </thead>
              <tbody>
                {relatorio.porTipo?.map((item) => (
                  <tr key={item.tipo}>
                    <td><span className={`badge tipo-${item.tipo.toLowerCase()}`}>{item.tipo}</span></td>
                    <td>{item.emitidas}</td>
                    <td>{item.atendidas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="secao">
            <h3>Tempo Médio de Atendimento</h3>
            <table>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>TM (minutos)</th>
                </tr>
              </thead>
              <tbody>
                {relatorio.tempoMedio?.map((item) => (
                  <tr key={item.tipo}>
                    <td><span className={`badge tipo-${item.tipo.toLowerCase()}`}>{item.tipo}</span></td>
                    <td>{item.tm ? Number(item.tm).toFixed(2) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {relatorio.senhasDetalhadas && (
            <div className="secao">
              <h3>Detalhamento das Senhas</h3>
              <table className="tabela-detalhada">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Tipo</th>
                    <th>Status</th>
                    <th>Emissão</th>
                    <th>Atendimento</th>
                    <th>Guichê</th>
                  </tr>
                </thead>
                <tbody>
                  {relatorio.senhasDetalhadas.map((senha) => (
                    <tr key={senha.id}>
                      <td>{senha.codigo}</td>
                      <td><span className={`badge tipo-${senha.tipo.toLowerCase()}`}>{senha.tipo}</span></td>
                      <td>{senha.status}</td>
                      <td>{formatDate(senha.data_emissao)}</td>
                      <td>{formatDate(senha.data_fim_atendimento)}</td>
                      <td>{senha.guiche_numero || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Relatorios;
