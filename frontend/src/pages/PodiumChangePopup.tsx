import React from 'react';
import { Card, Container, Image } from 'react-bootstrap';
import { useSpring, animated } from '@react-spring/web';
import { podium } from '../assets/images/characterPath';
import { DJ } from '../types/DJ';

// Props recebidas
interface Props {
  dj: DJ | undefined; // DJ atual
  djPodium: DJ[]; // DJs do pódio
}

// Componente do popup de animação de alteração no pódio
const PodiumChangePopup: React.FC<Props> = ({ dj, djPodium }) => {
  // Animação de pulo no DJ que mudou
  const jumpAnimation = useSpring({
    from: { transform: 'translateY(0px)' }, // Início da animação
    to: { transform: 'translateY(-10px)' }, // Fim da animação
    config: { duration: 300 }, // Configuração da animação
    loop: { reverse: true }, // Faz a animação voltar
  });

  return (
    <Container className='d-flex justify-content-center align-items-center'>
      { /* Imagem do pódio */ }
      <Image
        alt='pódio' // Texto alternativo
        src={ podium } // Caminho da imagem do pódio
        // Estilo da imagem do pódio
        style={{
          marginLeft: '30px', // Margem esquerda
          width: '300px' // Largura da imagem
        }}
      />
      { /* DJs em cima do pódio */ }
      <Container>
        { /* 1º lugar do pódio */ }
        { djPodium[0] && (
          <Container>
            { /* Animação de pulo para o DJ que está em 1º lugar */ }
            <animated.div
              key={ djPodium[0].id } // Chave única para o DJ
              style={ djPodium[0].id === dj?.id ? jumpAnimation : {} } // Se o DJ atual estiver em 1º no pódio, anima o personagem (pulando)
            >
              { /* Nome do DJ em cima do personagem */ }
              <p 
                className='text-light mt-3' // Classe para o texto
                // Estilo do texto
                style={{
                  marginBottom: !djPodium[1] && !djPodium[2] ? '310px' : !djPodium[2] ? '40px' : '0px', // Margem inferior
                  marginLeft: '-170px' // Margem esquerda
                }}>
                { djPodium[0].djName } { /* Nome do DJ */ }
              </p>
              { /* Imagem do personagem em cima do pódio de 1º lugar */ }
              <Card.Img
                alt={ `Personagem do DJ ${ djPodium[0].djName }` } // Texto alternativo
                src={ djPodium[0].characterPath } // Caminho da imagem
                // Estilo da imagem
                style={{
                  marginLeft: '-220px', // Margem esquerda
                  marginTop: !djPodium[1] && !djPodium[2] ? '-320px' : !djPodium[2] ? '-30px' : '-5px', // Margem superior
                  position: 'absolute', // Posição absoluta
                  width: '160px' // Largura da imagem
                }}
              />
            </animated.div>
          </Container>
        )}
        { /* 2º lugar do pódio */ }
        { djPodium[1] && (
          <Container>
            { /* Animação de pulo para o DJ que está em 2º lugar */ }
            <animated.div
              key={ djPodium[1].id } // Chave única para o DJ
              style={ djPodium[1].id === dj?.id ? jumpAnimation : {} } // Se o DJ atual estiver em 2º no pódio, anima o personagem (pulando)
            >
              { /* Nome do DJ em cima do personagem */ }
              <p
                className='text-light mt-3' // Classe para o texto
                // Estilo do texto
                style={{
                  marginBottom: !djPodium[2] ? '300px' : '-30px', // Margem inferior
                  marginLeft: '-290px' // Margem esquerda
                }}
              >
                { djPodium[1].djName } { /* Nome do DJ */ }
              </p>
              {  /* Imagem do personagem em cima do pódio de 2º lugar */  }
              <Card.Img
                alt={ `Personagem do DJ ${ djPodium[1].djName }` } // Texto alternativo
                src={ djPodium[1].characterPath } // Caminho da imagem
                style={{
                  marginLeft: '-320px', // Margem esquerda
                  marginTop: !djPodium[2] ? '-300px' : '30px', // Margem superior
                  position: 'absolute', // Posição absoluta
                  width: '140px' // Largura da imagem
                }}
              />
            </animated.div>
          </Container>
        )}
        { /* 3º lugar do pódio */ }
        { djPodium[2] && (
          <Container>
            { /* Animação de pulo para o DJ que está em 3º lugar */ }
            <animated.div
              key={ djPodium[2].id } // Chave única para o DJ
              style={ djPodium[2].id === dj?.id ? jumpAnimation : {} } // Se o DJ atual estiver em 3º no pódio, anima o personagem (pulando)
            >
              { /* Nome do DJ em cima do personagem */ }
              <p
                className='text-light mt-3' // Classe para o texto
                style={{
                  marginLeft: '-80px', // Margem esquerda
                  marginBottom: '260px' // Margem inferior
                }}
              >
                { djPodium[2].djName } { /* Nome do DJ */ }
              </p>
              { /* Imagem do personagem em cima do pódio de 3º lugar */ }
              <Card.Img
                alt={ djPodium[2].djName } // Texto alternativo
                src={ `Personagem do DJ ${ djPodium[2].djName }` } // Caminho da imagem
                style={{
                  marginLeft: '-110px', // Margem esquerda
                  marginTop: '-255px', // Margem superior
                  position: 'absolute', // Posição absoluta
                  width: '130px' // Largura da imagem
                }}
              />
            </animated.div>
          </Container>
        )}
      </Container>
    </Container>
  )}

export default PodiumChangePopup;
