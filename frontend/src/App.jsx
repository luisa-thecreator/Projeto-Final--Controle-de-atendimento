import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Totem from './pages/Totem';
import Painel from './pages/Painel';
import Atendente from './pages/Atendente';
import Relatorios from './pages/Relatorios';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <nav className="navbar">
          <div className="nav-brand">Controle de Atendimento</div>
          <div className="nav-links">
            <NavLink to="/" end>Totem</NavLink>
            <NavLink to="/painel">Painel</NavLink>
            <NavLink to="/atendente">Atendente</NavLink>
            <NavLink to="/relatorios">Relatorios</NavLink>
          </div>
        </nav>

        <main className="content">
          <Routes>
            <Route path="/" element={<Totem />} />
            <Route path="/painel" element={<Painel />} />
            <Route path="/atendente" element={<Atendente />} />
            <Route path="/relatorios" element={<Relatorios />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
