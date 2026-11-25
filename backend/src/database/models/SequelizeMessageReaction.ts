import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';
import db from '.';

class SequelizeMessageReaction extends Model<
  InferAttributes<SequelizeMessageReaction>,
  InferCreationAttributes<SequelizeMessageReaction>
> {
  declare id?: number;
  declare messageId: number;
  declare djId: number;
  declare emoji: string;
  declare createdAt: Date;
  declare read: boolean;
}

SequelizeMessageReaction.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    messageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'message_id',
    },
    djId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'dj_id',
    },
    emoji: {
      type: DataTypes.STRING(32),
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at',
      defaultValue: DataTypes.NOW,
    },
    read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize: db,
    tableName: 'message_reactions',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['message_id', 'dj_id', 'emoji'],
        name: 'unique_message_reaction_per_dj',
      },
    ],
  }
);

export default SequelizeMessageReaction;
