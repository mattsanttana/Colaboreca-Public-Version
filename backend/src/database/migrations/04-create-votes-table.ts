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
      voterId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'voter_id',
      },
      veryGood: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'very_good',
      },
      good: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      normal: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      bad: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      veryBad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'very_bad',
      },
      musicId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'music_id',
      },
    });
  },
  down(queryInterface: QueryInterface) {
    return queryInterface.dropTable('votes')
  }
};