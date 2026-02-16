import React from 'react';
import { Image, Col } from 'react-bootstrap';
import { DJ } from '../types/DJ';
import { FaArrowDown, FaArrowUp, FaStar } from 'react-icons/fa';
import useRankingTable from '../utils/useRankingTable';

type Props = {
  currentRanking: DJ[]; // Ranking atual
  dj: DJ | undefined; // DJ logado (pode ser undefined se o usuário não for um DJ)
  previousRanking: DJ[]; // Ranking anterior
};

const DJProfileMini: React.FC<Props> = ({ currentRanking, dj, previousRanking }) => {
  const { points, pointDirection, formatScore } = useRankingTable(currentRanking, dj, previousRanking );

  if (!dj) return null;
  
  return (
    <Col className='d-flex flex-column align-items-center'>
      {/* Wrapper para posicionar rank sobre a imagem */}
      <div style={{ position: 'relative', width: '250px', height: '250px' }}>
        <Image
          alt={ `Personagem do DJ ${ dj?.djName }` }
          className='img-fluid rounded-circle mb-3 profile-avatar'
          src={ dj?.characterPath }
          style={{
            backgroundColor: '#2e30594D',
            border: '2px solid #000',
            height: '230px',
            width: '230px',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />
        {/* Rank dentro da imagem */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            background:
              dj?.ranking === 1
                ? '#FFD700'
                : dj?.ranking === 2
                ? '#C0C0C0'
                : dj?.ranking === 3
                ? '#CD7F32'
                : '#222',
            color: dj?.ranking && dj.ranking <= 3 ? '#000' : '#fff',
            fontWeight: 'bold',
            fontSize: '1.5rem',
            fontFamily: '"Bebas Neue", Oswald, Arial, sans-serif',
            border: '2px solid #444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow:
              dj?.ranking === 1
                ? '0 0 8px #FFD700'
                : dj?.ranking === 2
                ? '0 0 8px #C0C0C0'
                : dj?.ranking === 3
                ? '0 0 8px #CD7F32'
                : 'none',
          }}
        >
          { dj?.ranking ? dj.ranking : '—' }
        </div>
      </div>
      {/* Nome e pontuação */}
      <div 
        className='d-flex flex-column align-items-center mt-2'
        style={{ lineHeight: '1.2' }}
      >
        {/* Nome */}
        <div
          style={{
            fontSize: '1.2rem',
            fontWeight: '600',
            color: '#ccc', // cor clarinha pra combinar com o fundo
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          { dj?.djName }
        </div>

        {/* Pontuação */}
        <div
          // Classe condicional para indicar aumento ou diminuição de pontos
          className={ `flex-shrink-0 text-light ${
            pointDirection[dj.id] === 'up' ? 'points-up' : pointDirection[dj.id] === 'down' ? 'points-down' : ''
          }` }
        >
          <span className='d-flex align-items-center'>
            { formatScore(points[dj.id] !== undefined ? points[dj.id] : dj.score) } { /* Formata e exibe a pontuação */ }
            <FaStar className='ms-2 points-icon' /> { /* Ícone de estrela */ }
            { pointDirection[dj.id] === 'up' && <FaArrowUp className='ms-2 point-arrow up' /> } { /* Ícone de seta para cima se pontos aumentaram */ }
            { pointDirection[dj.id] === 'down' && <FaArrowDown className='ms-2 point-arrow down' /> } { /* Ícone de seta para baixo se pontos diminuíram */ }
          </span>
                    </div>
      </div>
    </Col>
  )
};

export default DJProfileMini;