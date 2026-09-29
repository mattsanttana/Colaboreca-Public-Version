import React from 'react';
import { Container } from 'react-bootstrap';

// Props para o componente VoteThermometer
interface Props {
  vote: number; // Voto selecionado (0 a 4)
  setVote: (value: number) => void; // Função para atualizar o voto
}

// Componente VoteThermometer responsável por exibir o termômetro de votação
const VoteThermometer: React.FC<Props> = ({ vote, setVote }) => {
  // Função para lidar com a mudança de voto
  const handleVoteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVote(Number(event.target.value)); // Atualiza o estado do voto com o valor selecionado
  };

  return (
    <Container className='thermometer-container'>
      <input
        className='thermometer' // Classe para estilização do termômetro
        aria-label='Avalie a música de Ninguém merece a Hino'
        max='4' // Valor máximo do termômetro
        min='0' // Valor mínimo do termômetro
        onChange={ handleVoteChange } // Função para lidar com a mudança de voto
        style={{ '--vote-progress': `${vote * 25}%` } as React.CSSProperties}
        type='range' // Tipo do input
        value={ vote } // Valor do input
      />
      { /* Labels para cada opção de voto */ }
      <Container className='labels'>
        { ['Ninguém merece', 'Ruim', 'Tanto faz', 'Boa', 'Hino'].map((label, index) => (
          <span className={ vote === index ? 'highlight' : '' } key={ label }>
            { label }
          </span>
        )) }
      </Container>
    </Container>
  )
};

export default VoteThermometer;