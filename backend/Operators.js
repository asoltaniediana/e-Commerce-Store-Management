import Sequelize from 'sequelize';

const Egal=Sequelize.Op.eq;
const MaiMicSauEgal=Sequelize.Op.lte;
const LikeOp=Sequelize.Op.like;

export default {Egal, MaiMicSauEgal,LikeOp};