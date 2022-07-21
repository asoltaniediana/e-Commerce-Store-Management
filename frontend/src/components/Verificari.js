//Activitate
export const Activitate_numarCaractereNume = 3;
export const Activitate_numarCaractereDetalii = 5;
//Client
export const Client_numarCaractereNume = 3;
//verificare telefonDisponibil
//verificare emailDisponibil
//Comanda
export const Comanda_numarCaractereAdresa = 10;
//Produs
export const numarCaractereNumeProdus = 3;
//Schema
export const Schema_numarCaractereSchema = 10;
//Utilizator
export const Utilizator_numarCaractereNumeUtilizator = 8;
export const Utilizator_numarCaractereNume = 5;
export const Utilizator_numarCaractereParola = 8;
//Verificare numeUtilizatorDisponibil
//Verificare formatParola
export function verificareParola(Parola) {
    let lowerCase = 0;
    let upperCase = 0;
    let digit = 0;
    let space = 0;
    for (let i = 0; i < Parola.length; i++) {
        if (Parola[i] >= "a" && Parola[i] <= "z") lowerCase++;
        if (Parola[i] >= "A" && Parola[i] <= "Z") upperCase++;
        if (Parola[i] >= "0" && Parola[i] <= "9") digit++;
        if (Parola[i] === " ") space++;
    }
    if (lowerCase === 0) {
        throw new Error("Parola trebuie sa contina cel putin o litera mica");
        return;
    }
    if (upperCase === 0) {
        throw new Error("Parola trebuie sa contina cel putin o litera mare");
        return;
    }
    if (digit === 0) {
        throw new Error("Parola trebuie sa contina cel putin o cifra");
        return;
    }
    if (space !== 0) {
        throw new Error("Parola nu poate contine spatii");
        return;
    }
    if (lowerCase + upperCase + digit === Parola.length) {
        throw new Error("Parola trebuie sa contina cel putin un caracter special");
        return;
    }
    return true;
}

export function verificareUtilizatorNume(UtilizatorNume) {
    let space = 0;
    for (let i = 0; i < UtilizatorNume.length; i++) {
        if (UtilizatorNume[i] === " ") space++;
    }
    if (space !== 0) {
        throw new Error("Numele de utilizator nu poate contine spatii");
        return;
    }
    return true;
}

export function cantitateTotalaProdus(comandaProdus) {
    let c = 0;
    for (let i = 0; i < comandaProdus.length; i++) {
        c = c + comandaProdus[i].Cantitate;
    }
    return c;
}
export function valoareProduse(comandaProdus) {
    let v = 0;
    for (let i = 0; i < comandaProdus.length; i++) {
        v = v + comandaProdus[i].Cantitate * comandaProdus[i].Pret;
    }
    return v;
}
