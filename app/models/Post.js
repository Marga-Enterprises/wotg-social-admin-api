module.exports = (sequelize, DataTypes) => {
    const Post = sequelize.define('Post', {
        id: {
            type: DataTypes.INTEGER(11),
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        original_post_id: {
            type: DataTypes.INTEGER(11),
            allowNull: true, // null = original post
            references: {
                model: 'posts',
                key: 'id',
            },
            onDelete: 'SET NULL',
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        visibility: {
            type: DataTypes.ENUM('public', 'followers', 'private'),
            allowNull: false,
            defaultValue: 'public',
        },
        reaction_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        comments_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        shares_count: {
            type: DataTypes.INTEGER,
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
        modelName: 'Post',
        tableName: 'posts',
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    });

    // Associations
    Post.associate = (models) => {
        // User ↔ Posts
        Post.belongsTo(models.User, { foreignKey: 'user_id', as: 'author' });
        models.User.hasMany(Post, { foreignKey: 'user_id', as: 'posts' });

        // Self-referencing (shares / original_post)
        Post.belongsTo(models.Post, { foreignKey: 'original_post_id', as: 'original_post' });
        Post.hasMany(models.Post, { foreignKey: 'original_post_id', as: 'shares' });
    };

    return Post;
};
