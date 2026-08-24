import { lazy, Suspense, useState, useEffect, useRef } from 'react';
import { Button, Container, Form, Image, ProgressBar } from 'react-bootstrap';
import { connect, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { horizontalLogo, charactersPaths, logo } from '../assets/images/characterPath';
import { RootState } from '../redux/store';
import { saveDJ } from '../redux/actions';
import useTrack from '../utils/useTrack'

const CharactersSelectPopup = lazy(() => import('./CharactersSelectPopup')); // Componente que não precisa ser carregado inicialmente
const MessagePopup = lazy(() => import('./MessagePopup')); // Componente que não precisa ser carregado inicialmente

// Props recebidas pelo redux
interface Props {
  code: string; // Código do Spotify
  token: string; // Token da pista
}

// Componente da página de criação de pista
const CreateTrack: React.FC<Props> = ({ code, token }) => {
  const [buttonDisabled, setButtonDisabled] = useState(true); // Estado responsável por habilitar/desabilitar o botão
  const [isLoading, setIsLoading] = useState(true); // Estado responsável por controlar o carregamento da página
  const [popupMessageData, setPopupMessageData] = useState({ message: '', redirectTo: '', show: false }); // Estado responsável por armazenar os dados do popup de mensagem
  const [trackName, setTrackName] = useState(''); // Estado responsável por armazenar o nome da pista
  const [djName, setDJName] = useState(''); // Estado responsável por armazenar o nome do DJ
  const [characterPath, setCharacterPath] = useState(charactersPaths[Math.floor(Math.random() * charactersPaths.length)]); // Estado responsável por armazenar o caminho do personagem (sorteado aleatoriamente)
  const [showCharacterPopup, setShowCharacterPopup] = useState(false); // Estado responsável por controlar a exibição do popup de seleção de personagem

  const dispatch = useDispatch(); // Hook para despachar ações do Redux
  const navigate = useNavigate(); // Hook para navegar entre páginas
  const trackActions = useTrack(); // Hook personalizado pra lidar com as ações relacionadas à pista
  const characterRef = useRef<HTMLImageElement>(null); // Referência para o avatar do DJ

  // UseEffect responsável por monitorar a entrada de nome da pista e verificar se o comprimento é valido
  useEffect(() => {
    // Se o comprimento for maior que 3 e menor que 32 o botão é habilitado
    if (trackName.length >= 3 && trackName.length <= 32  && djName.length >= 3 && djName.length <= 16) {
      setButtonDisabled(false);
      // Caso contrário o botão é desabilitado
    } else {
      setButtonDisabled(true);
    }
  }
  , [trackName, djName]);

  // UseEffect responsável por verificar se uma pista já foi criada neste dispositivo
  useEffect(() => {
    const fetchData = async () => {
      const response = await trackActions.verifyIfTrackAlreadyBeenCreated(token); // Função que verifica se a uma pista já foi criada neste dispositivo
      // Se a verificação retornar um status igual a 200 redireciona o usuário para pista criada
      if (response?.status === 200) {
        navigate(`/track/${response.data}`);
        // Caso contrário continua com a criação da pista
      } else {
        setIsLoading(false);
      }
    };

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Funçao responsável por capturar a mudança na entrada
  const handleChangeTrackName = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setTrackName(value);
  };

  const handleChangeDJName = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setDJName(value);
  };

  // Função responsável por criar a pista
  const handleClick = async () => {
    // Caso os estados de trackName e code sejam diferente de null/undefined
    if (trackName && djName && characterPath&& code) {
      const track = await trackActions.createTrack(trackName, djName, characterPath, code); // Chama a função de criar a pista
      // Caso retorne o status 201
      if (track?.status === 201) {
        dispatch(saveDJ(track.data.token)); // Dispacha a ação de salvar o token do DJ no redux
        navigate(`/track/${ track.data.id }`); // Redireciona o usuário pra pista
        // Caso o status seja igual a 401
      } else if (track?.status === 401) {
        // Renderiza o popup de mensagem informando que a conta do Spotify do usuário precisa ser premium para criar uma pista
        setPopupMessageData({
          message: 'Sua conta do Spotify precisa ser premium para criar uma pista.', // Mensagem de erro
          redirectTo: '/', // Redireciona para a página inicial
          show: true // Mostra o popup
        });
        // Caso o status seja igual a 400
      } else if (track?.status === 400) {
        // Renderiza o popup de mensagem informando que o nome da pista é muito curto ou muito longo
        setPopupMessageData({
          message: 'O nome da sua pista é muito curto ou muito longo, por favor tente outro.', // Mensagem de erro
          redirectTo: '', // Não redireciona
          show: true // Mostra o popup
        });
      } else {
        // Caso contrário renderiza o popup de mensagem informando um erro
        setPopupMessageData({
          message: 'Algo deu errado ao tentar criar a pista, tente novamente.', // Mensagem de erro
          redirectTo: '/', // Redireciona para a página inicial
          show: true // Mostra o popup
        });
      }
    }
  };

  // Função responsável por chamar a função de criação ao apertar o botão "enter"
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !buttonDisabled) {
      handleClick();
    }
  };

  return (
    <>
      { /* Caso o popup tenha que ser aberto e ainda não tiver carregado renderizar um spinner */ }
      <Suspense
        // fallback={ <Spinner /> } // Spinner de carregamento
      >
        {/* Componente de popup de seleção de personagem */ }
        <CharactersSelectPopup
          onHide={() => setShowCharacterPopup(false)} // Função para fechar o popup
          setCharacterPath={ setCharacterPath } // Função de armazenar o novo personagem
          setShowCharacterPopup={ setShowCharacterPopup } // Função de estado do popup de seleção de personagem
          show={ showCharacterPopup } // Estado para exibir o popup
        />
        {/* Componente de popup de mensagem */}
        <MessagePopup
          data={ popupMessageData } // Dados da mensagem
          handleClose={() => setPopupMessageData({ ...popupMessageData, show: false })} // Função para fechar o popup
        />
      </Suspense>
      { /* Verifica se está carregando */ }
      { isLoading ? (
        // Caso esteja carregando renderiza uma animação de carregamento
        <Container
          className='d-flex justify-content-center align-items-center' // Classe para centralizar o conteúdo
          style={{ height: '100vh' }} // Altura da tela
        >
          { /* Aniamção de carregamento */ }
          <Image
            alt='Animação de carergamento' // Texto alternativo
            className='logo-spinner' // Classe de animação de carregamento
            src={ logo } // Caminho da imagem
            style={{ width: '200px'}}
          />
        </Container>
      ) : (
        <Container
          className="d-flex flex-column align-items-center justify-content-center gradient-border"
          style={{
            width: "100%",
            maxWidth: "500px",
            height: "100dvh",
            padding: "0.75rem 1rem",
            boxSizing: "border-box",
            overflowY: "auto",
          }}
        >
          <Image
            alt="logo"
            className="img-fluid shadow-lg"
            src={horizontalLogo}
            style={{ maxWidth: "150px" }}
          />
          <h1
            style={{
              fontSize: "2.1rem",
              fontWeight: "bold",
              color: "#fff4c2", // Corrigido: removido o apóstrofo extra
              marginBottom: "0.25rem",
              textAlign: "center",
              textShadow:
                "0 0 10px rgba(255, 244, 194, 0.22), 0 0 24px rgba(76, 201, 240, 0.12)",
            }}
          >
            Crie sua Pista
          </h1>
          <p
            style={{
              fontSize: "1rem",
              color: "#999999",
              marginBottom: "0.9rem",
              textAlign: "center",
              textShadow: "0 0 12px rgba(168, 218, 220, 0.12)",
            }}
          >
            Monte sua pista e veja quem manda melhor no som.
          </p>
          <div
            style={{
              marginBottom: "1rem",
              maxWidth: "400px",
              width: "100%",
            }}
          >
            <small
              style={{
                color: "#a8dadc",
                fontSize: "0.9rem",
                textShadow: "0 0 10px rgba(76, 201, 240, 0.18)",
              }}
            >
              Progresso da Criação
            </small>
            <ProgressBar
              now={(trackName.length > 2 ? 50 : 0) + (djName.length > 2 ? 50 : 0)}
              style={{
                height: "4px",
                marginTop: "0.5rem",
                background: "linear-gradient(to bottom, #494c80, #a8dadc, #186ea7, #4cc9f0)",
              }}
              className="custom-progress-bar"
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: "1rem",
              width: "100%",
            }}
          >
            <div
              aria-label="Escolher avatar do DJ"
              className="avatar-picker"
              onClick={() => setShowCharacterPopup(true)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setShowCharacterPopup(true);
                }
              }}
              ref={characterRef}
              role="button"
              style={{
                cursor: "pointer",
                position: "relative",
                marginBottom: "0.5rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "0.75rem 1rem",
                borderRadius: "20px",
                border: "1px solid rgba(76, 201, 240, 0.45)",
                background:
                  "linear-gradient(180deg, rgba(24, 27, 45, 0.96), rgba(38, 44, 74, 0.92))",
                boxShadow: "0 16px 40px rgba(0, 0, 0, 0.32)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
              }}
              tabIndex={0}
            >
              <span
                style={{
                  marginBottom: "0.5rem",
                  padding: "0.28rem 0.75rem",
                  borderRadius: "999px",
                  background:
                    "linear-gradient(90deg, rgba(76, 201, 240, 0.2), rgba(168, 218, 220, 0.22))",
                  border: "1px solid rgba(168, 218, 220, 0.35)",
                  color: "#dffcff",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  textShadow: "0 0 12px rgba(76, 201, 240, 0.22)",
                  boxShadow: "0 0 18px rgba(76, 201, 240, 0.08)",
                }}
              >
                Clique para escolher seu avatar
              </span>
              <Image
                alt="Personagem do DJ"
                className="img-fluid mb-2"
                src={characterPath}
                style={{
                  maxWidth: "120px",
                  height: "120px",
                  objectFit: "cover",
                  borderRadius: "50%",
                  border: "3px solid #4cc9f0",
                  background: "#181a2a",
                  boxShadow: "0 0 0 4px rgba(76, 201, 240, 0.12)",
                }}
              />
              <span
              style={{
                fontWeight: "bold",
                color: "#00d4aa",
                fontSize: "1rem",
                marginBottom: "0.1rem",
                textShadow:
                  "0 0 10px rgba(0, 212, 170, 0.3), 0 0 20px rgba(76, 201, 240, 0.12)",
              }}
            >
              { trackName ? `${trackName}` : '' }
            </span>
            <p
              style={{
                color: "white",
                fontWeight: "bold",
                fontSize: "1.05rem",
                marginBottom: 0,
                textShadow: "0 0 12px rgba(255, 255, 255, 0.12)",
              }}
            >
              {djName || ""}
            </p>
            <small
              style={{
                color: "#cccccc",
                fontSize: "0.8rem",
                marginBottom: 0,
                textShadow: "0 0 10px rgba(168, 218, 220, 0.1)",
              }}
            >
              Você será o administrador da pista
            </small>
            </div>
          </div>
          <Form
            style={{
              width: "100%",
              maxWidth: "300px",
              margin: "0 auto",
            }} 
          >
            <Form.Group className="mb-2">
              <Form.Label
                style={{
                  marginBottom: "0.35rem",
                  fontSize: "0.9rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  color: "#ffda6a",
                  textShadow:
                    "0 0 8px rgba(255, 218, 106, 0.28), 0 0 16px rgba(255, 183, 3, 0.12)",
                }}
              >
                🎵 Nome da Pista
                {trackName.length >= 3 && trackName.length <= 32 && (
                  <span style={{ color: "#00d4aa", fontSize: "1.1rem" }}>✓</span>
                )}
              </Form.Label>
              <Form.Control
                autoComplete="off"
                className="text-center custom-input"
                maxLength={ 32 }
                onChange={handleChangeTrackName}
                onKeyDown={handleKeyDown}
                placeholder="Ex: Paredão do João 🔥"
                style={{
                  height: "42px",
                  fontSize: "0.95rem",
                  backgroundColor: "#0a0a0a",
                  border:
                    trackName.length >= 3
                      ? "1px solid #00d4aa"
                      : "1px solid #333333",
                  color: "white",
                  width: "100%",
                  boxSizing: "border-box",
                  transition: "border-color 0.3s ease",
                  zIndex: 1, // Garante que o input esteja acima de outros elementos
                  position: "relative", // Evita que estilos herdados causem problemas
                }}
                type="text"
                value={trackName}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "0.15rem",
                }}
              >
                <small
                  style={{
                    color: trackName.length < 3 ? "#ff6b6b" : "#00d4aa",
                    fontSize: "0.8rem",
                  }}
                >
                  {trackName.length}/32
                </small>
                {trackName.length > 0 && trackName.length < 3 && (
                  <small style={{ color: "#ff6b6b", marginLeft: "1rem" }}>
                    Mínimo 3 caracteres
                  </small>
                )}
                {trackName.length >= 3 && (
                  <small style={{ color: "#00d4aa", marginLeft: "1rem" }}>
                    ✓ Nome válido!
                  </small>
                )}
              </div>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label
                style={{
                  marginBottom: "0.35rem",
                  fontSize: "0.9rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  color: "#ffda6a",
                  textShadow:
                    "0 0 8px rgba(255, 218, 106, 0.28), 0 0 16px rgba(255, 183, 3, 0.12)",
                }}
              >
                🎧 Seu Vulgo
                {djName.length >= 3 && djName.length <= 16 && (
                  <span style={{ color: "#00d4aa", fontSize: "1.1rem" }}>✓</span>
                )}
              </Form.Label>
              <Form.Control
                autoComplete="off"
                className="text-center custom-input"
                maxLength={16}
                onChange={handleChangeDJName}
                onKeyDown={handleKeyDown}
                placeholder="Ex: DJ Nebuloso"
                style={{
                  height: "42px",
                  fontSize: "0.95rem",
                  backgroundColor: "#0a0a0a",
                  border:
                    djName.length >= 3
                      ? "1px solid #00d4aa"
                      : "1px solid #333333",
                  color: "white",
                  width: "100%",
                  boxSizing: "border-box",
                  transition: "border-color 0.3s ease",
                  zIndex: 1, // Garante que o input esteja acima de outros elementos
                  position: "relative", // Evita que estilos herdados causem problemas
                }}
                type="text"
                value={djName}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "0.15rem",
                }}
              >
                <small
                  style={{
                    color: djName.length < 3 ? "#ff6b6b" : "#00d4aa",
                    fontSize: "0.8rem",
                  }}
                >
                  {djName.length}/16
                </small>
                {djName.length > 0 && djName.length < 3 && (
                  <small style={{ color: "#ff6b6b", marginLeft: "1rem" }}>
                    Mínimo 3 caracteres
                  </small>
                )}
                {djName.length >= 3 && (
                  <small style={{ color: "#00d4aa", marginLeft: "1rem" }}>
                    ✓ Vulgo disponível!
                  </small>
                )}
              </div>
            </Form.Group>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.8rem" }}>
              <Button
                className="primary-button"
                disabled={buttonDisabled}
                onClick={handleClick}
                style={{
                  height: "46px",
                  width: "100%",
                  fontWeight: "bold",
                  border: "none",
                  opacity: buttonDisabled ? 0.5 : 1,
                  transform: buttonDisabled ? "scale(0.98)" : "scale(1)",
                  transition: "all 0.3s ease",
                  fontSize: "1rem",
                  background: "linear-gradient(90deg, #00d4aa 0%, #7f5cff 100%)",
                  color: "white",
                  boxShadow: "0 2px 16px #00d4aa33",
                  textShadow: "0 0 12px rgba(255, 255, 255, 0.18)",
                }}
              >
                {trackName.length >= 3 && djName.length >= 3
                  ? "🚀 Criar Pista"
                  : "🔒 Preencha os Campos"}
              </Button>
            </div>
            <div className="text-center">
              {trackName.length >= 3 && djName.length >= 3 ? (
                <small
                  style={{
                    color: "#00d4aa",
                    fontSize: "0.82rem",
                    fontWeight: "bold",
                    textShadow:
                      "0 0 10px rgba(0, 212, 170, 0.3), 0 0 18px rgba(76, 201, 240, 0.1)",
                  }}
                >
                  ✓ Tudo pronto! Você está prestes a criar sua pista colaborativa
                </small>
              ) : (
                <small
                  style={{
                    color: "#a8dadc",
                    fontSize: "0.82rem",
                    textShadow: "0 0 10px rgba(76, 201, 240, 0.1)",
                  }}
                >
                  💡 Preencha o nome da pista e seu vulgo para começar
                </small>
              )}
            </div>
            <div className="text-center" style={{ marginTop: "0.5rem" }}>
              <small
                style={{
                  color: "#999999",
                  fontSize: "0.78rem",
                  textShadow: "0 0 10px rgba(168, 218, 220, 0.08)",
                }}
              >
                Sua pista poderá receber outros DJs. Compartilhe com seus amigos depois de criar!
              </small>
            </div>
          </Form>
        </Container>
      )}
    </>
  );
}

// Função para mapear o estado do Redux para as props do componente
const mapStateToProps = (state: RootState) => ({
  token: state.djReducer.token // Token da pista
});

const CreateTrackConnected = connect(mapStateToProps)(CreateTrack); // Conecta o componente ao Redux

export default CreateTrackConnected; // Exporta o componente conectado
