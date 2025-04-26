import { Suspense, useCallback, useEffect, useState  } from 'react';
import { Button, Col, Container, Form, Image, Row, Spinner } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import CreateDJConnected from './CreateDJ'
import MessagePopup from './MessagePopup';
import { logo } from '../assets/images/characterPath';
import useTrack from '../utils/useTrack';

const EnterTrack: React.FC = () => {
  const { trackIdParam } = useParams(); // Pega o ID da pista da URL
  const [buttonDisabled, setButtonDisabled] = useState(true); // Estado responsável por habilitar/desabilitar botão
  const [phase, setPhase] = useState(1); // Estado responsável por aramazenar a fase que o usuário está (entrar ou criar o dj)
  const [popupMessageData, setPopupMessageData] = useState({ message: '', redirectTo: '', show: false }); // Estado responsável por armazenar os dados do popup de mensagem
  const [trackId, setTrackId] = useState(''); // Estado responsável por armazenar o id da pista

  const trackActions = useTrack(); // Hook personalzido para lidar com as ações relacioandas à pista

  // Função callback responsávle por validar a entrada do id da pista
  const inputValidation = useCallback(() => {
    setButtonDisabled(!(trackId && trackId.replace(/\s/g, '').length === 6)); // Caso o trackId seja null/undefined ou seja diferente de 6 dígitos o botão vai ficar desabilitado
    // Usa o trackId no array de dependencia pra o UseEffect ser reexecutado sempre que houver uma mudança na variável 
  }, [trackId]);

  // UseEffect responsável por mudar a fase (entrar ou criar o dj) caso o trackId já tenha sido passado na URL
  useEffect(() => {
    if (trackIdParam) {
      setTrackId(trackIdParam);
      setPhase(2);
    }
    inputValidation();
  }, [inputValidation, trackIdParam]);

  // Função responsável por formatar o id da pista (xxx xxx)
  const formatTrackId = (value: string) => {
    const cleaned = value.replace(/\D/g, '').substring(0, 6); // Remove non-digits and limit to 6 digits
    const part1 = cleaned.substring(0, 3);
    const part2 = cleaned.substring(3, 6);
    return part2 ? `${part1} ${part2}` : part1;
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
      const response = await trackActions.enterTrack(cleanedTrackId); // Chama a função responsável por entrar na pista
      // Caso haja resposta e o status for igual a 200
      if (response && response.status === 200) {
        setPhase(2); // Muda a fase para 2
        //Caso haja respista e o status for igual a 404
      } else if (response && response.status === 404) {
        // Rendeeriza o popup de mensagem informando que com aquele id não foi encontrada
        setPopupMessageData({
          message: 'Pista não encontrada',
          redirectTo: '',
          show: true
        })
        // Caso contrário
      } else {
        // Rendeeriza o popup de mensagem informando que houve um erro ao tentar entrar na pista
        setPopupMessageData({
          message: 'Erro ao tentar entrar na pista, tente novamente em alguns minutos',
          redirectTo: '',
          show: true
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
      <Suspense fallback={<Spinner />}>
        {/* Componente de popup de mensagem */}
        <MessagePopup
          data={ popupMessageData } // Dados da mensagem
          handleClose={() => setPopupMessageData({ ...popupMessageData, show: false })} // Função para fechar o popup
        />
      </Suspense>
      <Container className='d-flex align-items-center justify-content-center vh-100'>
        <Row className='justify-content-center'>
          <Container className='d-flex flex-column align-items-center'>
            <Col className='text-center mb-5'>
              { /* Caso a fase seja um renderiza a página de entrar numa pista */ }
              { phase === 1 ? (
                <>
                  { /* Lodo do aplicativo */ }
                  <Image
                    alt='logo' // Texto alternativo para a imagem
                    className='img-fluid shadow-lg mb-5' // Classes do Bootstrap para estilização
                    src={ logo } // Caminho da imagem
                    style={{ maxWidth: '300px' }} // Estilo inline para definir a largura máxima
                  />
                  <Form.Group className='mb-3' style={{ maxWidth: '500px'}}>
                    { /* Entrada do id da pista */ }
                    <Form.Control
                      autoComplete='off' // Desabilita o autocomplete do navegador
                      className='text-center custom-input' // Classe personalizada para estilização
                      name='trackId' // Nome do campo
                      onChange={ handleChange } // Função chamada ao mudar o valor do campo
                      onKeyDown={ handleKeyDown } // Função chamada ao apertar uma tecla
                      placeholder='Pin da Pista' // Texto placeholder
                      style={{ height: '50px', fontSize: '1.2rem', marginBottom: '20px', textAlign: 'center' }} // Estilo inline
                      type='text' // Tipo do campo
                      value={ trackId } // Valor do campo
                    />
                    <Button
                      disabled={ buttonDisabled } // Desabilita o botão caso o estado buttonDisabled seja true
                      onClick={ handleClick } // Função chamada ao clicar no botão
                      style={{ height: '50px', fontSize: '1.2rem', marginTop: '10px', width: '100%' }} // Estilo inline
                      variant='primary' // Cor do botão
                    >
                      Entrar
                    </Button>
                  </Form.Group>
                </>
              ) : (
                // Caso a fase seja 2 renderiza a página de criar o dj
                <CreateDJConnected trackId={ trackId.replace(/\s/g, '') } />
              )}
            </Col>
          </Container>
        </Row>
      </Container>
    </>
  );
};

export default EnterTrack; // Exporta o componente EnterTrack