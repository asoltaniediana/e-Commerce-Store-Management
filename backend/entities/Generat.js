import db from '../dbConfig.js';
import Sequelize from 'sequelize';

const Generat = db.define('Generat', {
    GeneratId:
    {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    SchemaNume:{
        type: Sequelize.STRING,
        allowNull: false,
        
    },
    Continut:{
        type: Sequelize.STRING(10000),
        allowNull: false,
        
    },
    UtilizatorId:{
        type: Sequelize.INTEGER,
        allowNull: false
    },
    SchemaId:
    {
        type: Sequelize.INTEGER,      
        allowNull: false
    }
})

export default Generat;
