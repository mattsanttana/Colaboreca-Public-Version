import { Table, Button, Container, Image, Spinner } from 'react-bootstrap';
import { DJ } from '../types/DJ';
import useTrack from '../utils/useTrack';
import { lazy, Suspense, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Componentes que não precisam ser carregados inicialmente
const ExpelDJConfirmationPopup = lazy(() => import('./ExpelDJConfirmationPopup'));

// Props para o componente RankingTable
interface Props {
  djs: DJ[]; // Lista de DJs
  isTrackOwner: boolean; // Indica se o usuário é o dono da pista
  trackId: number; // ID da pista
  trackToken: string; // Token da pista
}

// Componente responsável por exibir a tabela de ranking dos DJs
const RankingTable: React.FC<Props> = ({ djs, isTrackOwner, trackId, trackToken }) => {
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false); // Estado para controlar a exibição do modal de confirmação
  const [selectedDJ, setSelectedDJ] = useState<DJ | null>(null); // Estado para armazenar o DJ selecionado para expulsão

  const navigate = useNavigate(); // Hook para navegação entre rotas
  const trackActions = useTrack(); // Hook personalizado para ações relacionadas à pista

  // Função para confirmar a expulsão do DJ selecionado
  const confirmExpelDJ = () => {
    // Se um DJ estiver selecionado, chama a ação de expulsão e fecha o modal
    if (selectedDJ) {
      trackActions.expelDJ(selectedDJ.id, trackToken); // Chama a ação de expulsão do DJ
      setSelectedDJ(null); // Limpa o DJ selecionado
      setShowConfirmModal(false); // Fecha o modal de confirmação
    }
  };
  
  // Função para lidar com a ação de expulsar um DJ
  const handleExpelDJ = (dj: DJ) => {
    setSelectedDJ(dj); // Define o DJ selecionado para expulsão
    setShowConfirmModal(true); // Abre o modal de confirmação
  };

  return (
    // Container para a tabela de ranking
    <Container className='table-responsive'>
      <Suspense fallback={ <Spinner /> }>
        { /* Popup de confirmação de expulsão de DJ */ }
        <ExpelDJConfirmationPopup
          confirmExpelDJ={ confirmExpelDJ } // Função para confirmar a expulsão do DJ
          setShowConfirmModal={ setShowConfirmModal } // Função para fechar o modal
          showConfirmModal={ showConfirmModal } // Estado para controlar a exibição do modal
        />
      </Suspense>
      { /* Tabela de ranking dos DJs */ }
      <Table>
        { /* Cabeçalho da tabela */ }
        <thead>
          <tr>
            { /* Coluna de imagem do DJ */ }
            <th
              className='text-light'
              style={{
                backgroundColor: 'transparent',
                borderBottom: 'none'
              }}
            />
            { /* Coluna de nome do DJ */ }
            <th
              className='text-light'
              style={{
                backgroundColor: 'transparent',
                borderBottom: 'none'
              }}
            />
            { /* Coluna de pontos do DJ */ }
            <th
              className='text-light'
              style={{
                backgroundColor: 'transparent',
                borderBottom: 'none'
              }}/>
            { /* Verifica se o usuário é o dono da pista para exibir a coluna de expulsão */ }
            { isTrackOwner && (
              // Coluna de expulsão do DJ
              <th
                className='text-light'
                style={{
                  backgroundColor: 'transparent',
                  borderBottom: 'none'
                }}
              />
            )}
          </tr>
        </thead>
        { /* Corpo da tabela */ }
        <tbody>
          { /* Ordedna e mapeia os DJs e renderiza uma linha para cada um */ }
          { djs.sort((a, b) => {
            if (a.ranking === 0) return 1; // Se o ranking for 0, coloca no final
            if (b.ranking === 0) return -1; // Se o ranking for 0, coloca no final
            return a.ranking - b.ranking; // Ordena pelo ranking
            }).map((selectedDJ: DJ) => (
              <tr key={ selectedDJ.id }>
                { /* Renderiza a imagem do DJ */ }
                <td
                  id='dj-image'
                  className='text-light'
                  style={{
                    backgroundColor: 'transparent',
                    borderBottom: 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                    <span
                      style={{
                        display: 'inline-block',
                        width: 32,
                        height: 32,
                        lineHeight: '32px',
                        borderRadius: '50%',
                        background:
                          selectedDJ.ranking === 1
                            ? '#FFD700'
                            : selectedDJ.ranking === 2
                            ? '#C0C0C0'
                            : selectedDJ.ranking === 3
                            ? '#CD7F32'
                            : '#222',
                        color:
                          selectedDJ.ranking === 1 ||
                          selectedDJ.ranking === 2 ||
                          selectedDJ.ranking === 3
                            ? '#000'
                            : '#fff',
                        fontWeight: 'bold',
                        fontSize: '1.3rem',
                        fontFamily: '"Bebas Neue", Oswald, Arial, sans-serif',
                        border: '2px solid #444',
                        boxShadow:
                          selectedDJ.ranking === 1
                            ? '0 0 8px #FFD700'
                            : selectedDJ.ranking === 2
                            ? '0 0 8px #C0C0C0'
                            : selectedDJ.ranking === 3
                            ? '0 0 8px #CD7F32'
                            : 'none',
                        letterSpacing: 1,
                      }}
                    >
                      { selectedDJ.ranking === 0 ? '—' : selectedDJ.ranking }
                    </span>
                    <Image
                      alt={selectedDJ.djName}
                      className='img-thumbnail img-thumbnail-hover'
                      onClick={ () => navigate(
                        isTrackOwner ? `/track-info/profile/${ trackId }/${ selectedDJ.id }` : `/track/profile/${ trackId }/${ selectedDJ.id }`
                      )} // Navega para a página do DJ ao clicar
                      src={selectedDJ.characterPath}
                      style={{
                        backgroundColor: '#1d1d1dff',
                        border:
                          selectedDJ.ranking === 1
                            ? '2px solid #FFD700'
                            : selectedDJ.ranking === 2
                            ? '2px solid #C0C0C0'
                            : selectedDJ.ranking === 3
                            ? '2px solid #CD7F32'
                            : 'none',
                        boxShadow:
                          selectedDJ.ranking === 1
                            ? '0 0 10px #FFD700'
                            : selectedDJ.ranking === 2
                            ? '0 0 10px #C0C0C0'
                            : selectedDJ.ranking === 3
                            ? '0 0 10px #CD7F32'
                            : 'none',
                        cursor: 'pointer',
                        height: '50px',
                        width: '50px',
                      }}
                    />
                  </div>
                </td>
                { /* Renderiza o nome do DJ */ }
                <td
                 className='text-light'
                 style={{
                  backgroundColor: 'transparent',
                  borderBottom: 'none'
                 }}
                >
                  { selectedDJ.djName }
                </td>
                { /* Renderiza os pontos do DJ */ }
                <td
                  className='text-light'
                  style={{
                    backgroundColor: 'transparent',
                    borderBottom: 'none'
                  }}
                >
                  { selectedDJ.score.toLocaleString('pt-BR') } pts
                </td>
                { /* Se o usuário for o dono da pista, renderiza o botão de expulsão */ }
                { isTrackOwner && (
                  // Coluna de expulsão do DJ
                  <td
                    className='text-light' 
                    style={{
                      backgroundColor: 'transparent',
                      borderBottom: 'none'
                    }}
                  >
                    <Button
                      variant='danger'
                      onClick={ () => handleExpelDJ(selectedDJ) } // Chama a função para expulsar o DJ
                    >
                      Expulsar
                    </Button>
                  </td>
                )}
              </tr>
            ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default RankingTable;