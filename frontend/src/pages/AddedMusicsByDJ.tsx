import React, { useState } from 'react';
import { Card, Container, Form, Image, Table } from 'react-bootstrap';
import { DJMusic } from '../types/SpotifySearchResponse';

// Props para o componente AddedMusicsByDJ
interface Props {
  addedMusics: DJMusic[]; // Lista de músicas adicionadas pelo DJ
}

// Componente AddedMusicsByDJ
const AddedMusicsByDJ: React.FC<Props> = ({ addedMusics }) => {
  const [addedMusicsFilter, setAddedMusicsFilter] = useState<'all' | 'played' | 'not played'>('all'); // Estado para controlar o filtro de músicas (1: Todas, 2: Tocadas, 3: Não tocadas)

  const playedMusics = addedMusics.filter((music) => music.wasPlayed); // Filtra as músicas que foram tocadas
  const notPlayedMusics = addedMusics.filter((music) => !music.wasPlayed); // Filtra as músicas que não foram tocadas
  let musicsToShow: DJMusic[] = [];

  // Determina quais músicas serão exibidas com base no filtro selecionado
  if (addedMusicsFilter === 'all') {
    musicsToShow = addedMusics; // Exibe todas as músicas adicionadas pelo DJ
  } else if (addedMusicsFilter === 'played') {
    musicsToShow = playedMusics; // Exibe apenas as músicas que foram tocadas
  } else {
    musicsToShow = notPlayedMusics; // Exibe apenas as músicas que não foram tocadas
  }

  // Renderiza o componente DJProfile
  return (
    <Card>
      { /* Formulário para filtrar as músicas adicionadas pelo DJ */ }
      <Container
        // Estilo do container para o filtro de músicas
        style={{
          display: 'flex', // Exibe o container como flex
          justifyContent: 'flex-end', // Alinha o conteúdo à direita
          alignItems: 'center', // Alinha o conteúdo verticalmente ao centro
          marginTop: '20px' // Margem superior
        }}
      >
        <Form.Select
          className='text-light' // Classe para aplicar cor ao texto
          onChange={ e => setAddedMusicsFilter(e.target.value as 'all' | 'played' | 'not played') } // Função para atualizar o filtro quando o valor mudar
          style={{ backgroundColor: '#000000', width: '140px' }} // Cor e largura do seletor
          value={ addedMusicsFilter } // Valor selecionado do filtro
        >
          <option value='all'>Todas</option> { /* Opção para renderizar todas as músicas adicionadas pelo DJ */ }
          <option value='played'>Tocadas</option> { /* Opção para renderizar apenas as músicas tocadas */ }
          <option value='not played'>Não tocadas</option> { /* Opção para renderizar apenas as músicas não tocadas */ }
        </Form.Select>
      </Container>
      { /* Renderiza o card com as músicas adicionadas pelo DJ */ }
      <Card.Body style={{ height: '36vh', overflow: 'auto' }}>
        { /* Título do card */ }
        <Card.Title className='mt-4 text-light' style={{ margin: '10px' }}>Músicas adicionadas:</Card.Title>
        { /* Verifica se há músicas adicionadas pelo DJ */ }
        { addedMusics.length > 0 ? (
          // Se houver, renderiza a tabela com as músicas
          <Container className='table-responsive'>
            <Table className='text-light'>
              <thead>
                <tr>
                  <th
                    className='text-light' // Classe para aplicar cor ao texto
                    style={{ backgroundColor: 'transparent', borderBottom: 'none' }} // Estilo do cabeçalho da tabela
                  />
                  <th
                    className='text-light'
                    style={{ backgroundColor: 'transparent', borderBottom: 'none' }}
                  />
                  <th
                    className='text-light'
                    style={{ backgroundColor: 'transparent', borderBottom: 'none' }}
                  />
                </tr>
              </thead>
              <tbody>
                { musicsToShow.map((music, index) => (
                  <tr key={ index }>
                    <td
                      className='text-light'
                      style={{ backgroundColor: 'transparent', borderBottom: 'none' }}
                    >
                      { music.name }
                    </td>
                    <td
                      className='text-light'
                      style={{ backgroundColor: 'transparent', borderBottom: 'none' }}
                    >
                      { music.artists }
                    </td>
                    <td style={{ backgroundColor: 'transparent', borderBottom: 'none' }}>
                      <Image
                        alt={ music.name } // Texto alternativo para a imagem
                        className='img-thumbnail' // Classe para aplicar estilo de miniatura à imagem
                        src={ music.cover } // URL da imagem da capa da música
                        // Estilo da imagem
                        style={{
                          backgroundColor: 'transparent', // Cor de fundo transparente
                          height: '60px', // Altura da imagem
                          width: '60px' // Largura da imagem
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Container>
        ) : (
          <Container>
            <h4 className='text-light' style={{ margin: '100px' }}>A lista está vazia</h4> { /* Mensagem exibida quando não há músicas adicionadas pelo DJ */ }
          </Container>
        )}
      </Card.Body>
    </Card>
  )
}

export default AddedMusicsByDJ; // Exporta o componente AddedMusicsByDJ