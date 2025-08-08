import { Col, Container, ListGroupItem, Image, Row } from 'react-bootstrap';
import TQueue from '../types/TQueue';
import { logo } from '../assets/images/characterPath';
import Slider from 'react-slick';
import { useNavigate } from 'react-router-dom';

interface Props {
  currentTrackIndex: number; // Índice da música selecionada
  isTrackOwner: boolean;
  queue: TQueue[]; // Fila de reprodução atual
  setCurrentTrackIndex: (index: number) => void;
  sliderRef: React.RefObject<Slider | null>;
  trackId: number | undefined; // ID da pista atual
  trackRefs: React.MutableRefObject<(HTMLDivElement | null)[]>; // Referências para as músicas da lista
}

// Componente da lista de músicas da fila de reprodução
const QueueList: React.FC<Props> = ({ currentTrackIndex, isTrackOwner, queue, setCurrentTrackIndex, sliderRef, trackId, trackRefs }) => { 
  const navigate = useNavigate(); // Hook para navegação
  
  // Função para pular para o item clicado no carrossel
  const handleClickTrack = (index: number) => {
    setCurrentTrackIndex(index); // Atualiza o índice da música atual
    sliderRef.current?.slickGoTo(index); // Atualiza o carrossel para o índice selecionado
  };

  return (
    <Row>
      { queue.map((track, index) => (
        // Renderiza cada item da fila dentro de uma coluna
        <Col
          key={ index } // Chave única para cada item da fila
          md={ 4 } // Define a largura da coluna em telas médias
          onClick={ () => handleClickTrack(index) } // Adiciona evento de clique para pular para o item clicado
        >
          { /* Item da lista de músicas, que é um ListGroupItem do React Bootstrap */ }
          <ListGroupItem
            ref={ (el) => { trackRefs.current[index] = el instanceof HTMLDivElement ? el : null; } } // Adiciona a referência ao item da fila
            style={{
              backgroundColor: 'transparent', // Cor de fundo do item da lista
              borderBottom: 'none', // Remove a borda inferior do item da lista
              cursor: 'pointer' // Define o cursor como ponteiro para indicar que é clicável
            }}
          >
            { /* Container para o conteúdo do item da lista */ }
            <Container
              className='d-flex align-items-center' // Classes para alinhar o conteúdo do item da lista
              style={{ backgroundColor: currentTrackIndex === index ? '#23272b' : '' }} // Define o estilo do item da lista
            >
              { /* Verifica se a música tem uma imagem de personagem, caso contrário, usa o logo padrão */ }
              { track.characterPath ? (
                // Renderiza o popover com as opções de perfil e chat para o DJ
                <Image
                  alt={ `Música adicionada por ${ track.addedBy }` }
                  className='img-thumbnail i' // Classe para estilizar a imagem
                  onClick={ () => navigate(
                    isTrackOwner ? `/track-info/profile/${ trackId }/${ track.djId }` : `/track/profile/${ trackId }/${ track.djId }`
                  ) } // Navega para a página de perfil do DJ ou da música
                  // Define o estilo da imagem
                  style={{
                    backgroundColor: '#000000', // Cor de fundo da imagem
                    cursor: 'pointer', // Define o cursor como ponteiro para indicar que é clicável
                    height: '70px', // Altura da imagem
                    width: '70px' // Largura da imagem
                  }}
                  src={ track.characterPath } // Caminho da imagem do personagem
                />
              ) : (
                <Image
                  alt='Logo do Colaboreca' // Texto alternativo da imagem
                  className='img-thumbnail' // Classe para estilizar a imagem
                  // Define o estilo da imagem
                  style={{
                    width: '70px', // Largura da imagem
                    height: '70px', // Altura da imagem
                    backgroundColor: '#000000', // Cor de fundo da imagem
                  }}
                  src={ logo } // Caminho da imagem do logo
                />
              )}
              { /* Container para o texto do item da lista */ }
              <Container
                className='hide-scrollbar' // Classe para esconder a barra de rolagem
                // Define o estilo do container de texto
                style={{
                  flexDirection: 'column', // Direção do layout do container
                  margin: '8px', // Margem do container
                  maxWidth: '200px' // Largura máxima do container
                }}
              >
                { /* Nome do DJ que adicionou a música */ }
                <h5
                  className='text-light' // Cor do texto
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
                  className='text-light' // Cor do texto
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