import { IDJ } from "../interfaces/djs/IDJ";
import { IMusicWithDJAndVotes } from "../interfaces/musics/IMusic";

// Função que calcula os pontos de um DJ com base nos votos recebidos
export const getDJScore = (music: IMusicWithDJAndVotes) => {
  // Contar quantos votos cada opção recebeu
  const voteCounts = music.votes.reduce((acc, vote) => {
    acc[vote.vote] = (acc[vote.vote] || 0) + 1;
    return acc;
  }, {
    very_good: 0,
    good: 0,
    normal: 0,
    bad: 0,
    very_bad: 0,
  });

  // Determinar a opção com mais votos
  const maxVotes = Math.max(...Object.values(voteCounts));
  const topOptions = Object.keys(voteCounts).filter(option => voteCounts[option as keyof typeof voteCounts] === maxVotes);

  // Calcular os pontos de acordo com as regras
  const pointsMap = {
    very_good: 3,
    good: 1,
    normal: 0,
    bad: -1,
    very_bad: -3
  };

  let totalPoints = 0; // Pontuação total a ser adicionada ao score do DJ

  // Se houver apenas uma opção com mais votos, atribuir os pontos dessa opção
  if (topOptions.length === 1) {
    totalPoints = pointsMap[topOptions[0] as keyof typeof pointsMap];
  } else {
    // Em caso de empate, calcular a média dos pontos das opções empatadas
    const total = topOptions.reduce((sum, option) => sum + pointsMap[option as keyof typeof pointsMap], 0);
    totalPoints = total / topOptions.length;
  }

  const currentScore = music.dj.score ?? 0; // Garantir que dj.score tenha um valor padrão de 0 se estiver indefinido

  const newScore = Math.max(currentScore + totalPoints, 0); // Calcular o novo score garantindo que não seja negativo

  return { newScore, majorityVote: topOptions }; // Retornar o novo score e a(s) opção(ões) com mais votos
};

// Função que atualiza o ranking de DJs com base nos votos recebidos
export const updateDJsRanking = (djs: IDJ[], musics: IMusicWithDJAndVotes[]) => {
  // Pegar todos os votos que os DJs receberam nas músicas que eles adicionaram
  const allVotes = musics
    .map(music => music.votes.map(vote => ({ ...vote, musicDjId: music.djId })))
    .flat();

  // Ordenar DJs por score (descendente) e aplicar critérios de desempate
  const sortedDJs = djs.sort((a, b) => {
    const scoreA = a.score ?? 0;
    const scoreB = b.score ?? 0;

    if (scoreB !== scoreA) {
      return scoreB - scoreA;
    }

    // Critério de desempate 1: mais votos "very good"
    const veryGoodVotesA = allVotes.filter(v => v.musicDjId === a.id && v.vote === 'very_good').length;
    const veryGoodVotesB = allVotes.filter(v => v.musicDjId === b.id && v.vote === 'very_good').length;
    if (veryGoodVotesB !== veryGoodVotesA) {
      return veryGoodVotesB - veryGoodVotesA;
    }

    // Critério de desempate 2: mais votos "good"
    const goodVotesA = allVotes.filter(v => v.musicDjId === a.id && v.vote === 'good').length;
    const goodVotesB = allVotes.filter(v => v.musicDjId === b.id && v.vote === 'good').length;
    if (goodVotesB !== goodVotesA) {
      return goodVotesB - goodVotesA;
    }

    // Critério de desempate 3: menos votos "very bad"
    const veryBadVotesA = allVotes.filter(v => v.musicDjId === a.id && v.vote === 'very_bad').length;
    const veryBadVotesB = allVotes.filter(v => v.musicDjId === b.id && v.vote === 'very_bad').length;
    if (veryBadVotesA !== veryBadVotesB) {
      return veryBadVotesA - veryBadVotesB;
    }

    // Critério de desempate 4: menos votos "bad"
    const badVotesA = allVotes.filter(v => v.musicDjId === a.id && v.vote === 'bad').length;
    const badVotesB = allVotes.filter(v => v.musicDjId === b.id && v.vote === 'bad').length;
    if (badVotesA !== badVotesB) {
      return badVotesA - badVotesB;
    }

    // Critério de desempate 5: quem alcançou o empate (menor id)
    if (a.id === undefined || b.id === undefined) {
      return 0; // Tratar como iguais se id for indefinido
    }
    return a.id - b.id;
  });

  return sortedDJs; // Retornar DJs ordenados
};
