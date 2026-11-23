import '../../styles/tracks/CreateTrack.css';
import { lazy, Suspense, useState, useEffect } from 'react';
import { Button, Container, Form, Image, ProgressBar, Spinner } from 'react-bootstrap';
import { connect, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { horizontalLogo, charactersPaths, logo } from '../../assets/images/characterPath';
import { RootState } from '../../redux/store';
import { saveToken } from '../../redux/actions';
import useTrack from '../../utils/useTrack'
import { Settings } from '../../types/Settings';
import DJCreationFields from '../djs/DJCreationFields';

const MessagePopup = lazy(() => import('../shared/MessagePopup')); // Componente que não precisa ser carregado inicialmente
const TrackSettingsPopup = lazy(() => import('./TrackSettingsPopup')); // Componente reutilizado para configurações da pista

// Props recebidas pelo redux
interface Props {
  code: string; // Código do Spotify
  token: string; // Token da pista
}

// Componente da página de criação de pista
const CreateTrack: React.FC<Props> = ({ code, token }) => {
  const [buttonDisabled, setButtonDisabled] = useState(true); // Estado responsável por habilitar/desabilitar o botão
  const [isLoading, setIsLoading] = useState(true); // Estado responsável por controlar o carregamento da página
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado responsável por controlar o envio do formulário
  const [popupMessageData, setPopupMessageData] = useState({ message: '', redirectTo: '', show: false }); // Estado responsável por armazenar os dados do popup de mensagem
  const [trackName, setTrackName] = useState(''); // Estado responsável por armazenar o nome da pista
  const [djName, setDJName] = useState(''); // Estado responsável por armazenar o nome do DJ
  const [characterPath, setCharacterPath] = useState(charactersPaths[Math.floor(Math.random() * charactersPaths.length)]); // Estado responsável por armazenar o caminho do personagem (sorteado aleatoriamente)
  const [queueSettings, setQueueSettings] = useState<Settings>({
    queueOpen: true,
    maxSongsPerDJ: 3,
    veryBadVotesToSkip: 0,
  }); // Estado responsável por armazenar as configurações da fila
  const [showTrackSettingsPopup, setShowTrackSettingsPopup] = useState(false); // Estado responsável por controlar a exibição do popup de configurações da pista

  const dispatch = useDispatch(); // Hook para despachar ações do Redux
  const navigate = useNavigate(); // Hook para navegar entre páginas
  const trackActions = useTrack(); // Hook personalizado pra lidar com as ações relacionadas à pista

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
    if (trackName && djName && characterPath && code && !isSubmitting) {
      setIsSubmitting(true);
      try {
        const track = await trackActions.createTrack(trackName, djName, characterPath, code, queueSettings); // Chama a função de criar a pista
        // Caso retorne o status 201
        if (track?.status === 201) {
          dispatch(saveToken(track.data.token)); // Dispacha a ação de salvar o token do DJ no redux
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
      } finally {
        setIsSubmitting(false);
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
        <TrackSettingsPopup
          allowEditTrackName={ false }
          onHide={ () => setShowTrackSettingsPopup(false) }
          onSettingsChange={ setQueueSettings }
          queueSettings={ queueSettings }
          setTrackName={ setTrackName }
          show={ showTrackSettingsPopup }
          token={ token }
          trackName={ trackName }
        />
        {/* Componente de popup de mensagem */}
        <MessagePopup
          data={ popupMessageData } // Dados da mensagem
          onHide={() => setPopupMessageData({ ...popupMessageData, show: false })} // Função para fechar o popup
        />
      </Suspense>
      { /* Verifica se está carregando */ }
      { isLoading ? (
        // Caso esteja carregando renderiza uma animação de carregamento
        <Container
          className='d-flex justify-content-center align-items-center create-track-container' // Classe para centralizar o conteúdo
 // Altura da tela
        >
          { /* Aniamção de carregamento */ }
          <Image
            alt='Animação de carergamento' // Texto alternativo
            className='logo-spinner create-track-logo-spinner' // Classe de animação de carregamento
            src={ logo } // Caminho da imagem

          />
        </Container>
      ) : (
        <Container
          className="d-flex flex-column align-items-center justify-content-center gradient-border create-track-container-2"

        >
          <Image
            alt="logo"
            className="img-fluid shadow-lg create-track-image"
            src={horizontalLogo}

          />
          <h1 className="create-track-title"
            style={{ 
              marginBottom: "0.25rem" }}
          >
            Crie sua Pista
          </h1>
          <p className="create-track-text"

          >
            Monte sua pista e veja quem manda melhor no som.
          </p>
          <div className="create-track-wrapper"

          >
            <small className="create-track-small"

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
          <DJCreationFields
            characterPath={ characterPath }
            djName={ djName }
            onCharacterChange={ setCharacterPath }
            onDJNameChange={ handleChangeDJName }
            onKeyDown={ handleKeyDown }
            trackName={ trackName }
          />
          <Form className="create-track-form"
 
          >
            <Form.Group className="mb-2">
              <Form.Label className="create-track-label"

              >
                🎵 Nome da Pista
                {trackName.length >= 3 && trackName.length <= 32 && (
                  <span className="create-track-label-2">✓</span>
                )}
              </Form.Label>
              <Form.Control
                autoComplete="off"
                className="text-center custom-input create-track-custom-input"
                maxLength={ 32 }
                onChange={handleChangeTrackName}
                onKeyDown={handleKeyDown}
                placeholder="Ex: Festa do João 🔥"
                style={{ 
                  position: "relative", 
                }}
                type="text"
                value={trackName}
              />
              <div className="create-track-wrapper-2"

              >
                <small className="create-track-small-2"
                  style={{ color: trackName.length < 3 ? "#ff6b6b" : "#00d4aa" }}
                >
                  {trackName.length}/32
                </small>
                {trackName.length > 0 && trackName.length < 3 && (
                  <small className="create-track-small-3">
                    Mínimo 3 caracteres
                  </small>
                )}
                {trackName.length >= 3 && (
                  <small className="create-track-small-4">
                    ✓ Nome válido!
                  </small>
                )}
              </div>
            </Form.Group>
            <div className="create-track-wrapper-3">
              <Button
                className="primary-button"
                onClick={() => setShowTrackSettingsPopup(true)}
                variant="outline-light"
                style={{
                  height: "42px",
                  width: "100%",
                  fontWeight: "bold",
                  border: "1px solid rgba(168, 218, 220, 0.35)",
                  background: "rgba(15, 23, 42, 0.7)",
                  color: "#dffcff",
                  boxShadow: "0 0 18px rgba(76, 201, 240, 0.08)",
                }}
              >
                ⚙️ Configurações da pista
              </Button>
            </div>
            <div className="create-track-wrapper-4">
              <Button
                className="primary-button create-track-primary-button"
                disabled={buttonDisabled || isSubmitting}
                onClick={handleClick}
                style={{ opacity: buttonDisabled ? 0.5 : 1, transform: buttonDisabled ? "scale(0.98)" : "scale(1)" }}
              >
                {isSubmitting ? <Spinner animation="border" size="sm" /> : trackName.length >= 3 && djName.length >= 3
                  ? "🚀 Criar Pista"
                  : "🔒 Preencha os Campos"}
              </Button>
            </div>
            <div className="text-center">
              {trackName.length >= 3 && djName.length >= 3 ? (
                <small className="create-track-small-5"

                >
                  ✓ Tudo pronto! Você está prestes a criar sua pista colaborativa
                </small>
              ) : (
                <small className="create-track-small-6"

                >
                  💡 Preencha o nome da pista e seu vulgo para começar
                </small>
              )}
            </div>
            <div className="text-center create-track-wrapper-5">
              <small className="create-track-small-7"

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
  token: state.reducer.token // Token da pista
});

const CreateTrackConnected = connect(mapStateToProps)(CreateTrack); // Conecta o componente ao Redux

export default CreateTrackConnected; // Exporta o componente conectado
