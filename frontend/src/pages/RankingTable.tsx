import { lazy, Suspense } from 'react';
import { Button, Container, FormControl, Image, Spinner } from 'react-bootstrap';
import { FaArrowUp, FaArrowDown, FaTimes, FaStar, FaSearch, FaUserSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { animated } from '@react-spring/web';
import { DJ } from '../types/DJ';
import useRankingTable from '../utils/useRankingTable';

// Componentes que não precisam ser carregados inicialmente
const ExpelDJConfirmationPopup = lazy(() => import('./ExpelDJConfirmationPopup'));

// Props para o componente RankingTable
interface Props {
  currentRanking: DJ[]; // Ranking atual
  dj?: DJ, // DJ atual (opcional)
  isTrackOwner?: boolean; // Indica se o usuário é o dono da pista
  previousRanking: DJ[]; // Ranking anterior
  trackToken?: string; // Token da pista
}

// Componente responsável por exibir a tabela de ranking dos DJs
const RankingTable: React.FC<Props> = ({ currentRanking, dj, isTrackOwner, previousRanking, trackToken }) => {
  const navigate = useNavigate(); // Hook para navegação entre rotas

  // Hook personalizado para gerenciar o estado e lógica da tabela de ranking
  const {
    setShowConfirmModal, showConfirmModal, trackId, search, setSearch, tableRef, tableHeight, rowRefs,
    filteredRanking, points, pointDirection, updatedDJId, springs, confirmExpelDJ, handleExpelDJ, formatScore
  } = useRankingTable(currentRanking, dj, previousRanking, trackToken);

  return (
    <Container className='table-responsive'>
      { /* Carregaento preguiçoso para componentes menos importantes */ }
      <Suspense fallback={ <Spinner /> }>
        { /* Modal de confirmação para expulsar DJ */ }
        <ExpelDJConfirmationPopup
          confirmExpelDJ={ confirmExpelDJ } // Função para confirmar expulsão
          setShowConfirmModal={ setShowConfirmModal } // Função para controlar exibição do modal
          showConfirmModal={ showConfirmModal } // Estado de exibição do modal
        />
      </Suspense>
      
      { /* Barra de busca */ }
      <Container className='d-flex justify-content-end'>
        <div className='search-group my-3' style={{ width: '30%', position: 'relative' }}>
          <FaSearch className='search-icon' /> { /* Ícone de busca */ }
          { /* Verifica se há texto na busca para mostrar o ícone de limpar */ }
          { search ? (
            // Ícone de limpar busca
            <FaTimes
              className='times-icon'
              style={{ cursor: 'pointer' }}
              onClick={ () => setSearch('') } // Limpa o campo de busca
            />
          // Se não houver texto, não mostra nada
          ) : null }
          { /* Campo de entrada para busca de DJs */ }
          <FormControl
            className='search-input'
            type='text'
            placeholder='Buscar DJ'
            value={ search } // Valor do campo de busca
            onChange={e => setSearch(e.target.value)} // Atualiza o estado da busca ao digitar
            style={{
              paddingLeft: '2rem', // espaço pro ícone
              backgroundColor: '#212529',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              paddingRight: '2rem' // espaço pro ícone não cobrir texto
            }}
          />
        </div>
      </Container>
      {/* Container principal para animação */}
      <Container 
        ref={ tableRef } // Referência para medir altura
        style={{ 
          position: 'relative', 
          height: tableHeight,
          minHeight: '300px' // Garante altura mínima
        }}
      >
        { /* Mapeia o ranking filtrado para exibir cada DJ */ }
        { filteredRanking.map((dj, index) => (
          // Linha animada para cada DJ
          <animated.div
            key={ dj.id }
            ref={ el => rowRefs.current[index] = el } // Referência para medir altura da linha
            id={ `dj-${ dj.id }` } // ID para scroll
            className={ `ranking-row d-flex align-items-center mb-2 p-2 rounded ${ dj.id === updatedDJId ? 'highlighted' : '' }` } // Classe para destacar DJ atualizado
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              zIndex: 1,
              transform: springs[index].y.to(y => `translateY(${y}px)`),
              transition: 'background-color 0.3s ease',
              border: 'none',
              cursor: 'pointer',
            }}
            // Navega para o perfil do DJ ao clicar na linha
            onClick={() => navigate(
              isTrackOwner 
                ? `/track-info/profile/${ trackId }/${ dj.id }` // Rota para dono da pista
                : `/track/profile/${ trackId }/${ dj.id }` // Rota para outros usuários
            )}
          >
            {/* Posição */}
            <Container className='flex-shrink-0' style={{ width: '50px', textAlign: 'center' }}>
              <span
                className='d-inline-flex align-items-center justify-content-center'
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background:
                    dj.ranking === 1
                      ? '#FFD700' // Ouro
                      : dj.ranking === 2
                      ? '#C0C0C0' // Prata
                      : dj.ranking === 3
                      ? '#CD7F32' // Bronze
                      : '#222', // Padrão
                  color:
                    dj.ranking === 1 || dj.ranking === 2 || dj.ranking === 3
                      ? '#000' // Preto para medalhas
                      : '#fff', // Branco para os outros
                  fontWeight: 'bold',
                  fontSize: '1.3rem',
                  fontFamily: '"Bebas Neue", Oswald, Arial, sans-serif',
                  border: '2px solid #444',
                  boxShadow:
                    dj.ranking === 1
                      ? '0 0 8px #FFD700' // Brilho dourado
                      : dj.ranking === 2
                      ? '0 0 8px #C0C0C0' // Brilho prateado
                      : dj.ranking === 3
                      ? '0 0 8px #CD7F32' // Brilho bronze
                      : 'none', // Sem brilho
                }}
              >
                { dj.ranking === 0 ? '—' : dj.ranking } { /* Mostra travessão se ranking for 0 */ }
              </span>
            </Container>

            {/* Avatar e Nome */}
            <div className='d-flex align-items-center flex-grow-1'> 
              {/* Avatar */}
              <div className='flex-shrink-0 mx-2'>
                <Image
                  alt={ `Personagem do DJ ${ dj.djName }` }
                  src={ dj.characterPath }
                  className='img-thumbnail'
                  style={{
                    width: '50px',
                    height: '50px',
                    backgroundColor: '#1d1d1d',
                    border:
                      dj.ranking === 1
                        ? '2px solid #FFD700' // Ouro
                        : dj.ranking === 2
                        ? '2px solid #C0C0C0' // Prata
                        : dj.ranking === 3
                        ? '2px solid #CD7F32' // Bronze
                        : '1px solid #444', // Padrão
                    boxShadow:
                      dj.ranking === 1
                        ? '0 0 10px #FFD700' // Brilho dourado
                        : dj.ranking === 2
                        ? '0 0 10px #C0C0C0' // Brilho prateado
                        : dj.ranking === 3
                        ? '0 0 10px #CD7F32' // Brilho bronze
                        : 'none'
                  }}
                />
              </div>
              
              {/* Nome */}
              <div className='text-light'>
                { dj.djName }
              </div>
            </div>
            
            {/* Pontuação */}
            <div
              // Classe condicional para indicar aumento ou diminuição de pontos
              className={ `flex-shrink-0 text-light ${
                pointDirection[dj.id] === 'up' ? 'points-up' : pointDirection[dj.id] === 'down' ? 'points-down' : ''
              }` }
            >
              <span className='d-flex align-items-center'>
                { formatScore(points[dj.id] !== undefined ? points[dj.id] : dj.score) } { /* Formata e exibe a pontuação */ }
                <FaStar className='ms-2 points-icon' /> { /* Ícone de estrela */ }
                { pointDirection[dj.id] === 'up' && <FaArrowUp className='ms-2 point-arrow up' /> } { /* Ícone de seta para cima se pontos aumentaram */ }
                { pointDirection[dj.id] === 'down' && <FaArrowDown className='ms-2 point-arrow down' /> } { /* Ícone de seta para baixo se pontos diminuíram */ }
              </span>
            </div>
            
            {/* Botão de expulsão */}
            { isTrackOwner && (
              <div className='flex-shrink-0 ms-3'>
                <Button variant='danger' size='sm' title='Expulsar DJ' onClick={() => handleExpelDJ(dj)}>
                  <FaUserSlash /> { /* Ícone de expulsão */ }
                </Button>
              </div>
            )}
          </animated.div>
        ))}
      </Container>
    </Container>
  );
}

export default RankingTable;