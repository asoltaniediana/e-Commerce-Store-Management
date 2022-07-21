export const DB_USERNAME = "root";
export const DB_PASSWORD = "123456";
export const listaCulori = ["#FF8A65", "#FFB74D", "#FFEE58", "#A5D6A7", "#80DEEA", "#90CAF9", "#B39DDB", "#F48FB1", "#EF9A9A"];
export const culoriBarChart = ["#FFCDD2", "#FFD180", "#C5E1A5", "#B3E5FC", "#C5CAE9"];
export const numarCaractere = {
    Activitate: {
        Nume: 3,
        Detalii: 5,
    },
    Utilizator: {
        UtilizatorNume: 8,
        Nume: 5,
        Parola: 8,
    },
    Client: {
        ClientNume: 3,
    },
    Comanda: {
        Adresa: 10,
    },
    Schema: {
        Continut: 10,
        SchemaNume: 5,
    },
    Produs: {
        Descriere: 10,
        Nume: 3,
        Categorie: 3,
    },
};
export const culoareStatusComanda = {
    "Awaiting Payment": "#FFE082",
    "Awaiting Fulfillment": "#A5D6A7",
    "Awaiting Shipment": "#80CBC4",
    "Partially Shipped": "#80DEEA",
    Shipped: "#90CAF9",
    Completed: "#81C784",
    Refunded: "#FFAB91",
    "Partially Refunded": "#FFCC80",
    Cancelled: "#B39DDB",
};
export const latimiColoane = {
    //Produs
    Nume: "60%",
    Imagine: "10%",
    Cantitate: "10%",
    Pret: "10%",
    PretTotal: "10%",
    //Comanda
    NumeClient: "15%",
    Adresa: "25%",
    Data: "15%",
    Status: "15%",
    Detalii: "30%",
};
