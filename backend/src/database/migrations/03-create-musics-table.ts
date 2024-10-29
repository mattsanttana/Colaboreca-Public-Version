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
      cover: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'cover',
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'name',
      },
      artists: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'artists',
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
      },
      pointsApllied: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: 'points_apllied',
      },
    });
  },
  down(queryInterface: QueryInterface) {
    return queryInterface.dropTable('musics')
  }
};