import { DataTypes, Model, QueryInterface } from 'sequelize';
import { IVote } from '../../interfaces/votes/IVote';

export default {
  up(queryInterface: QueryInterface) {
    return queryInterface.createTable<Model<IVote>>('votes', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      djId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'dj_id',
      },
      musicId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'music_id',
      },
      vote: {
        type: DataTypes.ENUM('very_good', 'good', 'normal', 'bad', 'very_bad'),
        allowNull: false,
      },
    });
  },
  down(queryInterface: QueryInterface) {
    return queryInterface.dropTable('votes')
  }
};