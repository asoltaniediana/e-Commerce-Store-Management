import db from '../dbConfig.js';
import Sequelize from 'sequelize';

const ComandaProdus = db.define('ComandaProdus', {
    ComandaId:
    {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    ProdusId:
    {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false
    }, 
    Cantitate:
    {type: Sequelize.INTEGER,
        allowNull: false
    },
    Pret:{
        type: Sequelize.FLOAT,
        allowNull: false
    }
    
})

export default ComandaProdus;
