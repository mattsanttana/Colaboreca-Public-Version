import { Container, Image } from 'react-bootstrap';
import Slider from 'react-slick';
import TQueue from '../types/TQueue';

interface Props {
  currentTrackIndex: number; // Índice da música selecionada
  queue: TQueue[]; //Fila atual
  setCurrentTrackIndex: (current: number) => void;
  sliderRef: React.RefObject<Slider>; // Referência para o slider
}

// Componente do carrosel
const QueueCarousel: React.FC<Props> = ({ queue, setCurrentTrackIndex, sliderRef }) => {
  // Configurações do carrossel
  const settings = {
    afterChange: (current: number) => setCurrentTrackIndex(current), // Atualiza o índice da música atual após a mudança no carrossel
    dots: true, // Exibe os pontos de navegação do carrossel
    infinite: true, // Permite rolagem infinita
    slidesToShow: 1, // Exibe um slide por vez
    slidesToScroll: 1, // Rola um slide por vez
    speed: 500 // Velocidade da transição entre os slides
  };

  return (
    <Container
      className='mx-auto sticky-carousel d-flex justify-content-center' // Classe para o espaçamento e centralização do container
      style={{ backgroundColor: 'transparent' }} // Fundo do container transparente
    >
      <Container
        style={{
          marginBottom: '20px', // Margem inferior do carrossel
          marginTop: '10px', // Margem superior do carrossel
          maxWidth: '300px' // Largura máxima do carrossel
        }}
      >
        <Slider
          { ...settings } // Configurações do carrossel
          ref={ sliderRef } // Referência para o carrossel
        >
          { /* Mapeia a fila de músicas para renderizar cada item no carrossel */ }
          { queue.map((track, index) => (
            <Container
              key={ index } // Chave única para cada item do carrossel
              style={{ padding: '20px' }} // Padding do item do carrossel
            >
              { /* Imagem da capa da música */ }
              <Container className='d-flex justify-content-center'>
                <Image
                  alt={ track.musicName } // Texto alternativo da imagem
                  src={ track.cover } // Caminho da imagem da capa
                  style={{ width: '150px', height: '150px' }} // Define a largura e altura da imagem
                />
              </Container>
              { /* Nome da música, artistas e quem adicionou a música */ }
              <h4>{ track.musicName }</h4>
              <h5>{ track.artists }</h5>
              <p>Adicionada por: { track.addedBy }</p>
            </Container>
          ))}
        </Slider>
      </Container>
    </Container>
  );
}

export default QueueCarousel; //  Exporta o componente para que possa ser usado em outros lugares
