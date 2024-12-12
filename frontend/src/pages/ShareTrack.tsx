import React, { useCallback } from 'react';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import QRCode from 'qrcode-generator';

interface Props {
  trackId: string | undefined;
}

const ShareTrack: React.FC<Props> = ({ trackId }) => {
  const generateQRCode = useCallback(() => {
    const qr = QRCode(0, 'M');
    qr.addData(`http://localhost:5173/create-track/${trackId}`);
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
          title: 'Essa é a minha pista no Colaboreca!',
          text: 'Clique no link e venha discotecar comigo!',
          url: `http://localhost:5173/create-track/${trackId}`,
        });
        console.log('Link compartilhado com sucesso!');
      } else {
        console.log('A API Web Share não está disponível.');
      }
    } catch (error) {
      console.error('Erro ao compartilhar link:', error);
    }
  }, [trackId]);

  const trackIdHead = trackId?.slice(0, 3);
  const trackIdTail = trackId?.slice(-3);

  return (
    <Container>
       <Card
        className="text-center text-light"
        style={{ backgroundColor: '#000000', boxShadow: '0 0 0 0.5px #ffffff', padding: '0' }}
      >
        <Card.Body>
          <Row className='w-100'>
            <Col md={12} className='d-flex justify-content-center align-items-center'>
              <h3 className="mb-4">O ID da sua pista é:</h3>
            </Col>
            <Col md={12} className='d-flex justify-content-center align-items-center'>
              <Col md={1} className='d-flex justify-content-center align-items-center'>
                <h1 className='track-id'> { trackIdHead } </h1>
              </Col>
              <Col md={1} className='d-flex justify-content-center align-items-center'></Col>
                <h1 className='track-id'> { trackIdTail } </h1>
              </Col>
            <Col
              md={12}
              className='d-flex flex-column justify-content-center align-items-center text-center'
            >
             <div style={{ backgroundColor: 'white', height: '200px', width: '200px' }}>
                <div className="mb-3" style={{ marginTop: '13px' }}>{generateQRCode()}</div>
              </div>
            </Col>
          </Row>
          <Button variant="primary" onClick={ handleShare } style={{margin: '20px', marginRight: '42px'}}>
            Compartilhar
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ShareTrack;
