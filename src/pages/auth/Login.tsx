import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUtilizadoresInfo } from "wasp/client/operations"; 
import './Login.css';

export function Login() {
  const initialState = {
    email: "",
    password: "",
  };

  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const utilizadoresInfo = await getUtilizadoresInfo();

      const user = utilizadoresInfo.find(
        (userInfo) =>
          userInfo.contacto.Email === formData.email &&
          userInfo.utilizador.PalavraPasse === formData.password
      );

      if (user) {
        console.log("Login bem-sucedido para:", user);
        alert("Login bem-sucedido!");
        navigate("/mainpage");

      } else {
        alert("Credenciais inválidas. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      alert("Falha no login. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2 className="login-title">Login</h2>
        <p className="login-subtitle">Faça o login na sua conta</p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="login-input"
            required
          />
          <button type="submit" className="login-submit-button" disabled={loading}>
            {loading ? "Aguarde..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
