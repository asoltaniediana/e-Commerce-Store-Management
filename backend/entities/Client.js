import db from '../dbConfig.js';
import Sequelize from 'sequelize';

const Client = db.define('Client', {
    ClientId:
    {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    ClientNume:{
        type: Sequelize.STRING,
        allowNull: false,
        
    },
    Email:{
        type: Sequelize.STRING,
        allowNull: false
       
    },
    Telefon:{
        type: Sequelize.STRING,
        allowNull: false
    },
    TipClient:{
        type: Sequelize.ENUM("Basic","Gold","Premium","Silver"),
        allowNull: false
    },
    TipPersoana:{
        type: Sequelize.ENUM("Persoana Fizica", "Persoana Juridica"),
        allowNull: false
    }

})

export default Client;
