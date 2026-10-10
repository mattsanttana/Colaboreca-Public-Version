import React from 'react';
import { Image, Col, Button } from 'react-bootstrap';
import { DJ } from '../types/DJ';
import { FaArrowDown, FaArrowUp, FaStar } from 'react-icons/fa';
import { BsPencilFill } from 'react-icons/bs';
import useRankingTable from '../utils/useRankingTable';

type Props = {
  currentRanking: DJ[]; // Ranking atual
  dj: DJ | undefined; // DJ logado (pode ser undefined se o usuário não for um DJ)
  onEdit?: () => void;
  previousRanking: DJ[]; // Ranking anterior
  showEditButton?: boolean;
};

const DJProfileMini: React.FC<Props> = ({ currentRanking, dj, onEdit, previousRanking, showEditButton = false }) => {
  const { points, pointDirection, formatScore } = useRankingTable(currentRanking, dj, previousRanking );

  if (!dj) return null;
  
  return (
    <Col className='d-flex flex-column align-items-center dj-profile-mini'>
      {/* Wrapper para posicionar rank sobre a imagem */}
      <div className='dj-profile-avatar-wrapper'>
        { showEditButton && onEdit && (
          <Button
            aria-label='Editar perfil do DJ'
            className='dj-profile-edit-icon'
            onClick={ onEdit }
            title='Editar perfil'
            type='button'
          >
            <BsPencilFill aria-hidden='true' />
          </Button>
        ) }
        <Image
          alt={ `Personagem do DJ ${ dj?.djName }` }
          className='img-fluid rounded-circle mb-3 profile-avatar'
          src={ dj?.characterPath }
          style={{
            backgroundColor: '#2e30594D',
            border: '3px solid #494c80',
            objectFit: 'cover',
            objectPosition: 'center',
            boxShadow: '0 0 24px rgba(73, 76, 128, 0.45)',
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
                ? 'linear-gradient(145deg, #fff2a8 0%, #ffd700 52%, #b8860b 100%)'
                : dj?.ranking === 2
                ? 'linear-gradient(145deg, #ffffff 0%, #d9dee5 52%, #8994a3 100%)'
                : dj?.ranking === 3
                ? 'linear-gradient(145deg, #ffd0a3 0%, #cd7f32 52%, #8b4513 100%)'
                : 'linear-gradient(145deg, #343434, #171717)',
            color: dj?.ranking && dj.ranking <= 3 ? '#000' : '#fff',
            fontWeight: 'bold',
            fontSize: '1.5rem',
            fontFamily: '"Bebas Neue", Oswald, Arial, sans-serif',
            border:
              dj?.ranking === 1
                ? '2px solid #fff2a8'
                : dj?.ranking === 2
                ? '2px solid #f1f5f9'
                : dj?.ranking === 3
                ? '2px solid #ffe0bf'
                : '2px solid #494c80',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow:
              dj?.ranking === 1
                ? '0 0 0 3px rgba(255, 215, 0, 0.2), 0 0 14px rgba(255, 215, 0, 0.72), inset 0 1px 3px rgba(255, 255, 255, 0.65)'
                : dj?.ranking === 2
                ? '0 0 0 3px rgba(217, 222, 229, 0.2), 0 0 14px rgba(217, 222, 229, 0.65), inset 0 1px 3px rgba(255, 255, 255, 0.8)'
                : dj?.ranking === 3
                ? '0 0 0 3px rgba(205, 127, 50, 0.22), 0 0 14px rgba(205, 127, 50, 0.68), inset 0 1px 3px rgba(255, 224, 191, 0.65)'
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
            color: '#fff4c2',
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