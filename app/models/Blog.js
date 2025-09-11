module.exports = (sequelize, DataTypes) => {
    const Blog = sequelize.define('Blog', {
        id: {
            type: DataTypes.INTEGER(11),
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        blog_title: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        blog_body: {
            type: DataTypes.TEXT('long'),
            allowNull: false,
        },
        blog_thumbnail: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        blog_creator: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
        },
        blog_uploaded_by: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        blog_approved: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        blog_release_date_and_time: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        blog_intro: {
            type: DataTypes.TEXT('long'),
            allowNull: true,
        },
        blog_video: {
            type: DataTypes.TEXT,
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
        modelName: 'Blog',
        tableName: 'blogs',
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    });

    return Blog;
};
