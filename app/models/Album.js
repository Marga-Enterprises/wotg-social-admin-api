// app/models/Album.js
module.exports = (sequelize, DataTypes) => {
    const Album = sequelize.define('Album', {
        id: {
            type: DataTypes.INTEGER(11),
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        artist_name: {
            type: DataTypes.STRING(255), // If you're not using a separate Artist model yet
            allowNull: false,
        },
        cover_image: {
            type: DataTypes.STRING(255), // URL or filename
            allowNull: true,
        },
        release_date: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        type: {
            type: DataTypes.ENUM('album', 'single', 'compilation'),
            allowNull: false,
            defaultValue: 'album',
        },
        label: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    }, {
        sequelize,
        modelName: 'Album',
        tableName: 'albums',
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    });

    return Album;
};
