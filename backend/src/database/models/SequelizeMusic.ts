import { DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import db from '.';
import SequelizeDJ from './SequelizeDJ';
import SequelizeTrack from './SequelizeTrack';

class SequelizeMusic extends Model<
  InferAttributes<SequelizeMusic>,
  InferCreationAttributes<SequelizeMusic>
> {
  declare id?: number;
  declare musicURI: string;
  declare djId: number;
  declare trackId: number;
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
  },
  {
    sequelize: db,
    modelName: 'musics',
    timestamps: false,
  }
);

SequelizeDJ.hasMany(SequelizeMusic, {
  foreignKey: 'djId',
  as: 'music',
});

SequelizeMusic.belongsTo(SequelizeDJ, {
  foreignKey: 'djId',
  as: 'dj',
});

SequelizeTrack.hasMany(SequelizeMusic, {
  foreignKey: 'trackId',
  as: 'music',
});

SequelizeMusic.belongsTo(SequelizeTrack, {
  foreignKey: 'trackId',
  as: 'track',
});

export default SequelizeMusic;