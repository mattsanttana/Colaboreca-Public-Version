import { DataTypes, Model, QueryInterface } from 'sequelize';
import { IDJ } from '../../interfaces/djs/IDJ';

// Migration de criação da tabela de djs
export default {
  // Função de criação da tabela
  up(queryInterface: QueryInterface) {
    // Cria a tabela de djs
    return queryInterface.createTable<Model<IDJ>>('djs', {
      // Coluna de id
      id: {
        type: DataTypes.INTEGER, // Tipo inteiro
        autoIncrement: true, // Auto incremento
        allowNull: false, // Não pode ser nulo
        primaryKey: true, // É uma chave primária
      },
      // Coluna de nome do DJ
      djName: {
        type: DataTypes.STRING, // Tipo string
        allowNull: false, // Não pode ser nulo
        field: 'dj_name', // Nome da coluna no banco de dados
      },
      // Coluna de caminho da imagem do personagem
      characterPath: {
        type: DataTypes.STRING, // Tipo string
        allowNull: false, // Não pode ser nulo
        field: 'character_path' // Nome da coluna no banco de dados
      },
      // Coluna de pontuação
      score: {
        type: DataTypes.FLOAT, // Tipo float
        allowNull: false, // Não pode ser nulo
        defaultValue: 0 // Valor padrão
      },
      // Coluna de ranking
      ranking: {
        type: DataTypes.INTEGER, // Tipo inteiro
        allowNull: false // Não pode ser nulo
      },
      // Coluna de id da pista
      trackId: {
        type: DataTypes.INTEGER, // Tipo inteiro
        allowNull: false, // Não pode ser nulo
        field: 'track_id' // Nome da coluna no banco de dados
      }
    })
  },

  // Função de remoção da tabela
  down(queryInterface: QueryInterface) {
    // Remove a tabela de djs
    return queryInterface.dropTable('djs')
  }
};