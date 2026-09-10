import { lazy, Suspense, useCallback, useState } from 'react';
import { Button, Card, Col, Container, Image, Modal, Row, Spinner } from 'react-bootstrap';
import QRCode from 'qrcode-generator';

// Componentes que não precisam ser carregados inicialmente
const ShareTrackOptions = lazy(() => import('./ShareTrackOptions'));

// Props recebidas
interface Props {
  onHide: () => void; // Função para abrir o popup
  show: boolean; // Estado de visibilidade do popup
  trackId: string | undefined; // ID da pista a ser compartilhada
}

// Componente ShareTrackPopup que é responsável por gerar e compartilhar o QR Code da pista e o link de compartilhamento
const ShareTrackPopup: React.FC<Props> = ({ onHide, show, trackId }) => {
  const [showShareTrackOptions, setShowShareTrackOptions] = useState(false); // Estado para controlar a visibilidade do popup de compartilhamento

  // Função para gerar o QR Code da pista
  const generateQRCode = useCallback(() => {
    const qr = QRCode(0, 'M'); // Cria uma instância do QR Code com nível de correção 'M'
    qr.addData(`http://localhost:5173/enter-track/${ trackId }`); // Adiciona a URL da pista ao QR Code
    qr.make(); // Gera o QR Code

    const canvas = document.createElement('canvas'); // Cria um elemento canvas para desenhar o QR Code
    const context = canvas.getContext('2d'); // Obtém o contexto 2D do canvas

    // Define o tamanho do canvas com base no número de módulos do QR Code
    if (context) {
      const squareSize = 6; // Define o tamanho de cada quadrado do QR Code
      canvas.width = qr.getModuleCount() * squareSize; // Define a largura do canvas
      canvas.height = qr.getModuleCount() * squareSize; // Define a altura do canvas

      // Desenha o QR Code no canvas
      for (let row = 0; row < qr.getModuleCount(); row++) {
        // Percorre cada linha do QR Code
        for (let col = 0; col < qr.getModuleCount(); col++) {
          // Percorre cada coluna do QR Code
          if (qr.isDark(row, col)) {
            context.fillRect(col * squareSize, row * squareSize, squareSize, squareSize); // Desenha um quadrado preto se o módulo for escuro
          }
        }
      }
    }

    const dataURL = canvas.toDataURL('image/png'); // Converte o canvas em uma URL de dados (data URL) no formato PNG

    return <Image src={ dataURL } alt='QR Code' className='img-fluid rounded' />;
  }, [trackId]);

  // Renderiza o componente ShareTrack
  return (
    /* Modal para compartilhar a pista ou mostrar detalhes da pista */
    <Modal
      className='custom-modal' // Classe personalizada para o modal
      onHide={ onHide } // Chama a função para fechar o modal
      show={ show } // Controla a visibilidade do modal
      size='lg' // Tamanho do modal
    >
      <Suspense fallback={ <Spinner /> }>
        <ShareTrackOptions
          show={ showShareTrackOptions }
          onHide={ () => setShowShareTrackOptions(false) }
          trackId={ trackId || '' }
        />
      </Suspense>
      { /* Cabeçalho do modal */ }
      <Modal.Header
        className='custom-modal-header' // Classe personalizada para o cabeçalho do modal
        closeButton  // Botão para fechar o modal
      >
        { /* Título do modal */ }
        <Modal.Title>
          Compartilhar Pista
        </Modal.Title>
      </Modal.Header>
      { /* Corpo do modal */ }
      <Modal.Body>
        <Container>
          {/* Card que exibe o QR Code e o PIN da pista */}
          <Card
            className='text-center text-light'
            style={{ boxShadow: '0 0 0 0.5px #ffffff', padding: '0' }}
          >
            <Card.Body>
              {/* Linha que centraliza o conteúdo do card */}
              <Row className='w-100 justify-content-center align-items-center m-0'>
                <Col xs={12} className='d-flex flex-column justify-content-center align-items-center' style={{ color: '#fff4c2' }}>
                  <h3 className='mb-4'>O PIN da sua pista é:</h3>
                  <h1 className='track-id' style={{ letterSpacing: '2px', margin: 0 }}>
                    { trackId ? `${trackId.slice(0, 3)} ${trackId.slice(3, 6)}` : '' }
                  </h1>
                  <div
                    style={{
                      backgroundColor: '#fff4c2', // Cor de fundo
                      height: '200px',
                      marginTop: '20px',
                      width: '200px',
                      borderRadius: '12px', // Ajuste o valor para mais ou menos arredondado
                      padding: '10px', // Espaço interno entre a borda e o QR Code
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    <div className='mb-3' style={{ marginTop: '13px' }}>{ generateQRCode() }</div>
                  </div>
                </Col>
              </Row>
              { /* Botão para compartilhar a pista */ }
              <Container className='d-flex justify-content-center align-items-center gap-2 mt-3'>
                <Button 
                  className='primary-button'
                  onClick={() => setShowShareTrackOptions(true)}
                >
                  Compartilhar
                </Button>
              </Container>
            </Card.Body>
          </Card>
        </Container>
      </Modal.Body>
    </Modal>
  );
};

export default ShareTrackPopup; // Exporta o compontente ShareTrack
