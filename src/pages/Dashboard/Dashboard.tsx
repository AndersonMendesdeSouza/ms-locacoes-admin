import { useNavigate } from "react-router";
import styles from "./Dashboard.module.css";

const stats = [
  {
    title: "Locações ativas",
    value: "18",
    variation: "+12,5%",
    description: "em relação ao mês anterior",
    icon: "▤",
  },
  {
    title: "Faturamento do mês",
    value: "R$ 24.850",
    variation: "+8,2%",
    description: "em relação ao mês anterior",
    icon: "R$",
  },
  {
    title: "Eventos agendados",
    value: "12",
    variation: "+4",
    description: "novos eventos neste mês",
    icon: "▦",
  },
  {
    title: "Clientes cadastrados",
    value: "146",
    variation: "+6,8%",
    description: "em relação ao mês anterior",
    icon: "♙",
  },
];

const events = [
  {
    id: "LOC-001",
    client: "João Carlos",
    service: "Palco + Sonorização",
    date: "15/10/2026",
    value: "R$ 3.500,00",
    status: "Confirmado",
  },
  {
    id: "LOC-002",
    client: "Prefeitura Municipal",
    service: "Tendas + Estrutura",
    date: "18/10/2026",
    value: "R$ 5.200,00",
    status: "Pendente",
  },
  {
    id: "LOC-003",
    client: "Mariana Oliveira",
    service: "Som + Iluminação",
    date: "20/10/2026",
    value: "R$ 1.800,00",
    status: "Confirmado",
  },
  {
    id: "LOC-004",
    client: "Empresa ABC",
    service: "Palco + Tendas",
    date: "22/10/2026",
    value: "R$ 4.600,00",
    status: "Em análise",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className={styles.content}>
      <div className={styles.pageHeader}>
        <div>
          <span className={styles.pageSubtitle}>
            PAINEL DE CONTROLE
          </span>

          <h1>Visão geral</h1>

          <p>
            Acompanhe os principais indicadores e atividades
            da sua empresa.
          </p>
        </div>

        <button
          className={styles.primaryButton}
          onClick={() => navigate("/locacoes/nova")}
        >
          <span>+</span>
          Nova locação
        </button>
      </div>

      <div className={styles.statsGrid}>
        {stats.map((stat) => (
          <div className={styles.statCard} key={stat.title}>
            <div className={styles.statTop}>
              <span>{stat.title}</span>
              <div className={styles.statIcon}>{stat.icon}</div>
            </div>

            <strong className={styles.statValue}>
              {stat.value}
            </strong>

            <div className={styles.statFooter}>
              <span className={styles.positiveVariation}>
                {stat.variation}
              </span>
              <span>{stat.description}</span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.sectionGrid}>
        <section className={styles.summaryCard}>
          <div className={styles.cardHeader}>
            <div>
              <h2>Resumo operacional</h2>
              <p>Situação atual das locações</p>
            </div>
            <span className={styles.periodBadge}>Este mês</span>
          </div>

          <div className={styles.operationalList}>
            <div className={styles.operationalItem}>
              <div className={styles.operationalInfo}>
                <span className={styles.dotGreen} />
                <span>Confirmadas</span>
              </div>
              <strong>24</strong>
            </div>

            <div className={styles.progressTrack}>
              <div
                className={styles.progressGreen}
                style={{ width: "70%" }}
              />
            </div>

            <div className={styles.operationalItem}>
              <div className={styles.operationalInfo}>
                <span className={styles.dotYellow} />
                <span>Pendentes</span>
              </div>
              <strong>8</strong>
            </div>

            <div className={styles.progressTrack}>
              <div
                className={styles.progressYellow}
                style={{ width: "35%" }}
              />
            </div>

            <div className={styles.operationalItem}>
              <div className={styles.operationalInfo}>
                <span className={styles.dotGray} />
                <span>Finalizadas</span>
              </div>
              <strong>16</strong>
            </div>

            <div className={styles.progressTrack}>
              <div
                className={styles.progressGray}
                style={{ width: "55%" }}
              />
            </div>
          </div>
        </section>

        <section className={styles.quickAccessCard}>
          <div className={styles.cardHeader}>
            <div>
              <h2>Acesso rápido</h2>
              <p>Principais operações do sistema</p>
            </div>
          </div>

          <div className={styles.quickActions}>
            <button onClick={() => navigate("/locacoes/nova")}>
              <div className={styles.quickIcon}>+</div>
              <div>
                <strong>Nova locação</strong>
                <span>Cadastrar um novo serviço</span>
              </div>
              <span className={styles.actionArrow}>→</span>
            </button>

            <button onClick={() => navigate("/clientes")}>
              <div className={styles.quickIcon}>♙</div>
              <div>
                <strong>Gerenciar clientes</strong>
                <span>Consultar e cadastrar clientes</span>
              </div>
              <span className={styles.actionArrow}>→</span>
            </button>

            <button onClick={() => navigate("/equipamentos")}>
              <div className={styles.quickIcon}>▣</div>
              <div>
                <strong>Equipamentos</strong>
                <span>Controle de equipamentos</span>
              </div>
              <span className={styles.actionArrow}>→</span>
            </button>
          </div>
        </section>
      </div>

      <section className={styles.tableCard}>
        <div className={styles.cardHeader}>
          <div>
            <h2>Próximas locações</h2>
            <p>Eventos e serviços agendados</p>
          </div>

          <button
            className={styles.viewAllButton}
            onClick={() => navigate("/locacoes")}
          >
            Ver todas →
          </button>
        </div>

        <div className={styles.tableWrapper}>
          <table>
            <thead>
              <tr>
                <th>CÓDIGO</th>
                <th>CLIENTE</th>
                <th>SERVIÇO</th>
                <th>DATA</th>
                <th>VALOR</th>
                <th>STATUS</th>
              </tr>
            </thead>

            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td className={styles.eventId}>{event.id}</td>
                  <td className={styles.clientName}>
                    {event.client}
                  </td>
                  <td>{event.service}</td>
                  <td>{event.date}</td>
                  <td className={styles.eventValue}>
                    {event.value}
                  </td>
                  <td>
                    <span
                      className={`${styles.status} ${
                        event.status === "Confirmado"
                          ? styles.confirmed
                          : event.status === "Pendente"
                          ? styles.pending
                          : styles.analysis
                      }`}
                    >
                      {event.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
