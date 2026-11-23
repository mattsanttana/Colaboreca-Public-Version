import '../../styles/queue/AddTrackGrid.css';
// components/TrackGrid.tsx
import { Card, Col, Row, Spinner } from 'react-bootstrap';
import { Music } from '../../types/SpotifySearchResponse';

// Props para o componente TrackGrid
interface Props {
  handleClick: (track: Music) => void; // Função chamada ao clicar em uma música
  isDebouncing: boolean; // Indica se está em estado de debouncing
  memoizedSearchResults: Music[]; // Resultados da pesquisa de músicas
  memoizedTopTracksInBrazil: Music[]; // Músicas mais populares no Brasil
  queueOpen: boolean; // Indica se a fila está aberta
}

const AddTrackGrid: React.FC<Props> = ({ handleClick, isDebouncing, memoizedSearchResults, memoizedTopTracksInBrazil, queueOpen }) => {
  // Função para renderizar as músicas em um grid
  const renderTracks = (tracks: Music[]) => (
    // Mapeia as músicas e cria um Card para cada uma
    <Row className='add-track-grid add-track-grid-add-track-grid'>
      { tracks.map((track, index) => (
        <Col
          className='mb-4' // Margem inferior para espaçamento
          key={ index } // Chave única para cada coluna
          xs={ 12 } sm={ 6 } md={ 4 } lg={ 3 } // Define a largura da coluna em diferentes tamanhos de tela
        >
          { /* Card que exibe a música */ }
          <Card
            className='image-col text-light gradient-border add-track-card' // Classe para estilizar o card
            onClick={ () => handleClick(track) } // Chama a função handleClick ao clicar no card
            style={{
              cursor: 'pointer', 
            }}
          >
            { /* Imagem da música */ }
            <Card.Img
              src={ track.album.images[0].url } // URL da imagem do álbum
              variant='top' // Variante de imagem no topo do card
            />
            { /* Corpo do card com informações da música */ }
            <Card.Body>
              <Card.Title className='add-track-title'>{ track.name }</Card.Title>
              <Card.Text className='add-track-artists'>
                { track.artists.map((artist) => artist.name).join(', ') }
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );

  // Se estiver em estado de debouncing, exibe um spinner
  if (isDebouncing) {
    return (
      <div className="add-track-grid-wrapper"
        // Estilo para o container do spinner
        style={{ 
          background: 'transparent', 
          display: 'flex', 
          height: '90vh', 
          justifyContent: 'center', 
          left: 0, 
          position: 'absolute', 
          top: 0, 
          width: '100%', 
          zIndex: 10 
      }}>
        <Spinner animation='border' className='text-light' />
      </div>
    );
  }

  
  return (
    <div className='add-track-results add-track-grid-add-track-results'>
      { queueOpen === false && (
        <div className="add-track-grid-wrapper-2"
          aria-live='polite'

        >
          <div className="add-track-grid-wrapper-3"

          >
            <span className="add-track-grid-label">
              A fila está fechada pelo dono da pista.
            </span>
          </div>
        </div>
      )}
      { memoizedSearchResults.length > 0 ? (
        <>
          <h1 className='add-track-section-title'>Resultados da busca:</h1>
          { renderTracks(memoizedSearchResults) }
        </>
      ) : (
        <>
          <h1 className='add-track-section-title'>Populares no Brasil:</h1>
          { renderTracks(memoizedTopTracksInBrazil) }
        </>
      )}
    </div>
  );
};

export default AddTrackGrid;
