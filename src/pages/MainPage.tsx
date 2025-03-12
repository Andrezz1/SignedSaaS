import { getUtilizadoresInfo, useQuery } from 'wasp/client/operations'
import { Utilizador } from 'wasp/entities'
import { useEffect, useState } from 'react'
import UserDetailsModal from '../components/UserDetailsModal';
import "./MainPage.css"

export const MainPage = () => {
  const { data: utilizadoresInfo, isLoading, error } = useQuery(getUtilizadoresInfo)

  return (
    <div className="container">
      <h1>Lista de Utilizadores</h1>
      {isLoading && <p>Loading...</p>}
      {error && <p className="error">Error</p>}
      {utilizadoresInfo && <UtilizadoresTable utilizadoresInfo={utilizadoresInfo} />}
    </div>
  )
}

interface UtilizadoresTableProps {
  utilizadoresInfo: {
    utilizador: Utilizador;
    subscricoes: { EstadoSubscricao: boolean }[];
    contacto: { Telemovel: string };
  }[];
}

const UtilizadoresTable = ({ utilizadoresInfo }: UtilizadoresTableProps) => {
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const toggleDropdown = (idx: number) => {
    setOpenDropdown(openDropdown === idx ? null : idx);
  };

  const handleOutsideClick = (event: MouseEvent) => {
    if (!(event.target as HTMLElement).closest('.dropdown-container')) {
      setOpenDropdown(null);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const openUserDetails = (utilizador: any, contacto: any, subscricoes: any) => {
    setSelectedUser({ utilizador, contacto, subscricoes });
    setOpenDropdown(null);
  };

  return (
    <>
      <table className="utilizadores-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Nº Telemóvel</th>
            <th>NIF</th>
            <th>Estado da Subscrição</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {utilizadoresInfo.map(({ utilizador, subscricoes, contacto }, idx) => {
            let estadoSubscricao = 'Sem Subscrição';
            if (subscricoes.length > 0) {
              const subscricaoAtiva = subscricoes.find(sub => sub.EstadoSubscricao);
              estadoSubscricao = subscricaoAtiva ? 'Ativa' : 'Expirada';
            }

            return (
              <tr key={idx}>
                <td>{utilizador.Nome}</td>
                <td>{contacto.Telemovel || 'Não disponível'}</td>
                <td>{utilizador.NIF}</td>
                <td>{estadoSubscricao}</td>
                <td className="dropdown-container">
                  <button className="settings-button" onClick={(e) => { e.stopPropagation(); toggleDropdown(idx); }}>⋮</button>
                  {openDropdown === idx && (
                    <div className="dropdown-menu">
                      <button onClick={() => openUserDetails(utilizador, contacto, subscricoes)}>Ver Detalhes</button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {selectedUser && (
        <UserDetailsModal
          utilizador={selectedUser.utilizador}
          contacto={selectedUser.contacto}
          subscricoes={selectedUser.subscricoes}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </>
  );
};
