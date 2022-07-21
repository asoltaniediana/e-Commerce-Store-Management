import Client from "../entities/Client.js";
import Comanda from "../entities/Comanda.js";
import ComandaProdus from "../entities/ComandaProdus.js";
import Generat from "../entities/Generat.js";
import Produs from "../entities/Produs.js";
import Schema from "../entities/Schema.js";
import Utilizator from "../entities/Utilizator.js";
import Activitate from "../entities/Activitate.js";
import Sequelize from "sequelize";
import moment from "moment";
//--------------------------------------------------------------------------------------------------------Utilizator
//GET - TOTI UTILIZATORII
export async function getUtilizator() {
    return await Utilizator.findAll({ include: ["Activitati"] });
}
//GET - UTILIZATOR DUPA ID
export async function getUtilizatorById(id) {
    return await Utilizator.findByPk(id, { include: ["Activitati"] });
}

//GET - UTILIZATOR DUPA UTILIZATORNUME
export async function getUtilizatorByUtilizatorNume(UtilizatorNume) {
    return await Utilizator.findAll(
        {
            where: {
                UtilizatorNume: UtilizatorNume,
            },
        },
        { include: ["Activitati"] }
    );
}
export async function filterUtilizator(filter) {
    let whereClause = {};
    if (filter.UtilizatorNume != "-") whereClause.UtilizatorNume = { [Sequelize.Op.like]: `%${filter.UtilizatorNume}%` };
    if (filter.Tip != "-") whereClause.Tip = { [Sequelize.Op.like]: `%${filter.Tip}%` };
    if (filter.Nume != "-") whereClause.Nume = { [Sequelize.Op.like]: `%${filter.Nume}%` };

    return await Utilizator.findAll({
        include: ["Activitati"],
        where: whereClause,
    });
}
export async function getUtilizatorSortat(camp, asc) {
    return await Utilizator.findAll({
        order: [[camp, asc]],
    });
}
//--------------------------------------------------------------------------------------------------------Produs
export async function getProdusByNume(Nume) {
    return await Produs.findAll({
        where: {
            Nume: Nume,
        },
    });
}
export async function getProdusById(id) {
    return await Produs.findByPk(id);
}
export async function getProdus() {
    return await Produs.findAll({ include: "ComandaProduse" });
}
export async function getProdusSortat(camp, asc) {
    return await Produs.findAll({
        order: [[camp, asc]],
        include: ["ComandaProduse"],
    });
}
export async function filterProdus(filter) {
    let whereClause = {};
    if (filter.Nume) whereClause.Nume = { [Sequelize.Op.like]: `%${filter.Nume}%` };
    if (filter.Descriere) whereClause.Descriere = { [Sequelize.Op.like]: `%${filter.Descriere}%` };
    if (filter.Categorie) whereClause.Categorie = { [Sequelize.Op.like]: `%${filter.Categorie}%` };
    if (filter.Pret) whereClause.Pret = { [Sequelize.Op.gte]: `${filter.Pret}` };
    let camp = "Nume";
    let asc = "asc";
    if (filter.Camp) {
        camp = filter.Camp;
    }
    if (filter.Asc) {
        asc = filter.Asc;
    }
    let lista = await Produs.findAll({
        include: ["ComandaProduse"],
        order: [[camp, asc]],
        where: whereClause,
    });

    return lista;
}
//--------------------------------------------------------------------------------------------------------Client
export async function getClient() {
    return await Client.findAll({ include: "Comenzi" });
}
export async function getClientByTelefon(Telefon) {
    return await Client.findAll({
        where: {
            Telefon: Telefon,
        },
        include: "Comenzi",
    });
}
export async function getClientById(id) {
    return await Client.findByPk(id, { include: ["Comenzi"] });
}

export async function getClientByEmail(Email) {
    return await Client.findAll({
        where: {
            Email: Email,
        },
        include: "Comenzi",
    });
}
export async function filterClient(filter) {
    let whereClause = {};
    if (filter.ClientNume) whereClause.ClientNume = { [Sequelize.Op.like]: `%${filter.ClientNume}%` };
    if (filter.Telefon) whereClause.Telefon = { [Sequelize.Op.like]: `%${filter.Telefon}%` };
    if (filter.Email) whereClause.Email = { [Sequelize.Op.like]: `%${filter.Email}%` };
    if (filter.TipPersoana) whereClause.TipPersoana = { [Sequelize.Op.like]: `%${filter.TipPersoana}%` };
    if (filter.TipClient) whereClause.TipClient = { [Sequelize.Op.like]: `%${filter.TipClient}%` };
    let Camp = "ClientNume";
    let Asc = "asc";
    if (filter.Camp != "-") Camp = filter.Camp;
    if (filter.Asc != "-") Asc = filter.Asc;
    if (Camp == "NumarComenzi") {
        let clienti = await Client.findAll({
            include: ["Comenzi"],
            where: whereClause,
        });
        if (Asc == "asc") {
            clienti = clienti.sort((a, b) => a.Comenzi.length - b.Comenzi.length);
        } else {
            clienti = clienti.sort((a, b) => b.Comenzi.length - a.Comenzi.length);
        }
        return clienti;
    } else {
        return await Client.findAll({
            include: ["Comenzi"],
            where: whereClause,
            order: [[Camp, Asc]],
        });
    }
}
export async function getClientSortat(camp, asc) {
    return await Client.findAll({
        order: [[camp, asc]],
        include: ["Comenzi"],
    });
}
//--------------------------------------------------------------------------------------------------------Comanda
export async function getComandaProdusByProdusId(ProdusId) {
    return await ComandaProdus.findAll({
        where: {
            ProdusId: ProdusId,
        },
    });
}
export async function getComanda() {
    return await Comanda.findAll({
        include: ["ComandaProduse"],
    });
}
export async function getComandaById(id) {
    return await Comanda.findByPk(id, { include: ["ComandaProduse"] });
}
export async function getComandaByClientId(id) {
    return await Comanda.findAll({
        where: {
            ClientId: id,
        },
    });
}
export async function getComandaSortat(camp, asc) {
    return await Comanda.findAll({
        order: [[camp, asc]],
        include: ["ComandaProduse"],
    });
}
export async function filterComanda(filter) {
    let whereClause = {};
    if (filter.Adresa) whereClause.Adresa = { [Sequelize.Op.like]: `%${filter.Adresa}%` };
    if (filter.Data) {
        whereClause.Data = { [Sequelize.Op.gte]: `${filter.Data}` };
    }
    if (filter.Status) whereClause.Status = { [Sequelize.Op.like]: `%${filter.Status}%` };
    if (filter.Detalii) whereClause.Detalii = { [Sequelize.Op.like]: `%${filter.Detalii}%` };
    if (filter.DataMinima && filter.DataMaxima) {
        if (filter.DataMinima <= filter.DataMaxima) {
            let date = moment(filter.DataMaxima, "YYYY-MM-DD").add(1, "days").toDate();
            filter.DataMaxima = date;
            whereClause.Data = {
                [Sequelize.Op.and]: { [Sequelize.Op.gte]: `${moment(filter.DataMinima, "YYYY-MM-DD").toDate()}`, [Sequelize.Op.lte]: `${filter.DataMaxima}` },
            };
        }
    } else {
        if (filter.DataMinima) {
            whereClause.Data = { [Sequelize.Op.gte]: `${moment(filter.DataMinima, "YYYY-MM-DD").toDate()}` };
        }
        if (filter.DataMaxima) {
            let date = moment(filter.DataMaxima, "YYYY-MM-DD").add(1, "days").toDate();
            filter.DataMaxima = date;
            whereClause.Data = { [Sequelize.Op.lte]: `${filter.DataMaxima}` };
        }
    }
    let camp = "ComandaId";
    let asc = "asc";
    if (filter.Camp && filter.Camp != "NumeClient") camp = filter.Camp;
    if (filter.Asc) asc = filter.Asc;
    return await Comanda.findAll({
        include: ["ComandaProduse"],
        where: whereClause,
        order: [[camp, asc]],
    });
}
//--------------------------------------------------------------------------------------------------------Activitate
export async function getActivitateById(ActivitateId) {
    return await Activitate.findByPk(ActivitateId);
}
export async function getActivitateByManagerId(ManagerId) {
    return await Activitate.findAll({
        where: {
            ManagerId: ManagerId,
        },
    });
}
export async function getActivitateSortat(camp, asc) {
    return await Activitate.findAll({
        order: [[camp, asc]],
    });
}
export async function getActivitateFinalizataByManagerId(ManagerId) {
    return await Activitate.findAll({
        where: {
            ManagerId: ManagerId,
            Stare: "Finalizata",
        },
        order: [["DataLimita", "desc"]],
    });
}
export async function getNotificareActivitateAngajatId(AngajatId) {
    return await Activitate.findAll({
        where: {
            UtilizatorId: AngajatId,
            Notificare: "Da",
        },
        order: [["DataLimita", "asc"]],
    });
}
export async function getActivitateNefinalizataByManagerId(ManagerId) {
    return await Activitate.findAll({
        where: {
            ManagerId: ManagerId,
            Stare: "Nefinalizata",
        },
        order: [["DataLimita", "asc"]],
    });
}
export async function getActivitateFilter(filter) {
    let whereClause = {};

    if (filter.UtilizatorId) whereClause.UtilizatorId = { [Sequelize.Op.eq]: `${filter.UtilizatorId}` };
    if (filter.Nume) whereClause.Nume = { [Sequelize.Op.like]: `%${filter.Nume}%` };
    if (filter.Detalii) whereClause.Detalii = { [Sequelize.Op.like]: `%${filter.Detalii}%` };
    if (filter.ManagerId) whereClause.ManagerId = { [Sequelize.Op.eq]: `${filter.ManagerId}` };
    if (filter.Stare) whereClause.Stare = { [Sequelize.Op.like]: `${filter.Stare}%` };
    if (filter.DataMinima && filter.DataMaxima) {
        filter.DataMinima = moment(filter.DataMinima, "YYYY-MM-DD").toDate();
        filter.DataMaxima = moment(filter.DataMaxima, "YYYY-MM-DD").add(1, "day").toDate();
        whereClause.DataLimita = { [Sequelize.Op.and]: { [Sequelize.Op.gte]: `${filter.DataMinima}`, [Sequelize.Op.lte]: `${filter.DataMaxima}` } };
    } else {
        if (filter.DataMinima) {
            filter.DataMinima = moment(filter.DataMinima, "YYYY-MM-DD").toDate();
            whereClause.DataLimita = { [Sequelize.Op.gte]: `${filter.DataMinima}` };
        }
        if (filter.DataMaxima) {
            filter.DataMaxima = moment(filter.DataMaxima, "YYYY-MM-DD").add(1, "day").toDate();
            whereClause.DataLimita = { [Sequelize.Op.lte]: `${filter.DataMaxima}` };
        }
    }
    let camp = "DataLimita";
    let asc = "asc";
    if (filter.Camp) camp = filter.Camp;
    if (filter.Asc) asc = filter.Asc;
    console.log(whereClause);
    return await Activitate.findAll({
        where: whereClause,
        order: [[camp, asc]],
    });
}

//--------------------------------------------------------------------------------------------------------Schema
export async function getSchemaByNumeAndTip(SchemaNume, Tip) {
    return await Schema.findAll({
        where: {
            SchemaNume: SchemaNume,
            Tip: Tip,
        },
    });
}
export async function getSchemaById(id) {
    return await Schema.findByPk(id, { include: ["Generate"] });
}
export async function getSchema() {
    return await Schema.findAll({
        include: ["Generate"],
    });
}
export async function filterSchema(filter) {
    let whereClause = {};
    if (filter.SchemaNume) whereClause.SchemaNume = { [Sequelize.Op.like]: `%${filter.SchemaNume}%` };
    if (filter.Continut) whereClause.Continut = { [Sequelize.Op.like]: `%${filter.Continut}%` };
    if (filter.Tip) whereClause.Tip = { [Sequelize.Op.like]: `%${filter.Tip}%` };
    let camp = "SchemaNume";
    let asc = "asc";
    if (filter.Camp) {
        camp = filter.Camp;
    }
    if (filter.Asc) {
        asc = filter.Asc;
    }
    return await Schema.findAll({
        include: ["Generate"],
        where: whereClause,
        order: [[camp, asc]],
    });
}

//--------------------------------------------------------------------------------------------------------Generat
