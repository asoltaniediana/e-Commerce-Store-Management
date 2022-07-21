import db from '../dbConfig.js';
import Sequelize from 'sequelize';

const Utilizator = db.define('Utilizator', {
    UtilizatorId:
    {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    UtilizatorNume:{
        type: Sequelize.STRING,
        allowNull: false,
        
    },
    Parola:{
        type: Sequelize.STRING,
        allowNull: false
       
    },
    Tip:{
        type: Sequelize.ENUM("Manager", "Angajat"),
        allowNull: false
       
    },
    Nume:{
        type: Sequelize.STRING,
        allowNull: false
       
    }

})

export default Utilizator;
