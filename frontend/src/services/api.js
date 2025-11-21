import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api'
});

export const senhaService = {
  emitir: (tipo) => api.post('/senhas/emitir', { tipo }),
  chamar: (guicheId, ultimoTipo) => api.post('/senhas/chamar', { guicheId, ultimoTipo }),
  getPainel: () => api.get('/senhas/painel'),
  getFila: () => api.get('/senhas/fila'),
  getById: (id) => api.get(`/senhas/${id}`),
  getSenhaAtualGuiche: (guicheId) => api.get(`/senhas/guiche/${guicheId}/atual`),
  iniciar: (id) => api.put(`/senhas/${id}/iniciar`),
  finalizar: (id, tempoAtendimento) => api.put(`/senhas/${id}/finalizar`, { tempoAtendimento }),
  descartar: (id) => api.put(`/senhas/${id}/descartar`)
};

export const guicheService = {
  getAll: () => api.get('/guiches'),
  getDisponiveis: () => api.get('/guiches/disponiveis')
};

export const relatorioService = {
  getDiario: (data) => api.get(`/relatorios/diario/${data}`),
  getMensal: (ano, mes) => api.get(`/relatorios/mensal/${ano}/${mes}`)
};

export default api;
