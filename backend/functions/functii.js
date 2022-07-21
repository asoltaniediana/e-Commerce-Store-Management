export function verificareParola(Parola) {
    let lowerCase = 0;
    let upperCase = 0;
    let digit = 0;
    let space = 0;
    for (let i = 0; i < Parola.length; i++) {
        if (Parola[i] >= "a" && Parola[i] <= "z") lowerCase++;
        if (Parola[i] >= "A" && Parola[i] <= "Z") upperCase++;
        if (Parola[i] >= "0" && Parola[i] <= "9") digit++;
        if (Parola[i] == " ") space++;
    }
    if (lowerCase == 0) {
        throw new Error("Parola trebuie sa contina cel putin o litera mica");
        return;
    }
    if (upperCase == 0) {
        throw new Error("Parola trebuie sa contina cel putin o litera mare");
        return;
    }
    if (digit == 0) {
        throw new Error("Parola trebuie sa contina cel putin o cifra");
        return;
    }
    if (space != 0) {
        throw new Error("Parola nu poate contine spatii");
        return;
    }
    if (lowerCase + upperCase + digit === Parola.length) {
        throw new Error("Parola trebuie sa contina cel putin un caracter special");
        return;
    }
    return true;
}

export function verificareFormatTelefon(Telefon) {
    let digit = 0;
    if (Telefon.length != 10) {
        return false;
    }
    for (let i = 0; i < 10; i++) {
        if (Telefon[i] >= "0" && Telefon[i] <= "9") {
            digit++;
        }
    }
    if (digit != 10) {
        return false;
    }
    return true;
}
export function verificareFormatEmail(Email) {
    var re = /\S+@\S+\.\S+/;
    return re.test(Email);
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
export function formatData(date) {
    let d = new Date(date);
    let zi = d.getDate();
    let luna = d.getMonth() + 1;
    let an = d.getFullYear();
    let ora = d.getHours();
    let minut = d.getMinutes();

    let s = zi + "-" + luna + "-" + an + "  " + ora + ":";
    if (minut < 10) s += "0" + minut;
    else s += "" + minut;
    return s;
}
export function exportToCsv(filename, rows) {
    var processRow = function (row) {
        var finalVal = "";
        for (var j = 0; j < row.length; j++) {
            var innerValue = row[j] === null ? "" : row[j].toString();
            if (row[j] instanceof Date) {
                innerValue = row[j].toLocaleString();
            }
            var result = innerValue.replace(/"/g, '""');
            if (result.search(/("|,|\n)/g) >= 0) result = '"' + result + '"';
            if (j > 0) finalVal += ",";
            finalVal += result;
        }
        return finalVal + "\n";
    };

    var csvFile = "";
    for (var i = 0; i < rows.length; i++) {
        csvFile += processRow(rows[i]);
    }

    var blob = new Blob([csvFile], { type: "text/csv;charset=utf-8;" });
    if (navigator.msSaveBlob) {
        // IE 10+
        navigator.msSaveBlob(blob, filename);
    } else {
        var link = document.createElement("a");
        if (link.download !== undefined) {
            // feature detection
            // Browsers that support HTML5 download attribute
            var url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}
