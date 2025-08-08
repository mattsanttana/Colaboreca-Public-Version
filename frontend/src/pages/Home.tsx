import { useNavigate } from 'react-router-dom';
import { Button, Col, Container, Image, Row } from 'react-bootstrap';
import { logo } from '../assets/images/characterPath';

// Página inicial
const Home = () => {
  const navigate = useNavigate(); // Hook para navegação entre páginas

  return (
    <Container
      className='d-flex align-items-center justify-content-center vh-100 text-light' // Classes para centralizar o conteúdo
    >
      <Row
        className='w-100' // Largura da linha
      >
        <Col
          className='d-flex justify-content-center align-items-center' // Classes para centralizar o conteúdo
          md={ 6 } // Largura da coluna
        >
          {/* Logo do aplicativo */}
          <Image 
            alt='Logo do aplicativo' // Texto alternativo
            className='img-fluid shadow-lg logo'  // Class para estilização
            src={ logo } // Caminho da imagem
            style={{ maxWidth: '350px' }} // Estilo para definir a largura máxima
          />
        </Col>
        <Col
          className='d-flex flex-column justify-content-center align-items-center' // Classes para centralizar o conteúdo
          md={ 6 } // Largura da coluna
        >
            {/* Título da página */}
            <h1 className='login-title'>Crie ou entre numa pista para começar</h1>
            {/* Botões de navegação */}
            <Button 
              className='menu-button'  // Classe para estilização
              onClick={() => navigate('/login')} // Navegação para a página de login
              variant='primary' // Cor do botão
            >
              Criar Uma Pista
            </Button>
            <Button 
              className='menu-button' // Classe para estilização
              onClick={() => navigate('/enter-track')} // Navegação para a página de entrar numa pista
              variant='secondary' // Cor do botão
            >
              Entrar Numa Pista
            </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;