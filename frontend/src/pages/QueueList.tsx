import { Col, Container, ListGroupItem, Image, Row } from 'react-bootstrap';
import TQueue from '../types/TQueue';
import { logo } from '../assets/images/characterPath';
import Slider from 'react-slick';
import { useNavigate } from 'react-router-dom';

interface Props {
  currentTrackIndex: number; // Índice da música selecionada
  queue: TQueue[]; // Fila de reprodução atual
  setCurrentTrackIndex: (index: number) => void;
  sliderRef: React.RefObject<Slider | null>;
  trackId: number | undefined; // ID da pista atual
  trackRefs: React.MutableRefObject<(HTMLDivElement | null)[]>; // Referências para as músicas da lista
}

// Componente da lista de músicas da fila de reprodução
const QueueList: React.FC<Props> = ({ currentTrackIndex, queue, setCurrentTrackIndex, sliderRef, trackId, trackRefs }) => { 
  const navigate = useNavigate(); // Hook para navegação
  
  // Função para pular para o item clicado no carrossel
  const handleClickTrack = (index: number) => {
    setCurrentTrackIndex(index); // Atualiza o índice da música atual
    sliderRef.current?.slickGoTo(index); // Atualiza o carrossel para o índice selecionado
  };

  return (
    <Row className='queue-list'>
      { queue.map((track, index) => (
        // Renderiza cada item da fila dentro de uma coluna
        <Col
          className='queue-list-column'
          key={ index } // Chave única para cada item da fila
          md={ 4 } // Define a largura da coluna em telas médias
          onClick={ () => handleClickTrack(index) } // Adiciona evento de clique para pular para o item clicado
        >
          { /* Item da lista de músicas, que é um ListGroupItem do React Bootstrap */ }
          <ListGroupItem
            className='queue-list-item'
            ref={ (el) => { trackRefs.current[index] = el instanceof HTMLDivElement ? el : null; } } // Adiciona a referência ao item da fila
          >
            { /* Container para o conteúdo do item da lista */ }
            <Container
              className={`d-flex align-items-center queue-list-item-content ${ currentTrackIndex === index ? 'active' : '' }`}
            >
              { /* Verifica se a música tem uma imagem de personagem, caso contrário, usa o logo padrão */ }
              { track.characterPath ? (
                // Renderiza o popover com as opções de perfil e chat para o DJ
                <Image
                  alt={ `Música adicionada por ${ track.addedBy }` }
                  className='img-thumbnail i queue-contributor-image' // Classe para estilizar a imagem
                  onClick={ () => navigate( `/track/profile/${ trackId }/${ track.djId }` )} // Navega para a página de perfil do DJ ou da música
                  // Define o estilo da imagem
                  style={{ cursor: 'pointer', height: '70px', width: '70px' }}
                  src={ track.characterPath } // Caminho da imagem do personagem
                />
              ) : (
                <Image
                  alt='Logo do Colaboreca' // Texto alternativo da imagem
                  className='img-thumbnail queue-contributor-image' // Classe para estilizar a imagem
                  // Define o estilo da imagem
                  style={{ width: '70px', height: '70px' }}
                  src={ logo } // Caminho da imagem do logo
                />
              )}
              { /* Container para o texto do item da lista */ }
              <Container
                className='queue-list-copy'
              >
                { /* Nome do DJ que adicionou a música */ }
                <h5
                  className='queue-added-by'
                  // Estilo do texto
                  style={{
                    fontSize: '13px', // Tamanho da fonte
                    fontWeight: 'bold', // Fonte em negrito
                    textAlign: 'left', // Alinhamento do texto à esquerda
                    textShadow: '1px 1px 4px #000' // Sombra para melhor leitura em fundo escuro
                  }}
                >
                  { track.addedBy }
                </h5>
                <div
                  className='queue-music-detail'
                  // Estilo do texto
                  style={{
                    overflow: 'hidden', // Escolnde a barra de rolagem
                    textAlign: 'left', // Alinha o texto à esquerad
                    textOverflow: 'ellipsis', // Adiciona reticências caso o texto for longo demais
                    width: '100%', // Define a largura
                    whiteSpace: 'nowrap' // Impede a quebra ed linha
                  }}
                  title={ track.musicName + '-' + track.artists }
                >
                  <strong>{ track.musicName }</strong>
                  <br />
                  { track.artists }
                </div>
              </Container>
            </Container>
          </ListGroupItem>
        </Col>
      ))}
    </Row>
  );
}

export default QueueList; // Exporta o componente para que possa ser usado em outros lugares