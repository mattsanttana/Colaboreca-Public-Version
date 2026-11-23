import '../../styles/ranking/Podium.css';
import { useEffect, useState } from 'react';
import { Card, Container, Image } from 'react-bootstrap';
import { podium } from '../../assets/images/characterPath';
import { DJ } from '../../types/DJ';

// Props do componente
type Props = {
  dj?: DJ;
  djs: DJ[];
  featured?: boolean;
  preview?: boolean;
  trackName: string;
};

const Podium: React.FC<Props> = ({ dj, djs, featured = false, preview = false, trackName }) => {
  const [djPodium, setPodium] = useState<DJ[]>([]);

  useEffect(() => {
    const sortedDJs = [...djs].sort((firstDJ, secondDJ) => secondDJ.score - firstDJ.score);
    setPodium(sortedDJs.filter((candidate) => candidate.ranking > 0).slice(0, 3));
  }, [djs]);

  return (
    <Container className={`ranking-podium-container ${ featured ? 'featured' : '' } ${ preview ? 'preview' : '' }`}>
      <Card className='text-center ranking-podium-card'>
        <Card.Header className='ranking-podium-header'>
          <div className='ranking-track-name'>{ trackName }</div>
        </Card.Header>
        <Card.Body className='ranking-podium-body'>
          <div className='podium-wrapper'>
            <Image alt='Pódio' className='podium-img' src={ podium } />
            <Container>
              { djPodium[0] && (
                <div className='dj-rank dj-rank-1'>
                  <div className={ dj?.id === djPodium[0].id ? 'dj-dancing' : '' }>
                    <p className='dj-podium-name'>{ djPodium[0].djName }</p>
                    <Image
                      alt={ `Personagem do 1º lugar no pódio: ${ djPodium[0].djName }` }
                      className='dj-img'
                      key={ djPodium[0].id }
                      src={ djPodium[0].characterPath }
                    />
                  </div>
                </div>
              ) }
              { djPodium[1] && (
                <div className='dj-rank dj-rank-2'>
                  <div className={ dj?.id === djPodium[1].id ? 'dj-dancing' : '' }>
                    <p className='dj-podium-name'>{ djPodium[1].djName }</p>
                    <Image
                      alt={ `Personagem do 2º lugar no pódio: ${ djPodium[1].djName }` }
                      className='dj-img'
                      key={ djPodium[1].id }
                      src={ djPodium[1].characterPath }
                    />
                  </div>
                </div>
              ) }
              { djPodium[2] && (
                <div className='dj-rank dj-rank-3'>
                  <div className={ dj?.id === djPodium[2].id ? 'dj-dancing' : '' }>
                    <p className='dj-podium-name'>{ djPodium[2].djName }</p>
                    <Image
                      alt={ `Personagem do 3º lugar no pódio: ${ djPodium[2].djName }` }
                      className='dj-img'
                      key={ djPodium[2].id }
                      src={ djPodium[2].characterPath }
                    />
                  </div>
                </div>
              ) }
            </Container>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Podium;