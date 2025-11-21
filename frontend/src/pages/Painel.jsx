import { useState, useEffect } from 'react';
import { senhaService } from '../services/api';
import './Painel.css';

function Painel() {
  const [senhas, setSenhas] = useState([]);

  useEffect(() => {
    const fetchPainel = async () => {
      try {
        const { data } = await senhaService.getPainel();
        setSenhas(data);
      } catch (error) {
        console.error('Erro ao buscar painel:', error);
      }
    };

    fetchPainel();
    const interval = setInterval(fetchPainel, 3000);
    return () => clearInterval(interval);
  }, []);

  const getTipoClass = (tipo) => {
    return `tipo-${tipo.toLowerCase()}`;
  };

  return (
    <div className="painel-container">
      <h1>Painel de Chamadas</h1>

      <div className="senhas-grid">
        {senhas.length === 0 ? (
          <p className="sem-senhas">Nenhuma senha chamada</p>
        ) : (
          senhas.map((senha, index) => (
            <div
              key={senha.id}
              className={`senha-card ${getTipoClass(senha.tipo)} ${index === 0 ? 'destaque' : ''}`}
            >
              <div className="senha-info">
                <span className="senha-codigo">{senha.codigo}</span>
                <span className="senha-guiche">Guichê {senha.guiche_numero}</span>
              </div>
              <span className="senha-tipo">{senha.tipo}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Painel;
