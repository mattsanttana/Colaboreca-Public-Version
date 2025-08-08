import { useCallback, useState } from 'react';
import { Button, Card, Col, Container, Image, Row } from 'react-bootstrap';
import QRCode from 'qrcode-generator';
import ShareTrackPopup from './ShareTrackPopup';

// Props recebidas
interface Props {
  pageType: string; // Pra diferenciar se é um DJ ou o dono da pista
  setShowPopup: (isOpen: boolean) => void; // Função para abrir o popup
  trackId: string | undefined; // ID da pista a ser compartilhada
}

// Componente ShareTrack que é responsável por gerar e compartilhar o QR Code da pista e o link de compartilhamento
const ShareTrack: React.FC<Props> = ({ pageType, setShowPopup, trackId }) => {
  const [showSharePopup, setShowSharePopup] = useState(false); // Estado para controlar a visibilidade do popup de compartilhamento

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
    <>
      { showSharePopup && (
        <ShareTrackPopup
          show={ showSharePopup }
          handleClose={ () => setShowSharePopup(false) }
          trackId={ trackId || '' }
        />
      )}
      <Container>
        {/* Card que exibe o QR Code e o PIN da pista */}
        <Card
          className='text-center text-light'
          style={{ backgroundColor: '#121212', boxShadow: '0 0 0 0.5px #ffffff', padding: '0' }}
        >
          <Card.Body>
            {/* Linha que centraliza o conteúdo do card */}
            <Row className='w-100 justify-content-center align-items-center m-0'>
              <Col xs={12} className='d-flex flex-column justify-content-center align-items-center'>
                <h3 className='mb-4'>O PIN da sua pista é:</h3>
                <h1 className='track-id' style={{ letterSpacing: '2px', margin: 0 }}>
                  {trackId ? `${trackId.slice(0, 3)} ${trackId.slice(3, 6)}` : ''}
                </h1>
                <div
                  style={{
                    backgroundColor: 'white',
                    height: '200px',
                    marginTop: '20px',
                    width: '200px'
                  }}
                >
                  <div className='mb-3' style={{ marginTop: '13px' }}>{generateQRCode()}</div>
                </div>
              </Col>
            </Row>
            {/* Botões para compartilhar a pista e editar/excluir (se for o dono da pista) */}
            <Container className='d-flex justify-content-center align-items-center gap-2 mt-3'>
              <Button variant='primary' onClick={() => setShowSharePopup(true)}>
                Compartilhar
              </Button>
              {/* Botão para editar ou excluir a pista, visível apenas se for o dono da pista */}
              {pageType === 'track-info' && (
                <Button variant='secondary' onClick={() => setShowPopup(true)}>
                  Editar/Excluir
                </Button>
              )}
            </Container>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
};

export default ShareTrack; // Exporta o compontente ShareTrack
