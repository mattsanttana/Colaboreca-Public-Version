import React from 'react';
import { Image, Col, Container } from 'react-bootstrap';
import { DJ } from '../types/DJ';

// Recebe as props
type Props = {
  dj: DJ | undefined; // DJ cujas informações serão exibidas
};

const DJProfileMini: React.FC<Props> = ({ dj }) => (
   <Col>
    { /* Imagem do DJ */ }
    <Image
      alt={ `Personagem do DJ ${ dj?.djName }` } // Texto alternativo da imagem
      className='img-fluid rounded-circle mb-3' // Classe para estilizar a imagem
      src={ dj?.characterPath } // Caminho da imagem do DJ
      style={{
        border: '2px solid #000', // Borda preta ao redor da imagem
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)', // Sombra para dar destaque
        height: '250px', // Altura da imagem
        objectFit: 'cover', // Ajusta a imagem para cobrir o espaço sem distorção
        objectPosition: 'center', // Centraliza a imagem
        width: '250px', // Largura da imagem
      }}
    />
    <Container className='d-flex justify-content-center align-items-center squeres-container'>
      { /* Exibe o ranking do DJ */ }
      <div
        // Classe para estilizar o quadrado do ranque de acordo com a posição
        className={
          `rank-square ${dj?.ranking === 1 ? 'gold' :
            dj?.ranking === 2 ? 'silver' :
              dj?.ranking === 3 ?
                'bronze' : ''}`
        }
      >
        { dj?.ranking ? `${dj.ranking}º` : '-' }
      </div>
      { /* Exibe o nome do DJ */ }
      <div className='name-square mx-3'>{ dj?.djName }</div>
      { /* Exibe a pontuação do DJ */ }
      <div className='points-square'>{ dj?.score.toLocaleString('pt-BR') } pts</div>
    </Container>
  </Col>
);

export default DJProfileMini;