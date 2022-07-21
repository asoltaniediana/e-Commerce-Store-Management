import db from '../dbConfig.js';
import Sequelize from 'sequelize';

const Activitate = db.define('Activitate', {
    ActivitateId:
    {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    Nume:{
        type: Sequelize.STRING,
        allowNull: false
    },
    Detalii:{
        type: Sequelize.STRING(1000),
        allowNull: false
    },
    DataLimita:{
        type: Sequelize.DATE,
        allowNull: false
    },
    Stare:{
        type: Sequelize.ENUM("Nefinalizata", "Finalizata"),
        allowNull: false,
        default: "Nefinalizata"
    },
    ManagerId:
    {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    UtilizatorId:
    {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    Notificare:{
        type: Sequelize.ENUM("Da", "Nu"),
        allowNull:false,
        default: "Da"
    }
    
})

export default Activitate;
