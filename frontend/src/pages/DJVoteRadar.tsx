import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts';
import { DJMusic } from '../types/SpotifySearchResponse';

type Props = {
  addedMusics: DJMusic[];
};

const voteCategories = [
  { key: 'very_good', name: 'Hino', emoji: '👑' },
  { key: 'good', name: 'Boa', emoji: '😎' },
  { key: 'normal', name: 'Tanto faz', emoji: '😐' },
  { key: 'bad', name: 'Ruim', emoji: '😒' },
  { key: 'very_bad', name: 'Ninguém merece', emoji: '🤢' },
] as const;

type VoteCategory = typeof voteCategories[number]['key'];

const DJVoteRadar: React.FC<Props> = ({ addedMusics }) => {
  const winnerTotals: Record<VoteCategory, number> = {
    very_good: 0,
    good: 0,
    normal: 0,
    bad: 0,
    very_bad: 0,
  };

  let votedMusicCount = 0;
  const completedMusics = addedMusics.filter((music) => music.wasPlayed);

  completedMusics.forEach((music) => {
    const maximumVotes = Math.max(...voteCategories.map(({ key }) => music.voteCounts[key]));
    if (maximumVotes === 0) return;

    const winningCategories = voteCategories.filter(({ key }) => music.voteCounts[key] === maximumVotes);
    const sharePerWinner = 1 / winningCategories.length;
    winningCategories.forEach(({ key }) => {
      winnerTotals[key] += sharePerWinner;
    });
    votedMusicCount += 1;
  });

  const data = voteCategories.map(({ key, name, emoji }) => ({
    category: name,
    emoji,
    average: votedMusicCount === 0 ? 0 : (winnerTotals[key] / votedMusicCount) * 100,
  }));

  return (
    <section className='dj-vote-radar' aria-labelledby='dj-vote-radar-title'>
      <div className='dj-vote-radar-heading'>
        <h2 id='dj-vote-radar-title' className='dj-vote-radar-title'>Média das classificações</h2>
        <span className='dj-vote-radar-count'>
          { votedMusicCount } { votedMusicCount === 1 ? 'música concluída e votada' : 'músicas concluídas e votadas' }
        </span>
      </div>
      { votedMusicCount > 0 ? (
        <div className='dj-vote-radar-chart'>
          <ResponsiveContainer width='100%' height='100%'>
          <RadarChart data={ data } outerRadius='78%'>
            <defs>
              <linearGradient id='djVoteRadarFill' x1='0' y1='0' x2='1' y2='1'>
                <stop offset='0%' stopColor='#14f4e8' stopOpacity={ 0.78 } />
                <stop offset='100%' stopColor='#008acb' stopOpacity={ 0.35 } />
              </linearGradient>
              <filter id='djVoteRadarGlow' x='-40%' y='-40%' width='180%' height='180%'>
                <feGaussianBlur stdDeviation='3' result='glow' />
                <feMerge>
                  <feMergeNode in='glow' />
                  <feMergeNode in='SourceGraphic' />
                </feMerge>
              </filter>
            </defs>
            <PolarGrid stroke='#18cce0' strokeOpacity={ 0.38 } strokeWidth={ 1.2 } />
            <PolarAngleAxis
              dataKey='emoji'
              tick={{ fill: '#ddffff', fontSize: 26 }}
            />
            <PolarRadiusAxis
              angle={ 30 }
              domain={[0, 100]}
              tick={ false }
              axisLine={{ stroke: '#18cce0', strokeOpacity: 0.45 }}
            />
            <Tooltip
              formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Média das vitórias']}
              labelFormatter={(label, payload) => payload[0]?.payload?.category ?? label}
              contentStyle={{
                background: '#06152c',
                border: '1px solid #14dce9',
                color: '#ddffff',
                borderRadius: 8,
                fontWeight: 'bold',
                boxShadow: '0 0 18px rgba(20, 220, 233, 0.28)',
              }}
            />
            <Radar
              name='Média das categorias vencedoras'
              dataKey='average'
              stroke='#30f4ef'
              strokeWidth={ 2 }
              fill='url(#djVoteRadarFill)'
              fillOpacity={ 0.78 }
              filter='url(#djVoteRadarGlow)'
              dot={{ r: 3, fill: '#ddffff', stroke: '#14dce9', strokeWidth: 1 }}
              activeDot={{ r: 6, fill: '#ffffff', stroke: '#14dce9', strokeWidth: 2 }}
            />
          </RadarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className='dj-vote-radar-empty'>Ainda não há músicas concluídas com votos para calcular a média.</p>
      ) }
    </section>
  );
};

export default DJVoteRadar;