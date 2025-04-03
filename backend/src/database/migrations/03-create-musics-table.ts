import { DataTypes, Model, QueryInterface } from 'sequelize';
import { IMusic } from '../../interfaces/musics/IMusic';

// Migration de criação da tabela de músicas
export default {
  // Função de criação da tabela
  up(queryInterface: QueryInterface) {
    // Cria a tabela de músicas
    return queryInterface.createTable<Model<IMusic>>('musics', {
      id: {
        type: DataTypes.INTEGER, // Tipo inteiro
        autoIncrement: true, // Auto incremento
        allowNull: false, // Não pode ser nulo
        primaryKey: true, // É uma chave primária
      },
      // Coluna de capa
      cover: {
        type: DataTypes.STRING, // Tipo string
        allowNull: false, // Não pode ser nulo
        field: 'cover', // Nome da coluna no banco de dados
      },
      // Coluna de nome
      name: {
        type: DataTypes.STRING, // Tipo string
        allowNull: false, // Não pode ser nulo
        field: 'name', // Nome da coluna no banco de dados
      },
      // Coluna de artistas
      artists: {
        type: DataTypes.STRING, // Tipo string
        allowNull: false, // Não pode ser nulo
        field: 'artists', // Nome da coluna no banco de dados
      },
      // Coluna de URI da música
      musicURI: {
        type: DataTypes.STRING, // Tipo string
        allowNull: false, // Não pode ser nulo
        field: 'track_uri', // Nome da coluna no banco de dados
      },
      // Coluna de ID do DJ
      djId: {
        type: DataTypes.INTEGER, // Tipo inteiro
        allowNull: false, // Não pode ser nulo
        field: 'dj_id', // Nome da coluna no banco de dados
      },
      // Coluna de ID da pista
      trackId: {
        type: DataTypes.INTEGER, // Tipo inteiro
        allowNull: false, // Não pode ser nulo
        field: 'track_id', // Nome da coluna no banco de dados
      },
      // Coluna de pontos aplicados
      pointsApllied: {
        type: DataTypes.BOOLEAN, // Tipo booleano
        allowNull: false, // Não pode ser nulo
        field: 'points_apllied', // Nome da coluna no banco de dados
      },
    });
  },

  // Função de remoção da tabela
  down(queryInterface: QueryInterface) {
    return queryInterface.dropTable('musics')
  }
};