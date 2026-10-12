import { Navigate, Route, Routes } from "react-router";
import { useState } from "react";

import AdminLayout from "../components/Layout/Layout";
import Dashboard from "../pages/Dashboard/Dashboard";
import Login from "../pages/Login/Logins";
import Locacoes from "../pages/Locacoes/Locacoes";
import Clientes from "../pages/Clientes/Clientes";
import Equipamentos from "../pages/Equipamentos/Equipamentos";
import Orcamentos from "../pages/Orcamentos/Orcamentos";
import EmployeeHome from "../pages/Employee/EmployeeHome";

import { UserRole } from "../dtos/enums/role-type.enum";

export default function AppRoutes() {
  const [userRole] = useState<UserRole>(UserRole.EMPLOYEE);

  return (
    <Routes>
      {/* Login */}
      <Route path="/" element={<Login />} />

      {/* Administrador */}
      {userRole === UserRole.ADMIN && (
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/orcamentos" element={<Orcamentos />} />
          <Route path="/locacoes" element={<Locacoes />} />
          <Route path="/locacoes/nova" element={<Locacoes />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/equipamentos" element={<Equipamentos />} />
        </Route>
      )}

      {/* Funcionário */}
      {userRole === UserRole.EMPLOYEE && (
        <Route path="/employee" element={<EmployeeHome />} />
      )}

      {/* Redirecionamento */}
      <Route
        path="*"
        element={
          <Navigate
            to={
              userRole === UserRole.ADMIN
                ? "/dashboard"
                : "/employee"
            }
            replace
          />
        }
      />
    </Routes>
  );
}
