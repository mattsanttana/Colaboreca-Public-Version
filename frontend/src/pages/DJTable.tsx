import { useEffect, useRef } from 'react';
import { Card, Container, Spinner } from 'react-bootstrap';
import { FaExclamationTriangle } from 'react-icons/fa';
import { djTable, djTablePlaying } from '../assets/images/characterPath';
import { DJPlayingNow } from '../types/DJ';
import PlayingNow from '../types/PlayingNow';

// Props recebidas
type Props = {
  djPlayingNow: DJPlayingNow | null; // DJ que está tocando a música atual
  playingNow: PlayingNow | null; // Música que está tocando atualmente
  showAddedByandTrackName?: boolean; // Flag para exibir o nome do DJ e da pista
  trackName?: string; // Nome da música tocando
};

// Componente DJTable responsável por exibir a mesa de discotecagem e o estado atual da música
// O componente exibe informações sobre o DJ que está tocando, a música atual e animações relacionadas
const DJTable: React.FC<Props> = ({ djPlayingNow, playingNow, showAddedByandTrackName, trackName }) => {
  const containerRef = useRef<HTMLDivElement | null>(null); // Ref para o container do texto rolante
  const scrollRef = useRef<HTMLDivElement | null>(null); // Ref para o elemento de rolagem

  // useEffect para lidar com a animação de rolagem do texto no nome da música
  useEffect(() => {
    const scrollElement = scrollRef.current; // Elemento que contém o texto rolante
    const containerElement = containerRef.current; // Container do texto rolante
  
    // Verifica se os elementos estão definidos
    if (scrollElement && containerElement) {
      const scrollWidth = scrollElement.scrollWidth; // Calcula a largura total do conteúdo rolante
      const containerWidth = containerElement.clientWidth; // Largura do container
      
      const isPlaying = playingNow && playingNow.is_playing && playingNow.currently_playing_type === 'track'; // Verifica se a música está tocando
      const scrollAmount = scrollWidth - containerWidth + 20; // Distância total que o texto precisa rolar
      
      // Verifica se a música está tocando ou se o texto é maior que o container
      if ((isPlaying || scrollWidth > containerWidth) && scrollWidth > containerWidth) {
        scrollElement.style.animation = `scroll-text ${scrollAmount / 15}s linear infinite`; // Define a animação de rolagem
        scrollElement.style.setProperty('--scroll-distance', `-${scrollAmount}px`); // Define a distância de rolagem
        // Caso contrário, remove a animação
      } else {
        scrollElement.style.animation = 'none'; // Remove a animação
      }
    }
  }, [playingNow]);
  
  // Variáveis auxiliares para renderização condicional
  const isTrackPlaying = playingNow && playingNow.is_playing && playingNow.currently_playing_type === 'track'; // Verifica se a música está tocando
  const addedByDJ = djPlayingNow?.addedBy !== undefined; // Verifica se o DJ adicionou a música
  const albumHasImage = (playingNow?.item?.album?.images?.length ?? 0) > 0; // Verifica se o álbum tem imagem

  // Renderiza o componente DJTable
  return (
    // Container principal
    <Container style={{ padding: '0px' }}>
      { /* Exibição do estado de reprodução */ }
      <Container className='d-flex justify-content-center align-items-center squeres-container'>
        { showAddedByandTrackName && (
          <>
            { /* Exibição do nome do DJ */ }
            <div className='dj-square mx-2 hide-scrollbar'>
              <div style={{ fontWeight: 'bold' }}>Discotecando:</div>
              <div>{ addedByDJ ? djPlayingNow?.addedBy : '-' }</div>
            </div>
            { /* Exibição do nome da pista */ }
            <div className='track-square mx-2 hide-scrollbar'>
              <div>{ trackName }</div>
            </div>
          </>
        )}
        <div
          className='music-square mx-2 hide-scrollbar' // Classe para estilização
          ref={ containerRef } // Ref para o container do texto rolante
        >
          <div style={{ fontWeight: 'bold' }}>Tocando:</div>
          <div
            className='music-scroll' // Classe para estilização do texto rolante
            ref={ scrollRef } // Ref para o elemento de rolagem
          >
            {/* Texto rolante com o nome da música e os artistas */}
            { isTrackPlaying && playingNow?.item
              ? `${ playingNow.item.name } - ${ playingNow.item.artists?.map((artist) => artist.name).join(', ') }`
              : 'Nenhuma música tocando'}
          </div>
        </div>
      </Container>
      { /* Renderização da mesa de DJ */ }
      <div className='dj-table-container'>
        { /* Renderiza a imagem do DJ dançando se a música foi adicionada por um DJ */ }
        { addedByDJ && isTrackPlaying && (
          <Card.Img
            alt={ `Personagem do do ${ djPlayingNow?.addedBy }` } // Descrição da imagem
            className='img-fluid dj-character-inside-table dj-dancing' // Classe para estilização
            src={ djPlayingNow?.characterPath } // Caminho da imagem do DJ
          />
        )}
        <Card.Img
          alt='Mesa de discotecagem' // Descrição da imagem
          className='img-fluid dj-table' // Classe para estilização
          src={ addedByDJ ? djTablePlaying : djTable } // Caminho da imagem da mesa de DJ
        />
        {/* Renderização condicional das notas musicais e da capa/spinner */}
        { isTrackPlaying ? (
          <>
            { /* Animação no lado superior esquero */ }
            <div className='music-notes-animation-top-left' style={{ backgroundColor: 'transparent' }}>
              <span className='music-note'>♪</span>
              <span className='music-note'>♫</span>
              <span className='music-note'>♬</span>
            </div>
            { /* Animação no lado superior direito */ }
            <div className='music-notes-animation-top-right' style={{ backgroundColor: 'transparent' }}>
              <span className='music-note'>♪</span>
              <span className='music-note'>♫</span>
              <span className='music-note'>♬</span>
            </div>
            { /* Animação no lado inferior esquerdo */ }
            <div className='music-notes-animation-bottom-left' style={{ backgroundColor: 'transparent' }}>
              <span className='music-note'>♪</span>
              <span className='music-note'>♫</span>
              <span className='music-note'>♬</span>
            </div>
            { /* Animação no lado inferior direito */ }
            <div className='music-notes-animation-bottom-right' style={{ backgroundColor: 'transparent' }}>
              <span className='music-note'>♪</span>
              <span className='music-note'>♫</span>
              <span className='music-note'>♬</span>
            </div>
            { /* Verifica se o álbum tem imagem */ }
            { albumHasImage ? (
              // Se sim, renderiza a imagem do álbum
              <Card.Img
                alt={ `Capa do álbum da música ${ playingNow.item.album.name }` }
                className='img-fluid music-inside-table'
                src={ playingNow.item.album.images[0].url }
              />
            ) : (
              // Se não, renderiza um spinner de carregamento
              <Container className='d-flex justify-content-center align-items-center music-inside-table' style={{ height: '100px' }}>
                <Spinner animation='border' role='status' />
              </Container>
            )}
          </>
          // Caso não tenha música tocando, renderiza um ícone indicando que não há música
        ) : (
          <FaExclamationTriangle className='music-inside-table' style={{ width: '60px' }} /> // Ícone de aviso
        )}
      </div>
    </Container>
  );
};

export default DJTable;  // Exporta o componente PlaybackState