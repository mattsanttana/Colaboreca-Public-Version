import React, { useCallback } from 'react';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import QRCode from 'qrcode-generator';

interface Props {
  trackId: string | undefined;
  pageType: string;
  setShowPopup: (isOpen: boolean) => void;
}

const ShareTrack: React.FC<Props> = ({ trackId, pageType, setShowPopup, }) => {
  const generateQRCode = useCallback(() => {
    const qr = QRCode(0, 'M');
    qr.addData(`http://localhost:5173/enter-track/${trackId}`);
    qr.make();

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (context) {
      const squareSize = 6;
      canvas.width = qr.getModuleCount() * squareSize;
      canvas.height = qr.getModuleCount() * squareSize;

      for (let row = 0; row < qr.getModuleCount(); row++) {
        for (let col = 0; col < qr.getModuleCount(); col++) {
          if (qr.isDark(row, col)) {
            context.fillRect(col * squareSize, row * squareSize, squareSize, squareSize);
          }
        }
      }
    }

    const dataURL = canvas.toDataURL('image/png');

    return <img src={dataURL} alt="QR Code" className="img-fluid rounded" />;
  }, [trackId]);

  const handleShare = useCallback(async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Esta é uma pista de discoteca no Colaboreca!',
          text: 'Clique no link e venha discotecar comigo!',
          url: `http://localhost:5173/enter-track/${trackId}`,
        });
        console.log('Link compartilhado com sucesso!');
      } else {
        console.log('A API Web Share não está disponível.');
      }
    } catch (error) {
      console.error('Erro ao compartilhar link:', error);
    }
  }, [trackId]);

  return (
    <Container>
       <Card
        className="text-center text-light"
        style={{ backgroundColor: '#000000', boxShadow: '0 0 0 0.5px #ffffff', padding: '0' }}
      >
        <Card.Body>
          <Row className='w-100'>
            <Col md={12} className='d-flex justify-content-center align-items-center' style={{ marginLeft: '10px' }}>
              <h3 className="mb-4">O ID da sua pista é:</h3>
            </Col>
            <Row md={12} className='d-flex justify-content-center align-items-center'>
              <Col
                md={4} // Ajuste o tamanho conforme necessário
                className="d-flex flex-column justify-content-center align-items-center"
                style={{ marginLeft: '50px' }}
              >
                <div className="d-flex justify-content-center align-items-center gap-2">
                <h1 className="track-id">
                  {trackId?.slice(0, Math.ceil(trackId.length / 2))} {/* Primeira metade */}
                  <span style={{ margin: '0 8px' }}></span> {/* Espaço no meio */}
                  {trackId?.slice(Math.ceil(trackId?.length / 2))} {/* Segunda metade */}
                </h1>
                </div>
              </Col>
              <Col
                md={12}
                className='d-flex flex-column justify-content-center align-items-center text-center'
              >
              <div style={{ backgroundColor: 'white', height: '200px', width: '200px', marginLeft: '50px' }}>
                  <div className="mb-3" style={{ marginTop: '13px' }}>{generateQRCode()}</div>
                </div>
              </Col>
            </Row>
          </Row>
          <div className="d-flex justify-content-center align-items-center gap-2 mt-3">
            <Button variant="primary" onClick={handleShare}>
              Compartilhar
            </Button>
            {pageType === 'track-info' && (
              <Button variant="secondary" onClick={() => setShowPopup(true)}>
                Editar/Excluir
              </Button>
            )}
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ShareTrack;
