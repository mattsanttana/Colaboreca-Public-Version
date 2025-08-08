import { lazy, Suspense, useEffect, useState } from 'react';
import { Button, Card, Col, Container, Form, Image, Row, Spinner } from 'react-bootstrap';
import { connect, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { charactersPaths, horizontalLogo, logo } from '../assets/images/characterPath';
import { saveDJ } from '../redux/actions';
import { RootState } from '../redux/store';
import useDJ from '../utils/useDJ';

const MessagePopup = lazy(() => import('./MessagePopup')); // Componente que não precisa ser carregado inicialmente

// Props recebidas pelo redux
interface CreateDJProps {
  token: string;
  trackId: string;
}

// Componente da página de criação do DJ
const CreateDJ: React.FC<CreateDJProps> = ({ token, trackId }) => {
  const [buttonDisabled, setButtonDisabled] = useState(true); // Estado responsável por habilitar/desabilitar o botão
  // Estado responsável por armazenar os dados do DJ (nome e caminho do personagem)
  const [djData, setDJData] = useState({
    name: '', // Nome do DJ
    selectedCharacterPath: charactersPaths[Math.floor(Math.random() * charactersPaths.length)] // Caminho do personagem (ao renderizar a página um personagem aleatório é escolhido)
  });
  const [isLoading, setIsLoading] = useState(true); // Estado responsável por controlar a animação de carregamento
  const [hoveredCharacter, setHoveredCharacter] = useState<string | null>(null); // Estado responsável por armazenar o personagem que está sendo selecionado
  const [popupMessageData, setPopupMessageData] = useState({ message: '', redirectTo: '', show: false }); // Estado responsável por armazenar os dados do popup de mensagem
  const [phase, setPhase] = useState(1); // Estado responsável por armazenar a fase que o usuário está (escolhendo o personagem ou nome)

  const dispatch = useDispatch(); // Hook para despachar ações do Redux
  const djActions = useDJ(); // Hook personalizado pra lidar com as ações relacionadas ao DJ
  const navigate = useNavigate(); // Hook personalziado pra lidar com as ações relacionadas à pista

  // UseEffect responsável por verificar se o DJ já foi criada pra esta pista neste dispositivo
  useEffect(() => {
    const fetchData = async () => {
      const response = await djActions.getDJData(token); // Chama a função que verifica se o DJ já foi criado pra esta pista neste dispositivo
      // Se o DJ já foi criada para esta pista neste dispositivo
      if (Number(response?.data?.dj?.trackId) === Number(trackId)) {
        navigate(`/track/${response?.data.dj.trackId}`); // Redireciona o usuário para a pista
      }
      setIsLoading(false); // Desabilita a animação de carregamento
    };
    
    fetchData();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // UseEffect responsável por controlar o estado do botão (habilitado/desabilitado)
  useEffect(() => {
    // Se o comprimento do nome for igual ou maior que 3 e igual ou menor que 16
    if (djData.name.length >= 3 && djData.name.length <= 16) {
      setButtonDisabled(false); // Habilita o botão
      // Caso contrário
    } else {
      setButtonDisabled(true); // Desabilita o botão
    }
  }, [djData.name]);

  // Função responsável por lidar com o evento de mudança da entrada
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name: inputName, value } = event.target; // Desestrutura o nome e o valor da entrada
    setDJData(prevState => ({ ...prevState, [inputName]: value })); // Atualiza o estado do DJ
  };

  // Função responsável por lidar com o evento de clique do botão
  const handleClick = async () => {
    // Se a fase for 1
    if (phase === 1) {
      setPhase(2); // Redireciona o usuário pra fase 2
      return;
    }

    // Se a fase for 2
    if (phase === 2) {
      // Cria o DJ
      const dj = await djActions.createDJ({
        djName: djData.name, // Nome do DJ
        characterPath: djData.selectedCharacterPath, // Caminho do personagem
        trackId: Number(trackId) // ID da pista
      });

      // Se o status for igual a 201
      if (dj?.status === 201) {
        dispatch(saveDJ(dj.data.token)); // Salva o token do DJ no Redux
        navigate(`/track/${trackId}`); // Redireciona o usuário para à pista
        // Se o status for igual a 400
      } else if (dj?.status === 400) {
        // Renderiza uma mensagem de erro dizendo que aquele nome de usuário já existe
        setPopupMessageData({
          message: 'Este vulgo já existe, por favor tente outro', // Mensagem de erro
          redirectTo: '', // Não redireciona
          show: true // Mostra o popup
        })
        // Se o status for igual a 401
      } else if (dj?.status === 401) {
        // Renderiza uma mensagem de erro dizendo que a pista foi excluída
        setPopupMessageData({
          message: 'Pista excluída, por favor entre em uma nova pista', // Mensagem de erro
          redirectTo: '/', // Redireciona para a página inicial
          show: true // Mostra o popup
        })
        // Caso contário
      } else {
        // Renderiza uma mensagem de erro genérica
        setPopupMessageData({
          message: 'Algo deu errado, por favor tente novamente em alguns minutos', // Mensagem de erro
          redirectTo: '/', // Redireciona para a página inicial
          show: true // Mostra o popup
        })
      }
    }
  };

  // Função responsável por selecionar o personagem
  const handleClickCharacter = (characterPath: string) => {
    setDJData(prevState => ({ ...prevState, selectedCharacterPath: characterPath })); // Atualiza o estado dos dados do DJ com o personagem selecionado
  };

  // Função responsável por chamar a função de handlerClick ao apertar o botão 'enter'
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
          className='d-flex justify-content-center align-items-center' // Classes para centralizar o conteúdo
          style={{ height: '100vh' }} // Altura da tela
        >
          { /* Logo de carregamento */ }
          <Image
            alt='Logo de carregamento' // Texto alternativo
            className='logo-spinner' // Classe para animação de carregamento
            src={ logo } // Caminho do logo
          />
        </Container>
      ) : (
        <Container
          className='menu-container' // Classe do container
        >
          { /* Caso a fase for 1 renderiza a tela de escolha do personagem */ }
          { phase === 1 ? (
            <Container
              className='menu-background' // Classe do background
            >
              { /* Logo horizontal */ }
              <Image
                alt='Logo horizontal' // Texto alternativo
                className='logo' // Classe do logo
                src={ horizontalLogo } // Caminho do logo
                // Estilo do logo
                style={{ width: '200px' }} // Largura do logo
              />
              <Container
                className='text-center' // Classe para centralizar o texto
              >
                { /* Personagem escolhido */ }
                <Image
                  alt='Avatar escolhido' // Texto alternativo
                  className='chosen-character'  // Classe do personagem
                  roundedCircle // Borda arredondada
                  src={ djData.selectedCharacterPath } // Caminho do personagem
                />
                { /* Nome do DJ */ }
                <h2
                  className='text-white' // Classe do texto
                >
                  { djData.name }
                </h2>
              </Container>
              { /* Título da tela */ }
              <h1
                className='text-white' // Cor do texto
              >
                Escolha o seu personagem
              </h1>
              { /* Card que contém os personagens */ }
              <Card
                className='text-center card-style' // Classe do card
                // Estilo do card
                style={{
                  backgroundColor: '#000000', // Cor de fundo do card
                  boxShadow: '0 0 0 0.5px #ffffff', // Sombra do card
                  padding: '0' // Espaçamento do card
                  }}
              >
                <Card.Body>
                  <Row
                    className='image-container' // Classe do container de imagens
                  >
                    { /* Mapeia os caminhos dos personagens e renderiza cada um deles */ }
                    { charactersPaths.map((character, index) => (
                      <Col
                      className='image-col' // Classe da coluna
                        key={ index } // Chave única para cada coluna
                      >
                        <Image
                          alt={ `Personagem ${ index }` } // Texto alternativo
                          className={ `image-style ${ djData.selectedCharacterPath === character ? 'selected-style' : ''}` } // Caso o personagem seja o selecionado, adiciona a classe de estilo apropriada
                          onClick={() => handleClickCharacter(character)} // Função chamada ao clicar no personagem
                          onMouseEnter={() => setHoveredCharacter(character)} // Função chamada ao passar o mouse por cima do personagem
                          onMouseLeave={() => setHoveredCharacter(null)} // Função chamada ao tirar o mouse de cima do personagem
                          src={ character } // Caminho do personagem
                          // Estilo do personagem
                          style={{ opacity: hoveredCharacter === character ? 0.8 : 1 }} // Opacidade do personagem (caso o mouse esteja em cima, a opacidade diminui)
                        />
                      </Col>
                    ))}
                  </Row>
                </Card.Body>
              </Card>
              { /* Botão de confirmar a escolha do personagem */ }
              <Button
                className='mt-3' // Classe de margem superior
                onClick={ handleClick } // Função chamada ao clicar no botão
                // Estilo do botão
                style={{ width: '100%' }} // Largura do botão
                variant='primary' // Cor do botão
              >
                Ok
              </Button>
            </Container>
            // Caso a fase seja 2 renderiza a tela de escolha do nome
          ) : (
            <Container
              className='d-flex flex-column align-items-center' // Classes para centralizar o conteúdo
            >
              { /* Logo horizontal */ }
              <Image
                alt='Logo horizontal' // Texto alternativo
                src={ horizontalLogo } // Caminho do logo
                // Estilo do logo
                style={{ width: '300px' }} // Largura da logo
              />
              { /* Personagem escolhido */ }
              <Image
                alt='Avatar escolhido' // Texto alternativo
                className='chosen-character' // Classe do personagem
                roundedCircle // Borda arredondada
                src={ djData.selectedCharacterPath } // Caminho do personagem
              />
              { /* Contador de caracteres */ }
              <Container
                // Estilo do container
                style={{
                  marginBottom: '10px', // Margem inferior
                  textAlign: 'center' // Alinhamento do texto
                }}>
                <Container
                  as='span' // Define o container como um span
                  style={{ color: djData.name.length < 3 ? 'red' : 'white' }} // Cor do texto (vermelho se o nome tiver menos de 3 caracteres)
                >
                  { djData.name.length }/16
                </Container>
              </Container>
              <Form.Group
                className='d-flex flex-column align-items-center' // Classes para centralizar o conteúdo
              >
                { /* Entrada do nome do DJ */ }
                <Form.Control
                  autoComplete='off' // Desabilita o autocomplete
                  className='my-3 custom-input' // Classe do input
                  maxLength={ 16 } // Limite de caracteres
                  name='name' // Nome do input
                  onChange={ handleChange } // Função chamada ao mudar o valor do input
                  onKeyDown={ handleKeyDown } // Função chamada ao apertar uma tecla
                  placeholder='Insira um vulgo' // Texto placeholder
                  // Estilo do input
                  style={{
                    fontSize: '1.2rem', // Tamanho da fonte
                    height: '50px', // Altura do input
                    marginBottom: '20px', // Margem inferior
                    textAlign: 'center' // Alinhamento do texto
                  }}
                  type='text' // Tipo do input
                  value={ djData.name } // Valor do input
                />
                { /* Botão de confirmar a escolha do nome */ }
                <Button
                  disabled={ buttonDisabled } // Desabilita o botão se o estado buttonDisabled for true
                  onClick={ handleClick } // Função chamada ao clicar no botão
                  // Estilo do botão
                  style={{
                    height: '50px', // Altura do botão
                    fontSize: '1.2rem', // Tamanho da fonte
                    marginTop: '10px', // Margem superior
                    width: '100%' // Largura do botão
                  }}
                  variant='primary' // Cor do botão
                >
                  Ok
                </Button>
              </Form.Group>
            </Container>
          )}
        </Container>
    )}
    </>
  );
};

// Mapeia o estado do Redux para as props do componente
const mapStateToProps = (state: RootState) => ({
  token: state.djReducer.token // Token do DJ
});

const CreateDJConnected = connect(mapStateToProps)(CreateDJ); // Conecta o componente ao Redux

export default CreateDJConnected; // Exporta o componente conectado ao Redux
