import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import styles from "./Login.module.css";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email || !password) return;

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      navigate("/dashboard");
    }, 700);
  };

  return (
    <main className={styles.container}>
      <section className={styles.brandSection}>
        <div className={styles.brandContent}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>MS</span>
            <span>LOCAÇÕES</span>
          </div>

          <div className={styles.brandMessage}>
            <span className={styles.badge}>PAINEL ADMINISTRATIVO</span>

            <h1>
              Sua operação.
              <br />
              <span>Nosso controle.</span>
            </h1>

            <p>
              Gerencie seus serviços, clientes e locações
              em um só lugar, com praticidade e organização.
            </p>
          </div>

          <div className={styles.brandFooter}>
            © {new Date().getFullYear()} MS Locações.
            Todos os direitos reservados.
          </div>
        </div>

        <div className={styles.decorativeCircle} />
      </section>

      <section className={styles.formSection}>
        <div className={styles.formContainer}>
          <div className={styles.mobileLogo}>
            <span className={styles.logoIcon}>MS</span>
            <span>LOCAÇÕES</span>
          </div>

          <div className={styles.formHeader}>
            <span className={styles.welcome}>BEM-VINDO DE VOLTA</span>

            <h2>Acesse sua conta</h2>

            <p>
              Insira suas credenciais para acessar
              o painel administrativo.
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="email">E-mail</label>

              <input
                id="email"
                type="email"
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <div className={styles.passwordHeader}>
                <label htmlFor="password">Senha</label>
              </div>

              <div className={styles.passwordWrapper}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className={styles.showPassword}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar no sistema"}
              {!loading && <span>→</span>}
            </button>
          </form>

          <div className={styles.securityNotice}>
            <span className={styles.securityIcon}>●</span>
            Acesso exclusivo para usuários autorizados.
          </div>
        </div>

        <div className={styles.formFooter}>
          MS Locações • Sistema de Gestão
        </div>
      </section>
    </main>
  );
}