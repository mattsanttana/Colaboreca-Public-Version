import { useEffect, useRef, useState } from 'react';
import { Container, Image , Modal, Table} from 'react-bootstrap';
import { animated, useSpring, useTransition } from '@react-spring/web';
import { DJ } from '../types/DJ';
import PodiumChangePopup from './PodiumChangePopup';

// Props recebidas
interface Props {
  currentRanking: DJ[]; // Ranking atual
  dj: DJ | undefined; // DJ atual
  handleClose: () => void; // Função para fechar o popup
  previousRanking: DJ[]; // Ranking anterior
  showRankingChangePopup: boolean; // Estado para controlar a exibição do popup
}

// Componente principal do popup de animação de alteração de ranking
const RankingChangePopup: React.FC<Props> = ({ dj, previousRanking, currentRanking, showRankingChangePopup, handleClose }) => {
  const [displayedRanking, setDisplayedRanking] = useState<DJ[]>(previousRanking); // Ranking a ser exibido
  const [djPodium, setPodium] = useState<DJ[]>([]); // Ranking do pódio
  const [points, setPoints] = useState<{ [key: number]: number }>({}); // Armazena os pontos dos DJs
  const [rowHeight, setRowHeight] = useState(0); // Altura da linha
  const [showPodium, setShowPodium] = useState(false); // Estado para controlar a exibição do pódio
  const [showRanking, setShowRanking] = useState(true); // Estado para controlar a exibição do ranking
  const [updatedDJId, setUpdatedDJId] = useState<number | null>(null); // ID do DJ atualizado

  const sampleRowRef = useRef<HTMLTableRowElement>(null); // Ref para a linha de amostra

  // Quando abrir popup: primeiro ranque antigo, depois flip pro novo, depois highlight
  useEffect(() => {
    setDisplayedRanking([...previousRanking].sort((a, b) => b.score - a.score)); // Exibe ranking antigo

    // Aguarda 2.5s para fazer o flip
    const t1 = setTimeout(() => {
      setDisplayedRanking([...currentRanking].sort((a, b) => b.score - a.score)); // Exibe ranking novo

      // Aguarda 200 ms para fazer o highlight
      const t2 = setTimeout(() => {
        setUpdatedDJId(Number(dj?.id)); // Atualiza o ID do DJ
      }, 200);

      return () => clearTimeout(t2); // Limpa o timeout
    }, 2500);

    return () => clearTimeout(t1); // Limpa o timeout
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Quando o usuário já estiver no pódio, monta o array correto
  useEffect(() => {
    if (!showPodium) return; // Se não estiver mostrando o pódio, não faz nada

    // Cria um array com os DJs do pódio ordenado por ranking
    const top3 = [...currentRanking]
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    setPodium(top3); // Atualiza o estado do pódio

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pontos animados **imediatamente** ao abrir o popup
  useEffect(() => {
    previousRanking.forEach((prev) => {
      if (!dj) return; // Se não houver DJ, não faz nada

      setPoints((p) => ({ ...p, [prev.id]: prev.score })); // inicia no valor antigo

      const diff = dj.score - prev.score; // Diferença de pontos
    
      // Se o DJ subiu de pontos, anima a contagem
      if (diff > 0) {
        let c = prev.score; // Contador inicial
        // Intervalo para incrementar os pontos
        const iv = setInterval(() => {
          c += 1; // Incrementa os pontos de 1 em 1
          setPoints((p) => ({ ...p, [prev.id]: c })); // Atualiza os pontos
          if (c >= dj.score) clearInterval(iv); // Limpa o intervalo se chegou ao valor final
        }, 2000);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // UseEffec para medir a altura da linha
  useEffect(() => {
    // Se a linha de amostra tiver definida
    if (sampleRowRef.current) {
      const h = sampleRowRef.current.offsetHeight; // Pega a altura da linha
      setRowHeight(h > 0 ? h : 50); // Atualiza o estado da altura
    }
  }, []);

  // Rola até o DJ destacado (highlight)
  useEffect(() => {
    // Se o ID do DJ atualizado não for nulo
    if (updatedDJId !== null) {
      const el = document.getElementById(`dj-${updatedDJId}`); // Seleciona o elemento do DJ
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); // Rola até o elemento
    }
  }, [updatedDJId]);

  // Animação de flip do ranking
  const rankingChangeAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(-20px)' }, // Início da animação
    to: { opacity: 1, transform: 'translateY(0px)' }, // Fim da animação
    config: { duration: 800 }, // Configuração da animação
    onRest: () => {
      // Quando terminar o flip, se o usuário subiu pro top 3, fecha ranking e abre pódio
      if (currentRanking.some((it) => it.id === dj?.id && it.ranking <= 3)) {
        // Aguarda 4s para mostrar o ranking
        setTimeout(() => {
          setShowRanking(false); // Esconde o ranking
          setShowPodium(true); // Mostra o pódio
        }, 4000);
      }
    },
  });

  // Transição de posição das linhas
  const transitions = useTransition(
    displayedRanking, // Array de DJs a serem exibidos
    {
      keys: (it: DJ) => it.id, // Chave única para cada DJ
      from: (it) => {
        const prevIdx = previousRanking.findIndex((d) => d.id === it.id); // Índice do DJ no ranking anterior
        const curIdx = currentRanking.findIndex((d) => d.id === it.id); // Índice do DJ no ranking atual
        const h = rowHeight || 50; // Altura da linha
        return { opacity: 0, transform: `translateY(${(prevIdx - curIdx) * h}px)` }; // Cálculo da posição inicial
      },
      enter: { opacity: 1, transform: 'translateY(0px)' }, // Posição final
      config: { duration: 2000 }, // Configuração da animação
  });

  return (
    
    <Modal
      className='custom-modal custom-modal-header' // Classe personalizada
      onHide={ handleClose } // Função para fechar o popup
      show={ showRankingChangePopup } // Estado para mostrar o popup
    >
      <Modal.Header
        closeButton // Botão de fechar
        style={{ borderBottom: 'none' }} // Estilo do cabeçalho
      >
        <Modal.Title>Você subiu no ranque!</Modal.Title>
      </Modal.Header>
      <Modal.Body
        // Estilo do corpo do modal
        style={{
          maxHeight: '70vh', // Altura máxima do modal
          overflowY: 'auto' // Permite rolagem vertical
        }}
      >
        { /* Exibe o ranking se showRanking for verdadeiro */}
        { showRanking && (
          <Container className='table-responsive'>
            { /* Tabela com o ranking */ }
            <Table striped>
              { /* Cabeçalho da tabela */ }
              <thead>
                { /* Linha do cabeçalho */ }
                <tr>
                  { /* Cabeçalho da coluna vazio que vai agrupar a imagem do personagem de cada DJ */ }
                  <th 
                    className='text-light' // Classe para o cabeçalho
                    // Estilo do cabeçalho
                    style={{
                      backgroundColor: '#000000', // Cor de fundo
                      borderBottom: 'none' // Remove a borda inferior
                    }}
                  >
                  </th>
                  { /* Cabeçalho da coluna "ranque" */}
                  <th
                    className='text-light' // Classe para o cabeçalho
                    // Estilo do cabeçalho
                    style={{
                      backgroundColor: '#000000', // Cor de fundo
                      borderBottom: 'none' // Remove a borda inferior
                    }}
                  >
                    Ranque
                  </th>
                  { /* Cabeçalho da coluna "Vulgo" */}
                  <th
                    className='text-light' // Classe para o cabeçalho
                    // Estilo do cabeçalho
                    style={{
                      backgroundColor: '#000000', // Cor de fundo
                      borderBottom: 'none' // Remove a borda inferior
                    }}
                  >
                    Vulgo
                  </th>
                  { /* Cabeçalho da coluna "Pontos" */}
                  <th
                    className='text-light' // Classe para o cabeçalho
                    // Estilo do cabeçalho
                    style={{
                      backgroundColor: '#000000', // Cor de fundo
                      borderBottom: 'none' // Remove a borda inferior
                    }}
                  >
                    Pontos
                  </th>
                </tr>
              </thead>
              { /* Corpo da tabela */ }
              <tbody>
                { /* Linha usada para medir a altura */ }
                <tr
                  ref={ sampleRowRef } // Ref para a linha de amostra
                  // Estilo da linha de amostra
                  style={{
                    visibility: 'hidden', // Esconde a linha
                    position: 'absolute' // Posiciona a linha
                  }}
                >
                  <td />
                  <td />
                  <td />
                  <td />
                </tr>
                { /* Mapeia os DJs do ranking atual */ }
                { transitions((style, item) => (
                  // Animação de transição para cada DJ
                  <animated.tr
                    key={ item.id } // Chave única para cada DJ
                    id={ `dj-${ item.id }` } // ID único baseado no DJ
                    className={ Number(item.id) === Number(updatedDJId) ? 'highlighted' : '' } // Classe para destaque
                    style={{ ...style, ...rankingChangeAnimation }} // Estilo da animação
                  >
                    { /* Célula para a imagem do personagem */ }
                    <td
                      className='text-light' // Classe para a célula
                      // Estilo da célula
                      style={{
                        backgroundColor: '#000000', // Cor de fundo
                        borderBottom: 'none' // Remove a borda inferior
                      }}
                    >
                      { /* Imagem do personagem do DJ */ }
                      <Image
                        alt={ `personagem do DJ ${ item.djName }` } // Texto alternativo
                        className='img-thumbnail img-thumbnail-hover' // Classe para a imagem
                        src={ item.characterPath } // Caminho da imagem
                        // Estilo da imagem
                        style={{
                          backgroundColor: '#000000', // Cor de fundo
                          // Borda da imagem
                          border:
                            // Borda e sombra diferentes para os 3 primeiros DJs
                            item.ranking === 1
                              ? '2px solid #FFD700' // Dourado para o primeiro colocado
                              : item.ranking === 2
                              ? '2px solid #C0C0C0' // Prata para o segundo colocado
                              : item.ranking === 3
                              ? '2px solid #CD7F32' // Bronze para o terceiro colocado
                              : 'none', // Sem borda para os demais
                          // Sombra da imagem
                          boxShadow:
                            // Sombra diferente para os 3 primeiros DJs
                            item.ranking === 1
                              ? '0 0 10px #FFD700' // Dourado para o primeiro colocado
                              : item.ranking === 2
                              ? '0 0 10px #C0C0C0' // Prata para o segundo colocado
                              : item.ranking === 3
                              ? '0 0 10px #CD7F32' // Bronze para o terceiro colocado
                              : 'none',
                          cursor: 'pointer', // Cursor de ponteiro
                          height: '50px', // Altura da imagem
                          width: '50px', // Largura da imagem
                        }}
                      />
                    </td>
                    { /* Célula para o ranque */ }
                    <td
                      className='text-light' // Classe para a célula
                      // Estilo da célula
                      style={{
                        backgroundColor: '#000000', // Cor de fundo
                        borderBottom: 'none' // Remove a borda inferior
                      }}
                    >
                      { item.ranking === 0 ? '-' : item.ranking } { /* Ranque do DJ ou "-" caso o DJ não seja ranqueado */}
                    </td>
                    { /* Célula para o nome do DJ */ }
                    <td
                      className='text-light' // Classe para a célula
                      // Estilo da célula
                      style={{
                        backgroundColor: '#000000', // Cor de fundo
                        borderBottom: 'none' // Remove a borda inferior
                      }}
                    >
                      { item.djName } { /* Nome do DJ */ }
                    </td>
                    { /* Célula para os pontos do DJ */ }
                    <td
                      className='text-light' // Classe para a célula
                      // Estilo da célula
                      style={{
                        backgroundColor: '#000000', // Cor de fundo
                        borderBottom: 'none' // Remove a borda inferior
                      }}
                    >
                      { points[Number(item.id)] !== undefined ? points[Number(item.id)] : item.score } { /* Pontos do DJ */ }
                    </td>
                  </animated.tr>
                ))}
              </tbody>
            </Table>
          </Container>
        )}
        { /* Exibe o pódio se showPodium for verdadeiro */ }
        { showPodium && (
          <PodiumChangePopup dj={ dj } djPodium={ djPodium } />
        )}
      </Modal.Body>
      <Modal.Footer style={{ borderTop: 'none' }} />
    </Modal>
  );
};

export default RankingChangePopup;
