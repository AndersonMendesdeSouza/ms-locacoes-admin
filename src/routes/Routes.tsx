import { Route, Routes } from "react-router";
import AdminLayout from "../components/Layout/Layout";
import Dashboard from "../pages/Dashboard/Dashboard";
import Login from "../pages/Login/Logins";
import Locacoes from "../pages/Locacoes/Locacoes";
import Clientes from "../pages/Clientes/Clientes";
import Equipamentos from "../pages/Equipamentos/Equipamentos";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Rota pública */}
      <Route path="/" element={<Login />} />

      {/* Rotas administrativas */}
      <Route element={<AdminLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/locacoes" element={<Locacoes />} />
        <Route path="/locacoes/nova" element={<Locacoes />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/equipamentos" element={<Equipamentos />} />
      </Route>
    </Routes>
  );
}
