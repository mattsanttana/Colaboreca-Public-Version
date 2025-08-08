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
        max='4' // Valor máximo do termômetro
        min='0' // Valor mínimo do termômetro
        onChange={ handleVoteChange } // Função para lidar com a mudança de voto
        type='range' // Tipo do input
        value={ vote } // Valor do input
      />
      { /* Labels para cada opção de voto */ }
      <Container className='labels'>
        <span
          className={ vote === 0 ? 'highlight' : '' } // Classe para estilização do texto
        >
          Ninguém merece
        </span>
        <span
          className={ vote === 1 ? 'highlight' : '' } // Classe para estilização do texto
          style={{ marginLeft: '20px' }} // Estilo para adicionar margem
        >
          Ruim
        </span>
        <span
          className={ vote === 2 ? 'highlight' : '' } // Classe para estilização do texto
          style={{ marginLeft: '20px' }} // Estilo para adicionar margem
        >
          Tanto faz
        </span>
        <span
          className={ vote === 3 ? 'highlight' : '' } // Classe para estilização do texto
          style={{ marginLeft: '50px' }} // Estilo para adicionar margem
        >
          Boa
        </span>
        <span
          className={ vote === 4 ? 'highlight' : '' } // Classe para estilização do texto
          style={{ marginRight: '-40px' }} // Estilo para adicionar margem
        >
          Hino
        </span>
      </Container>
    </Container>
  )
};

export default VoteThermometer;