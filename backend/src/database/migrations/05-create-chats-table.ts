import { DataTypes, Model, QueryInterface } from 'sequelize';
import { IChat } from '../../interfaces/chats/IChat';

export default {
  up(queryInterface: QueryInterface) {
    return queryInterface.createTable<Model<IChat>>('chats', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      trackId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'track_id',
      },
    });
  },
  down(queryInterface: QueryInterface) {
    return queryInterface.dropTable('chats')
  }
};