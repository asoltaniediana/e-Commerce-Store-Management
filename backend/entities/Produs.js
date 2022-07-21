import db from '../dbConfig.js';
import Sequelize from 'sequelize';

const Produs = db.define('Produs', {
    ProdusId:
    {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    Nume:{
        type: Sequelize.STRING(300),
        allowNull: false,
    },
    Pret:{
        type: Sequelize.FLOAT,
        allowNull: false
    },
    Imagine:{
        type: Sequelize.STRING,
        allowNull: false,
    },
    Descriere:{
        type: Sequelize.STRING(10000),
        allowNull: false,
    },
    Categorie:{
        type: Sequelize.STRING,
        allowNull: false,
    }
})

export default Produs;
