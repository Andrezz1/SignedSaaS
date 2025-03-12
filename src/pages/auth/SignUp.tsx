import { useState, useEffect } from "react";
import { getTipoUtilizador ,createUtilizador } from "wasp/client/operations";
import './SignUp.css'; 

export function Signup() {

  const initialState = {
    name: "",
    email: "",
    password: "",
    telemovel: "",
    nif: "",
    dataNascimento: "",
    concelho: "",
    distrito: "",
    localidade: "",
    tipoUtilizadorId: "", 
  };

  const [formData, setFormData] = useState(initialState);
  const [tipoUtilizador, setTipoUtilizador] = useState<{ TipoUtilizadorId: number; Descricao: string }[]>([]);
  const [formKey, setFormKey] = useState(Date.now()); 

  useEffect(() => {
    async function fetchTipoUtilizador() {
      try {
        const tipos = await getTipoUtilizador(); 
        setTipoUtilizador(tipos); 
      } catch (error) {
        console.error("Erro ao buscar tipo de utilizador:", error);
      }
    }
    fetchTipoUtilizador();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "nif" || name === "telemovel") {
      const numericValue = value.replace(/\D/g, "").slice(0, 9);
      setFormData({ ...formData, [name]: numericValue });
      return;
    }
    if (name === "name" || name === "concelho" || name === "distrito") {
      const onlyLetters = value.replace(/[^A-Za-zÀ-ÿ\s]/g, "");
      setFormData({ ...formData, [name]: onlyLetters });
      return;
    }
    if (name === "localidade") {
      let numericValue = value.replace(/\D/g, "").slice(0, 7);
      if (numericValue.length > 4) {
        numericValue = numericValue.slice(0, 4) + "-" + numericValue.slice(4);
      }
      setFormData({ ...formData, [name]: numericValue });
      return;
    }
  
    setFormData({ ...formData, [name]: value });
  };
  
  
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, tipoUtilizadorId: e.target.value }); 
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
        TipoUtilizadorId: parseInt(formData.tipoUtilizadorId),
      });
      console.log("User Registered: ", newUser);
      alert("Utilizador adicionado com sucesso!");

      setFormData(initialState);
      setFormKey(Date.now()); 

    } catch (error) {
      console.error("Error signing up: ", error);
      alert("Registo falhou. Por favor, tente novamente.");
    }
  };
  return (
    <div className="signup-page">  
      <div className="signup-container">
        <h2>Registe um novo Utilizador</h2>
        <p className="subtitle">Preencha os dados</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Nome Completo"
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
            maxLength={9}
          />
          <input
            type="text"
            name="nif"
            placeholder="NIF"
            value={formData.nif}
            onChange={handleChange}
            required
            maxLength={9}
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
            placeholder="Código Postal (xxxx-xxx)"
            value={formData.localidade}
            onChange={handleChange}
            required
          />
          <select
            name="tipoUtilizadorId"
            value={formData.tipoUtilizadorId}
            onChange={handleSelectChange}
            required
          >
            <option value="">Selecione o tipo de utilizador</option>
            {tipoUtilizador.map((tipo) => (
              <option key={tipo.TipoUtilizadorId} value={tipo.TipoUtilizadorId}>
                {tipo.Descricao}
              </option>
            ))}
          </select>
          <button type="submit">Adicionar Utilizador</button>
        </form>
      </div>
    </div>
  );
}
