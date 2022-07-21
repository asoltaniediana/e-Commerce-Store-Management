import Client from "../entities/Client.js";
import Comanda from "../entities/Comanda.js";
import ComandaProdus from "../entities/ComandaProdus.js";
import Generat from "../entities/Generat.js";
import Produs from "../entities/Produs.js";
import Schema from "../entities/Schema.js";
import Utilizator from "../entities/Utilizator.js";
import Activitate from "../entities/Activitate.js";

import moment from "moment";
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
import { getUtilizatorById } from "./read.js";
import { getUtilizatorByUtilizatorNume } from "./read.js";
import { getClientByTelefon } from "./read.js";
import { getClientByEmail } from "./read.js";
import { getSchemaByNumeAndTip } from "./read.js";
import { getSchemaById } from "./read.js";
import { getComandaById } from "./read.js";
import { getProdusById } from "./read.js";

export async function createUtilizator(utilizator) {
    if (utilizator.UtilizatorNume.includes(" ") == false) {
        if (utilizator.UtilizatorNume.length >= numarCaractereNumeUtilizator) {
            if (utilizator.Parola.length >= numarCaractereParola) {
                if (verificareParola(utilizator.Parola) == true) {
                    let verificare = await getUtilizatorByUtilizatorNume(utilizator.UtilizatorNume);
                    if (!verificare.length) {
                        return await Utilizator.create(utilizator);
                    } else {
                        throw new Error(`${utilizator.UtilizatorNume} nu este disponibil`);
                        return;
                    }
                }
            } else {
                throw new Error(`Parola trebuie sa aiba cel putin ${numarCaractereParola} caractere`);
                return;
            }
        } else {
            throw new Error(`Numele de utilizator trebuie sa aiba cel putin 
                            ${numarCaractereNumeUtilizator} caractere`);
            return;
        }
    } else {
        throw new Error(`Numele de utilizator nu trebuie sa contina spatii`);
        return;
    }
}

export async function createProdus(produs) {
    if (produs.Nume.length >= numarCaractereNumeProdus) {
        if (produs.Pret > 0) {
            console.log(produs);
            return await Produs.create(produs);
        } else {
            throw new Error("Pretul produsului trebuie sa fie pozitiv");
            return;
        }
    } else {
        throw new Error(`Numele produsului trebuie sa contina cel putin ${numarCaractereNumeProdus} litere`);
        return;
    }
}

export async function createActivitate(activitate, UtilizatorId, ManagerId) {
    console.log(activitate);
    if (UtilizatorId != activitate.UtilizatorId) {
        throw new Error(`Id-ul Angajatului este diferit`);
        return;
    }
    if (ManagerId != activitate.ManagerId) {
        throw new Error(`Id-ul Managerului este diferit`);
        return;
    }
    let manager = await getUtilizatorById(ManagerId);

    if (!manager) {
        throw new Error(`Nu exista un manager cu id-ul introdus`);
        return;
    }

    if (manager.Tip != "Manager") {
        throw new Error(`ManagerId nu este asociat unui manager, ci unui angajat`);
        return;
    }
    let utilizator = await getUtilizatorById(UtilizatorId);

    if (!utilizator) {
        throw new Error(`Nu exista un utilizator cu acest id-ul introdus`);
        return;
    }
    if (activitate.Nume.length < numarCaractereNumeActivitate) {
        throw new Error(`Numele activitatii trebuie sa contina cel putin ${numarCaractereNumeActivitate} litere`);
        return;
    }
    if (activitate.Detalii.length < numarCaractereDetaliiActivitate) {
        throw new Error(`Detaliile activitatii trebuie sa contina cel putin ${numarCaractereDetaliiActivitate} litere`);
        return;
    }
    let now = new Date();
    now.setHours(now.getHours() + 3);
    if (new Date(activitate.DataLimita) < now) {
        throw new Error(`Data limita a activitatii trebuie sa fie in viitor`);
        return;
    }
    activitate.Stare = "Nefinalizata";

    return await Activitate.create(activitate);
}

export async function createSchema(schema, UtilizatorId) {
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
    if (schema.UtilizatorId != UtilizatorId) {
        throw new Error(`UtilizatorId difera de schema.UtilizatorId`);
        return;
    }
    let verificareUtilizator = await getUtilizatorById(UtilizatorId);

    if (!verificareUtilizator) {
        throw new Error(`Nu exista un utilizator cu id-ul ${UtilizatorId}`);
        return;
    }

    if (!verificareFormatSchema(schema.Continut)) {
        throw new Error(`Schema nu are un format valid`);
        return;
    }

    let verificareSchemaNume = await getSchemaByNumeAndTip(schema.SchemaNume, schema.Tip);
    console.log(verificareSchemaNume);
    if (verificareSchemaNume.length > 0) {
        throw new Error(`Exista deja o schema de tip ${schema.Tip} cu numele ${schema.SchemaNume}`);
        return;
    }
    if (!verificareVariabileSchemaUnice(variabileSchema(schema.Continut))) {
        throw new Error(`Variabilele din schema trebuie sa aiba nume unice`);
        return;
    }
    return await Schema.create(schema);
}

export async function createGenerat(generat, SchemaId, UtilizatorId) {
    if (!generat.Continut) {
        throw new Error(`Continutul trebuie sa fie completat`);
        return;
    }
    if (generat.UtilizatorId != UtilizatorId) {
        throw new Error(`UtilizatorId difera de generat.UtilizatorId`);
        return;
    }
    if (generat.SchemaId != SchemaId) {
        throw new Error(`SchemaId difera de generat.SchemaId`);
        return;
    }
    let verificareUtilizator = await getUtilizatorById(UtilizatorId);
    if (!verificareUtilizator) {
        throw new Error(`Nu exista un utilizator cu id-ul ${UtilizatorId}`);
        return;
    }
    let verificareSchema = await getSchemaById(SchemaId);
    if (!verificareSchema) {
        throw new Error(`Nu exista o schema cu id-ul ${SchemaId}`);
        return;
    }
    if (verificareSchema.SchemaNume != generat.SchemaNume) {
        throw new Error(`SchemaNume difera de generat.SchemaNume`);
        return;
    }
    return await Generat.create(generat);
}

export async function createClient(client) {
    if (client.ClientNume.length < numarCaractereNumeClient) {
        throw new Error(`Numele clientului trebuie sa contina cel putin ${numarCaractereNumeClient}`);
        return;
    }
    if (verificareFormatEmail(client.Email) != true) {
        throw new Error(`Email-ul nu are un format valid`);
        return;
    }
    if (verificareFormatTelefon(client.Telefon) != true) {
        throw new Error(`Telefonul-ul nu are un format valid`);
        return;
    }
    let verificaEmail = await getClientByEmail(client.Email);
    if (verificaEmail.length > 0) {
        throw new Error(`Exista deja un client asociat acestui email`);
        return;
    }
    let verificaTelefon = await getClientByTelefon(client.Telefon);
    if (verificaTelefon.length > 0) {
        throw new Error(`Exista deja un client asociat acestui numar de telefon`);
        return;
    }
    return await Client.create(client);
}

export async function createComanda(comanda, ClientId, UtilizatorId) {
    console.log(comanda);
    if (comanda.Adresa.length < numarCaractereAdresa) {
        throw new Error(`Adresa comenzii trebuie sa fie contina cel putin ${numarCaractereAdresa} caractere`);
        return;
    }
    if (comanda.UtilizatorId != UtilizatorId) {
        throw new Error(`UtilizatorId difera de comanda.UtilizatorId`);
        return;
    }
    if (comanda.ClientId != ClientId) {
        throw new Error(`ClientId difera de comanda.ClientId`);
        return;
    }
    if (!comanda.Data) {
        throw new Error(`Data trebuie completata`);
        return;
    }
    let d = moment().toDate();

    let cd = moment(comanda.Data, "YYYY-MM-DD").add(3, "hour").toDate();
    if (d < cd) {
        throw new Error(`Data nu poate fi in viitor`);
        return;
    }
    let c = {};
    c.ComandaId = comanda.ComandaId;
    c.Adresa = comanda.Adresa;
    c.Data = moment(comanda.Data, "YYYY-MM-DD").add(3, "hour").toDate();
    c.UtilizatorId = comanda.UtilizatorId;
    c.Status = comanda.Status;
    c.Detalii = comanda.Detalii;
    c.ClientId = comanda.ClientId;
    if (comanda.ComandaProduse.length > 0) {
        let comandaCreata = await Comanda.create(c);
        for (let i = 0; i < comanda.ComandaProduse.length; i++) {
            let comandaProdus = comanda.ComandaProduse[i];
            let produs = { ComandaId: comandaCreata.ComandaId, ProdusId: comandaProdus.ProdusId, Cantitate: comandaProdus.Cantitate, Pret: comandaProdus.Pret };
            let cp = await ComandaProdus.create(produs);
        }
        return await getComandaById(comandaCreata.ComandaId);
    } else {
        throw new Error(`Comanda nu contine produse`);
        return;
    }
}

export async function createComandaProdus(comandaProdus) {
    if (comandaProdus.Pret <= 0) {
        throw new Error(`Pretul trebuie sa fie pozitiv`);
        return;
    }
    if (comandaProdus.Cantitate <= 0) {
        throw new Error(`Cantitatea trebuie sa fie pozitiva`);
        return;
    }
    let comanda = await getComandaById(comandaProdus.ComandaId);
    if (!comanda) {
        throw new Error(`Nu exista o comanda cu acest id`);
        return;
    }
    let produs = await getProdusById(comandaProdus.ProdusId);
    if (!produs) {
        throw new Error(`Nu exista un produs cu acest id`);
        return;
    }
    return await ComandaProdus.create(comandaProdus);
}
