// app/models/Music.js
module.exports = (sequelize, DataTypes) => {
    const Music = sequelize.define('Music', {
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
            type: DataTypes.STRING(255), // Can be changed to relation later
            allowNull: false,
        },
        album_id: {
            type: DataTypes.INTEGER(11), // Must match Album's ID type
            allowNull: true,
            references: {
                model: 'albums',
                key: 'id',
            },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE',
        },
        audio_url: {
            type: DataTypes.STRING(255), // File path or streaming URL
            allowNull: false,
        },
        duration: {
            type: DataTypes.INTEGER, // In seconds
            allowNull: false,
        },
        track_number: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        is_explicit: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        genre: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        play_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
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
        modelName: 'Music',
        tableName: 'music',
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    });

    // Associations
    Music.associate = (models) => {
        Music.belongsTo(models.Album, {
            foreignKey: 'album_id',
            targetKey: 'id',
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE',
        });
    };

    return Music;
};
