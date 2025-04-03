import { DataTypes, Model, QueryInterface } from 'sequelize';
import { IVote } from '../../interfaces/votes/IVote';

// Migration de criação da tabela de votos
export default {
  // Função de criação da tabela
  up(queryInterface: QueryInterface) {
    // Cria a tabela de votos
    return queryInterface.createTable<Model<IVote>>('votes', {
      // Coluna de id
      id: {
        type: DataTypes.INTEGER, // Tipo inteiro
        autoIncrement: true, // Auto incremento
        allowNull: false, // Não pode ser nulo
        primaryKey: true, // É uma chave primária
      },
      // Coluna de id do DJ
      djId: {
        type: DataTypes.INTEGER, // Tipo inteiro
        allowNull: false, // Não pode ser nulo
        field: 'dj_id', // Nome da coluna no banco de dados
      },
      // Coluna de id da música
      musicId: {
        type: DataTypes.INTEGER, // Tipo inteiro
        allowNull: false, // Não pode ser nulo
        field: 'music_id', // Nome da coluna no banco de dados
      },
      // Coluna de voto
      vote: {
        type: DataTypes.ENUM('very_good', 'good', 'normal', 'bad', 'very_bad'), // Tipo enum
        allowNull: false, // Não pode ser nulo
      },
      // Coluna de id da pista
      trackId: {
        type: DataTypes.INTEGER, // Tipo inteiro
        allowNull: false, // Não pode ser nulo
        field: 'track_id', // Nome da coluna no banco de dados
      },
    });
  },

  // Função de remoção da tabela
  down(queryInterface: QueryInterface) {
    return queryInterface.dropTable('votes')
  }
};