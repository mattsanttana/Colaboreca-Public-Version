import { useEffect, useState } from 'react';
import { Card, Container, Image } from 'react-bootstrap';
import { podium } from '../assets/images/characterPath';
import { DJ } from '../types/DJ';

// Props do componente
type Props = {
  djs: DJ[]; // Lista de DJs
}

// Componente de pódio
const Podium: React.FC<Props> = ({ djs }) => {
  const [djPodium, setPodium] = useState<DJ[]>([]); // Estado para armazenar o pódio

  // useEffect para atualizar o pódio sempre que a lista de DJs mudar
  useEffect(() => {
    const sortedDJs = [...djs].sort((a, b) => b.score - a.score); // Ordena os DJs por pontuação
    const newPodium = sortedDJs.filter(dj => dj.ranking > 0).slice(0, 3); // Filtra os DJs com ranque maior que 0 e pega os 3 primeiros
    
    setPodium(newPodium); // Atualiza o estado do pódio

    // O useEffect é chamado sempre que a lista de DJs muda
  }, [djs]);

  // Renderiza o componente
  return (
    <Container className='py-4'>
      <Card
        className='text-center text-light' // Classe para centralizar o texto e aplicar cor
        // Estilo do card
        style={{
          boxShadow: '0 0 0 0.5px #ffffff', // Sombra do card
          top: '60px' // Distância do topo
        }}
      >
        <Card.Body
          className='hide-scrollbar' // Classe para esconder a barra de rolagem
          style={{ height: '400px' }} // Estilo para altura e rolagem
        >
          <div className='podium-wrapper'>
            { /* Imagem do pódio */ }
            <Image
              alt='Pódio' // Texto alternativo da imagem
              className='podium-img' // Classe da imagem do pódio
              src={ podium } // Caminho da imagem do pódio
            />
            <Container>
              { /* 1º lugar */ }
              { djPodium[0] && (
                <div className='dj-rank dj-rank-1'>
                  { /* Nome do DJ no 1º lugar */ }
                  <p className='text-light mt-3'>{ djPodium[0].djName }</p> 
                  { /* Imagem do DJ no pódio */ }
                  <Image
                    alt={ `Personagem do 1º lugar no pódio: ${ djPodium[0].djName }` } // Texto alternativo da imagem
                    className='dj-img' // Classe da imagem do DJ
                    key={ djPodium[0].id } // Chave única para o componente
                    src={ djPodium[0].characterPath } // Caminho da imagem do DJ
                  />
                </div>
              )}
              { /* 2º lugar */ }
              { djPodium[1] && (
                <div className='dj-rank dj-rank-2'>
                  <p className='text-light mt-3'>{ djPodium[1].djName }</p>
                  { /* Renderiza o popover com as opções de perfil e chat */ }
                  <Image
                    alt={ `Personagem do 2º lugar no pódio: ${ djPodium[1].djName }` } // Texto alternativo da imagem
                    className='dj-img' // Classe da imagem do DJ
                    key={ djPodium[1].id } // Chave única para o componente
                    src={ djPodium[1].characterPath } // Caminho da imagem do DJ
                  />
                </div>
              )}
              { /* 3º lugar */ }
              { djPodium[2] && (
                <div className='dj-rank dj-rank-3'>
                  { /* Renderiza o nome do DJ no 3º lugar */ }
                  <p className='text-light mt-3'>{ djPodium[2].djName }</p>
                  <Image
                    alt={ `Personagem do 3º lugar no pódio: ${ djPodium[2].djName }` } // Texto alternativo da imagem
                    className='dj-img' // Classe da imagem do DJ
                    key={ djPodium[2].id } // Chave única para o componente
                    src={ djPodium[2].characterPath } // Caminho da imagem do DJ
                  />
                </div>
              )}
            </Container>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Podium; // Exporta o componente Podium