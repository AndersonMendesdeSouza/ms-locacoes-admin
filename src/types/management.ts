import type { Dispatch, SetStateAction } from "react";

export type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  document: string;
};

export type EquipmentStatus = "Disponível" | "Em manutenção" | "Indisponível";

export type Equipment = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  status: EquipmentStatus;
};

export type RentalStatus = "Confirmado" | "Pendente" | "Em análise" | "Finalizado";

export type Rental = {
  id: string;
  clientId: string;
  service: string;
  date: string;
  value: number;
  status: RentalStatus;
};

export type QuoteItem = {
  equipmentId: string;
  name: string;
  quantity: number;
  unitPrice: number;
};

export type Quote = {
  id: string;
  clientName: string;
  date: string;
  location: string;
  createdAt: string;
  items: QuoteItem[];
  status: "Aguardando confirmação" | "Confirmado (simulação)";
};

export type ManagementContext = {
  clients: Client[];
  setClients: Dispatch<SetStateAction<Client[]>>;
  equipment: Equipment[];
  setEquipment: Dispatch<SetStateAction<Equipment[]>>;
  rentals: Rental[];
  setRentals: Dispatch<SetStateAction<Rental[]>>;
  quotes: Quote[];
  setQuotes: Dispatch<SetStateAction<Quote[]>>;
};
