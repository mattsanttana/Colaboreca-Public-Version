import { Suspense, useCallback, useEffect, useState  } from 'react';
import { Button, Col, Container, Form, Image, Row, Spinner } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import CreateDJ from './CreateDJ'
import MessagePopup from './MessagePopup';
import { logo } from '../assets/images/characterPath';
import useDJ from '../utils/useDJ';
import useTrack from '../utils/useTrack';
import { RootState } from '../redux/store';
import { connect } from 'react-redux';

interface Props {
  djToken?: string; // Token do DJ, opcional
}

// Página de entrar numa pista
const EnterTrack: React.FC<Props> = ({ djToken }) => {
  const { trackIdParam } = useParams(); // Pega o ID da pista da URL
  const [buttonDisabled, setButtonDisabled] = useState(true); // Estado responsável por habilitar/desabilitar botão
  const [phase, setPhase] = useState(1); // Estado responsável por aramazenar a fase que o usuário está (entrar ou criar o dj)
  // Estado responsável por armazenar os dados do popup de mensagem
  const [popupMessageData, setPopupMessageData] = useState({ message: '', redirectTo: '', show: false });
  const [trackId, setTrackId] = useState(''); // Estado responsável por armazenar o id da pista

  const djActions = useDJ(); // Hook personalizado para lidar com as ações relacionadas ao DJ
  const trackActions = useTrack(); // Hook personalzido para lidar com as ações relacioandas à pista

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
      setPhase(2);
    }

    inputValidation();
    // Só depende de trackIdParam e inputValidation
  }, [trackIdParam, inputValidation]);

  // Busca um trackId com base no token armazenado no redux caso não exista trackIdParam na URL
  useEffect(() => {
    if (!trackIdParam) {
      const fetchData = async () => {
        const response = await djActions.getDJData(djToken ?? ''); // Busca os dados do DJ com o token

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
        setPhase(2); // Muda a fase para 2
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
          handleClose={() => setPopupMessageData({ ...popupMessageData, show: false })} // Função para fechar o popup
        />
      </Suspense>
      <Container
        className='d-flex align-items-center justify-content-center vh-100' // Classes para centralizar o conteúdo vertical e horizontalmente
      >
        <Row
          className='justify-content-center' // Classes para centralizar o conteúdo
        >
          <Container
            className='d-flex flex-column align-items-center' // Classes para centralizar o conteúdo
          >
            <Col
              className='text-center mb-5' // Classes para centralizar o conteúdo
            >
              { /* Caso a fase seja um renderiza a página de entrar numa pista */ }
              { phase === 1 ? (
                <>
                  { /* Lodo do aplicativo */ }
                  <Image
                    alt='Logo do aplicativo' // Texto alternativo
                    className='img-fluid shadow-lg mb-5' // Classes do Bootstrap para estilização
                    src={ logo } // Caminho da imagem
                    style={{ maxWidth: '300px' }} // Estilo inline para definir a largura máxima
                  />
                  <Form.Group
                    className='mb-3' // Classe do Bootstrap para margem inferior
                    style={{ maxWidth: '500px'}} // Estilo inline para definir a largura máxima
                  >
                    { /* Entrada do id da pista */ }
                    <Form.Control
                      autoComplete='off' // Desabilita o autocomplete do navegador
                      className='text-center custom-input' // Classe personalizada para estilização
                      inputMode='numeric' // Especifica que o teclado numérico deve ser exibido
                      name='trackId' // Nome do campo
                      onChange={ handleChange } // Função chamada ao mudar o valor do campo
                      onKeyDown={ handleKeyDown } // Função chamada ao apertar uma tecla
                      placeholder='Pin da Pista' // Texto placeholder
                      // Estilo da entrada
                      style={{
                        height: '50px', // Altura do campo
                        fontSize: '1.2rem', // Tamanho da fonte
                        marginBottom: '20px', // Margem inferior
                        textAlign: 'center' // Alinhamento do texto
                      }}
                      type='text' // Tipo do campo
                      value={ trackId } // Valor do campo
                    />
                    <Button
                      disabled={ buttonDisabled } // Desabilita o botão caso o estado buttonDisabled seja true
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
                      Entrar
                    </Button>
                  </Form.Group>
                </>
              ) : (
                // Caso a fase seja 2 renderiza a página de criar o dj
                <CreateDJ
                  trackId={ trackId.replace(/\s/g, '') } // Passa o id da pista sem espaços como propriedade
                />
              )}
            </Col>
          </Container>
        </Row>
      </Container>
    </>
  );
};

// Função para mapear o estado do Redux para as props do componente
const mapStateToProps = (state: RootState) => ({
  djToken: state.djReducer.token, // Token do DJ
  trackToken: state.trackReducer.token // Token da pista
});

const EnterTrackConnected = connect(mapStateToProps)(EnterTrack); // Conecta o componente ao Redux

export default EnterTrackConnected; // Exporta o componente EnterTrack