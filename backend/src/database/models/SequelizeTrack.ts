import {
  DataTypes, Model, InferAttributes, InferCreationAttributes
} from 'sequelize';
import db from '.';
import SequelizeDJ from './SequelizeDJ';

class SequelizeTrack extends Model<
  InferAttributes<SequelizeTrack>,
  InferCreationAttributes<SequelizeTrack>
  > {
  declare id: number;
  declare trackName: string;
  declare spotifyToken: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

SequelizeTrack.init(
  {
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
    spotifyToken: DataTypes.STRING(400),
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at',
    },
  },
  {
    sequelize: db,
    tableName: 'tracks',
    timestamps: true,
  });

export default SequelizeTrack;