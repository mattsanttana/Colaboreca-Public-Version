import { DataTypes, Model, QueryInterface } from 'sequelize';
import { IDJ } from '../../interfaces/djs/IDJ';

export default {
  up(queryInterface: QueryInterface) {
    return queryInterface.createTable<Model<IDJ>>('djs', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      djName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'dj_name',
      },
      characterPath: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'character_path'
      },
      score: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      ranking: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      trackId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'track_id'
      }
    })
  },

  down(queryInterface: QueryInterface) {
    return queryInterface.dropTable('djs')
  }
};