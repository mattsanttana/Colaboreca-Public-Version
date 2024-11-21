import { DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import db from '.';
import SequelizeChat from './SequelizeChat';
import SequelizeDJ from './SequelizeDJ';

class SequelizeMessage extends Model<
  InferAttributes<SequelizeMessage>,
  InferCreationAttributes<SequelizeMessage>
> {
  declare id?: number;
  declare chatId?: number | null;
  declare djId: number;
  declare receiveDJId?: number | null;
  declare message: string;
  declare createdAt: Date;
}

SequelizeMessage.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    chatId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'chat_id',
    },
    receiveDJId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'receive_dj_id',
    },
    djId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'dj_id',
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at',
    },
  },
  {
    sequelize: db,
    tableName: 'messages',
    timestamps: false,
  }
);

SequelizeChat.hasMany(SequelizeMessage, {
  foreignKey: 'chatId',
  as: 'chatMessages', // Lista de mensagens associadas a um chat específico
});

SequelizeMessage.belongsTo(SequelizeChat, {
  foreignKey: 'chatId',
  as: 'chat', // Associação para identificar o chat associado à mensagem
});

SequelizeDJ.hasMany(SequelizeMessage, {
  foreignKey: 'djId',
  as: 'djMessages', // Lista de mensagens associadas a um DJ específico
});

SequelizeMessage.belongsTo(SequelizeDJ, {
  foreignKey: 'djId',
  as: 'dj', // Associação para identificar o DJ associado à mensagem
});

export default SequelizeMessage;