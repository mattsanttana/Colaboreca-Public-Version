import { lazy, Suspense, useEffect, useState } from 'react';
import { Button, Container, Form, Modal, Spinner } from 'react-bootstrap';
import { FaCheck, FaMinus, FaMusic, FaPen, FaPlus, FaRedoAlt, FaVoteYea } from 'react-icons/fa';
import { Settings } from '../types/Settings';
import useTrack from '../utils/useTrack';

const EditTrackNamePopup = lazy(() => import('./EditTrackNamePopup')); // Componente que não precisa ser carregado inicialmente

interface Props {
  allowEditTrackName?: boolean; // Permite editar o nome da pista quando a pista já existe
  onHide: (show: boolean) => void; // Função para definir o estado do popup
  onSettingsChange?: (settings: Settings) => void; // Atualiza o estado externo das configurações
  queueSettings?: Settings; // Configurações atuais da fila
  setTrackName?: (name: string) => void; // Função para definir o nome da pista
  show: boolean; // Estado para controlar o popup de informações da pista
  token: string; // Token do DJ
  trackName: string; // Nome da pista
}

const defaultQueueSettings: Settings = {
  maxSongsPerDJ: 3,
  queueOpen: true,
  veryBadVotesToSkip: 0,
};

interface NumberStepperProps {
  ariaLabel: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  value: number;
}

const NumberStepper: React.FC<NumberStepperProps> = ({ ariaLabel, max, min, onChange, value }) => (
  <div className='d-flex align-items-center gap-2'>
    <Button
      aria-label={`Diminuir ${ariaLabel}`}
      disabled={value <= min}
      onClick={() => onChange(value - 1)}
      variant='outline-light'
    >
      <FaMinus aria-hidden='true' />
    </Button>
    <span aria-label={`${value === 0 ? 'desativado' : value} ${ariaLabel}`} aria-live='polite' className='fw-bold text-center' style={{ minWidth: '5rem' }}>
      {value === 0 ? 'Desativado' : value}
    </span>
    <Button
      aria-label={`Aumentar ${ariaLabel}`}
      disabled={value >= max}
      onClick={() => onChange(value + 1)}
      variant='outline-light'
    >
      <FaPlus aria-hidden='true' />
    </Button>
  </div>
);

const TrackSettingsPopup: React.FC<Props> = ({ allowEditTrackName = true, onHide, onSettingsChange, queueSettings = defaultQueueSettings, setTrackName, show, token, trackName }) => {
  const [showEditTrackNamePopup, setShowEditTrackNamePopup] = useState(false); // Estado para controlar a exibição do modal de edição do nome da pista
  const [localQueueSettings, setLocalQueueSettings] = useState<Settings>(queueSettings);
  const trackActions = useTrack();

  const canEditTrackName = allowEditTrackName && !!setTrackName;

  useEffect(() => {
    setLocalQueueSettings(queueSettings);
  }, [queueSettings, show]);

  const updateNumberSetting = (setting: 'maxSongsPerDJ' | 'veryBadVotesToSkip', numericValue: number) => {
    const limits = setting === 'maxSongsPerDJ'
      ? { min: 0, max: 50 }
      : { min: 0, max: 20 };
    const safeValue = Math.min(limits.max, Math.max(limits.min, numericValue));

    const nextSettings: Settings = {
      ...localQueueSettings,
      [setting]: safeValue,
    };

    setLocalQueueSettings(nextSettings);
  };

  const handleQueueToggle = (checked: boolean) => {
    setLocalQueueSettings((currentSettings) => ({
      ...currentSettings,
      queueOpen: checked,
    }));
  };

  const handleResetSettings = () => {
    setLocalQueueSettings(defaultQueueSettings);
  };

  const handleSaveSettings = async () => {
    if (!allowEditTrackName) {
      onSettingsChange?.(localQueueSettings);
      onHide(false);
      return;
    }

    const response = await trackActions.updateTrack({
      trackName,
      ...localQueueSettings,
    }, token);

    if (response?.status === 200) {
      onSettingsChange?.(localQueueSettings);
      onHide(false);
    }
  };

  return (
    <Modal
      className='custom-modal' // classe customizada para o modal
      onHide={() => onHide(false)} // Função para fechar o modal
      show={ show } // Estado para controlar a exibição do modal
    >
      {canEditTrackName && (
        <Suspense fallback={<Spinner/>}>
          <EditTrackNamePopup
            onHide={ setShowEditTrackNamePopup } // Função para definir o estado do popup
            setTrackName={ setTrackName } // Função para definir o nome da pista
            show={ showEditTrackNamePopup } // Estado para controlar a exibição do modal de edição do nome da pista
            token={ token } // Token do DJ
            trackName={ trackName } // Nome da pista
          />
        </Suspense>
      )}
      <Modal.Header
        className='custom-modal-header' // classe customizada para o cabeçalho do modal
        closeButton // Adiciona um botão de fechar no cabeçalho do modal
        style={{ borderBottom: 'none' }}
      >
        <Modal.Title>Configurações da Pista</Modal.Title>
      </Modal.Header>
      <Modal.Body className='text-center' style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <Container className='px-1'>
          <Form>
            {canEditTrackName && (
              <Form.Group className='mb-3' controlId='formTrackName'>
                <div className='position-relative'>
                  <Form.Control
                    className='text-center pe-5'
                    readOnly
                    type='text'
                    value={ trackName }
                  />
                  <Button
                    aria-label='Editar nome da pista'
                    className='position-absolute top-0 end-0 h-100 rounded-start-0'
                    onClick={() => setShowEditTrackNamePopup(true)}
                    variant='outline-secondary'
                  >
                    <FaPen />
                  </Button>
                </div>
              </Form.Group>
            )}

            <section className='mb-4 text-start'>
              <div className='d-flex align-items-center gap-2 mb-2'>
                <FaMusic aria-hidden='true' className='text-warning' />
                <h6 className='mb-0 text-uppercase'>Fila de músicas</h6>
              </div>
              <div className='rounded p-3' style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
                <Form.Group className='mb-3' controlId='maxSongsPerDJ'>
                  <Form.Label className='mb-1'>Limite por DJ</Form.Label>
                  <Form.Text className='d-block mb-2 text-light opacity-75'>
                    Quantas músicas cada DJ pode manter na fila.
                  </Form.Text>
                  <NumberStepper
                    ariaLabel='músicas por DJ'
                    max={50}
                    min={0}
                    onChange={(value) => updateNumberSetting('maxSongsPerDJ', value)}
                    value={localQueueSettings.maxSongsPerDJ}
                  />
                  <span className='small text-light opacity-75'>
                    {localQueueSettings.maxSongsPerDJ === 0 ? 'limite desativado' : 'músicas por DJ'}
                  </span>
                </Form.Group>
                <Form.Check
                  checked={localQueueSettings.queueOpen}
                  id='queueOpen'
                  label='Fila aberta para novas músicas'
                  onChange={(event) => handleQueueToggle(event.target.checked)}
                  type='switch'
                />
                <Form.Text className='d-block mt-1 text-light opacity-75'>
                  Desative para pausar novas sugestões sem remover as músicas atuais.
                </Form.Text>
              </div>
            </section>

            <section className='mb-4 text-start'>
              <div className='d-flex align-items-center gap-2 mb-2'>
                <FaVoteYea aria-hidden='true' className='text-warning' />
                <h6 className='mb-0 text-uppercase'>Votação</h6>
              </div>
              <div className='rounded p-3' style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
                <Form.Group className='mb-3' controlId='veryBadVotesToSkip'>
                  <Form.Label className='mb-1'>Votos “Ninguém Merece” para pular</Form.Label>
                  <Form.Text className='d-block mb-2 text-light opacity-75'>
                    A música será pulada ao atingir este número de votos.
                  </Form.Text>
                  <NumberStepper
                    ariaLabel='votos para pular a música'
                    max={20}
                    min={0}
                    onChange={(value) => updateNumberSetting('veryBadVotesToSkip', value)}
                    value={localQueueSettings.veryBadVotesToSkip}
                  />
                  <span className='small text-light opacity-75'>
                    {localQueueSettings.veryBadVotesToSkip === 0 ? 'votos desativados' : 'votos'}
                  </span>
                </Form.Group>
              </div>
            </section>

          </Form>
        </Container>
      </Modal.Body>
      <Modal.Footer className='border-0 pt-0'>
        <Button
          aria-label='Restaurar configurações padrão'
          className='me-auto'
          onClick={handleResetSettings}
          title='Restaurar configurações padrão'
          variant='outline-light'
        >
          <FaRedoAlt />
        </Button>
        <Button onClick={() => onHide(false)} variant='outline-light'>
          Cancelar
        </Button>
        <Button onClick={handleSaveSettings} variant='warning'>
          <FaCheck className='me-2' />
          Salvar configurações
        </Button>
      </Modal.Footer>
    </Modal>
  )
};

export default TrackSettingsPopup; 