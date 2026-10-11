import type { Client, Equipment, Rental } from "../types/management";

export const initialClients: Client[] = [
  { id: "CLI-001", name: "João Carlos", email: "joao@example.com", phone: "", document: "" },
  { id: "CLI-002", name: "Prefeitura Municipal", email: "eventos@example.com", phone: "", document: "" },
  { id: "CLI-003", name: "Mariana Oliveira", email: "mariana@example.com", phone: "", document: "" },
  { id: "CLI-004", name: "Empresa ABC", email: "contato@example.com", phone: "", document: "" },
];

export const initialEquipment: Equipment[] = [
  { id: "EQP-001", name: "Caixa de som ativa", category: "Sonorização", quantity: 12, status: "Disponível" },
  { id: "EQP-002", name: "Tenda 5 x 5 m", category: "Estruturas", quantity: 8, status: "Disponível" },
  { id: "EQP-003", name: "Refletor LED", category: "Iluminação", quantity: 20, status: "Disponível" },
  { id: "EQP-004", name: "Mesa de som", category: "Sonorização", quantity: 2, status: "Em manutenção" },
];

export const initialRentals: Rental[] = [
  { id: "LOC-001", clientId: "CLI-001", service: "Palco + Sonorização", date: "2026-10-15", value: 3500, status: "Confirmado" },
  { id: "LOC-002", clientId: "CLI-002", service: "Tendas + Estrutura", date: "2026-10-18", value: 5200, status: "Pendente" },
  { id: "LOC-003", clientId: "CLI-003", service: "Som + Iluminação", date: "2026-10-20", value: 1800, status: "Confirmado" },
  { id: "LOC-004", clientId: "CLI-004", service: "Palco + Tendas", date: "2026-10-22", value: 4600, status: "Em análise" },
];
