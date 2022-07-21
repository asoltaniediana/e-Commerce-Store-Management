import Client from "../entities/Client.js";
import Comanda from "../entities/Comanda.js";
import ComandaProdus from "../entities/ComandaProdus.js";
import Generat from "../entities/Generat.js";
import Produs from "../entities/Produs.js";
import Schema from "../entities/Schema.js";
import Utilizator from "../entities/Utilizator.js";
import Activitate from "../entities/Activitate.js";

import { numarCaractereNumeUtilizator, numarCaractereNume } from "../Consts.js";
import { numarCaractereParola } from "../Consts.js";
import { numarCaractereNumeProdus } from "../Consts.js";
import { numarCaractereNumeActivitate } from "../Consts.js";
import { numarCaractereDetaliiActivitate } from "../Consts.js";
import { numarCaractereNumeClient } from "../Consts.js";
import { numarCaractereSchema } from "../Consts.js";
import { numarCaractereAdresa } from "../Consts.js";

import { verificareParola } from "./functii.js";

import { verificareFormatEmail } from "./functii.js";
import { verificareFormatTelefon } from "./functii.js";
import { verificareFormatSchema } from "./functii.js";
import { verificareVariabileSchemaUnice } from "./functii.js";
import { variabileSchema } from "./functii.js";

import { getActivitateById, getComandaById, getUtilizatorById } from "./read.js";
import { getUtilizatorByUtilizatorNume } from "./read.js";

import { getNotificareActivitateAngajatId } from "./read.js";
import { getProdusById, getProdusByNume } from "./read.js";
import { getClientById, getClientByEmail, getClientByTelefon } from "./read.js";
import { getSchemaById, getSchemaByNumeAndTip } from "./read.js";
//--------------------------------------------------------------------------------------------------------Utilizator

//UPDATE UTILIZATOR : Parola Nume UtilizatorNume
export async function updateUtilizator(UtilizatorId, utilizator) {
    if (UtilizatorId != utilizator.UtilizatorId) {
        throw new Error(`UtilizatorId difera de utilizator.UtilizatorId`);
        return;
    }
    let updateEntity = await getUtilizatorById(UtilizatorId);
    if (!updateEntity) {
        throw new Error(`Nu exista un utilizator cu acest id`);
        return;
    }
    if (utilizator.Tip != updateEntity.Tip) {
        throw new Error(`Nu puteti modifica tipul utilizatorului in acest fel!!`);
        return;
    }
    if (utilizator.Nume != updateEntity.Nume) {
        if (utilizator.Nume.length < numarCaractereNume) {
            throw new Error(`Numele trebuie sa contina cel putin ${numarCaractereNume} caractere`);
            return;
        }
    }
    if (utilizator.UtilizatorNume != updateEntity.UtilizatorNume) {
        let verificare = await getUtilizatorByUtilizatorNume(utilizator.UtilizatorNume);
        if (verificare.length != 0) {
            throw new Error(`Numele de utilizator este deja folosit`);
            return;
        }
        if (utilizator.UtilizatorNume < numarCaractereNumeUtilizator) {
            throw new Error(`Numele de utilizator trebuie sa contina cel putin ${numarCaractereNumeUtilizator} caractere`);
            return;
        }
    }
    if (utilizator.Parola != updateEntity.Parola) {
        if (utilizator.Parola.length < numarCaractereParola) {
            throw new Error(`Parola trebuie sa contina cel putin ${numarCaractereParola} caractere`);
            return;
        }
        if (!verificareParola(utilizator.Parola)) {
            return;
        }
    }

    return await updateEntity.update(utilizator);
}
//UPDATE Utilizator  Tip : Angajat -> Manager sau Manager -> Angajat
export async function updateTipUtilizator(UtilizatorId, ManagerId) {
    let utilizator = await getUtilizatorById(UtilizatorId);
    let manager = await getUtilizatorById(ManagerId);
    if (!utilizator) {
        throw new Error(`Nu exista un utilizator cu acest id`);
        return;
    }
    if (!manager) {
        throw new Error(`Nu exista un manager cu acest id`);
        return;
    }
    if (manager.Tip != "Manager") {
        throw new Error(`Id-ul ${ManagerId} este asociat unui angajat, nu unui manager`);
        return;
    }
    if (utilizator.Tip == "Manager") {
        utilizator.Tip = "Angajat";
    } else {
        utilizator.Tip = "Manager";
    }
    return await utilizator.save();
}
//--------------------------------------------------------------------------------------------------------Activitate
//UPDATE activitate
export async function updateActivitate(ManagerId, ActivitateId, activitate) {
    let manager = await getUtilizatorById(ManagerId);
    let activitateVeche = await getActivitateById(ActivitateId);
    if (!manager) {
        throw new Error(`Nu exista un manager cu acest id`);
        return;
    }
    if (!activitateVeche) {
        throw new Error(`Nu exista o activitate cu acest id`);
        return;
    }

    if (manager.Tip != "Manager") {
        throw new Error(`Id-ul ${ManagerId} este asociat unui angajat, nu unui manager`);
        return;
    }

    if (ActivitateId != activitate.ActivitateId) {
        throw new Error(`ActivitateId este diferit de activitate.ActivitateId`);
        return;
    }
    if (activitateVeche.Stare == "Finalizata") {
        throw new Error(`Nu puteti modifica o activitate finalizata`);
        return;
    }

    if (activitateVeche.ManagerId != activitate.ManagerId) {
        throw new Error(`Nu puteti modifica ManagerId pentru activitati`);
        return;
    }

    if (activitateVeche.UtilizatorId != activitate.UtilizatorId) {
        throw new Error(`Nu puteti modifica id-ul angajatului pentru activitati`);
        return;
    }
    if (activitateVeche.Nume != activitate.Nume) {
        if (activitate.Nume.length < numarCaractereNumeActivitate) {
            throw new Error(`Numele activitatii trebuie sa contina cel putin ${numarCaractereNumeActivitate} caractere`);
            return;
        }
    }
    if (activitateVeche.Detalii != activitate.Detalii) {
        if (activitate.Detalii.length < numarCaractereDetaliiActivitate) {
            throw new Error(`Detaliile activitatii trebuie sa contina cel putin ${numarCaractereDetaliiActivitate} caractere`);
            return;
        }
    }
    if (activitateVeche.DataLimita != activitate.DataLimita) {
        if (new Date(activitateVeche.DataLimita) > new Date(activitate.DataLimita)) {
            throw new Error(`Data limita noua trebuie sa fie dupa data limita veche`);
            return;
        }
    }
    if (activitateVeche.Stare != activitate.Stare) {
        throw new Error(`Nu puteti sa modificati starea in modul acesta`);
        return;
    }
    activitate.Notificare = "Da";
    return await activitateVeche.update(activitate);
}
//UPDATE -> Finalizeaza activitatea
export async function updateStareActivitate(UtilizatorId, ActivitateId) {
    let utilizator = await getUtilizatorById(UtilizatorId);
    let activitateVeche = await getActivitateById(ActivitateId);
    let activitateFinalizata = await getActivitateById(ActivitateId);
    if (!utilizator) {
        throw new Error(`Nu exista un utilizator cu acest id`);
        return;
    }
    if (!activitateVeche) {
        throw new Error(`Nu exista o activitate cu acest id`);
        return;
    }
    if (activitateVeche.UtilizatorId != UtilizatorId) {
        throw new Error(`Activitatea nu ii apartine utilizatorului cu id-ul ales`);
        return;
    }
    if (activitateVeche.Stare != "Nefinalizata") {
        throw new Error(`Activitatea este deja finalizata`);
        return;
    }
    activitateFinalizata.Stare = "Finalizata";
    activitateFinalizata.Notificare = "Nu";
    return await activitateFinalizata.save();
}

export async function stergeNotificare(ActivitateId) {
    let activitateVeche = await getActivitateById(ActivitateId);
    if (!activitateVeche) {
        throw new Error(`Nu exista o activitate cu acest id`);
        return;
    }
    if (activitateVeche.Notificare != "Da") {
        throw new Error(`Activitatea nu are o notificare atasata `);
        return;
    }
    activitateVeche.Notificare = "Nu";

    return await activitateVeche.save();
}
//--------------------------------------------------------------------------------------------------------Produs
export async function updateProdus(UtilizatorId, ProdusId, produs) {
    let utilizator = await getUtilizatorById(UtilizatorId);
    let produsVechi = await getProdusById(ProdusId);
    if (!utilizator) {
        throw new Error(`Nu exista un manager cu acest id`);
        return;
    }
    if (!produsVechi) {
        throw new Error(`Nu exista un produs cu acest id`);
        return;
    }
    if (produs.Nume.length >= numarCaractereNumeProdus) {
        if (produs.Pret > 0) {
            return await produsVechi.update(produs);
        } else {
            throw new Error("Pretul produsului trebuie sa fie pozitiv");
            return;
        }
    } else {
        throw new Error(`Numele produsului trebuie sa contina cel putin ${numarCaractereNumeProdus} litere`);
        return;
    }
    return await produsVechi.update(produs);
}
//--------------------------------------------------------------------------------------------------------Client
export async function updateClient(ManagerId, ClientId, client) {
    let manager = await getUtilizatorById(ManagerId);
    let clientVechi = await getClientById(ClientId);
    if (!manager) {
        throw new Error(`Nu exista un manager cu acest id`);
        return;
    }
    if (!clientVechi) {
        throw new Error(`Nu exista un client cu acest id`);
        return;
    }

    if (manager.Tip != "Manager") {
        throw new Error(`Id-ul ${ManagerId} este asociat unui angajat, nu unui manager`);
        return;
    }

    if (client.ClientNume.length < numarCaractereNumeClient) {
        throw new Error("Numele produsului exista deja in baza de date");
        return;
    }
    if (client.Email != clientVechi.Email) {
        if (!verificareFormatEmail(client.Email)) {
            throw new Error("Email-ul nu are un format valid");
            return;
        }
        let verificare = getClientByEmail(client.Email);
        if (verificare.length > 0) {
            throw new Error("Email-ul este deja folosit");
            return;
        }
    }
    if (client.Telefon != clientVechi.Telefon) {
        if (!verificareFormatTelefon(client.Telefon)) {
            throw new Error("Telefonul nu are un format valid");
            return;
        }
        let verificare = getClientByTelefon(client.Telefon);
        if (verificare.length > 0) {
            throw new Error("Telefonul este deja folosit");
            return;
        }
    }
    return await clientVechi.update(client);
}
//--------------------------------------------------------------------------------------------------------Schema
export async function updateSchema(ManagerId, SchemaId, schema) {
    let manager = await getUtilizatorById(ManagerId);
    let schemaVeche = await getSchemaById(SchemaId);
    if (!manager) {
        throw new Error(`Nu exista un manager cu acest id`);
        return;
    }
    if (!schemaVeche) {
        throw new Error(`Nu exista o schema cu acest id`);
        return;
    }

    if (manager.Tip != "Manager") {
        throw new Error(`Id-ul ${ManagerId} este asociat unui angajat, nu unui manager. Nu aveti dreptul de a modifica schema ca angajat!`);
        return;
    }

    if (!schema.SchemaNume) {
        throw new Error(`Numele Schemei trebuie sa fie completat`);
        return;
    }
    if (!schema.Continut) {
        throw new Error(`Continutul Schemei trebuie sa fie completat`);
        return;
    }
    if (schema.Continut.length < numarCaractereSchema) {
        throw new Error(`Continutul Schemei trebuie sa aiba cel putin ${numarCaractereSchema} caractere`);
        return;
    }
    if (schema.Tip != "Email" && schema.Tip != "Mesaj") {
        throw new Error(`Tipul Schemei trebuie sa fie Email sau Mesaj`);
        return;
    }

    if (!verificareFormatSchema(schema.Continut)) {
        throw new Error(`Continutul schemei nu are un format valid`);
        return;
    }
    if (schemaVeche.SchemaNume != schema.SchemaNume) {
        let verificareSchemaNume = await getSchemaByNumeAndTip(schema.SchemaNume, schema.Tip);
        if (verificareSchemaNume.length > 0) {
            throw new Error(`Exista deja o schema de tip ${schema.Tip} cu numele ${schema.SchemaNume}`);
            return;
        }
    }
    if (!verificareVariabileSchemaUnice(variabileSchema(schema.Continut))) {
        throw new Error(`Variabilele din schema trebuie sa aiba nume unice`);
        return;
    }

    return await schemaVeche.update(schema);
}
export async function updateComanda(ComandaId, Body) {
    let comandaVeche = await getComandaById(ComandaId);
    if (!comandaVeche) {
        throw new Error(`Nu există o comandă cu acest id`);
        return;
    }
    if (!Body.Detalii || !Body.Stare) {
        throw new Error(`Detaliile si starea comenzii trebuie sa fie completate`);
        return;
    }
    comandaVeche.Detalii = Body.Detalii;
    comandaVeche.Stare = Body.Stare;
    return await comandaVeche.save();
}
