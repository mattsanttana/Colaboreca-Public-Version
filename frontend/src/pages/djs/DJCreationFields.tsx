import '../../styles/djs/DJCreationFields.css';
import { useRef, useState } from 'react';
import { Form, Image } from 'react-bootstrap';
import CharactersSelectPopup from './CharactersSelectPopup';

interface DJCreationFieldsProps {
  characterPath: string;
  djName: string;
  onCharacterChange: (characterPath: string) => void;
  onDJNameChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  trackName?: string;
}

const DJCreationFields: React.FC<DJCreationFieldsProps> = ({
  characterPath,
  djName,
  onCharacterChange,
  onDJNameChange,
  onKeyDown,
  trackName = '',
}) => {
  const [showCharacterPopup, setShowCharacterPopup] = useState(false);
  const [hasInteractedWithAvatar, setHasInteractedWithAvatar] = useState(false);
  const characterRef = useRef<HTMLDivElement>(null);

  const openCharacterPopup = () => {
    setHasInteractedWithAvatar(true);
    setShowCharacterPopup(true);
  };

  return (
    <>
      <div className="djcreation-fields-wrapper"

      >
        <div
          aria-label="Escolher avatar do DJ"
          className="avatar-picker"
          onClick={openCharacterPopup}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              openCharacterPopup();
            }
          }}
          ref={characterRef}
          role="button"
          style={{
            cursor: 'pointer',
            position: 'relative',
            marginBottom: '0.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '0.75rem 1rem',
            borderRadius: '20px',
            border: '1px solid rgba(76, 201, 240, 0.45)',
            background: 'linear-gradient(180deg, rgba(24, 27, 45, 0.96), rgba(38, 44, 74, 0.92))',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.32)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
          }}
          tabIndex={0}
        >
          <span className="djcreation-fields-label"

          >
            Clique para escolher seu avatar
          </span>
          <Image
            alt="Personagem do DJ"
            id="djcreation-fields-image" className={`img-fluid mb-2 ${hasInteractedWithAvatar ? '' : 'avatar-image'}`}
            src={characterPath}

          />
          <span className="djcreation-fields-label-2"

          >
            {trackName}
          </span>
          <p className="djcreation-fields-text"

          >
            {djName}
          </p>
          <small className="djcreation-fields-small"

          >
            Você será o administrador da pista
          </small>
        </div>
      </div>
      <Form.Group className="mb-3 djcreation-fields-group">
        <Form.Label className="djcreation-fields-label-3"

        >
          🎧 Seu Vulgo
          {djName.length >= 3 && djName.length <= 16 && (
            <span className="djcreation-fields-label-4">✓</span>
          )}
        </Form.Label>
        <Form.Control
          autoComplete="off"
          className="text-center custom-input djcreation-fields-custom-input"
          maxLength={16}
          onChange={onDJNameChange}
          onKeyDown={onKeyDown}
          placeholder="Ex: DJ Nebuloso"

          type="text"
          value={djName}
        />
        <div className="djcreation-fields-wrapper-2">
          <small className="djcreation-fields-small-2" style={{ color: djName.length < 3 ? '#ff6b6b' : '#00d4aa' }}>
            {djName.length}/16
          </small>
          {djName.length > 0 && djName.length < 3 && (
            <small className="djcreation-fields-small-3">Mínimo 3 caracteres</small>
          )}
          {djName.length >= 3 && (
            <small className="djcreation-fields-small-4">✓</small>
          )}
        </div>
      </Form.Group>
      <CharactersSelectPopup
        onHide={() => setShowCharacterPopup(false)}
        setCharacterPath={onCharacterChange}
        setShowCharacterPopup={setShowCharacterPopup}
        show={showCharacterPopup}
      />
    </>
  );
};

export default DJCreationFields;
