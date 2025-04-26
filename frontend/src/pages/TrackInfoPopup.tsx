import { useState, useEffect, lazy, Suspense  } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Modal, Form, Spinner } from 'react-bootstrap';
import useTrack from '../utils/useTrack';

const MessagePopup = lazy(() => import('./MessagePopup')); // Componentee que não precisa ser carregado inicialmente

interface Props {
  trackToken: string; // Token da pista
  trackName: string; // Nome da pista
  setShow: (show: boolean) => void; // Função para definir o estado do popup
  setTrackName: (name: string) => void; // Função para definir o nome da pista
  show: boolean; // Estado para controlar o popup de informações da pista
}

const TrackInfoPopup: React.FC<Props> = ({ trackToken, trackName, setTrackName, show, setShow }) => {
  const [editedTrackName, setEditedTrackName] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(false); // Estado responsável por habilitar/desabilitar o botão
  const [popupMessageData, setPopupMessageData] = useState({ message: '', redirectTo: '', show: false }); // Estado responsável por armazenar os dados do popup de mensagem
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const navigate = useNavigate();
  const trackActions = useTrack();
  
  useEffect(() => {
    const isSameAsTrack = trackName === editedTrackName;
    const isNameTooShort = editedTrackName.length < 3;
    const isNameTooBig = editedTrackName.length > 32;
  
    setIsButtonDisabled(isSameAsTrack || isNameTooShort || isNameTooBig);
  }, [trackName, editedTrackName]);
  
  const handleClosePopup = () => {
    setEditedTrackName(trackName);
    setShow(false);
    setShowDeleteConfirmation(false);
  };

  const handleSaveChanges = async () => {
    if (!editedTrackName) {
      setPopupMessageData({
        message: 'O nome da pista não pode estar vazio',
        redirectTo: '',
        show: true
      });
      return;
    }

    const response = await trackActions.updateTrack(editedTrackName, trackToken);

    if (response?.status === 200) {
      setShow(false);
      setTrackName(editedTrackName);
    } else {
      setPopupMessageData({
        message: 'Erro ao tentar editar a pista, tente novamente em alguns minutos',
        redirectTo: '',
        show: true
      });
    }
  };

  const handleDeleteTrack = async () => {
    const response = await trackActions.deleteTrack(trackToken);
    if (response?.status === 200) {
      navigate('/login');
    } else {
      setPopupMessageData({
        message: 'Erro ao tentar excluir a pista, tente novamente em alguns minutos',
        redirectTo: '',
        show: true
      });
    }
  };

  return (
      <Modal className='custom-modal' show={show} onHide={handleClosePopup}>
        { /* Caso o popup tenha que ser aberto e ainda não tiver carregado renderizar um spinner */ }
        <Suspense fallback={<Spinner />}>
        {/* Componente de popup de mensagem */}
          <MessagePopup
            data={popupMessageData} // Dados da mensagm
            handleClose={() => setPopupMessageData({ ...popupMessageData, show: false })} // Função para fechar o popup
          />
        </Suspense>
        <Modal.Header closeButton className='custom-modal-header' style={{ borderBottom: 'none' }}>
          <Modal.Title>{showDeleteConfirmation ? 'Excluir Pista' : 'Editar Nome da Pista'}</Modal.Title>
        </Modal.Header>
        <Modal.Body className='text-center'>
          {showDeleteConfirmation ? (
            <p>Você tem certeza que quer excluir a pista?</p>
          ) : (
            <Form>
              <Form.Group className='mb-3'>
                <Form.Control
                  type='text'
                  value={editedTrackName || trackName}
                  onChange={(e) => setEditedTrackName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {<Form.Control
                      type='text'
                      value={editedTrackName || trackName}
                      onChange={(e) => setEditedTrackName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveChanges();
                        }
                      }}
                      className='text-center'
                      style={{ backgroundColor: 'black', color: 'white', border: '1px solid white' }}
                    />
                      handleSaveChanges();
                    }
                  }}
                  className='text-center'
                  style={{ backgroundColor: 'black', color: 'white', border: '1px solid white' }}
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer className='d-flex justify-content-center' style={{ borderTop: 'none' }}>
          {showDeleteConfirmation ? (
            <>
              <Button variant='secondary' onClick={() => setShowDeleteConfirmation(false)}>
                Não
              </Button>
              <Button variant='danger' onClick={handleDeleteTrack} className='ms-2'>
                Sim
              </Button>
            </>
          ) : (
            <>
              <Button
                variant='primary'
                disabled={isButtonDisabled}
                onClick={handleSaveChanges}
                className='me-2'
              >
                Salvar
              </Button>
              <Button variant='danger' onClick={() => setShowDeleteConfirmation(true)}>
                Excluir Pista
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
  )
};

export default TrackInfoPopup;