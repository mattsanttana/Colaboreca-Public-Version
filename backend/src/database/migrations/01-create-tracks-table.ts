import { Model, QueryInterface, DataTypes, Sequelize } from 'sequelize';
import { ITrack } from '../../interfaces/tracks/ITrack';

// Migration de criação da tabela de tracks
export default {
  // Função de criação da tabela
  up(queryInterface: QueryInterface) {
    // Cria a tabela de tracks
    return queryInterface.createTable<Model<ITrack>>('tracks', {
      // Coluna de id
        id: {
          type: DataTypes.INTEGER, // Tipo inteiro
          allowNull: false, // Não pode ser nulo
          primaryKey: true, // É uma chave primária
        },
        // Coluna de nome da pista
        trackName: {
          type: DataTypes.STRING, // Tipo string
          allowNull: false, // Não pode ser nulo
          field: 'track_name', // Nome da coluna no banco de dados
        },
        // Coluna de token do Spotify
        spotifyToken: {
          type: DataTypes.STRING(400), // Tipo string
          allowNull: false, // Não pode ser nulo
        },
        // Coluna de data de criação
        createdAt: {
          type: DataTypes.DATE, // Tipo data
          allowNull: false, // Não pode ser nulo
          field: 'created_at', // Nome da coluna no banco de dados
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'), // Valor padrão
        },
        // Coluna de data de atualização
        updatedAt: {
          type: DataTypes.DATE, // Tipo data
          allowNull: false, // Não pode ser nulo
          field: 'updated_at', // Nome da coluna no banco de dados
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'), // Valor padrão
        },
      });
  },

  // Função de remoção da tabela
  down(queryInterface: QueryInterface) {
    return queryInterface.dropTable('tracks'); // Remove a tabela de tracks
  }
};