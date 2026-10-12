import { Boxes, CalendarRange, FileText, LayoutDashboard, LogOut, UsersRound } from "lucide-react";
import { NavLink, useNavigate } from "react-router";
import styles from "./Sidebar.module.css";

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>MS</div>
        <span>MS LOCAÇÕES</span>
      </div>

      <nav className={styles.navigation} aria-label="Menu principal">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `${styles.link} ${isActive ? styles.active : ""}`
          }
        >
          <span className={`${styles.icon} ${styles.dashboardIcon}`}>
            <LayoutDashboard size={19} aria-hidden="true" />
          </span>
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/orcamentos"
          className={({ isActive }) =>
            `${styles.link} ${isActive ? styles.active : ""}`
          }
        >
          <span className={`${styles.icon} ${styles.rentalsIcon}`}>
            <FileText size={19} aria-hidden="true" />
          </span>
          <span>Orçamentos</span>
        </NavLink>

        <NavLink
          to="/locacoes"
          className={({ isActive }) =>
            `${styles.link} ${isActive ? styles.active : ""}`
          }
        >
          <span className={`${styles.icon} ${styles.rentalsIcon}`}>
            <CalendarRange size={19} aria-hidden="true" />
          </span>
          <span>Locações</span>
        </NavLink>

        <NavLink
          to="/clientes"
          className={({ isActive }) =>
            `${styles.link} ${isActive ? styles.active : ""}`
          }
        >
          <span className={`${styles.icon} ${styles.clientsIcon}`}>
            <UsersRound size={19} aria-hidden="true" />
          </span>
          <span>Clientes</span>
        </NavLink>

        <NavLink
          to="/equipamentos"
          className={({ isActive }) =>
            `${styles.link} ${isActive ? styles.active : ""}`
          }
        >
          <span className={`${styles.icon} ${styles.equipmentIcon}`}>
            <Boxes size={19} aria-hidden="true" />
          </span>
          <span>Equipamentos</span>
        </NavLink>
      </nav>

      <div className={styles.footer}>
        <button
          type="button"
          className={styles.logoutButton}
          onClick={() => navigate("/", { replace: true })}
        >
          <LogOut size={20} aria-hidden="true" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
