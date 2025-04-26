import { useState, useEffect, lazy, useRef, Suspense  } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Modal, Form, Row, Col, Image, Spinner } from 'react-bootstrap';
import { DJ } from '../types/DJ';
import useDJ from '../utils/useDJ';
import { charactersPaths } from '../assets/images/characterPath';

const MessagePopup = lazy(() => import('./MessagePopup')); // Componentee que não precisa ser carregado inicialmente

interface Props {
  dj: DJ | undefined;
  djToken: string; // Token do DJ
  setShow: (show: boolean) => void; // Função para definir o estado do popup
  show: boolean; // Estado do popup
}

const DJInfoPopup: React.FC<Props> = ({ dj, djToken, setShow, show }) => {
  const [editedCharacterPath, setEditedCharacterPath] = useState<string>('');
  const [editedName, setEditedName] = useState<string>('');
  const [popupMessageData, setPopupMessageData] = useState<{message: string, redirectTo: string, show: boolean}>({
    message: '',
    redirectTo: '',
    show: false
  }); // Mensagem do popup
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showAvatarPopup, setShowAvatarPopup] = useState(false)
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const avatarRef = useRef<HTMLImageElement>(null);
  const djActions = useDJ();
  const navigate = useNavigate();
  
  useEffect(() => {
    const isSameAsDJ = editedCharacterPath === dj?.characterPath && editedName === dj?.djName;
    const isNameTooShort = editedName.length < 3;
    const isNameTooBig = editedName.length > 16;

    setIsButtonDisabled(isSameAsDJ || isNameTooShort || isNameTooBig);

    if (editedCharacterPath === '' && editedName === '' && dj) {
      setEditedCharacterPath(dj?.characterPath || '');
      setEditedName(dj?.djName || '');
    }
  }
  , [dj, editedCharacterPath, editedName, setEditedCharacterPath]);

  const handleSaveChanges = async () => {
    if (!editedName || !editedCharacterPath) {
      setPopupMessageData({
        message: 'Por favor, preencha todos os campos.',
        redirectTo: '',
        show: true
      });
      return;
    }

    const response = await djActions.updateDJ(editedName, editedCharacterPath, djToken);

    if (response?.status === 200) {
      window.location.reload();
    } else if (response?.status === 400) {
      setPopupMessageData({
        message: 'Este vulgo já existe',
        redirectTo: '',
        show: true
      });
    } else {
      setPopupMessageData({
        message: 'Algo deu errado, por favor tente novamente em alguns minutos',
        redirectTo: '',
        show: true
      });
    }
  };

  const handleDeleteDJ = () => {
    setShowDeleteConfirmation(true);
  };
  
  const confirmDeleteDJ = async () => {
    if (!dj?.id) {
      setPopupMessageData({
        message: 'Algo deu errado, por favor tente novamente em alguns estantes',
        redirectTo: '',
        show: true
      });
    }
  
    const response = await djActions.deleteDJ(djToken);
  
    if (response?.status === 200) {
      navigate('/');
    } else {
      setPopupMessageData({
        message: 'Algo deu errado, por favor tente novamente em alguns estantes',
        redirectTo: '',
        show: true
      });
    }
    setShowDeleteConfirmation(false);
  };
  
  const cancelDeleteDJ = () => {
    setShowDeleteConfirmation(false);
  };

  const handleClosePopup = () => {
    setShow(false);
    setShowAvatarPopup(false);
    setEditedCharacterPath(dj?.characterPath || '');
    setEditedName(dj?.djName || '');
  };

  const handleShowAvatarPopup = () => {
    setShowAvatarPopup(true);
  };

  const handleCloseAvatarPopup = () => {
    setShowAvatarPopup(false);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !isButtonDisabled) {
      handleSaveChanges();
    }
  };

  const handleClickCharacter = (event: React.MouseEvent<HTMLImageElement>) => {
    const target = event.target as HTMLImageElement;
    setEditedCharacterPath(target.src);
    setShowAvatarPopup(false);
  };

  return (
    <>
      { /* Caso o popup tenha que ser aberto e ainda não tiver carregado renderizar um spinner */ }
      <Suspense fallback={<Spinner />}>
      {/* Componente de popup de mensagem */}
        <MessagePopup
          data={popupMessageData} // Dados da mensagm
          handleClose={() => setPopupMessageData({ ...popupMessageData, show: false })} // Função para fechar o popup
        />
      </Suspense>
      <Modal className="custom-modal" show={show} onHide={handleClosePopup}>
        <Modal.Header closeButton className="custom-modal-header" style={{ borderBottom: 'none' }}>
          <Modal.Title>Editar DJ</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center" onKeyDown={handleKeyPress}>
          <Form>
            <div
              ref={avatarRef}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onClick={handleShowAvatarPopup}
              style={{ position: 'relative', cursor: 'pointer' }}
            >
              <img
                src={editedCharacterPath}
                alt={editedName}
                className="mb-3"
                style={{ width: '200px', borderRadius: '50%' }}
              />
              {showTooltip && (
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: '5px',
                  }}
                >
                  Alterar Avatar
                </div>
              )}
            </div>
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="text-centert"
                onKeyDown={handleKeyPress}
                style={{ backgroundColor: 'black', color: 'white', border: '1px solid white', textAlign: 'center' }}
              />
            </Form.Group>
            <Button variant="primary" disabled={isButtonDisabled} onClick={handleSaveChanges}>
              Salvar
            </Button>
            <Button variant="danger" onClick={handleDeleteDJ}>
              Excluir DJ
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
      <Modal className="custom-modal" show={showAvatarPopup} onHide={handleCloseAvatarPopup}>
        <Modal.Header closeButton className="custom-modal-header" style={{ borderBottom: 'none' }}>
          <Modal.Title>Escolha seu avatar</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center" style={{ overflowY: 'auto', maxHeight: '400px' }}>
          <Row>
            {charactersPaths.map((character, index) => (
              <Col key={index} className="image-col">
                <Image
                  src={character}
                  alt={`Character ${index}`}
                  onClick={handleClickCharacter}
                  className='image-style'
                  style={{ cursor: 'pointer', margin: '10px', width: '100px', height: '100px' }}
                />
              </Col>
              ))}
          </Row>
        </Modal.Body>
      </Modal>
      <Modal className='custom-modal' show={ showDeleteConfirmation } onHide={ cancelDeleteDJ }>
        <Modal.Header closeButton className='custom-modal-header' style={{ borderBottom: 'none' }}>
          <Modal.Title>Confirmação de Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Você tem certeza que quer excluir este DJ?
        </Modal.Body>
        <Modal.Footer style={{ borderTop: 'none' }}>
          <Button variant="secondary" onClick={cancelDeleteDJ}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmDeleteDJ}>
            Excluir
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
};

export default DJInfoPopup;