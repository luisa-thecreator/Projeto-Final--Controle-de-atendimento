const express = require('express');
const cors = require('cors');
require('dotenv').config();

const senhaRoutes = require('./routes/senhaRoutes');
const guicheRoutes = require('./routes/guicheRoutes');
const relatorioRoutes = require('./routes/relatorioRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/senhas', senhaRoutes);
app.use('/api/guiches', guicheRoutes);
app.use('/api/relatorios', relatorioRoutes);

// Rota de saúde
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
