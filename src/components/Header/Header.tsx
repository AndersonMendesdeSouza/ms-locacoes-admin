import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div>
        <h3>Painel Administrativo</h3>
      </div>

      <div className={styles.user}>
        <div className={styles.avatar}>AD</div>

        <div className={styles.userInfo}>
          <strong>Administrador</strong>
          <span>MS Locações</span>
        </div>
      </div>
    </header>
  );
}