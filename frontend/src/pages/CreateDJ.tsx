import React, { useState, useEffect, Suspense } from 'react';
import { connect, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Container, Button, Form, Row, Col, Image, Card, Spinner } from 'react-bootstrap';
import { saveDJ } from '../redux/actions';
import { RootState } from '../redux/store';
import MessagePopup from './MessagePopup';
import useDJ from '../utils/useDJ';
import { charactersPaths, horizontalLogo, logo } from '../assets/images/characterPath';

interface CreateDJProps {
  token: string;
  trackId: string;
}

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
      const response = await djActions.getDJData(token); // Chama a função que verifica se o DJ já foi criado
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
        trackId // ID da pista
      });

      // Se o status for igual a 201
      if (dj?.status === 201) {
        dispatch(saveDJ(dj.data.token)); // Salva o token do DJ no Redux
        navigate(`/track/${trackId}`); // Redireciona o usuário para à pista
        // Se o status for igual a 400
      } else if (dj?.status === 400) {
        // Renderiza uma mensagem de erro dizendo que aquele nome de usuário já existe
        setPopupMessageData({
          message: 'Este vulgo já existe, por favor tente outro',
          redirectTo: '',
          show: true
        })
        // Se o status for igual a 401
      } else if (dj?.status === 401) {
        setPopupMessageData({
          message: 'Pista excluída, por favor entre em uma nova pista',
          redirectTo: '/',
          show: true
        })
      } else {
        setPopupMessageData({
          message: 'Algo deu errado, por favor tente novamente em alguns minutos',
          redirectTo: '/',
          show: true
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
    if (event.key === 'Enter') {
      handleClick();
    }
  };

  return (
    <>
      { /* Caso o popup tenha que ser aberto e ainda não tiver carregado renderizar um spinner */ }
      <Suspense fallback={<Spinner />}>
        {/* Componente de popup de mensagem */}
        <MessagePopup
          data={ popupMessageData } // Dados da mensagem
          handleClose={() => setPopupMessageData({ ...popupMessageData, show: false })} // Função para fechar o popup
        />
      </Suspense>
      { /* Componente de carregamento */ }
      { isLoading ? (
        <Container
          className='d-flex justify-content-center align-items-center'
          style={{ height: '100vh' }}
        >
          <Image alt='Loading Logo' className='logo-spinner' src={ logo } />
        </Container>
      ) : (
        <Container className='menu-container'>
          { phase === 1 ? (
            <Container className='menu-background'>
              <Image src={ horizontalLogo } alt='horizontalLogo' className='logo' style={{width: '200px'}}/>
              <Container className='text-center'>
                <Image src={ djData.selectedCharacterPath } alt='Avatar escolhido' className='chosen-character' roundedCircle />
                <h2 className='text-white'>{ djData.name }</h2>
              </Container>
              <h1 className='text-white'>Escolha o seu personagem</h1>
              <Card
                className='text-center card-style'
                style={{
                  backgroundColor: '#000000',
                  boxShadow: '0 0 0 0.5px #ffffff',
                  padding: '0'
                  }}
                  >
                <Card.Body>
                  <Row className='image-container'>
                    {charactersPaths.map((character, index) => (
                      <Col key={index} className='image-col'>
                        <Image
                          src={character}
                          alt={`Character ${index}`}
                          onClick={() => handleClickCharacter(character)}
                          onMouseEnter={() => setHoveredCharacter(character)}
                          onMouseLeave={() => setHoveredCharacter(null)}
                          className={`image-style ${djData.selectedCharacterPath === character ?
                            'selected-style' : ''}`}
                          style={{ opacity: hoveredCharacter === character ? 0.8 : 1 }}
                        />
                      </Col>
                    ))}
                  </Row>
                </Card.Body>
              </Card>
              <Button variant='primary' onClick={handleClick} className='mt-3' style={{ width: '100%'}}>Ok</Button>
            </Container>
          ) : (
            <div className='d-flex flex-column align-items-center'>
              <Image src={ horizontalLogo } alt='horizontal_logo' style={{width: '300px'}}/>
              <Image
                src={ djData.selectedCharacterPath }
                alt='Avatar escolhido'
                className='chosen-character'
                roundedCircle
                />
              <div style={{ marginBottom: '10px', textAlign: 'center' }}>
                <span style={{ color: djData.name.length < 3 ? 'red' : 'white' }}>
                  { djData.name.length }/16
                </span>
              </div>
              <Form.Group className='d-flex flex-column align-items-center'>
                <Form.Control
                  type='text'
                  placeholder='Insira um vulgo'
                  name='name'
                  value={ djData.name }
                  onChange={ handleChange }
                  onKeyDown={ handleKeyDown }
                  className='my-3 custom-input'
                  style={{ height: '50px', fontSize: '1.2rem', marginBottom: '20px', textAlign: 'center' }}
                  autoComplete='off'
                  maxLength={ 16 }
                />
                <Button
                  variant='primary'
                  onClick={ handleClick }
                  disabled={ buttonDisabled }
                  style={{ height: '50px', fontSize: '1.2rem', marginTop: '10px', width: '100%' }}
                  >
                    Ok
                </Button>
              </Form.Group>
            </div>
          )}
        </Container>
    )}
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  token: state.djReducer.token
});

const CreateDJConnected = connect(mapStateToProps)(CreateDJ);

export default CreateDJConnected;
