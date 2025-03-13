import React from 'react';
import './UserDetailsModal.css';

interface UserDetailsModalProps {
  utilizador: {
    Nome: string;
    Email: string;
    NIF: string;
    DataNascimento: string;
    Morada: string;
    CodigoPostal: string;
    Pais: string;
  };
  contacto: { Telemovel: string };
  subscricoes: { EstadoSubscricao: boolean }[];
  onClose: () => void;
}

const UserDetailsModal = ({ utilizador, contacto, subscricoes, onClose }: UserDetailsModalProps) => {
  const estadoSubscricao = subscricoes.length > 0
    ? subscricoes.find(sub => sub.EstadoSubscricao) ? 'Ativa' : 'Expirada'
    : 'Sem Subscrição';

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Detalhes do Utilizador</h2>
        <div className="input-group">
          <label>Nome</label>
          <input type="text" value={utilizador.Nome} readOnly />
        </div>
        <div className="input-group">
          <label>Email</label>
          <input type="email" value={utilizador.Email} readOnly />
        </div>
        <div className="input-group">
          <label>NIF</label>
          <input type="text" value={utilizador.NIF} readOnly />
        </div>
        <div className="input-group">
          <label>Data de Nascimento</label>
          <input type="text" value={utilizador.DataNascimento} readOnly />
        </div>
        <div className="input-group">
          <label>Morada</label>
          <input type="text" value={utilizador.Morada} readOnly />
        </div>
        <div className="input-group">
          <label>Código Postal</label>
          <input type="text" value={utilizador.CodigoPostal} readOnly />
        </div>
        <div className="input-group">
          <label>País</label>
          <input type="text" value={utilizador.Pais} readOnly />
        </div>
        <div className="input-group">
          <label>Telemóvel</label>
          <input type="text" value={contacto.Telemovel} readOnly />
        </div>
        <div className="input-group">
          <label>Estado da Subscrição</label>
          <input type="text" value={estadoSubscricao} readOnly />
        </div>
        <button className="close-button" onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
};

export default UserDetailsModal;
