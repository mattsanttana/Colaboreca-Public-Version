import { DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import db from '.';
import SequelizeDJ from './SequelizeDJ';
import SequelizeTrack from './SequelizeTrack';

class SequelizeMusic extends Model<
  InferAttributes<SequelizeMusic>,
  InferCreationAttributes<SequelizeMusic>
> {
  declare id?: number;
  declare cover: string;
  declare name: string;
  declare artists: string;
  declare musicURI: string;
  declare djId: number;
  declare trackId: number;
  declare pointsApllied?: boolean;
}

SequelizeMusic.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
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
      defaultValue: false,
      allowNull: false,
      field: 'points_apllied',
    },
  },
  {
    sequelize: db,
    modelName: 'musics',
    timestamps: false,
  }
);

SequelizeDJ.hasMany(SequelizeMusic, {
  foreignKey: 'djId',
  as: 'colaborecaQueue',
});

SequelizeMusic.belongsTo(SequelizeDJ, {
  foreignKey: 'djId',
  as: 'dj',
});

SequelizeTrack.hasMany(SequelizeMusic, {
  foreignKey: 'trackId',
  as: 'colaborecaQueue',
});

SequelizeMusic.belongsTo(SequelizeTrack, {
  foreignKey: 'trackId',
  as: 'track',
});

export default SequelizeMusic;