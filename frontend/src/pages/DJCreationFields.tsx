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
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '1rem',
          width: '100%',
        }}
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
          <span
            style={{
              marginBottom: '0.5rem',
              padding: '0.28rem 0.75rem',
              borderRadius: '999px',
              background: 'linear-gradient(90deg, rgba(76, 201, 240, 0.2), rgba(168, 218, 220, 0.22))',
              border: '1px solid rgba(168, 218, 220, 0.35)',
              color: '#dffcff',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              textShadow: '0 0 12px rgba(76, 201, 240, 0.22)',
              boxShadow: '0 0 18px rgba(76, 201, 240, 0.08)',
            }}
          >
            Clique para escolher seu avatar
          </span>
          <Image
            alt="Personagem do DJ"
            className={`img-fluid mb-2 ${hasInteractedWithAvatar ? '' : 'avatar-image'}`}
            src={characterPath}
            style={{
              maxWidth: '120px',
              height: '120px',
              objectFit: 'cover',
              borderRadius: '50%',
              border: '3px solid #4cc9f0',
              background: '#181a2a',
              boxShadow: '0 0 0 4px rgba(76, 201, 240, 0.12)',
            }}
          />
          <span
            style={{
              fontWeight: 'bold',
              color: '#00d4aa',
              fontSize: '1rem',
              marginBottom: '0.1rem',
              textShadow: '0 0 10px rgba(0, 212, 170, 0.3), 0 0 20px rgba(76, 201, 240, 0.12)',
            }}
          >
            {trackName}
          </span>
          <p
            style={{
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1.05rem',
              marginBottom: 0,
              textShadow: '0 0 12px rgba(255, 255, 255, 0.12)',
            }}
          >
            {djName}
          </p>
          <small
            style={{
              color: '#cccccc',
              fontSize: '0.8rem',
              marginBottom: 0,
              textShadow: '0 0 10px rgba(168, 218, 220, 0.1)',
            }}
          >
            Você será o administrador da pista
          </small>
        </div>
      </div>
      <Form.Group className="mb-3" style={{ width: '100%', maxWidth: '300px', marginInline: 'auto' }}>
        <Form.Label
          style={{
            marginBottom: '0.35rem',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#ffda6a',
            textShadow: '0 0 8px rgba(255, 218, 106, 0.28), 0 0 16px rgba(255, 183, 3, 0.12)',
          }}
        >
          🎧 Seu Vulgo
          {djName.length >= 3 && djName.length <= 16 && (
            <span style={{ color: '#00d4aa', fontSize: '1.1rem' }}>✓</span>
          )}
        </Form.Label>
        <Form.Control
          autoComplete="off"
          className="text-center custom-input"
          maxLength={16}
          onChange={onDJNameChange}
          onKeyDown={onKeyDown}
          placeholder="Ex: DJ Nebuloso"
          style={{
            width: '100%',
            zIndex: 1,
            position: 'relative',
          }}
          type="text"
          value={djName}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.15rem' }}>
          <small style={{ color: djName.length < 3 ? '#ff6b6b' : '#00d4aa', fontSize: '0.8rem' }}>
            {djName.length}/16
          </small>
          {djName.length > 0 && djName.length < 3 && (
            <small style={{ color: '#ff6b6b', marginLeft: '1rem' }}>Mínimo 3 caracteres</small>
          )}
          {djName.length >= 3 && (
            <small style={{ color: '#00d4aa', marginLeft: '1rem' }}>✓</small>
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
