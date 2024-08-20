import { DataTypes, Model, QueryInterface } from 'sequelize';
import { IMusic } from '../../interfaces/musics/IMusic';

export default {
  up(queryInterface: QueryInterface) {
    return queryInterface.createTable<Model<IMusic>>('musics', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      musicURI: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'track_uri',
      },
      djId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'dj_id',
      },
      trackId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'track_id',
      }
    });
  },
  down(queryInterface: QueryInterface) {
    return queryInterface.dropTable('musics')
  }
};