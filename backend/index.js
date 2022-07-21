import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mysql from "mysql2/promise";
import { DB_USERNAME, DB_PASSWORD } from "./Consts.js";
import db from "./dbConfig.js";
import Client from "./entities/Client.js";
import Comanda from "./entities/Comanda.js";
import ComandaProdus from "./entities/ComandaProdus.js";
import Generat from "./entities/Generat.js";
import Produs from "./entities/Produs.js";
import Schema from "./entities/Schema.js";
import Utilizator from "./entities/Utilizator.js";
import Activitate from "./entities/Activitate.js";
import Sequelize from "sequelize";
import LikeOp from "./Operators.js";
import Egal from "./Operators.js";
//create
import { createUtilizator } from "./functions/create.js";
import { createProdus } from "./functions/create.js";
import { createActivitate } from "./functions/create.js";
import { createClient } from "./functions/create.js";
import { createSchema } from "./functions/create.js";
import { createGenerat } from "./functions/create.js";
import { createComanda } from "./functions/create.js";
//get
import {
    getProdus,
    getUtilizatorById,
    getProdusSortat,
    getNotificareActivitateAngajatId,
    getActivitateByManagerId,
    getActivitateFinalizataByManagerId,
    getActivitateNefinalizataByManagerId,
    getActivitateFilter,
    getActivitateSortat,
} from "./functions/read.js";
import { getUtilizator, filterUtilizator, getUtilizatorSortat } from "./functions/read.js";
import { getUtilizatorByUtilizatorNume } from "./functions/read.js";
import { filterProdus } from "./functions/read.js";
import { getComandaById, getComanda, getComandaSortat, filterComanda } from "./functions/read.js";
import { getComandaProdusByProdusId } from "./functions/read.js";
import { getClient, filterClient, getClientSortat } from "./functions/read.js";
import { getSchema, filterSchema, getSchemaByNumeAndTip, getSchemaById } from "./functions/read.js";
//update
import { updateUtilizator, updateTipUtilizator, updateStareActivitate, updateSchema } from "./functions/update.js";
import { updateActivitate, stergeNotificare } from "./functions/update.js";
import { updateProdus } from "./functions/update.js";
import { updateClient } from "./functions/update.js";
//delete
import { deleteProdus } from "./functions/delete.js";
import { deleteClient } from "./functions/delete.js";
import { deleteSchema } from "./functions/delete.js";
import { deleteActivitate } from "./functions/delete.js";
let app = express();
let router = express.Router();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use("/api", router);

let conn;

mysql
    .createConnection({
        user: DB_USERNAME,
        password: DB_PASSWORD,
    })
    .then((connection) => {
        conn = connection;
        return connection.query("CREATE DATABASE IF NOT EXISTS bazadedate");
    })
    .then(() => {
        return conn.end();
    })
    .catch((err) => {
        console.warn(err.stack);
    });
//---------------------------------------------------------------------------------------DECLARARE RELATII
Produs.hasMany(ComandaProdus, { as: "ComandaProduse", foreignKey: "ProdusId" });
ComandaProdus.belongsTo(Produs, { foreignKey: "ProdusId" });

Comanda.hasMany(ComandaProdus, { as: "ComandaProduse", foreignKey: "ComandaId" });
ComandaProdus.belongsTo(Comanda, { foreignKey: "ComandaId" });

Utilizator.hasMany(Comanda, { as: "Comenzi", foreignKey: "UtilizatorId" });
Comanda.belongsTo(Utilizator, { foreignKey: "UtilizatorId" });

Client.hasMany(Comanda, { as: "Comenzi", foreignKey: "ClientId" });
Comanda.belongsTo(Client, { foreignKey: "ClientId" });

Utilizator.hasMany(Schema, { as: "Scheme", foreignKey: "UtilizatorId" });
Schema.belongsTo(Utilizator, { foreignKey: "UtilizatorId" });

Schema.hasMany(Generat, { as: "Generate", foreignKey: "SchemaId" });
Generat.belongsTo(Schema, { foreignKey: "SchemaId" });

Utilizator.hasMany(Generat, { as: "Generate", foreignKey: "UtilizatorId" });
Generat.belongsTo(Utilizator, { foreignKey: "UtilizatorId" });

Utilizator.hasMany(Activitate, { as: "Activitati", foreignKey: "UtilizatorId" });
Activitate.belongsTo(Utilizator, { foreignKey: "UtilizatorId" });

db.sync();

//---------------------------------------------------------------------------------------ROUTES
//CREARE BAZA DE DATE
router.route("/create").get(async (req, res) => {
    try {
        await db.sync();
        res.status(201).json({ message: "created" });
    } catch (err) {
        console.log(e.message);
        return res.json({ message: e.message, status: 400 });
    }
});

//-----------------------------------------------------------------------------------------------ROUTES ACTIVITATE
//creare activitate
router.route("/activitate/:UtilizatorId/:ManagerId").post(async (req, res) => {
    try {
        return res.json(await createActivitate(req.body, req.params.UtilizatorId, req.params.ManagerId));
    } catch (e) {
        console.log(e.message);
        return res.json({ message: e.message, status: 400 });
    }
});
//get activitate by id
router.route("/activitate/:ActivitateId").get(async (req, res) => {
    try {
        return res.json(await getActivitateById(req.params.ActivitateId));
    } catch (e) {
        console.log(e.message);
        return res.json({ message: e.message, status: 400 });
    }
});

//get activitati sortate
router.route("/activitate/sortat/:camp/:asc").get(async (req, res) => {
    try {
        return res.json(await getActivitateSortat(req.params.camp, req.params.asc));
    } catch (e) {
        console.log(e.message);
        return res.json({ message: e.message, status: 400 });
    }
});
//get activitate by manager id
router.route("/activitate/ManagerId/:ManagerId").get(async (req, res) => {
    try {
        return res.json(await getActivitateByManagerId(req.params.ManagerId));
    } catch (e) {
        console.log(e.message);
        return res.json({ message: e.message, status: 400 });
    }
});
//get activitate finalizata by manager id
router.route("/activitate/Finalizata/ManagerId/:ManagerId").get(async (req, res) => {
    try {
        return res.json(await getActivitateFinalizataByManagerId(req.params.ManagerId));
    } catch (e) {
        console.log(e.message);
        return res.json({ message: e.message, status: 400 });
    }
});
//get activitate nefinalizata by manager id
router.route("/activitate/Nefinalizata/ManagerId/:ManagerId").get(async (req, res) => {
    try {
        return res.json(await getActivitateNefinalizataByManagerId(req.params.ManagerId));
    } catch (e) {
        console.log(e.message);
        return res.json({ message: e.message, status: 400 });
    }
});
//get activitate filter
router.route("/activitateFilter/:UtilizatorId/:ManagerId/:Nume/:Detalii/:Stare/:DataMinima/:DataMaxima/:Camp/:Asc").get(async (req, res) => {
    try {
        let filter = {};
        if (req.params.UtilizatorId != "-") filter.UtilizatorId = parseInt(req.params.UtilizatorId);
        if (req.params.Nume != "-") filter.Nume = req.params.Nume;
        if (req.params.Detalii != "-") filter.Detalii = req.params.Detalii;
        if (req.params.Stare != "-") filter.Stare = req.params.Stare;
        if (req.params.ManagerId != "-") filter.ManagerId = parseInt(req.params.ManagerId);
        if (req.params.DataMinima != "-") filter.DataMinima = req.params.DataMinima;
        if (req.params.DataMaxima != "-") filter.DataMaxima = req.params.DataMaxima;
        if (req.params.Camp != "-") filter.Camp = req.params.Camp;
        if (req.params.Asc != "-") filter.Asc = req.params.Asc;
        return res.json(await getActivitateFilter(filter));
    } catch (e) {
        console.log(e.message);
        return res.json({ message: e.message, status: 400 });
    }
});
//get notificari angajat

router.route("/Notificari/:UtilizatorId").get(async (req, res) => {
    try {
        let d = res.json(await getNotificareActivitateAngajatId(req.params.UtilizatorId));

        return d;
    } catch (e) {
        console.log(e.message);
        return res.json({ message: e.message, status: 400 });
    }
});
//update activitate
router.route("/activitate/:ManagerId/:ActivitateId").put(async (req, res) => {
    try {
        return res.json(await updateActivitate(req.params.ManagerId, req.params.ActivitateId, req.body));
    } catch (e) {
        console.log(e.message);
        return res.json({ message: e.message, status: 400 });
    }
});
//sterge notificarile angajatului
router.route("/Notificari/:UtilizatorId").put(async (req, res) => {
    try {
        let notificari = await getNotificareActivitateAngajatId(req.params.UtilizatorId);
        for (let i = 0; i < notificari.length; i++) {
            let actualizare = notificari[i];
            let a = await stergeNotificare(actualizare.ActivitateId);
        }
        return res.json({ message: "Notificari sterse cu succes", status: 201 });
    } catch (e) {
        console.log(e.message);
        return res.json({ message: e.message, status: 400 });
    }
});
//update stare activitate
router.route("/stareActivitate/:UtilizatorId/:ActivitateId").put(async (req, res) => {
    try {
        return res.json(await updateStareActivitate(req.params.UtilizatorId, req.params.ActivitateId));
    } catch (e) {
        console.log(e.message);
        return res.json({ message: e.message, status: 400 });
    }
});
//delete activitate
router.route("/activitate/:ActivitateId").delete(async (req, res) => {
    try {
        return res.json(await deleteActivitate(req.params.ActivitateId));
    } catch (e) {
        console.log(e.message);
        return res.json({ message: e.message, status: 400 });
    }
});

//-----------------------------------------------------------------------------------------------ROUTES CLIENT
//create client
router.route("/client").post(async (req, res) => {
    try {
        return res.json(await createClient(req.body));
    } catch (e) {
        console.log(e.message);
        return res.json({ message: e.message, status: 400 });
    }
});
//get clienti
router.route("/client").get(async (req, res) => {
    try {
        return res.json(await getClient());
    } catch (e) {
        console.log(e.message);
        return res.json({ message: e.message, status: 400 });
    }
});
//get clienti sortati
router.route("/client/sortat/:camp/:asc").get(async (req, res) => {
    try {
        return res.json(await getClientSortat(req.params.camp, req.params.asc));
    } catch (e) {
        console.log(e.message);
        return res.json({ message: e.message, status: 400 });
    }
});
//get clienti filtrati dupa ClientNume Email Telefon
router.route("/clientFilter/:ClientNume/:Email/:Telefon/:TipPersoana/:TipClient/:Camp/:Asc").get(async (req, res) => {
    try {
        let filter = {};
        if (req.params.ClientNume != "-") filter.ClientNume = req.params.ClientNume;
        if (req.params.Email != "-") filter.Email = req.params.Email;
        if (req.params.Telefon != "-") filter.Telefon = req.params.Telefon;
        if (req.params.TipPersoana != "-") filter.TipPersoana = req.params.TipPersoana;
        if (req.params.TipClient != "-") filter.TipClient = req.params.TipClient;
        if (req.params.Camp != "-") filter.Camp = req.params.Camp;
        if (req.params.Asc != "-") filter.Asc = req.params.Asc;
        return res.json(await filterClient(filter));
    } catch (e) {
        console.log(e.message);
        return res.json({ message: e.message, status: 400 });
    }
});
//update client
router.route("/client/:ManagerId/:ClientId").put(async (req, res) => {
    try {
        return res.json(await updateClient(req.params.ManagerId, req.params.ClientId, req.body));
    } catch (e) {
        console.log(e.message);
        return res.json({ message: e.message, status: 400 });
    }
});
//delete client by id
router.route("/client/:ClientId").delete(async (req, res) => {
    try {
        return res.json(await deleteClient(req.params.ClientId));
    } catch (e) {
        console.log(e.message);
        return res.json({ message: e.message, status: 400 });
    }
});

//-----------------------------------------------------------------------------------------------ROUTES COMANDA
//create comanda
router.route("/comanda/:ClientId/:UtilizatorId").post(async (req, res) => {
    try {
        return res.json(await createComanda(req.body, req.params.ClientId, req.params.UtilizatorId));
    } catch (e) {
        console.log(e.message);
        return res.json({ message: e.message, status: 400 });
    }
});
//get comanda by id
router.route("/comanda/:ComandaId").get(async (req, res) => {
    try {
        return res.json(await getComandaById(req.params.ComandaId));
    } catch (e) {
        console.log(e.message);
        return res.json({ message: e.message, status: 400 });
    }
});
//get comanda (toate comenzile)
router.route("/comanda").get(async (req, res) => {
    try {
        return res.json(await getComanda());
    } catch (e) {
        console.log(e.message);
        return res.json({ message: e.message, status: 400 });
    }
});
//get comanda filtrata
router.route("/comandaFilter/:Adresa/:DataMinima/:DataMaxima/:Status/:Detalii/:Camp/:Asc").get(async (req, res) => {
    try {
        let filter = {};
        if (req.params.Adresa != "-") filter.Adresa = req.params.Adresa;
        if (req.params.DataMinima != "-") filter.DataMinima = req.params.DataMinima;
        if (req.params.DataMaxima != "-") filter.DataMaxima = req.params.DataMaxima;
        if (req.params.Status != "-") filter.Status = req.params.Status;
        if (req.params.Detalii != "-") filter.Detalii = req.params.Detalii;
        if (req.params.Camp != "-") filter.Camp = req.params.Camp;
        if (req.params.Asc != "-") filter.Asc = req.params.Asc;
        let d = res.json(await filterComanda(filter));

        return d;
    } catch (e) {
        console.log(e.message);
        return res.json({ message: e.message, status: 400 });
    }
});
router.route("/comandaPieChart/:DataMinima/:DataMaxima").get(async (req, res) => {
    try {
        let filter = {};
        if (req.params.DataMinima != "-") filter.DataMinima = req.params.DataMinima;
        if (req.params.DataMaxima != "-") filter.DataMaxima = req.params.DataMaxima;

        let d = res.json(await filterComanda(filter));

        return d;
    } catch (e) {
        console.log(e.message);
        return res.json({ message: e.message, status: 400 });
    }
});
//getComandaSortat
router.route("/comanda/sortat/:camp/:asc").get(async (req, res) => {
    try {
        return res.json(await getComandaSortat(req.params.camp, req.params.asc));
    } catch (e) {
        console.log(e.message);
        return res.json({ message: e.message, status: 400 });
    }
});
//actualizare stare si detalii comanda
router.route("/comanda/:ComandaId").put(async (req, res) => {
    try {
        return res.json(await updateComanda(req.params.ComandaId, req.body));
    } catch (e) {
        console.log(e.message);
        return res.json({ message: e.message, status: 400 });
    }
});
//-----------------------------------------------------------------------------------------------ROUTES COMANDAPRODUS
//get comandaProdus by ProdusId
router.route("/comandaProdus/:ProdusId").get(async (req, res) => {
    try {
        return res.json(await getComandaProdusByProdusId(req.params.ProdusId));
    } catch (e) {
        console.log(e.message);
        return res.json({ message: e.message, status: 400 });
    }
});

//-----------------------------------------------------------------------------------------------ROUTES GENERAT
//create generat
router.route("/generat/:SchemaId/:UtilizatorId").post(async (req, res) => {
    try {
        return res.json(await createGenerat(req.body, req.params.SchemaId, req.params.UtilizatorId));
    } catch (e) {
        console.log(e.message);
        return res.json({ message: e.message, status: 400 });
    }
});

//-----------------------------------------------------------------------------------------------ROUTES PRODUS
//create produs
router.route("/produs").post(async (req, res) => {
    try {
        return res.json(await createProdus(req.body));
    } catch (e) {
        console.log(e.message);
        return res.json({ message: e.message, status: 400 });
    }
});
//get produse
router.route("/produs").get(async (req, res) => {
    try {
        return res.json(await getProdus());
    } catch (e) {
        console.log(e.message);
        return res.json({ message: e.message, status: 400 });
    }
});
//get produse sortate
router.route("/produs/sortat/:camp/:asc").get(async (req, res) => {
    try {
        return res.json(await getProdusSortat(req.params.camp, req.params.asc));
    } catch (e) {
        console.log(e.message);
        return res.json({ message: e.message, status: 400 });
    }
});

//get produse filtrate dupa nume, pret, descriere si categorie
router.route("/produsFilter/:Nume/:Pret/:Descriere/:Categorie/:Camp/:Asc").get(async (req, res) => {
    try {
        let filter = {};

        if (req.params.Nume != "-" && req.params.Nume != "") {
            filter.Nume = req.params.Nume;
        }
        if (req.params.Pret != "-" && req.params.Pret != "") {
            filter.Pret = req.params.Pret;
        }
        if (req.params.Descriere != "-" && req.params.Descriere != "") {
            filter.Descriere = req.params.Descriere;
        }
        if (req.params.Categorie != "-" && req.params.Categorie != "") {
            filter.Categorie = req.params.Categorie;
        }
        if (req.params.Camp != "-" && req.params.Camp != "") {
            filter.Camp = req.params.Camp;
        }
        if (req.params.Asc != "-" && req.params.Asc != "") {
            filter.Asc = req.params.Asc;
        }

        return res.json(await filterProdus(filter));
    } catch (e) {
        console.log(e.message);
        return res.json({ message: e.message, status: 400 });
    }
});
//update produs
router.route("/produs/:ManagerId/:ProdusId").put(async (req, res) => {
    try {
        let produs = req.body;
        produs.Pret = parseFloat(req.body.Pret);
        return res.json(await updateProdus(req.params.ManagerId, req.params.ProdusId, produs));
    } catch (e) {
        console.log(e.message);
        return res.json({ message: e.message, status: 400 });
    }
});
//delete produs
router.route("/produs/:ProdusId").delete(async (req, res) => {
    try {
        return res.json(await deleteProdus(req.params.ProdusId));
    } catch (e) {
        console.log(e.message);
        return res.json({ message: e.message, status: 400 });
    }
});

//-----------------------------------------------------------------------------------------------ROUTES SCHEMA
//create schema
router.route("/schema/:UtilizatorId").post(async (req, res) => {
    try {
        return res.json(await createSchema(req.body, req.params.UtilizatorId));
    } catch (e) {
        console.log(e.message);
        return res.json({ message: e.message, status: 400 });
    }
});
//get toate schemele
router.route("/schema").get(async (req, res) => {
    try {
        return res.json(await getSchema());
    } catch (e) {
        console.log(e.message);
        return res.json({ message: e.message, status: 400 });
    }
});
//
router.route("/schema/:SchemaId").get(async (req, res) => {
    try {
        return res.json(await getSchemaById(req.params.SchemaId));
    } catch (e) {
        console.log(e.message);
        return res.json({ message: e.message, status: 400 });
    }
});
//get scheme filtrate dupa SchemaNume Continut Tip
router.route("/schemaFilter/:SchemaNume/:Continut/:Tip/:Camp/:Asc").get(async (req, res) => {
    try {
        let filter = {};
        if (req.params.SchemaNume != "-") filter.SchemaNume = req.params.SchemaNume;
        if (req.params.Continut != "-") filter.Continut = req.params.Continut;
        if (req.params.Tip != "-") filter.Tip = req.params.Tip;
        if (req.params.Camp != "-" && req.params.Camp != "") {
            filter.Camp = req.params.Camp;
        }
        if (req.params.Asc != "-" && req.params.Asc != "") {
            filter.Asc = req.params.Asc;
        }
        return res.json(await filterSchema(filter));
    } catch (e) {
        console.log(e.message);
        return res.json({ message: e.message, status: 400 });
    }
});

//update schema
router.route("/schema/:UtilizatorId/:SchemaId").put(async (req, res) => {
    try {
        return res.json(await updateSchema(req.params.UtilizatorId, req.params.SchemaId, req.body));
    } catch (e) {
        console.log(e.message);
        return res.json({ message: e.message, status: 400 });
    }
});
//delete schema
router.route("/schema/:SchemaId").delete(async (req, res) => {
    try {
        return res.json(await deleteSchema(req.params.SchemaId));
    } catch (e) {
        console.log(e.message);
        return res.json({ message: e.message, status: 400 });
    }
});

//-----------------------------------------------------------------------------------------------ROUTES UTILIZATOR
//creare utilizator
router.route("/utilizator").post(async (req, res) => {
    try {
        return res.json(await createUtilizator(req.body));
    } catch (e) {
        console.log(e.message);
        return res.json({ message: e.message, status: 400 });
    }
});
//get utilizatori
router.route("/utilizator").get(async (req, res) => {
    try {
        return res.json(await getUtilizator());
    } catch (e) {
        console.log(e.message);
        return res.json({ message: e.message, status: 400 });
    }
});
//get utilizator dupa id
router.route("/utilizator/:UtilizatorId").get(async (req, res) => {
    try {
        return res.json(await getUtilizatorById(req.params.UtilizatorId));
    } catch (e) {
        console.log(e.message);
        return res.json({ message: e.message, status: 400 });
    }
});
//get utilizator dupa UtilizatorNume
router.route("/utilizator/UtilizatorNume/:UtilizatorNume").get(async (req, res) => {
    try {
        return res.json(await getUtilizatorByUtilizatorNume(req.params.UtilizatorNume));
    } catch (e) {
        console.log(e.message);
        return res.json({ message: e.message, status: 400 });
    }
});
//get utilizatori sortati
router.route("/utilizator/sortat/:camp/:asc").get(async (req, res) => {
    try {
        return res.json(await getUtilizatorSortat(req.params.camp, req.params.asc));
    } catch (e) {
        console.log(e.message);
        return res.json({ message: e.message, status: 400 });
    }
});
//get utilizatori filtrati dupa nume
//utilizatorFilter/UtilizatorNume/:UtilizatorNume/Tip/:Tip/Nume/:Nume
router.route("/utilizatorFilter/UtilizatorNume/:UtilizatorNume/Tip/:Tip/Nume/:Nume").get(async (req, res) => {
    try {
        let filter = {};

        filter.UtilizatorNume = req.params.UtilizatorNume;

        filter.Tip = req.params.Tip;

        filter.Nume = req.params.Nume;

        return res.json(await filterUtilizator(filter));
    } catch (e) {
        console.log(e.message);
        return res.json({ message: e.message, status: 400 });
    }
});
//update utilizator: Nume UtilizatorNume si Parola
router.route("/utilizator/:UtilizatorId").put(async (req, res) => {
    try {
        return res.json(await updateUtilizator(req.params.UtilizatorId, req.body));
    } catch (e) {
        console.log(e.message);
        return res.json({ message: e.message, status: 400 });
    }
});
//update utilizator: Tip
router.route("/tipUtilizator/:UtilizatorId/:ManagerId").put(async (req, res) => {
    try {
        return res.json(await updateTipUtilizator(req.params.UtilizatorId, req.params.ManagerId));
    } catch (e) {
        console.log(e.message);
        return res.json({ message: e.message, status: 400 });
    }
});
//delete utilizator
router.route("/utilizator/:UtilizatorId").delete(async (req, res) => {
    try {
        return res.json(await deleteUtilizator(req.params.UtilizatorId));
    } catch (e) {
        console.log(e.message);
        return res.json({ message: e.message, status: 400 });
    }
});

let port = process.env.PORT || 8000;
app.listen(port);
console.log(`API is running at ${port}`);
