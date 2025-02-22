import { IDJ } from "../interfaces/djs/IDJ";
import { IMusicWithDJAndVotes } from "../interfaces/musics/IMusic";

export const getDJScore = (music: IMusicWithDJAndVotes) => {
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

  let totalPoints = 0;
  if (topOptions.length === 1) {
    // Apenas uma opção tem mais votos
    totalPoints = pointsMap[topOptions[0] as keyof typeof pointsMap];
  } else {
    // Empate: calcular a média dos pontos das opções empatadas
    const total = topOptions.reduce((sum, option) => sum + pointsMap[option as keyof typeof pointsMap], 0);
    totalPoints = total / topOptions.length;
  }

  // Garantir que dj.score tenha um valor padrão de 0 se estiver indefinido
  const currentScore = music.dj.score ?? 0;

  // Verificar se é para adicionar ou subtrair pontos
  if (totalPoints < 0 && currentScore === 0) {
    // Verificar se a opção com mais votos é "bad" ou "very bad" (ou empate entre os dois)
    const negativeVotes = ["bad", "very_bad"];
    const isNegativeVote = topOptions.every(option => negativeVotes.includes(option));

    if (isNegativeVote) {
      // Não fazer nada se o score atual é 0 e os pontos são negativos
      totalPoints = 0;
    }
  }

  // Ajustar os pontos para evitar valores negativos
  if (totalPoints < 0) {
    if (currentScore < 3 && topOptions.includes("very_bad")) {
      totalPoints = -currentScore; // Reduzir para 0
    } else if (currentScore < 1 && topOptions.includes("bad")) {
      totalPoints = -currentScore; // Reduzir para 0
    }
  }

  // Calcular o novo score garantindo que não seja negativo
  const newScore = Math.max(currentScore + totalPoints, 0);

  return { newScore, majorityVote: topOptions[0] };
};

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

  return sortedDJs;
};
