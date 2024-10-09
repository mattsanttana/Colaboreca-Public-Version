import { DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import db from '.';
import SequelizeMusic from './SequelizeMusic';
import { Vote } from '../../interfaces/votes/IVote';
import SequelizeDJ from './SequelizeDJ';

class SequelizeVote extends Model<
  InferAttributes<SequelizeVote>,
  InferCreationAttributes<SequelizeVote>
  > {
  declare id?: number;
  declare djId: number;
  declare musicId: number;
  declare vote: Vote
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
    djId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'dj_id',
    },
    musicId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'music_id',
    },
    vote: {
      type: DataTypes.ENUM('very_good', 'good', 'normal', 'bad', 'very_bad'),
      allowNull: false,
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

SequelizeDJ.hasMany(SequelizeVote, {
  foreignKey: 'djId',
  as: 'vote',
});

export default SequelizeVote;