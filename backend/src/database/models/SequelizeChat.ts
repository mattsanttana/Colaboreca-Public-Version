import { DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import db from '.';
import SequelizeTrack from './SequelizeTrack';

class SequelizeChat extends Model<
  InferAttributes<SequelizeChat>,
  InferCreationAttributes<SequelizeChat>
> {
  declare id?: number;
  declare trackId: number;
}

SequelizeChat.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    trackId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'track_id',
    },
  },
  {
    sequelize: db,
    tableName: 'chats',
    timestamps: false,
  }
);

SequelizeTrack.hasMany(SequelizeChat, {
  foreignKey: 'trackId',
  as: 'chatMessages', // Lista de mensagens associadas a uma track específica
});

SequelizeChat.belongsTo(SequelizeTrack, {
  foreignKey: 'trackId',
  as: 'track', // Associação para identificar a track associada à mensagem
});

export default SequelizeChat;
