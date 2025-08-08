import { Modal, Row, Col, Image } from 'react-bootstrap';
import { charactersPaths } from '../assets/images/characterPath';

// Props para o componente CharactersSelectPopup
interface Props {
  onHide: () => void; // Função para fechar o popup
  setEditedCharacterPath: (characterPath: string) => void;
  setShowCharacterPopup: (show: boolean) => void; // Função para mostrar ou esconder o popup de seleção de personagens
  show: boolean; // Estado para controlar a visibilidade do popup
}

// Componente de popup para seleção de personagens
const CharactersSelectPopup: React.FC<Props> = ({ show, setEditedCharacterPath, setShowCharacterPopup, onHide }) => {
  // Função para lidar com o clique no personagem e definir o caminho do personagem editado
  const handleClickCharacter = (event: React.MouseEvent<HTMLImageElement>) => {
    const target = event.target as HTMLImageElement; // Obtém o elemento clicado
    setEditedCharacterPath(target.src); // Define o caminho do personagem editado com o src da imagem clicada
    setShowCharacterPopup(false); // Fecha o popup de seleção de avatar
  };

  return (
    <Modal
      className='custom-modal' // Classe personalizada para o modal
      onHide={ onHide } // Função chamada ao fechar o modal
      show={ show } // Estado que controla se o modal está visível
      style={{ maxHeight: '80vh', overflowY: 'auto' }} // Estilo para limitar a altura do modal e permitir rolagem
    >
      { /* Cabeçalho do modal com título e botão de fechar */ }
      <Modal.Header
        className='custom-modal-header' // Classe personalizada para o cabeçalho do modal
        closeButton // Botão para fechar o modal
        style={{ borderBottom: 'none' }} // Estilo para remover a borda inferior do cabeçalho
      >
        <Modal.Title>Escolha seu avatar</Modal.Title>
      </Modal.Header>
      { /* Corpo do modal com a lista de personagens */ }
      <Modal.Body
        className='text-center' // Classe para centralizar o texto no corpo do modal
        style={{ overflowY: 'auto' }} // Estilo para permitir rolagem vertical no corpo do modal
      >
        { /* Mapeia os caminhos dos personagens e renderiza uma imagem para cada um */ }
        <Row>
          { charactersPaths.map((character, index) => (
            // Renderiza uma coluna para cada personagem com a imagem e o evento de clique
            <Col
              className='image-col' // Classe para estilizar a coluna da imagem
              key={ index } // Chave única para cada coluna
            >
              { /* Imagem do personagem com evento de clique */ }
              <Image
                alt={ `Character ${ index }` } // Texto alternativo para a imagem
                className='image-style' // Classe para aplicar estilo à imagem
                onClick={ handleClickCharacter } // Evento de clique que chama a função handleClickCharacter
                src={ character } // Caminho da imagem do personagem
                // Estilo da imagem
                style={{
                  cursor: 'pointer', // Cursor de ponteiro ao passar o mouse
                  height: '100px', // Altura da imagem
                  margin: '10px', // Margem ao redor da imagem
                  width: '100px' // Largura da imagem
                }}
              />
            </Col>
          ))}
        </Row>
      </Modal.Body>
    </Modal>
  );
}

export default CharactersSelectPopup; // Exporta o componente CharactersSelectPopup