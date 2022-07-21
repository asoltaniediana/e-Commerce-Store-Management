import db from '../dbConfig.js';
import Sequelize from 'sequelize';

const Schema = db.define('Schema', {
    SchemaId:
    {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    SchemaNume:{
        type: Sequelize.STRING,
        allowNull: false,
        
    },
    Continut:
    {
        type: Sequelize.STRING(10000),
        allowNull: false
    },
    Tip:{
        type: Sequelize.ENUM("Email", "Mesaj"),
        allowNull: false
    },
    UtilizatorId:
    {
        type: Sequelize.INTEGER,
        allowNull: false
    }
    
})

export default Schema;
