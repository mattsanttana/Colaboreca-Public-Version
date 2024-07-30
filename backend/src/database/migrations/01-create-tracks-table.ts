import { Model, QueryInterface, DataTypes, Sequelize } from 'sequelize';
import { ITrack } from '../../interfaces/tracks/ITrack';

export default {
  up(queryInterface: QueryInterface) {
    return queryInterface.createTable<Model<ITrack>>('tracks', {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
        },
        trackName: {
          type: DataTypes.STRING,
          allowNull: false,
          field: 'track_name',
        },
        spotifyToken: {
          type: DataTypes.STRING(400),
          allowNull: false,
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          field: 'created_at',
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          field: 'updated_at',
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      });
  },

  down(queryInterface: QueryInterface) {
    return queryInterface.dropTable('tracks');
  }
};