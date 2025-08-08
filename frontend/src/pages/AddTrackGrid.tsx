// components/TrackGrid.tsx
import { Card, Col, Row, Spinner } from 'react-bootstrap';
import { Music } from '../types/SpotifySearchResponse';

// Props para o componente TrackGrid
interface Props {
  handleClick: (track: Music) => void; // Função chamada ao clicar em uma música
  isDebouncing: boolean; // Indica se está em estado de debouncing
  memoizedSearchResults: Music[]; // Resultados da pesquisa de músicas
  memoizedTopTracksInBrazil: Music[]; // Músicas mais populares no Brasil
}

const AddTrackGrid: React.FC<Props> = ({ handleClick, isDebouncing, memoizedSearchResults, memoizedTopTracksInBrazil }) => {
  // Função para renderizar as músicas em um grid
  const renderTracks = (tracks: Music[]) => (
    // Mapeia as músicas e cria um Card para cada uma
    <Row style={{ width: '100%' }}>
      { tracks.map((track, index) => (
        <Col
          className='mb-4' // Margem inferior para espaçamento
          key={ index } // Chave única para cada coluna
          xs={ 12 } sm={ 6 } md={ 4 } lg={ 3 } // Define a largura da coluna em diferentes tamanhos de tela
        >
          { /* Card que exibe a música */ }
          <Card
            className='image-col text-light' // Classe para estilizar o card
            onClick={ () => handleClick(track) } // Chama a função handleClick ao clicar no card
            // Estilo do card
            style={{
              backgroundColor: '#000', // Cor de fundo preta
              boxShadow: '0 0 0 0.5px #fff', // Sombra
              cursor: 'pointer', // Cursor de ponteiro para indicar que é clicável
              marginLeft: '5%', // Margem esquerda para espaçamento
            }}
          >
            { /* Imagem da música */ }
            <Card.Img
              src={ track.album.images[0].url } // URL da imagem do álbum
              variant='top' // Variante de imagem no topo do card
            />
            { /* Corpo do card com informações da música */ }
            <Card.Body>
              <Card.Title>{ track.name }</Card.Title>
              <Card.Text>
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
      <div
        // Estilo para o container do spinner
        style={{
          alignItems: 'center', // Alinha os itens no centro
          background: 'transparent', // Fundo transparente
          display: 'flex', // Exibe como flexbox
          height: '90vh', // Altura do container
          justifyContent: 'center', // Justifica o conteúdo no centro
          left: 0, // Alinha à esquerda
          position: 'absolute', // Posição absoluta
          top: 0, // Alinha ao topo
          width: '100%', // Largura total
          zIndex: 10 // Z-index para garantir que fique acima de outros elementos
        }}
      >
        <Spinner animation='border' className='text-light' />
      </div>
    );
  }

  // Se houver resultados de pesquisa, renderiza as músicas pesquisadas
  return (
    <>
      { memoizedSearchResults.length > 0 ? (
        <>
          <h1>Resultados da busca:</h1>
          { renderTracks(memoizedSearchResults) }
        </>
      ) : (
        <>
          <h1>Populares no Brasil:</h1>
          { renderTracks(memoizedTopTracksInBrazil) }
        </>
      )}
    </>
  );
};

export default AddTrackGrid;
