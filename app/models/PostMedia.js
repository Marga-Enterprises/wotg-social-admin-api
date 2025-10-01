module.exports = (sequelize, DataTypes) => {
    const PostMedia = sequelize.define('PostMedia', {
        id: {
            type: DataTypes.INTEGER(11),
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        post_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            references: {
                model: 'posts',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        type: {
            type: DataTypes.ENUM('image', 'video', 'audio'),
            allowNull: false,
        },
        url: {
            type: DataTypes.STRING(500),
            allowNull: false,
        },
        thumbnail: {
            type: DataTypes.STRING(500),
            allowNull: true, // Optional for videos or high-res images
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
        modelName: 'PostMedia',
        tableName: 'post_media',
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    });

    // Associations
    PostMedia.associate = (models) => {
        PostMedia.belongsTo(models.Post, { foreignKey: 'post_id', as: 'post' });
        models.Post.hasMany(PostMedia, { foreignKey: 'post_id', as: 'media' });
    };

    return PostMedia;
};
