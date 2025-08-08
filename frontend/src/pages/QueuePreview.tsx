import { Card, Container, Image, Table } from 'react-bootstrap';
import { Music } from '../types/SpotifySearchResponse';

// Props do componente
type Props = {
  queue: Music[] | undefined;
}

// Componente de pré-visualização da fila (renderiza as primeiras 3 músicas da fila)
const QueuePreview: React.FC<Props> = ({ queue }) => (
  <Container className='py-4 p-0'>
    <Card
      className='text-center text-light m-0 p-0' // Classe para centralizar o texto e aplicar cor
      style={{ boxShadow: '0 0 0 0.5px #ffffff', padding: 0, margin: 0 }} // Estilo do card
    >
      <Card.Body 
        // className='p-0' // Remove o preenchimento do corpo do card
        // Estilo do corpo do card
        style={{ 
          height: '360px', // Altura fixa do card
          display: 'flex', // Flexbox para organizar o conteúdo
          flexDirection: 'column', // Direção da coluna
          justifyContent: 'space-between', // Espaçamento entre os itens
        }}
      >
        <Container
          // Estilo do container para a tabela
          className='hide-scrollbar p-0 m-0' // Classe para esconder a barra de rolagem
          style={{
            flex: 1, // Permite que o container ocupe o espaço restante
            margin: 0, // Margem
            msOverflowStyle: 'none', // Estilo para esconder a barra de rolagem no Microsoft Edge
            padding: 0, // Espeçanento
            scrollbarWidth: 'none', // Esconde a barra de rolagem no Firefox
          }}
        >
          { /* Título do card */ }
          <Card.Title className='text-start '>A seguir:</Card.Title>
          { /* Tabela para exibir as músicas da fila */ }
          <Table
            className='m-0 p-0' // Remove margens e preenchimento da tabela
            style={{
              tableLayout: 'fixed',
              width: '100%', // Largura total da tabela
              wordWrap: 'break-word', // Quebra de palavras
              margin: 0, // Margem
              padding: 0, // Espaçamento
            }}
          >
            { /* Cabeçalho da tabela */ }
            <thead>
              <tr>
                { /* Coluna da imagem do álbum */ }
                <th
                  className='text-light' // Classe para aplicar cor ao texto
                  // Estilo do cabeçalho da coluna
                  style={{
                    backgroundColor: 'transparent', // Cor de fundo do cabeçalho
                    borderBottom: 'none', // Remove a borda inferior
                    width: '50px', // largura fixa da coluna da imagem
                  }}
                />
                { /* Coluna do nome da música */ }
                <th
                  className='text-light p-0 m-0' // Classe para aplicar cor ao texto
                  // Estilo do cabeçalho da coluna
                  style={{
                    backgroundColor: 'transparent', // Cor de fundo do cabeçalho
                    borderBottom: 'none', // Remove a borda inferior
                    padding: 0, // Remove o preenchimento
                    margin: 0, // Remove a margem
                  }}
                />
              </tr>
            </thead>
            { /* Corpo da tabela com as músicas da fila */ }
            <tbody>
              { /* Mapeia as músicas da fila para criar as linhas da tabela */ }
              { queue?.map((track: Music, index: number) => (
                <tr key={ index }>
                  { /* Coluna da imagem do álbum */ }
                  <td
                    // Estilo da coluna da imagem do álbum
                    style={{
                      backgroundColor: 'transparent', // Cor de fundo da coluna
                      borderBottom: 'none', // Remove a borda inferior
                      padding: 0, // Remove o preenchimento
                      margin: 0, // Remove a margem
                      width: '50px', // largura igual à imagem
                      height: '50px' // altura igual à imagem (opcional)
                    }}
                  >
                    { /* Imagem do álbum da música */ }
                    <Image 
                      alt={ `Capa do da música ${ track.name }` } // Texto alternativo para a imagem
                      className='img-thumbnail'  // Classe para aplicar estilo de miniatura à imagem
                      src={ track.album.images[0].url } // URL da imagem do álbum
                      // Estilo da imagem
                      style={{
                        backgroundColor: 'transparent', // Cor de fundo da imagem
                        border: 'none', // Remove a borda da imagem
                        height: '50px', // Altura da imagem
                        width: '50px', // Largura da imagem
                        display: 'block', // Exibe a imagem como um bloco
                      }} 
                    />
                  </td>
                  { /* Coluna do nome da música e artista */ }
                  <td
                    className='text-light text-start p-0 m-0' // Classe para aplicar cor e posição do texto
                    // Estilo do texto
                    style={{
                      backgroundColor: 'transparent', // Fundo da imagem transparente
                      borderBottom: 'none', // Sem bordas inferior
                      margin: 0, // Margem
                      padding: 0, // Espaçamento
                      width: '50%' // Largura
                    }}
                  >
                    <div
                      style={{
                        overflow: 'hidden', // Esconde a barra de rolagem
                        textOverflow: 'ellipsis', // Adiciona reticências caso o texto for muito longo
                        whiteSpace: 'nowrap', // Não permite quebra de linha
                        width: '100%' // Largura
                      }}
                      // Texto que vai ser vispivel ao passar o mouse em cima
                      title={ track.name + ' - ' + track.artists.map((artist) => artist.name).join(', ') }
                    >
                      <strong>{ track.name} </strong>
                      <br />
                      { track.artists.map((artist) => artist.name).join(', ') }
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Container>
      </Card.Body>
    </Card>
  </Container>
)

export default QueuePreview; // Exporta o componente QueuePreview