import { DataTypes, Model, QueryInterface } from 'sequelize';
import { IMessage } from '../../interfaces/messages/IMessage';

// Migration de criação da tabela de mensagens
export default {
  // Função de criação da tabela
  up(queryInterface: QueryInterface) {
    // Cria a tabela de mensagens
    return queryInterface.createTable<Model<IMessage>>('messages', {
      // Coluna de id
      id: {
        type: DataTypes.INTEGER, // Tipo inteiro
        autoIncrement: true, // Auto incremento
        allowNull: false, // Não pode ser nulo
        primaryKey: true, // É uma chave primária
      },
      // Coluna de id do chat
      chatId: {
        type: DataTypes.INTEGER, // Tipo inteiro
        allowNull: true, // Pode ser nulo
        field: 'chat_id', // Nome da coluna no banco de dados
      },
      // Coluna de id da pista
      trackId: {
        type: DataTypes.INTEGER, // Tipo inteiro
        allowNull: false, // Não pode ser nulo
        field: 'track_id', // Nome da coluna no banco de dados
      },
      // Coluna de id do DJ
      djId: {
        type: DataTypes.INTEGER, // Tipo inteiro
        allowNull: false, // Não pode ser nulo
        field: 'dj_id', // Nome da coluna no banco de dados
      },
      // Coluna de id do DJ que recebeu a mensagem
      receiveDJId: {
        type: DataTypes.INTEGER, // Tipo inteiro
        allowNull: true, // Pode ser nulo
        field: 'receive_dj_id', // Nome da coluna no banco de dados
      },
      // Coluna de mensagem
      message: {
        type: DataTypes.TEXT, // Tipo texto
        allowNull: false, // Não pode ser nulo
      },
      // Coluna de data de criação
      createdAt: {
        type: DataTypes.DATE, // Tipo data
        allowNull: false, // Não pode ser nulo
        field: 'created_at', // Nome da coluna no banco de dados
        defaultValue: new Date(), // Valor padrão
      },
      // Coluna responsável pra marcar a mensagem como lida
      read: {
        type: DataTypes.BOOLEAN, // Tipo booleano
        allowNull: false, // Não pode ser nulo
        defaultValue: false, // Valor padrão
      },
      // Coluna responsável por marcar a mensagem como uma resposta
      isReply: {
        type: DataTypes.BOOLEAN, // Tipo booleano
        allowNull: false, // Não pode ser nulo
        field: 'is_reply', // Nome da coluna no banco de dados
      },
      // Coluna de id da mensagem respondida
      replyTo: {
        type: DataTypes.INTEGER, // Tipo inteiro
        allowNull: true, // Pode ser nulo
        field: 'reply_to', // Nome da coluna no banco de dados
      },
    });
  },
  // Função de remoção da tabela
  down(queryInterface: QueryInterface) {
    // Remove a tabela de mensagens
    return queryInterface.dropTable('messages')
  }
};