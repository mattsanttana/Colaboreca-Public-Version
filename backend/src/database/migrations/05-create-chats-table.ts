import { DataTypes, Model, QueryInterface } from 'sequelize';
import { IChat } from '../../interfaces/chats/IChat';

// Migration de criação da tabela de chats
export default {
  // Função de criação da tabela
  up(queryInterface: QueryInterface) {
    // Cria a tabela de chats
    return queryInterface.createTable<Model<IChat>>('chats', {
      // Coluna de id
      id: {
        type: DataTypes.INTEGER, // Tipo inteiro
        autoIncrement: true, // Auto incremento
        allowNull: false, // Não pode ser nulo
        primaryKey: true, // É uma chave primária
      },
      // Coluna de mensagem
      trackId: {
        type: DataTypes.INTEGER, // Tipo inteiro
        allowNull: false, // Não pode ser nulo
        field: 'track_id', // Nome da coluna no banco de dados
      },
    });
  },

  // Função de remoção da tabela
  down(queryInterface: QueryInterface) {
    // Remove a tabela de chats
    return queryInterface.dropTable('chats')
  }
};