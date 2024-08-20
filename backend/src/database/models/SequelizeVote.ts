import { DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import db from '.';
import SequelizeMusic from './SequelizeMusic';

class SequelizeVote extends Model<
  InferAttributes<SequelizeVote>,
  InferCreationAttributes<SequelizeVote>
  > {
  declare id?: number;
  declare voterId: number;
  declare veryGood: number;
  declare good: number;
  declare normal: number;
  declare bad: number;
  declare veryBad: number;
  declare musicId: number;
}

SequelizeVote.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
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
  },
  {
    sequelize: db,
    modelName: 'vote',
    timestamps: false,
  }
);

SequelizeMusic.hasMany(SequelizeVote, {
  foreignKey: 'musicId',
  as: 'vote',
});

SequelizeVote.belongsTo(SequelizeMusic, {
  foreignKey: 'musicId',
});