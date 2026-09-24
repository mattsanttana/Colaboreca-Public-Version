import { DataTypes, QueryInterface } from 'sequelize';

// Mantém instalações já migradas compatíveis com as configurações adicionadas à pista.
export default {
  async up(queryInterface: QueryInterface) {
    const columns = await queryInterface.describeTable('tracks');

    if (!columns.queue_open) {
      await queryInterface.addColumn('tracks', 'queue_open', {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      });
    }

    if (!columns.max_songs_per_dj) {
      await queryInterface.addColumn('tracks', 'max_songs_per_dj', {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 3,
      });
    }

    if (!columns.very_bad_votes_to_skip) {
      await queryInterface.addColumn('tracks', 'very_bad_votes_to_skip', {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });
    }
  },

  async down(queryInterface: QueryInterface) {
    const columns = await queryInterface.describeTable('tracks');
    const removableColumns = ['queue_open', 'max_songs_per_dj', 'very_bad_votes_to_skip']
      .filter((column) => columns[column]);

    await Promise.all(removableColumns.map((column) => queryInterface.removeColumn('tracks', column)));
  },
};
