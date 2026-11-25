import { DataTypes, QueryInterface } from 'sequelize';

export default {
  async up(queryInterface: QueryInterface) {
    await queryInterface.addColumn('djs', 'is_moderator', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('djs', 'chat_timeout_until', {
      type: DataTypes.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('djs', 'queue_timeout_until', {
      type: DataTypes.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('messages', 'deleted_at', {
      type: DataTypes.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('messages', 'deleted_by_dj_id', {
      type: DataTypes.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('messages', 'deleted_by_moderation', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.removeColumn('messages', 'deleted_by_moderation');
    await queryInterface.removeColumn('messages', 'deleted_by_dj_id');
    await queryInterface.removeColumn('messages', 'deleted_at');
    await queryInterface.removeColumn('djs', 'queue_timeout_until');
    await queryInterface.removeColumn('djs', 'chat_timeout_until');
    await queryInterface.removeColumn('djs', 'is_moderator');
  },
};
