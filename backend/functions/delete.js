import Client from '../entities/Client.js';
import Comanda from '../entities/Comanda.js';
import ComandaProdus from '../entities/ComandaProdus.js';
import Generat from '../entities/Generat.js';
import Produs from '../entities/Produs.js';
import Schema from '../entities/Schema.js';
import Utilizator from '../entities/Utilizator.js';
import Activitate from '../entities/Activitate.js';
import {getProdusById} from './read.js';
import {getClientById} from './read.js';
import { getSchemaById } from './read.js';
import { getActivitateById } from './read.js';

export async function deleteActivitate(ActivitateId){
   
    let deleteEntity = await getActivitateById(ActivitateId);
    
    if (!deleteEntity){
        console.log("There isn't a activitate with this id");
        return;
    }
    
    return await deleteEntity.destroy();
}

export async function deleteUtilizator(UtilizatorId){
   
    let deleteEntity = await getUtilizatorById(UtilizatorId);

    if (!deleteEntity){
        console.log("There isn't a utilizator with this id");
        return;
    }
    let deleteActivitati = deleteEntity.Activitate;
    if(deleteActivitati!=null){for(let activitate in deleteActivitati)
        deleteActivitate(activitate.ActivitateId);}
    
    return await deleteEntity.destroy();
}

export async function deleteProdus(ProdusId){
   
    let deleteEntity = await getProdusById(ProdusId);
    
    if (!deleteEntity){
        console.log("There isn't a produs with this id");
        return;
    }
    return await deleteEntity.destroy();
}

export async function deleteClient(ClientId){
   
    let deleteEntity = await getClientById(ClientId);
    
    if (!deleteEntity){
        console.log("There isn't a client with this id");
        return;
    }
    return await deleteEntity.destroy();
}

export async function deleteSchema(SchemaId){
   
    let deleteEntity = await getSchemaById(SchemaId);
    
    if (!deleteEntity){
        console.log("There isn't a schema with this id");
        return;
    }
    return await deleteEntity.destroy();
}
