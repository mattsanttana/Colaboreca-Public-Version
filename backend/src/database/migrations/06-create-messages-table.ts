import { DataTypes, Model, QueryInterface } from 'sequelize';
import { IMessage } from '../../interfaces/messages/IMessage';

export default {
  up(queryInterface: QueryInterface) {
    return queryInterface.createTable<Model<IMessage>>('messages', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      chatId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'chat_id',
      },
      djId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'dj_id',
      },
      receiveDJId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'receive_dj_id',
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'created_at',
        defaultValue: new Date(),
      },
    });
  },
  down(queryInterface: QueryInterface) {
    return queryInterface.dropTable('messages')
  }
};