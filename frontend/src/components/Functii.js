import { link, produsRoute, utilizatorRoute, clientRoute } from "../ApiRoutes";
import { TableCell, TableRow } from "@material-ui/core";
import { get, post, put, remove } from "../Calls";
import { listaCulori, numarCaractere } from "./Consts";
export function formatData(date) {
    let d = new Date(date);
    d.setHours(d.getHours() - 3);
    let zi = d.getDate() < 10 ? "0" + d.getDate() : d.getDate();
    let luna = d.getMonth() + 1 < 10 ? "0" + (d.getMonth() + 1) : d.getMonth() + 1;
    let an = d.getFullYear();
    let ora = d.getHours() < 10 ? "0" + d.getHours() : d.getHours();
    let minut = d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes();

    let s = zi + "-" + luna + "-" + an + "  " + ora + ":" + minut;

    return s;
}
export function formatDataFaraOra(date) {
    let d = new Date(date);
    d.setHours(d.getHours() - 3);
    let zi = d.getDate() < 10 ? "0" + d.getDate() : d.getDate();
    let luna = d.getMonth() + 1 < 10 ? "0" + (d.getMonth() + 1) : d.getMonth() + 1;
    let an = d.getFullYear();

    let s = zi + "-" + luna + "-" + an;

    return s;
}
export function traducereStatus(status) {
    switch (status) {
        case "Awaiting Fulfillment":
            return "În procesare";
            break;
        case "Awaiting Payment":
            return "Plată în așteptare";
            break;
        case "Awaiting Shipment":
            return "Așteptare preluare curier";
            break;
        case "Cancelled":
            return "Anulată";
            break;
        case "Completed":
            return "Finalizată";
            break;
        case "Partially Refunded":
            return "Rambursare parțială";
            break;
        case "Partially Shipped":
            return "Livrată parțial";
            break;
        case "Refunded":
            return "Rambursată";
            break;
        case "Shipped":
            return "Livrată";
            break;
        default:
            return "";
    }
}
export function procentFinalizare(listaActivitati) {
    let finalizat = 0;
    let total = listaActivitati.length;
    if (total == 0) {
        return 0;
    }
    for (let activitate of listaActivitati) {
        if (activitate.Stare == "Finalizata") finalizat++;
    }

    return ((finalizat / total) * 100).toFixed(2);
}
export function numarActivitatiFinalizate(listaActivitati) {
    let finalizat = 0;
    for (let activitate of listaActivitati) {
        if (activitate.Stare == "Finalizata") finalizat++;
    }
    return finalizat;
}
export function numarActivitatiNefinalizate(listaActivitati) {
    let nefinalizat = 0;
    for (let activitate of listaActivitati) {
        if (activitate.Stare == "Nefinalizata") nefinalizat++;
    }
    return nefinalizat;
}
export function numarComenziStatus(listaComenzi) {
    let numar = {};
    for (let comanda of listaComenzi) {
        if (numar[comanda.Status]) numar[comanda.Status]++;
        else numar[comanda.Status] = 1;
    }

    return numar;
}
export function cantitateCategorieProduse(listaComenzi, listaProduse) {
    let numar = {};
    for (let comanda of listaComenzi) {
        for (let randComanda of comanda.ComandaProduse) {
            if (numar[listaProduse[randComanda.ProdusId].Categorie]) numar[listaProduse[randComanda.ProdusId].Categorie] += randComanda.Cantitate;
            else numar[listaProduse[randComanda.ProdusId].Categorie] = randComanda.Cantitate;
        }
    }

    return numar;
}
export function valoareCategorieProduse(listaComenzi, listaProduse) {
    let numar = {};
    for (let comanda of listaComenzi) {
        for (let randComanda of comanda.ComandaProduse) {
            if (numar[listaProduse[randComanda.ProdusId].Categorie])
                numar[listaProduse[randComanda.ProdusId].Categorie] += Math.round(randComanda.Cantitate * randComanda.Pret * 100) / 100;
            else numar[listaProduse[randComanda.ProdusId].Categorie] = Math.round(randComanda.Cantitate * randComanda.Pret * 100) / 100;
        }
    }

    return numar;
}
export function styleStareActivitate(row) {
    let c = row.Stare == "Nefinalizata" ? (Date.parse(row.DataLimita) > new Date() ? "#FFD740" : "#FF7043") : "#81C784";

    return c;
}
export function stareActivitate(row) {
    let c = row.Stare == "Nefinalizata" ? (Date.parse(row.DataLimita) > new Date() ? "Nefinalizata" : "Timp Expirat") : "Finalizata";

    return c;
}
export function createActivitateFilterRoute(filter) {
    // /activitateFilter/:UtilizatorId/:ManagerId/:Nume/:Detalii/:Stare/:DataMinima/:DataMaxima/:Camp/:Asc'
    let route = link + "activitateFilter/";

    if (filter.UtilizatorId) route += filter.UtilizatorId + "/";
    else route += "-/";
    if (filter.ManagerId) route += filter.ManagerId + "/";
    else route += "-/";
    if (filter.Nume) route += filter.Nume + "/";
    else route += "-/";
    if (filter.Detalii) route += filter.Detalii + "/";
    else route += "-/";
    if (filter.Stare) route += filter.Stare + "/";
    else route += "-/";
    if (filter.DataMinima) route += filter.DataMinima + "/";
    else route += "-/";
    if (filter.DataMaxima) route += filter.DataMaxima + "/";
    else route += "-/";
    if (filter.Camp) route += filter.Camp + "/";
    else route += "-/";
    if (filter.Asc) route += filter.Asc + "/";
    else route += "-/";
    return route;
}
export function actualizeazaModSortare(filtru, Camp) {
    if (filtru.Camp != Camp) {
        filtru.Asc = "asc";
        filtru.Camp = Camp;
    } else {
        if (filtru.Asc == "asc") {
            filtru.Asc = "desc";
        } else {
            filtru.Asc = "asc";
        }
    }
    return filtru.Asc;
}
export function createProdusFilterRoute(produsFilter) {
    // /produsFilter/:Nume/:Pret/:Descriere/:Categorie/:Camp/:Asc
    let route = link + "produsFilter/";

    if (produsFilter.Nume == "") {
        route += "-/";
    } else {
        route += produsFilter.Nume + "/";
    }

    if (produsFilter.Pret == "" || produsFilter.Pret == 0) {
        route += "-/";
    } else {
        route += produsFilter.Pret + "/";
    }

    if (produsFilter.Descriere == "" || produsFilter.Descriere == 0) {
        route += "-/";
    } else {
        route += produsFilter.Descriere + "/";
    }
    if (produsFilter.Categorie == "" || produsFilter.Categorie == 0) {
        route += "-/";
    } else {
        route += produsFilter.Categorie + "/";
    }
    if (produsFilter.Camp) route += produsFilter.Camp + "/";
    else route += "-/";
    if (produsFilter.Asc) route += produsFilter.Asc + "/";
    else route += "-/";
    return route;
}

export function createComandaFilterRoute(comandaFilter) {
    ///comandaFilter/:Adresa/:DataMinima/:DataMaxima/:Status/:Detalii/:Camp/:Asc
    let route = link + "comandaFilter/";
    if (comandaFilter.Adresa == "") {
        route += "-/";
    } else {
        route += comandaFilter.Adresa + "/";
    }

    if (comandaFilter.DataMinima == "") {
        route += "-/";
    } else {
        route += comandaFilter.DataMinima + "/";
    }
    if (comandaFilter.DataMaxima == "") {
        route += "-/";
    } else {
        route += comandaFilter.DataMaxima + "/";
    }

    if (comandaFilter.Status == "") {
        route += "-/";
    } else {
        route += comandaFilter.Status + "/";
    }
    if (comandaFilter.Detalii == "") {
        route += "-/";
    } else {
        route += comandaFilter.Detalii + "/";
    }
    if (comandaFilter.Camp) route += comandaFilter.Camp + "/";
    else route += "-/";
    if (comandaFilter.Asc) route += comandaFilter.Asc + "/";
    else route += "-/";
    return route;
}
export function createClientFilterRoute(clientFilter) {
    ///clientFilter/:ClientNume/:Email/:Telefon/:TipPersoana/:TipClient/:Camp/:Asc
    let route = link + "clientFilter/";
    if (clientFilter.ClientNume == "") {
        route += "-/";
    } else {
        route += clientFilter.ClientNume + "/";
    }

    if (clientFilter.Email == "") {
        route += "-/";
    } else {
        route += clientFilter.Email + "/";
    }
    if (clientFilter.Telefon == "") {
        route += "-/";
    } else {
        route += clientFilter.Telefon + "/";
    }

    if (clientFilter.TipPersoana == "") {
        route += "-/";
    } else {
        route += clientFilter.TipPersoana + "/";
    }
    if (clientFilter.TipClient == "") {
        route += "-/";
    } else {
        route += clientFilter.TipClient + "/";
    }
    if (clientFilter.Camp) route += clientFilter.Camp + "/";
    else route += "-/";
    if (clientFilter.Asc) route += clientFilter.Asc + "/";
    else route += "-/";
    return route;
}
export function createSchemaFilterRoute(schemaFilter) {
    ///schemaFilter/:SchemaNume/:Continut/:Tip/:Camp/:Asc
    let route = link + "schemaFilter/";
    if (schemaFilter.SchemaNume == "") {
        route += "-/";
    } else {
        route += schemaFilter.SchemaNume + "/";
    }
    if (schemaFilter.Continut == "") {
        route += "-/";
    } else {
        route += schemaFilter.Continut + "/";
    }
    if (schemaFilter.Tip == "") {
        route += "-/";
    } else {
        route += schemaFilter.Tip + "/";
    }
    if (schemaFilter.Camp) route += schemaFilter.Camp + "/";
    else route += "-/";
    if (schemaFilter.Asc) route += schemaFilter.Asc + "/";
    else route += "-/";
    return route;
}
export function legentPieChart(data) {
    if (Object.keys(data).length != 0) {
        return data.map((row) => (
            <TableRow>
                <TableCell
                    align='center'
                    style={{
                        fontSize: "16px",
                        padding: "1px",
                        paddingLeft: "2px",
                        paddingRight: "2px",
                    }}
                >
                    {row.title}
                </TableCell>
                <TableCell
                    align='center'
                    style={{
                        fontSize: "16px",
                        padding: "1px",
                        paddingLeft: "2px",
                        paddingRight: "2px",
                    }}
                >
                    {row.value}
                </TableCell>
                <TableCell
                    align='center'
                    style={{
                        fontSize: "16px",
                        padding: "1px",
                        paddingLeft: "2px",
                        paddingRight: "2px",
                    }}
                >
                    {row.percent}
                </TableCell>
                <TableCell style={{ backgroundColor: row.color, width: "4px" }}> </TableCell>
            </TableRow>
        ));
    } else return null;
}

export function label(dataEntry) {
    let label = "";
    if (dataEntry.percent >= 4) label = Math.round(dataEntry.percent * 10) / 10 + "%";
    return label;
}

export function eroareParola(Parola) {
    if (Parola.length == 0) {
        return " ";
    }
    if (Parola.length < numarCaractere.Utilizator.Parola) {
        return `Parola trebuie să conțină cel puțin ${numarCaractere.Utilizator.Parola} caractere`;
    }
    let lowerCase = 0;
    let upperCase = 0;
    let digit = 0;
    let space = 0;
    for (let i = 0; i < Parola.length; i++) {
        if (Parola[i] >= "a" && Parola[i] <= "z") {
            lowerCase++;
        }
        if (Parola[i] >= "A" && Parola[i] <= "Z") {
            upperCase++;
        }
        if (Parola[i] >= "0" && Parola[i] <= "9") {
            digit++;
        }
        if (Parola[i] == " ") {
            space++;
        }
    }
    if (lowerCase == 0) {
        return "Parola trebuie sa contina cel putin o litera mica";
    }
    if (upperCase == 0) {
        return "Parola trebuie sa contina cel putin o litera mare";
    }
    if (digit == 0) {
        return "Parola trebuie sa contina cel putin o cifra";
    }
    if (space != 0) {
        return "Parola nu poate contine spatii";
    }
    if (lowerCase + upperCase + digit === Parola.length) {
        return "Parola trebuie sa contina cel putin un caracter special";
    }

    return " ";
}
export function eroareUtilizatorNume(UtilizatorNume) {
    if (UtilizatorNume.length == 0) {
        return " ";
    }
    if (UtilizatorNume.includes(" ") == true) return "Numele de utilizator nu poate conține spații";
    if (UtilizatorNume.length < numarCaractere.Utilizator.UtilizatorNume) {
        return `Numele de utilizator trebuie să conțină cel puțin ${numarCaractere.Utilizator.UtilizatorNume} caractere`;
    }
    return " ";
}
export function eroareNume(Nume) {
    if (Nume.length == 0) {
        return " ";
    }
    if (Nume.length < numarCaractere.Utilizator.Nume) {
        return `Numele trebuie să conțină cel puțin ${numarCaractere.Utilizator.Nume} caractere`;
    }

    return " ";
}
export function eroareClientNume(ClientNume) {
    if (ClientNume.length < numarCaractere.Client.ClientNume) {
        return `Numele clientului trebuie sa contina cel putin ${numarCaractere.Client.ClientNume} caractere`;
    }
    return " ";
}
export function verificareFormatTelefon(Telefon) {
    let digit = 0;
    if (Telefon.length != 10) {
        return "Telefonul trebuie sa contina 10 caractere";
    }
    for (let i = 0; i < 10; i++) {
        if (Telefon[i] >= "0" && Telefon[i] <= "9") {
            digit++;
        }
    }
    if (digit != 10) {
        return "Telefon invalid!";
    }
    return " ";
}
export function verificareFormatEmail(Email) {
    var re = /\S+@\S+\.\S+/;
    if (re.test(Email)) {
        return " ";
    } else {
        return "Email invalid!";
    }
}
export async function verificareDisponibilitateUtilizatorNume(UtilizatorNume) {
    let verificare = await get(utilizatorRoute + "/UtilizatorNume/" + UtilizatorNume);
    console.log(verificare);
    return verificare.length == 0 ? " " : "Numele de utilizator este deja folosit";
}

export function totalValoare(comandaProduse) {
    let total = 0;
    for (let rand of comandaProduse) total += rand.Pret * rand.Cantitate;
    return total;
}
export function totalBucati(comandaProduse) {
    let total = 0;
    for (let rand of comandaProduse) total += rand.Cantitate;
    return total;
}
export async function getVectorClientiIndex() {
    let data = await get(clientRoute);
    let copie = [];
    for (let i = 0; i < data.length; i++) {
        copie[data[i].ClientId] = data[i];
    }
    return copie;
}
export async function getVectorProduseIndex() {
    let data = await get(produsRoute);
    let copie = [];
    for (let i = 0; i < data.length; i++) {
        copie[data[i].ProdusId] = data[i];
    }
    return copie;
}
export async function statisticiComenzi(rowsComenzi) {
    //valoarea medie a unei comenzi
    //numarul mediu de produse comandate
    //numarul mediu de comenzi plasate de un client
    //cel mai comandat produs a fost
    let produse = await getVectorProduseIndex();
    let clienti = await getVectorClientiIndex();
    let rezultat = [];
    if (rowsComenzi.length == 0) {
        rezultat.push(`În perioada selectată nu au fost plasate comenzi!`);
    } else {
        let suma = rowsComenzi.reduce((a, b) => a + totalValoare(b.ComandaProduse), 0);
        rezultat.push(`Au fost plasate în total ${rowsComenzi.length} comenzi. Valoarea totală a comenzilor a fost de ${suma}$.`);
        rezultat.push(`Valoarea medie a comenzilor plasate în perioada selectată a fost de ${Math.round(suma / rowsComenzi.length)}$.`);
        let cantitate = rowsComenzi.reduce((a, b) => a + totalBucati(b.ComandaProduse), 0);
        rezultat.push(`În total a fost comandată cantitatea de ${cantitate} produse.`);
        let vanzariClienti = [];
        rowsComenzi.map((row) => {
            vanzariClienti[row.ClientId] ? vanzariClienti[row.ClientId]++ : (vanzariClienti[row.ClientId] = 1);
        });
        let copie = [];
        let idClient = [];
        vanzariClienti.map((row, index) => {
            if (row) {
                copie.push(row);
                idClient.push(index);
            }
        });
        let max = Math.max(...copie);
        if (idClient.length != 0 && max > 1)
            rezultat.push(`Cele mai multe comenzi au fost plasate de clientul ${clienti[idClient[copie.indexOf(max)]].ClientNume}. 
        Clientul a plasat ${max} comenzi în perioada selectată.`);
        let vanzariProduse = [];
        //TREBUIE DUPA COMANDA PRODUS DE LA COMANDA NU PRODUS
        rowsComenzi.map((row) =>
            row.ComandaProduse.map((comandaProdus) => {
                if (vanzariProduse[comandaProdus.ProdusId]) {
                    vanzariProduse[comandaProdus.ProdusId].Cantitate += comandaProdus.Cantitate;
                    vanzariProduse[comandaProdus.ProdusId].Valoare += comandaProdus.Cantitate * comandaProdus.Pret;
                } else {
                    vanzariProduse[comandaProdus.ProdusId] = {
                        Cantitate: 0,
                        Valoare: 0,
                        ProdusId: comandaProdus.ProdusId,
                    };
                    vanzariProduse[comandaProdus.ProdusId].Cantitate = comandaProdus.Cantitate;
                    vanzariProduse[comandaProdus.ProdusId].Valoare = comandaProdus.Cantitate * comandaProdus.Pret;
                }
            })
        );
        console.log(vanzariProduse);
        vanzariProduse.sort((a, b) => b.Cantitate - a.Cantitate);
        if (vanzariProduse[0].Cantitate > 1) {
            rezultat.push(
                `Cel mai bun produs din punct de vedere al cantității vândute este ${produse[vanzariProduse[0].ProdusId].Nume}. Pentru acesta s-au vândut ${
                    vanzariProduse[0].Cantitate
                } bucăți.`
            );
        }

        vanzariProduse.sort((a, b) => b.Valoare - a.Valoare);
        rezultat.push(
            `Cel mai bun produs din punct de vedere al valorii vândute este ${
                produse[vanzariProduse[0].ProdusId].Nume
            }. Pentru acesta valoarea vânzărilor a fost ${vanzariProduse[0].Valoare}$.`
        );
    }
    console.log(clienti);
    return rezultat;
}
export function dateEgale(data1, data2) {
    if (!data1 || !data2) return false;
    data1 = data1.substring(0, 10);
    data2 = data2.substring(0, 10);
    return data1 == data2;
}
export function afiseaza(Id) {
    console.log("Afiseaza:", Id);
    document.getElementById(Id).style.display = "flex";
}
export function ascunde(Id) {
    console.log("Ascunde:", Id);
    document.getElementById(Id).style.display = "none";
}
export function eroareSchemaNume(SchemaNume) {
    if (SchemaNume.length < numarCaractere.Schema.SchemaNume) {
        return `Numele schemei trebuie sa contina cel putin ${numarCaractere.Schema.SchemaNume} caractere`;
    }
    return " ";
}
export function verificareFormatSchema(Continut) {
    let numarVariabile = 0;
    let a1 = 0;
    let a2 = 0;
    let a3 = 0;
    let a4 = 0;
    for (let i = 0; i < Continut.length; i++) {
        if (Continut[i] == "{") {
            if (Continut[i + 1] == "{" && Continut[i + 2] != "}") {
                a1 = 1;
                a2 = 1;
                i = i + 2;
            } else {
                return false;
            }
        }
        if (Continut[i] == "}") {
            if (a1 == 1 && a2 == 1) {
                if (Continut[i + 1] == "}") {
                    a3 = 1;
                    a4 = 1;
                    i = i + 1;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        }

        if (a1 + a2 + a3 + a4 == 4) {
            numarVariabile++;
            a1 = 0;
            a2 = 0;
            a3 = 0;
            a4 = 0;
        }
    }
    if (a1 + a2 + a3 + a4 != 0) {
        return false;
    }
    if (numarVariabile == 0) {
        return false;
    }
    return true;
}
export function verificareVariabileSchemaUnice(variabile) {
    let set = [
        ...new Set(
            variabile.map((element) => {
                return element.toLowerCase();
            })
        ),
    ];
    if (set.length == variabile.length) {
        return true;
    }

    return false;
}
export function variabileSchema(Continut) {
    let variabile = [];
    let variabila = "";
    for (let i = 0; i < Continut.length; i++) {
        if (Continut[i] == "{" && Continut[i + 1] == "{") {
            i = i + 2;
            while ((Continut[i] != "}" && Continut[i + 1] != "}") || (Continut[i] != "}" && Continut[i + 1] == "}")) {
                variabila = variabila.concat(Continut[i]);
                i++;
            }
            i++;
            variabile.push(variabila);
            variabila = "";
        }
    }
    return variabile;
}
export function eroareSchemaContinut(Continut) {
    if (Continut.length < numarCaractere.Schema.Continut) {
        return `Continutul schemei trebuie sa contina cel putin ${numarCaractere.Schema.Continut} caractere`;
    }
    if (verificareFormatSchema(Continut) == false) {
        return `Continutul schemei nu are un format valid`;
    }
    if (verificareVariabileSchemaUnice(variabileSchema(Continut)) == false) {
        return `Continutul schemei trebuie sa contina doar variabile unice`;
    }

    return " ";
}
export function eroareDataLimita(Data) {
    let d = new Date(Data);
    let now = new Date();
    now.setHours(now.getHours() + 3);
    console.log(now);
    console.log(d);
    console.log(now >= d);
    if (now >= d) {
        return `Data limită trebuie să fie în viitor!`;
    }
    return " ";
}
