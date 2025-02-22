import { DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import db from '.';
import SequelizeTrack from './SequelizeTrack';

class SequelizeDJ extends Model<
  InferAttributes<SequelizeDJ>,
  InferCreationAttributes<SequelizeDJ>
  > {
  declare id?: number;
  declare djName: string;
  declare characterPath: string;
  declare score?: number;
  declare ranking?: number;
  declare trackId: number;
}

SequelizeDJ.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
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
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    ranking: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    trackId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'track_id'
    }
  },
  {
    sequelize: db,
    tableName: 'djs',
    timestamps: false,
  });

SequelizeTrack.hasMany(SequelizeDJ, {
  foreignKey: 'trackId',
  as: 'djs',
});

SequelizeDJ.belongsTo(SequelizeTrack, {
  foreignKey: 'trackId',
  as: 'track',
});

export default SequelizeDJ;