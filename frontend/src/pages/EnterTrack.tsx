import { Suspense, useCallback, useEffect, useState  } from 'react';
import { Button, Col, Container, Form, Image, Modal, OverlayTrigger, Row, Spinner, Tooltip } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { FaSignInAlt } from 'react-icons/fa';
import MessagePopup from './MessagePopup';
import { logo } from '../assets/images/characterPath';
import useDJ from '../utils/useDJ';
import useTrack from '../utils/useTrack';
import { RootState } from '../redux/store';
import { connect } from 'react-redux';

interface Props {
  token: string; // Token do DJ, opcional
  onHide?: () => void;
  show?: boolean;
}

// Página de entrar numa pista
const EnterTrack: React.FC<Props> = ({ onHide, show = true, token }) => {
  const { trackIdParam } = useParams(); // Pega o ID da pista da URL
  const navigate = useNavigate();
  const [buttonDisabled, setButtonDisabled] = useState(true); // Estado responsável por habilitar/desabilitar botão
  // Estado responsável por armazenar os dados do popup de mensagem
  const [popupMessageData, setPopupMessageData] = useState({ message: '', redirectTo: '', show: false });
  const [trackId, setTrackId] = useState(''); // Estado responsável por armazenar o id da pista

  const djActions = useDJ(); // Hook personalizado para lidar com as ações relacionadas ao DJ
  const trackActions = useTrack(); // Hook personalzido para lidar com as ações relacioandas à pista

  const handleHide = () => {
    if (onHide) {
      onHide();
    } else {
      navigate('/');
    }
  };

  // Função callback responsávle por validar a entrada do id da pista
  const inputValidation = useCallback(() => {
    // Caso o trackId seja null/undefined ou seja diferente de 6 dígitos o botão vai ficar desabilitado
    setButtonDisabled(!(trackId && trackId.replace(/\s/g, '').length === 6)); 
    // Usa o trackId no array de dependencia pra o UseEffect ser reexecutado sempre que houver uma mudança na variável 
  }, [trackId]);

  // Atualiza o trackId e fase caso exista trackIdParam na URL
  useEffect(() => {
    if (trackIdParam) {
      setTrackId(formatTrackId(trackIdParam));
    }

    inputValidation();
    // Só depende de trackIdParam e inputValidation
  }, [trackIdParam, inputValidation]);

  // Busca um trackId com base no token armazenado no redux caso não exista trackIdParam na URL
  useEffect(() => {
    if (!trackIdParam) {
      const fetchData = async () => {
        const response = await djActions.getDJData(token ?? ''); // Busca os dados do DJ com o token

        // Caso haja resposta e o status for igual a 200
        if (response?.status === 200) {
         setTrackId(formatTrackId(String(response.data.dj.trackId))); // Formata o id da pista e atualiza o estado
        }
      };
      fetchData();
      inputValidation();
    }
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Função responsável por formatar o id da pista (xxx xxx)
  const formatTrackId = (value: string) => {
    const cleaned = value.replace(/\D/g, '').substring(0, 6); // Remove os caracteres não numéricos e pega os 6 primeiros dígitos
    const part1 = cleaned.substring(0, 3); // Pega os 3 primeiros dígitos
    const part2 = cleaned.substring(3, 6); // Pega os 3 últimos dígitos
    return part2 ? `${part1} ${part2}` : part1; // Retorna o id formatado
  };

  // Função reponsável por capturar a mudança na entrada
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatTrackId(event.target.value); // Formata o id da pista
    setTrackId(formattedValue); // Atualiza o estado com o valor formatado
  };

  // Função reponsável por entrar em uma pista 
  const handleClick = async () => {
    const cleanedTrackId = trackId.replace(/\s/g, ''); // Remove espaços do id da pista
    // Caso exista um id da pista
    if (cleanedTrackId) {
      const response = await trackActions.enterTrack(Number(cleanedTrackId)); // Chama a função responsável por entrar na pista
      // Caso haja resposta e o status for igual a 200
      if (response && response.status === 200) {
        if (onHide) {
          onHide();
        }
        navigate(`/create-dj/${cleanedTrackId}`);
        //Caso haja respista e o status for igual a 404
      } else if (response && response.status === 404) {
        // Rendeeriza o popup de mensagem informando que uma pista com aquele id não foi encontrada
        setPopupMessageData({
          message: 'Pista não encontrada', // Mensagem a ser exibida
          redirectTo: '', // Não redireciona para lugar nenhum
          show: true // Mostra o popup
        })
        // Caso contrário
      } else {
        // Rendeeriza o popup de mensagem informando que houve um erro ao tentar entrar na pista
        setPopupMessageData({
          message: 'Erro ao tentar entrar na pista, tente novamente em alguns minutos', // Mensagem a ser exibida
          redirectTo: '', // Não redireciona para lugar nenhum
          show: true // Mostra o popup
        });
      }
    }
  };

  // Função responsável por chamar a função de entrar na pista ao apertar o botão 'enter'
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && trackId.replace(/\s/g, '').length === 6) {
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
          onHide={() => setPopupMessageData({ ...popupMessageData, show: false })} // Função para fechar o popup
        />
      </Suspense>
      <Modal centered className='custom-modal' dialogClassName='login-popup-dialog' onHide={ handleHide } show={ show }>
          <Modal.Header className='custom-modal-header' closeButton>
            <Modal.Title>Entrar numa pista</Modal.Title>
          </Modal.Header>
          <Modal.Body className='py-3'>
        <Row
          className='justify-content-center' // Classes para centralizar o conteúdo
        >
          <Container
            className='d-flex flex-column align-items-center' // Classes para centralizar o conteúdo
          >
            <Col className='text-center'>
              <>
                  { /* Lodo do aplicativo */ }
                  <Image
                    alt='Logo do aplicativo' // Texto alternativo
                    className='img-fluid shadow-lg mb-4' // Classes do Bootstrap para estilização
                    src={ logo } // Caminho da imagem
                    style={{ maxWidth: '120px' }} // Estilo inline para definir a largura máxima
                  />
                  <Form.Group
                    className='mb-3 d-flex flex-column gap-3' // Classes do Bootstrap para espaçamento e organização
                    style={{ maxWidth: '400px'}} // Estilo inline para definir a largura máxima
                  >
                    <h1 className='login-title mb-0' style={{ color: '#fff4c2', fontSize: '1.35rem', margin: 0, textAlign: 'center' }}>
                      Digite o id da pista
                    </h1>
                    { /* Entrada do id da pista */ }
                    <div className='d-flex align-items-center gap-2' style={{ marginLeft: '50px' }}>
                      <Form.Control
                        autoComplete="off"
                        className="text-center custom-input flex-grow-1"
                        maxLength={ 7 }
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Ex: 000 000 🔥"
                        style={{
                          minWidth: 0,
                          zIndex: 1, // Garante que o input esteja acima de outros elementos
                          position: "relative", // Evita que estilos herdados causem problemas
                        }}
                        type="text"
                        value={trackId}
                      />
                      <OverlayTrigger
                        overlay={<Tooltip>Entrar na pista</Tooltip>}
                        placement='top'
                      >
                        <span className='d-block'>
                        <Button
                          aria-label='Entrar na pista'
                          className='d-flex align-items-center justify-content-center flex-shrink-0'
                          disabled={ buttonDisabled } // Desabilita o botão caso o estado buttonDisabled seja true
                          onClick={ handleClick } // Função chamada ao clicar no botão
                          style={{ width: '48px', height: '42px' }}
                          variant='outline-warning' // Mantém o botão alinhado à moldura dourada do modal
                        >
                          <FaSignInAlt aria-hidden='true' />
                        </Button>
                        </span>
                      </OverlayTrigger>
                    </div>
                  </Form.Group>
              </>
            </Col>
          </Container>
        </Row>
          </Modal.Body>
        </Modal>
    </>
  );
};

// Função para mapear o estado do Redux para as props do componente
const mapStateToProps = (state: RootState) => ({
  token: state.reducer.token, // Token do DJ
});

const EnterTrackConnected = connect(mapStateToProps)(EnterTrack); // Conecta o componente ao Redux

export default EnterTrackConnected; // Exporta o componente EnterTrack