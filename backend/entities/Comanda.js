import db from '../dbConfig.js';
import Sequelize from 'sequelize';

const Comanda = db.define('Comanda', {
    ComandaId:
    {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    Adresa:{
        type: Sequelize.STRING,
        allowNull: false
    },
    Data:{
        type: Sequelize.DATE,
        allowNull: false
    },
    UtilizatorId:
    {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    ClientId:
    {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    Status:{
        type: Sequelize.ENUM("Awaiting Fulfillment","Awaiting Payment","Awaiting Shipment","Cancelled","Completed",
        "Partially Refunded","Partially Shipped","Refunded","Shipped"),
        allowNull: false
    },
    Detalii:{
        type: Sequelize.STRING,
        allowNull: true
    }
})

export default Comanda;
