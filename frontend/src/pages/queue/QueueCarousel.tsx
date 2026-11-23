import '../../styles/queue/QueueCarousel.css';
import { Container, Image } from 'react-bootstrap';
import Slider from 'react-slick';
import TQueue from '../../types/TQueue';

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
      className='mx-auto sticky-carousel queue-carousel d-flex justify-content-center queue-carousel-mx-auto' // Classe para o espaçamento e centralização do container
 // Fundo do container transparente
    >
      <Container
        className='queue-carousel-inner'
      >
        <Slider
          { ...settings } // Configurações do carrossel
          ref={ sliderRef } // Referência para o carrossel
        >
          { /* Mapeia a fila de músicas para renderizar cada item no carrossel */ }
          { queue.map((track, index) => (
            <Container
              key={ index } // Chave única para cada item do carrossel
              className='queue-carousel-slide'
            >
              { /* Imagem da capa da música */ }
              <Container className='d-flex justify-content-center'>
                <Image
                  alt={ track.musicName } // Texto alternativo da imagem
                  src={ track.cover } // Caminho da imagem da capa
                  className='queue-current-cover'
                />
              </Container>
              { /* Nome da música, artistas e quem adicionou a música */ }
              <h4 className='queue-current-title'>{ track.musicName }</h4>
              <h5 className='queue-current-artists'>{ track.artists }</h5>
              <p className='queue-current-added-by'>
                <span>Adicionada por</span>
                <strong>{ track.addedBy }</strong>
              </p>
            </Container>
          ))}
        </Slider>
      </Container>
    </Container>
  );
}

export default QueueCarousel; //  Exporta o componente para que possa ser usado em outros lugares
