import { lazy, Suspense, useState, useEffect } from 'react';
import { Button, Col, Container, Form, Image, Row, Spinner } from 'react-bootstrap';
import { connect, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logo } from '../assets/images/characterPath';
import { RootState } from '../redux/store';
import { saveTrack } from '../redux/actions';
import useTrack from '../utils/useTrack'

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

  const dispatch = useDispatch(); // Hook para despachar ações do Redux
  const navigate = useNavigate(); // Hook para navegar entre páginas
  const trackActions = useTrack(); // Hook personalizado pra lidar com as ações relacionadas à pista

  // UseEffect responsável por monitorar a entrada de nome da pista e verificar se o comprimento é valido
  useEffect(() => {
    // Se o comprimento for maior que 3 e menor que 32 o botão é habilitado
    if (trackName.length >= 3 && trackName.length <= 32) {
      setButtonDisabled(false);
      // Caso contrário o botão é desabilitado
    } else {
      setButtonDisabled(true);
    }
  }
  , [trackName]);

  // UseEffect responsável por verificar se uma pista já foi criada neste dispositivo
  useEffect(() => {
    const fetchData = async () => {
      const response = await trackActions.verifyIfTrackAlreadyBeenCreated(token); // Função que verifica se a uma pista já foi criada neste dispositivo
      // Se a verificação retornar um status igual a 200 redireciona o usuário para pista criada
      if (response?.status === 200) {
        navigate(`/track-info/${response.data}`);
        // Caso contrário continua com a criação da pista
      } else {
        setIsLoading(false);
      }
    };

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Funçao responsável por capturar a mudança na entrada
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setTrackName(value);
  };

  // Função responsável por criar a pista
  const handleClick = async () => {
    // Caso os estados de trackName e code sejam diferente de null/undefined
    if (trackName && code) {
      const track = await trackActions.createTrack(trackName, code); // Chama a função de criar a pista
      // Caso retorne o status 201
      if (track?.status === 201) {
        dispatch(saveTrack(track.data.token)); // Dispacha a ação de salvar o token da pista no redux
        navigate(`/track-info/${track.data.id}`); // Redireciona o usuário pra pista
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
        fallback={ <Spinner /> } // Spinner de carregamento
      >
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
          />
        </Container>
      ) : (
        <Container
          className='d-flex align-items-center justify-content-center vh-100' // Classe para centralizar o conteúdo
        >
          <Row
            className='justify-content-center d-flex flex-column' // Classe para centralizar o conteúdo
          >
            <Col
              className='text-center mb-5' // Classe para centralizar o conteúdo
            >
              { /* Logo do alicaivo */ }
              <Image
                alt='logo' // Texto alternativo
                className='img-fluid shadow-lg mb-5' // Classe CSS para estilização
                src={ logo } // Caminho da imagem
                style={{ maxWidth: '300px' }} // Estilo CSS para definir a largura máxima
              />
              <Form.Group
                className='mb-3' // Classe para estilização
                style={{ maxWidth: '500px' }} // Estilo para definir a largura máxima
              >
                { /* Contador de caracteres */ }
                <Container
                  style={{
                    marginBottom:'10px', // Margem inferior
                    textAlign: 'center' // Alinhamento do texto
                  }}
                >
                  <Container
                    as='span' // Define o elemento como um span
                    style={{ color: trackName.length < 3 ? 'red' : 'white' }} // Se o comprimento for menor que 3, a cor do texto será vermelha caso contrário será branca
                  >
                    { trackName.length }/32 { /* Contador de caracteres */ }
                  </Container>
                </Container>
                { /* Campo de entrada para o nome da pista */ }
                <Form.Control
                  autoComplete='off' // Desabilita o preenchimento automático
                  className='text-center custom-input' // Classe CSS personalizada
                  maxLength={ 32 } // Limite de caracteres
                  onChange={ handleChange } // Função de mudança
                  onKeyDown={ handleKeyDown }  // Função de tecla pressionada
                  placeholder='Nome da Pista' // Placeholder
                  // Estilos do campo
                  style={{
                    height: '50px', // Altura do campo
                    fontSize: '1.2rem', // Tamanho da fonte
                    marginBottom: '20px', // Margem inferior
                    textAlign: 'center', // Alinhamento do texto
                  }}
                  type='text' // Tipo de entrada
                  value={ trackName } // Valor do campo
                />
                { /* Botão para criar a pista */ }
                <Button
                  variant='primary' // Cor do botão
                  disabled={ buttonDisabled } // Desabilita o botão se o estado for verdadeiro
                  onClick={ handleClick } // Função de clique
                  // Estilos do botão
                  style={{
                    fontSize: '1.2rem', // Tamanho da fonte
                    height: '50px', // Altura do botão
                    marginTop: '10px', // Margem superior
                    width: '100%', // Largura do botão
                  }}
                >
                  Criar
                </Button>
              </Form.Group>
            </Col>
          </Row>
        </Container>
      )}
    </>
  );
}

// Função para mapear o estado do Redux para as props do componente
const mapStateToProps = (state: RootState) => ({
  token: state.trackReducer.token // Token da pista
});

const CreateTrackConnected = connect(mapStateToProps)(CreateTrack); // Conecta o componente ao Redux

export default CreateTrackConnected; // Exporta o componente conectado
