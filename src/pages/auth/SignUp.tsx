import { useState, useEffect } from "react";
import { getTipoUtilizador ,createUtilizador } from "wasp/client/operations";
import './SignUp.css'; 

export function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    telemovel: "",
    nif: "",
    dataNascimento: "",
    concelho: "",
    distrito: "",
    localidade: "",
    tipoUtilizadorId: "", // Inicialmente vazio
  });

  const [tipoUtilizador, setTipoUtilizador] = useState<{ TipoUtilizadorId: number; Descricao: string }[]>([]); 

  // Buscar os tipos de utilizador ao carregar a página
  useEffect(() => {
    async function fetchTipoUtilizador() {
      try {
        const tipos = await getTipoUtilizador(); // Chama a API corretamente
        setTipoUtilizador(tipos); // Define os tipos corretamente
      } catch (error) {
        console.error("Erro ao buscar tipo de utilizador:", error);
      }
    }
    fetchTipoUtilizador();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, tipoUtilizadorId: e.target.value }); // Guarda o ID do tipo de utilizador
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const newUser = await createUtilizador({
        Nome: formData.name,
        DataNascimento: new Date(formData.dataNascimento),
        NIF: formData.nif,
        PalavraPasse: formData.password,
        Morada: {
          Concelho: formData.concelho,
          Distrito: formData.distrito,
          CodigoPostal: { Localidade: formData.localidade },
        },
        Contacto: {
          Email: formData.email,
          Telemovel: formData.telemovel,
        },
        TipoUtilizadorId: parseInt(formData.tipoUtilizadorId), // Envia o ID correto
      });

      console.log("User Registered: ", newUser);
      alert("Utilizador adicionado com sucesso!");
    } catch (error) {
      console.error("Error signing up: ", error);
      alert("Registo falhou. Por favor, tente novamente.");
    }
  };

  return (
    <div className="signup-container">
      <h2>Registe um novo Utilizador</h2>
      <p className="subtitle">Preencha os dados</p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Nome"
          value={formData.name}
          onChange={handleChange}
          required
        />
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
          required
        />
        <input
          type="text"
          name="telemovel"
          placeholder="Telemovel"
          value={formData.telemovel}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="nif"
          placeholder="NIF"
          value={formData.nif}
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="dataNascimento"
          value={formData.dataNascimento}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="concelho"
          placeholder="Concelho"
          value={formData.concelho}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="distrito"
          placeholder="Distrito"
          value={formData.distrito}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="localidade"
          placeholder="Código Postal"
          value={formData.localidade}
          onChange={handleChange}
          required
        />

        {/* Dropdown para escolher o tipo de utilizador */}
        <select
          name="tipoUtilizadorId"
          value={formData.tipoUtilizadorId}
          onChange={handleSelectChange}
          required
        >
          <option value="">Selecione o tipo de utilizador</option>
          {tipoUtilizador.map((tipo) => (
            <option key={tipo.TipoUtilizadorId} value={tipo.TipoUtilizadorId}>
              {tipo.Descricao} {/* Exibe a descrição do tipo de utilizador */}
            </option>
          ))}
        </select>

        <button type="submit">Adicionar Utilizador</button>
      </form>
    </div>
  );
}
