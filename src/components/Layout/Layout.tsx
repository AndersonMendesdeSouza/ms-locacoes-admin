import { useState } from "react";
import { Outlet } from "react-router";
import { initialClients, initialEquipment, initialRentals } from "../../data/management";
import type { ManagementContext } from "../../types/management";

import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";

import styles from "./Layout.module.css";

export default function AdminLayout() {
  const [clients, setClients] = useState(initialClients);
  const [equipment, setEquipment] = useState(initialEquipment);
  const [rentals, setRentals] = useState(initialRentals);

  const context: ManagementContext = {
    clients, setClients, equipment, setEquipment, rentals, setRentals,
  };

  return (
    <div className={styles.container}>
      <Sidebar />

      <div className={styles.main}>
        <Header />

        <main className={styles.content}>
          <Outlet context={context} />
        </main>
      </div>
    </div>
  );
}
