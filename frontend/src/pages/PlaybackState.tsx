import { Card, Container } from 'react-bootstrap';
import { BarChart, Bar, ResponsiveContainer, YAxis, XAxis, Tooltip } from 'recharts';
import { DJPlayingNow } from '../types/DJ';
import PlayingNow from '../types/PlayingNow';
import { Vote } from '../types/Vote';
import DJTable from './DJTable';

// Props recebidas
type Props = {
  djPlayingNow: DJPlayingNow | null; // DJ que está tocando a música atual
  playingNow: PlayingNow | null; // Música que está tocando atualmente
  trackName: string; // Nome da pista
  votes: Vote | undefined; // Votos da música atual
};

// Componente PlaybackState responsável por exibir o estado de reprodução atual
const PlaybackState: React.FC<Props> = ({ djPlayingNow, playingNow, trackName, votes }) => {
  // Variável para armazenar os votos
  const initialVoteCounts = { very_good: 0, good: 0, normal: 0, bad: 0, very_bad: 0 };

  // Contagem dos votos
  // Verifica se os votos estão definidos e se há valores de votos
  // Se sim, reduz os votos para contar quantas vezes cada valor foi votado
  const voteCounts = (votes && votes.voteValues && votes.voteValues.length > 0) ? votes.voteValues.reduce(
    (acc, vote) => {
      acc[vote] = (acc[vote] || 0) + 1; // Incrementa o contador para o voto correspondente
      return acc; // Retorna o acumulador atualizado
    },
    initialVoteCounts // Inicializa o acumulador com os votos iniciais
  ) : initialVoteCounts; // Inicializa os votos com 0 se não houver votos
  

  // Mapeia os dados para o gráfico de barras
  const data = [
    { name: 'Hino', value: voteCounts.very_good }, // Votos muito bons
    { name: 'Boa', value: voteCounts.good }, // Votos bons
    { name: 'Tanto faz', value: voteCounts.normal }, // Votos normais
    { name: 'Ruim', value: voteCounts.bad }, // Votos ruins
    { name: 'Ninguém merece', value: voteCounts.very_bad }, // Votos muito ruins
  ];
  
  // Renderiza o componente PlaybackState
  return (
    // Container principal
    <Container className='py-4'>
      {/* Exibição do estado de reprodução */}
      <Card
        className='text-center' // Estilo de texto centralizado
        // Estilo do card
        style={{
          boxShadow: '0 0 0 0.5px #ffffff', // Sombra
          padding: '0' // Preenchimento
        }}
      >
        { /* Corpo do card com imagem de fundo */}
        <Card.Body className='card-body-playback'>
          { /* Renderiza a mesa de DJ com as informações do DJ atual e da música tocando */ }   
          <DJTable 
            djPlayingNow={ djPlayingNow } // DJ que está tocando a música atual
            playingNow={ playingNow } // Música que está tocando atualmente
            showAddedByandTrackName={ true } // Exibe o nome do DJ e da pista
            trackName={ trackName } // Nome da pista
          />
          { /* Gráfico de votos */ }
          { data.some(item => item.value > 0) && (
            <div className='gradient-border mt-4 p-3' style={{ backgroundColor: '#2e30594D' }}>
              { /* Gráfico de barras responsivo */ }
              <ResponsiveContainer height={ 300 } width='100%'>
                <BarChart data={ data } layout='vertical'>
                  <defs>
                    <linearGradient id='barGradient' x1='0' y1='0' x2='1' y2='0'>
                      <stop offset='0%' stopColor='#fff4c2'/>
                      <stop offset='33%' stopColor='#494c80'/>
                      <stop offset='66%' stopColor='#2e3059'/>
                      <stop offset='100%' stopColor='#186ea7'/>
                    </linearGradient>
                  </defs>
                  <XAxis
                    allowDecimals={false}
                    domain={[0, 'dataMax']}
                    type='number'
                    tick={{ fontSize: 17, fill: '#a8dadc', fontWeight: 'bold' }}
                    axisLine={{ stroke: '#ffb703' }}
                    tickLine={false}
                  />
                  <YAxis
                    dataKey='name'
                    tick={{
                      fontSize: 17,
                      fill: '#a8dadc',
                      fontWeight: 'bold',
                    }}
                    type='category'
                    width={110}
                    axisLine={{ stroke: '#ffb703' }}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: '#ffb70322' }}
                    contentStyle={{
                      background: '#222',
                      border: '1px solid #ffb703',
                      color: '#fff',
                      borderRadius: 8,
                      fontWeight: 'bold'
                    }}
                  />
                  <Bar
                    dataKey='value'
                    fill='url(#barGradient)'
                    radius={[8, 8, 8, 8]}
                    barSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PlaybackState;  // Exporta o componente PlaybackState