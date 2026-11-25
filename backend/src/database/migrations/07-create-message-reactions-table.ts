import { DataTypes, QueryInterface } from 'sequelize';

export default {
  up(queryInterface: QueryInterface) {
    return queryInterface.createTable('message_reactions', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      messageId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'message_id',
        references: {
          model: 'messages',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      djId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'dj_id',
        references: {
          model: 'djs',
          key: 'id',
        },
        onDelete: 'CASCADE',
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
    }).then(() => queryInterface.addConstraint('message_reactions', {
      fields: ['message_id', 'dj_id', 'emoji'],
      type: 'unique',
      name: 'unique_message_reaction_per_dj',
    }));
  },

  down(queryInterface: QueryInterface) {
    return queryInterface.dropTable('message_reactions');
  },
};
