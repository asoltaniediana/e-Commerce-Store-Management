import { useState, useEffect } from "react";
import * as React from "react";
import { get, post, put, remove } from "../Calls";
import {
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableRow,
    TableContainer,
    InputLabel,
    Select,
    Grid,
    TextField,
    TableHead,
    IconButton,
    Tab,
} from "@material-ui/core";
import { PieChart } from "react-minimal-pie-chart";
import { stilTabel, stilButon, stilTextField, stilTableHeadCell, stilInformatiiImport, stilBarChart, PrimulElementPagina } from "./ConstanteStil";
import Tooltip from "@mui/material/Tooltip";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { link, utilizatorRoute, tipUtilizatorRoute, produsRoute, comandaRoute } from "../ApiRoutes";
import { Route, useNavigate } from "react-router-dom";
import { procentFinalizare, numarActivitatiFinalizate, statisticiComenzi, totalValoare, dateEgale, formatData, formatDataFaraOra } from "./Functii.js";
import { numarActivitatiNefinalizate, legentPieChart, label, traducereStatus } from "./Functii.js";
import { numarComenziStatus } from "./Functii.js";
import exportFromJSON from "export-from-json";
import { culoareStatusComanda, culoriBarChart, listaCulori } from "./Consts.js";
import { valoareCategorieProduse, cantitateCategorieProduse } from "./Functii.js";
import "../App.css";
export default function ManagerSituatie() {
    const [rowsSituatieAngajati, setRowsSituatieAngajati] = useState([]);
    const [rowsBarChartValoareMedie, setRowsBarChartValoareMedie] = useState([]);
    const [needUpdate, setNeedUpdate] = useState(false);
    const navigate = useNavigate();
    const [comandaFilter, setComandaFilter] = useState({
        Adresa: "",
        Data: "",
        Detalii: "",
        Status: "",
        DataMinima: "",
        DataMaxima: "",
        PieStatus: false,
        PieCantitateCategorie: false,
        PieValoareCategorie: false,
        StatisticiComenzi: false,
    });
    const [chartIds, setChartIds] = useState({
        StatusComanda: "Chart1",
        CantitateCategorie: "Chart2",
        ValoareCategorie: "Chart3",
        StatisticiComenzi: "Table2",
        ValoareTotalaZile: "BarChart1",
        ValoareMedieZile: "BarChart2",
        ValoareMinimaZile: "BarChart3",
        ValoareMaximaZile: "BarChart4",
        NumarVanzariZile: "BarChart5",
    });
    const [datePieStatusComenzi, setDatePieStatusComenzi] = useState({});
    const [datePieValoareCategorie, setDatePieValoareCategorie] = useState({});
    const [dateTabelStatisticiComenzi, setDateTabelStatisticiComenzi] = useState([]);
    const [datePieCantitateCategorie, setDatePieCantitateCategorie] = useState({});
    const defaultLabelStyle = {
        fontSize: "8px",
        color: "#FFFFFF",
        align: "center",
        fontFamily: "sans-serif",
    };
    const titluBarChart = {
        ValoareMinima: "Valoarea minimă a comenzilor pentru perioada selectată",
        ValoareMaxima: "Valoarea maximă a comenzilor pentru perioada selectată",
        ValoareMedie: "Valoarea medie a comenzilor pentru perioada selectată",
        ValoareTotala: "Valoarea totală a comenzilor pentru perioada selectată",
        NumarVanzari: "Numărul de comenzi pentru perioada selectată",
    };
    const options = {
        legend: {
            display: true,
            position: "right",
        },
        elements: {
            arc: {
                borderWidth: 1,
            },
        },
    };
    const [rowsProdus, setRowsProdus] = useState([]);
    const [numarComenzi, setNumarComenzi] = useState(0);
    useEffect(async () => {
        if (localStorage.getItem("Tip") == "Angajat") {
            navigate("/Angajat");
        }
        let data = await get(utilizatorRoute);
        data = data.filter((obj) => obj.UtilizatorId != localStorage.UtilizatorId);
        data.sort((a, b) => procentFinalizare(b.Activitati) - procentFinalizare(a.Activitati));
        for (let angajat of data) {
            angajat.numarActivitatiFinalizate = numarActivitatiFinalizate(angajat.Activitati);
            angajat.numarActivitatiNefinalizate = numarActivitatiNefinalizate(angajat.Activitati);
            angajat.procentFinalizare = procentFinalizare(angajat.Activitati);
        }
        setRowsSituatieAngajati(data);
        if (rowsProdus.length == 0) {
            let produse = await get(produsRoute);

            let copieProduse = [];
            for (let i = 0; i < produse.length; i++) {
                copieProduse[produse[i].ProdusId] = produse[i];
            }
            setRowsProdus(copieProduse);
        }
        if (comandaFilter.PieStatus == true) {
            let d = await genereazaPieChartStatusComenzi();
            setDatePieStatusComenzi(d);
            if (d.length > 0) {
                document.getElementById(chartIds.StatusComanda).style.display = "flex";
            }
        }
        if (comandaFilter.PieCantitateCategorie) {
            let d = await genereazaPieChartCantitateCategorieProduse();
            setDatePieCantitateCategorie(d);
            if (d.length > 0) {
                document.getElementById(chartIds.CantitateCategorie).style.display = "flex";
            }
        }
        if (comandaFilter.PieValoareCategorie == true) {
            let d = await genereazaPieChartValoareCategorieProduse();
            setDatePieValoareCategorie(d);
            if (d.length > 0) {
                document.getElementById(chartIds.ValoareCategorie).style.display = "flex";
            }
        }
        if (comandaFilter.PieValoareCategorie == true) {
            let d = await genereazaPieChartValoareCategorieProduse();
            setDatePieValoareCategorie(d);
            if (d.length > 0) {
                document.getElementById(chartIds.ValoareCategorie).style.display = "flex";
            }
        }
        if (comandaFilter.StatisticiComenzi == true) {
            let d = await genereazaTabelStatisticiComenzi();
            setDateTabelStatisticiComenzi(d);
            if (d.length > 0) {
                document.getElementById(chartIds.StatisticiComenzi).style.display = "flex";
            }
        }
        let d = await genereazaBarChartValoareMedieVanzariPeZile();
        console.log(d);
        setRowsBarChartValoareMedie(d);
    }, [needUpdate]);
    const onChangeComandaFilter = (e) => {
        setComandaFilter({ ...comandaFilter, [e.target.name]: e.target.value });
        setNeedUpdate(!needUpdate);
    };
    const exportaSituatieAngajati = () => {
        let data = structuredClone(rowsSituatieAngajati);
        for (let d of data) {
            delete d.Activitati;
            delete d.UtilizatorId;
            delete d.Parola;
            delete d.UtilizatorNume;
        }
        let fileName = "Situatie Angajati";
        let exportType = "xls"; //tipul poate fi text, json, csv, xls, xml
        exportFromJSON({ data, fileName, exportType });
    };
    function alertaDataMinimaSiMaxima() {
        if (comandaFilter.DataMinima && comandaFilter.DataMaxima) {
            if (comandaFilter.DataMinima > comandaFilter.DataMaxima) {
                alert("Data minimă trebuie să fie înaintea datei maxime");
                comandaFilter.DataMinima = "";
                comandaFilter.DataMaxima = "";
                return false;
            }
        }
        return true;
    }
    async function genereazaPieChartStatusComenzi() {
        ///comandaPieChart/:DataMinima/:DataMaxima'
        if (!alertaDataMinimaSiMaxima()) {
            return [];
        }
        let route = link + "comandaPieChart/";
        if (comandaFilter.DataMinima) {
            route += comandaFilter.DataMinima + "/";
        } else {
            route += "-/";
        }
        if (comandaFilter.DataMaxima) {
            route += comandaFilter.DataMaxima + "";
        } else {
            route += "-";
        }

        let data = await get(route);
        let rezultat = numarComenziStatus(data);

        let datePie = [];
        for (let camp in rezultat) {
            datePie.push({
                title: traducereStatus(camp),
                value: rezultat[camp],
                color: culoareStatusComanda[camp],
                percent: ((rezultat[camp] / data.length) * 100).toFixed(2),
            });
        }
        datePie.sort((a, b) => b.percent - a.percent);
        setNumarComenzi(datePie.length);
        return datePie;
    }
    async function genereazaPieChartValoareCategorieProduse() {
        ///comandaPieChart/:DataMinima/:DataMaxima'
        if (!alertaDataMinimaSiMaxima()) {
            return [];
        }
        let route = link + "comandaPieChart/";
        if (comandaFilter.DataMinima) {
            route += comandaFilter.DataMinima + "/";
        } else {
            route += "-/";
        }
        if (comandaFilter.DataMaxima) {
            route += comandaFilter.DataMaxima + "";
        } else {
            route += "-";
        }
        let data = await get(route);
        let rezultat = valoareCategorieProduse(data, rowsProdus);
        let datePie = [];
        let indexCuloare = 0;
        let total = 0;
        for (let camp in rezultat) {
            total += rezultat[camp];
        }
        for (let camp in rezultat) {
            datePie.push({
                title: camp,
                value: rezultat[camp],
                color: "",
                percent: ((rezultat[camp] / total) * 100).toFixed(2),
            });
        }
        datePie.sort((a, b) => b.percent - a.percent);
        for (let i in datePie) {
            datePie[i].color = listaCulori[indexCuloare % listaCulori.length];
            indexCuloare++;
        }
        setNumarComenzi(datePie.length);
        return datePie;
    }
    async function genereazaTabelStatisticiComenzi() {
        ///comandaPieChart/:DataMinima/:DataMaxima'
        if (!alertaDataMinimaSiMaxima()) {
            return [];
        }
        let route = link + "comandaPieChart/";
        if (comandaFilter.DataMinima) {
            route += comandaFilter.DataMinima + "/";
        } else {
            route += "-/";
        }
        if (comandaFilter.DataMaxima) {
            route += comandaFilter.DataMaxima + "";
        } else {
            route += "-";
        }
        let data = await get(route);
        let d = await statisticiComenzi(data);

        return d;
    }
    async function genereazaPieChartCantitateCategorieProduse() {
        ///comandaPieChart/:DataMinima/:DataMaxima'
        if (!alertaDataMinimaSiMaxima()) {
            return [];
        }
        let route = link + "comandaPieChart/";
        if (comandaFilter.DataMinima) {
            route += comandaFilter.DataMinima + "/";
        } else {
            route += "-/";
        }
        if (comandaFilter.DataMaxima) {
            route += comandaFilter.DataMaxima + "";
        } else {
            route += "-";
        }
        let data = await get(route);
        let rezultat = cantitateCategorieProduse(data, rowsProdus);
        let datePie = [];
        let indexCuloare = 0;
        let total = 0;
        for (let camp in rezultat) {
            total += rezultat[camp];
        }
        for (let camp in rezultat) {
            datePie.push({
                title: camp,
                value: rezultat[camp],
                color: "",
                percent: ((rezultat[camp] / total) * 100).toFixed(2),
            });
        }
        datePie.sort((a, b) => b.percent - a.percent);
        for (let i in datePie) {
            datePie[i].color = listaCulori[indexCuloare % listaCulori.length];
            indexCuloare++;
        }
        setNumarComenzi(datePie.length);
        return datePie;
    }
    async function genereazaBarChartValoareMedieVanzariPeZile() {
        if (!alertaDataMinimaSiMaxima()) {
            return [];
        }

        ///comandaFilter/:Adresa/:DataMinima/:DataMaxima/:Status/:Detalii/:Camp/:Asc
        let route =
            link +
            "comandaFilter/-/" +
            (comandaFilter.DataMinima ? comandaFilter.DataMinima : "-") +
            "/" +
            (comandaFilter.DataMaxima ? comandaFilter.DataMaxima : "-") +
            "/-/-/Data/asc";
        let data = await get(route);

        let valoriVanzariPeZile = [];
        if (data.length > 0) {
            valoriVanzariPeZile.push({
                Data: data[0].Data,
                Valoare: 0,
                Contor: 0,
                Maxim: totalValoare(data[0].ComandaProduse),
                Minim: totalValoare(data[0].ComandaProduse),
            });
            data.map((value) => {
                if (!dateEgale(valoriVanzariPeZile[valoriVanzariPeZile.length - 1].Data, value.Data)) {
                    valoriVanzariPeZile.push({
                        Data: value.Data,
                        Valoare: totalValoare(value.ComandaProduse),
                        Contor: 1,
                        Maxim: totalValoare(value.ComandaProduse),
                        Minim: totalValoare(value.ComandaProduse),
                    });
                } else {
                    valoriVanzariPeZile[valoriVanzariPeZile.length - 1].Valoare += totalValoare(value.ComandaProduse);
                    valoriVanzariPeZile[valoriVanzariPeZile.length - 1].Contor++;
                    if (totalValoare(value.ComandaProduse) > valoriVanzariPeZile[valoriVanzariPeZile.length - 1].Maxim) {
                        valoriVanzariPeZile[valoriVanzariPeZile.length - 1].Maxim = totalValoare(value.ComandaProduse);
                    }
                    if (totalValoare(value.ComandaProduse) < valoriVanzariPeZile[valoriVanzariPeZile.length - 1].Minim) {
                        valoriVanzariPeZile[valoriVanzariPeZile.length - 1].Minim = totalValoare(value.ComandaProduse);
                    }
                }
            });
        }
        setNumarComenzi(data.length);
        return valoriVanzariPeZile;
    }
    function graficBarChartValoareTotalaPeZile() {
        let max = Math.max(...rowsBarChartValoareMedie.map((row) => row.Valoare));
        return rowsBarChartValoareMedie.map((row) => rand(row.Data, row.Valoare, Math.round((row.Valoare / max) * 100), culoriBarChart[0], "$"));
    }
    function graficBarChartValoareMaximaPeZile() {
        let max = Math.max(...rowsBarChartValoareMedie.map((row) => row.Maxim));
        return rowsBarChartValoareMedie.map((row) => rand(row.Data, row.Maxim, Math.round((row.Maxim / max) * 100), culoriBarChart[1], "$"));
    }
    function graficBarChartValoareMinimaPeZile() {
        let max = Math.max(...rowsBarChartValoareMedie.map((row) => row.Minim));
        return rowsBarChartValoareMedie.map((row) => rand(row.Data, row.Minim, Math.round((row.Minim / max) * 100), culoriBarChart[2], "$"));
    }
    function graficBarChartValoareMediePeZile() {
        let max = Math.max(...rowsBarChartValoareMedie.map((row) => Math.round(row.Valoare / row.Contor)));
        return rowsBarChartValoareMedie.map((row) =>
            rand(row.Data, Math.round(row.Valoare / row.Contor), Math.round((Math.round(row.Valoare / row.Contor) / max) * 100), culoriBarChart[3], "$")
        );
    }
    function graficBarChartNumarComenziPeZile() {
        let max = Math.max(...rowsBarChartValoareMedie.map((row) => row.Contor));
        return rowsBarChartValoareMedie.map((row) => rand(row.Data, row.Contor, Math.round((row.Contor / max) * 100), culoriBarChart[4], ""));
    }
    function ascundeGrafic(GraficId) {
        return (
            <Tooltip title={"Ascunde graficul"}>
                <IconButton
                    style={{ padding: "10px" }}
                    onClick={() => {
                        document.getElementById(GraficId).style.display = "None";
                    }}
                >
                    <VisibilityOffIcon style={{ color: "#616161" }} />
                </IconButton>
            </Tooltip>
        );
    }
    function rand(Data, Valoare, Procent, Culoare, Caracter) {
        let x = new Array(100);
        x.fill(1);
        return (
            <TableRow style={{ border: "10px solid white", borderCollapse: "collapse" }}>
                <TableCell
                    style={{
                        width: "12%",
                        border: "0px",
                        padding: "3px",
                        borderCollapse: "collapse",
                        paddingLeft: "5px",
                        paddingRight: "5px",
                    }}
                >
                    {formatDataFaraOra(Data)}
                </TableCell>
                <TableCell style={{ padding: "0px", border: "0px", width: "5%", paddingLeft: "10px", paddingRight: "10px" }}>{Valoare + Caracter}</TableCell>
                {x.map((value, index) =>
                    index < Procent ? (
                        <TableCell
                            style={{
                                width: "0.95%",
                                padding: "0px",

                                borderCollapse: "collapse",
                                backgroundColor: Culoare,
                                border: "0px",
                            }}
                        ></TableCell>
                    ) : (
                        <TableCell
                            style={{
                                width: "0.95%",

                                padding: "0px",
                                borderCollapse: "collapse",
                                backgroundColor: "white",
                            }}
                        ></TableCell>
                    )
                )}
            </TableRow>
        );
    }
    function nuAuFostPlasateComenzi(ChartId) {
        return (
            <Table style={{ borderStyle: "none" }} id={ChartId}>
                <TableHead>
                    <TableCell
                        colSpan={101}
                        align='center'
                        style={{
                            fontSize: "15px",
                            textTransform: "uppercase",
                        }}
                    >
                        În perioada selectată nu au fost plasate comenzi!
                        {ascundeGrafic(ChartId)}
                    </TableCell>
                </TableHead>
            </Table>
        );
    }
    function barChart(ChartId, Titlu, Body) {
        return (
            <Table style={stilBarChart}>
                <TableHead>
                    <TableCell
                        colSpan={101}
                        align='center'
                        style={{
                            fontSize: "18px",
                            color: "#616161",
                            textTransform: "uppercase",
                        }}
                    >
                        {Titlu}
                        {ascundeGrafic(ChartId)}
                    </TableCell>
                </TableHead>
                <TableBody>{Body}</TableBody>
            </Table>
        );
    }
    function tableHeadLegendaPieChart(Cell1, Cell2, Cell3) {
        return (
            <TableHead>
                <TableRow>
                    <TableCell style={{ padding: "1px" }} align='center'>
                        {Cell1}
                    </TableCell>
                    <TableCell style={{ padding: "1px" }} align='center'>
                        {Cell2}
                    </TableCell>
                    <TableCell style={{ padding: "1px" }} align='center'>
                        {Cell3}
                    </TableCell>
                    <TableCell style={{ padding: "1px" }} align='center'></TableCell>
                </TableRow>
            </TableHead>
        );
    }
    function pieChart(datePieChart) {
        return (
            <PieChart
                data={datePieChart}
                lineWidth={55}
                paddingAngle={1}
                startAngle={180}
                label={({ dataEntry }) => label(dataEntry)}
                labelPosition={100 - 55 / 2}
                labelStyle={{
                    fill: "#FAFAFA",
                    fontFamily: '"Nunito Sans", -apple-system, Helvetica, Arial, sans-serif',
                    fontSize: "8px",
                    opacity: 0.8,
                    fontWeight: "bolder",
                    pointerEvents: "none",
                }}
                style={{ width: "85%" }}
            />
        );
    }

    return (
        <div>
            <Grid container alignItems='center' justifyContent='center' style={PrimulElementPagina}>
                <Grid item xs={12} sm={12} justifyContent='center'>
                    <TableContainer component={Paper} style={stilTabel}>
                        <Table aria-label='simple table'>
                            <TableHead>
                                <TableRow style={stilTableHeadCell}>
                                    <Tooltip title={"Accesare pagina cu toti utilizatorii "}>
                                        <TableCell align='center' onClick={() => navigate(`/Manager/Angajati`)}>
                                            <Button variant='outlined' style={stilButon}>
                                                Vizualizați utilizatorii
                                            </Button>
                                        </TableCell>
                                    </Tooltip>
                                    <Tooltip title={"Accesare pagina cu toate activitatile adaugate de tine "}>
                                        <TableCell align='center' colSpan={2} onClick={() => navigate(`/Manager/Activitati/Angajati`)}>
                                            <Button variant='outlined' style={stilButon}>
                                                Activități adăugate
                                            </Button>
                                        </TableCell>
                                    </Tooltip>
                                    <Tooltip title={"Exportati situatia angajatilor ca fisier xls"}>
                                        <TableCell align='center' onClick={exportaSituatieAngajati}>
                                            <Button variant='outlined' style={stilButon}>
                                                Exportă situație
                                            </Button>
                                        </TableCell>
                                    </Tooltip>
                                </TableRow>
                                <TableRow>
                                    <TableCell align='center' colSpan={4}>
                                        SITUAȚIE ANGAJAȚI
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell align='center' style={{ textTransform: "uppercase" }}>
                                        Nume
                                    </TableCell>
                                    <TableCell align='center' style={{ textTransform: "uppercase" }}>
                                        Finalizate
                                    </TableCell>
                                    <TableCell align='center' style={{ textTransform: "uppercase" }}>
                                        Nefinalizate
                                    </TableCell>
                                    <TableCell align='center' style={{ textTransform: "uppercase" }}>
                                        Procent Finalizare
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rowsSituatieAngajati.map((row, index) => (
                                    <TableRow key={row.UtilizatorId}>
                                        <TableCell align='center'>{row.Nume}</TableCell>
                                        <TableCell align='center'>{numarActivitatiFinalizate(row.Activitati)}</TableCell>
                                        <TableCell align='center'>{numarActivitatiNefinalizate(row.Activitati)}</TableCell>
                                        <TableCell align='center'>
                                            {procentFinalizare(row.Activitati) == -1 ? "Nu exista activitati" : procentFinalizare(row.Activitati) + "%"}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>
            <Grid container justifyContent='center' alignItems='center' style={{ marginBottom: "30px" }}>
                <Grid item xs={12} sm={12} justifyContent='left'>
                    <InputLabel
                        style={{
                            fontSize: "large",
                            color: "#616161",
                            marginTop: "20px",
                        }}
                    >
                        {`Grafice pentru perioada selectată`}
                    </InputLabel>
                </Grid>
                <Grid item xs={12} sm={5} justifyContent='center' style={{ marginLeft: "20px", marginRight: "20px" }}>
                    <TextField
                        autoFocus
                        margin='dense'
                        id='DataMinimaFilter'
                        name='DataMinima'
                        label='Data Minima'
                        InputLabelProps={{ shrink: true }}
                        variant='outlined'
                        fullWidth
                        value={comandaFilter.DataMinima}
                        type='date'
                        style={stilTextField}
                        helperText=' '
                        onChange={(e) => onChangeComandaFilter(e)}
                    />
                </Grid>
                <Grid item xs={12} sm={5} justifyContent='center' style={{ marginLeft: "20px", marginRight: "20px" }}>
                    <TextField
                        autoFocus
                        margin='dense'
                        id='DataMaximaFilter'
                        name='DataMaxima'
                        label='Data Maxima'
                        InputLabelProps={{ shrink: true }}
                        variant='outlined'
                        fullWidth
                        style={stilTextField}
                        value={comandaFilter.DataMaxima}
                        type='date'
                        error={
                            comandaFilter.DataMinima != "" && comandaFilter.DataMaxima != "" && comandaFilter.DataMinima > comandaFilter.DataMaxima
                                ? true
                                : false
                        }
                        helperText={
                            comandaFilter.DataMinima != "" && comandaFilter.DataMaxima != "" && comandaFilter.DataMinima > comandaFilter.DataMaxima
                                ? "Data Maximă trebuie să fie mai mare decât Data Minimă"
                                : " "
                        }
                        onChange={(e) => onChangeComandaFilter(e)}
                    />
                </Grid>
                <Grid item xs={11} sm={4} justifyContent='center'>
                    <Tooltip title={"Generati grafic status comenzi pentru perioada specificata"}>
                        <Button
                            variant='outlined'
                            style={stilButon}
                            onClick={() => {
                                comandaFilter.PieStatus = true;
                                setNeedUpdate(!needUpdate);
                            }}
                        >
                            status comenzi
                        </Button>
                    </Tooltip>
                </Grid>
                <Grid item xs={11} sm={4} justifyContent='center'>
                    <Tooltip title={"Generati grafic status comenzi pentru perioada specificata"}>
                        <Button
                            variant='outlined'
                            style={stilButon}
                            onClick={() => {
                                comandaFilter.PieValoareCategorie = true;
                                setNeedUpdate(!needUpdate);
                            }}
                        >
                            valoare categorie produse
                        </Button>
                    </Tooltip>
                </Grid>
                <Grid item xs={11} sm={4} justifyContent='center'>
                    <Tooltip title={"Generati grafic status comenzi pentru perioada specificata"}>
                        <Button
                            variant='outlined'
                            style={stilButon}
                            onClick={() => {
                                comandaFilter.PieCantitateCategorie = true;
                                setNeedUpdate(!needUpdate);
                            }}
                        >
                            cantitate categorie produse
                        </Button>
                    </Tooltip>
                </Grid>
                <Grid item xs={11} sm={4}>
                    <Tooltip title={"Generați statistici referitoare la comenzile din perioada selectată"}>
                        <Button
                            variant='outlined'
                            style={stilButon}
                            onClick={() => {
                                comandaFilter.StatisticiComenzi = true;
                                setNeedUpdate(!needUpdate);
                            }}
                        >
                            Statistici comenzi
                        </Button>
                    </Tooltip>
                </Grid>
                <Grid item xs={11} sm={4}>
                    <Tooltip title={"Generați grafic referitor la valoarea totală a comenzililor pe zile din perioada selectată"}>
                        <Button
                            variant='outlined'
                            style={stilButon}
                            onClick={() => {
                                document.getElementById(chartIds.ValoareTotalaZile).style.display = "flex";
                            }}
                        >
                            Valoare totală comenzi
                        </Button>
                    </Tooltip>
                </Grid>
                <Grid item xs={11} sm={4}>
                    <Tooltip title={"Generați grafic referitor la valoarea medie a comenzililor pe zile din perioada selectată"}>
                        <Button
                            variant='outlined'
                            style={stilButon}
                            onClick={() => {
                                document.getElementById(chartIds.ValoareMedieZile).style.display = "flex";
                            }}
                        >
                            Valoare medie comenzi
                        </Button>
                    </Tooltip>
                </Grid>
                <Grid item xs={11} sm={4}>
                    <Tooltip title={"Generați grafic referitor la numărul comenzililor pe zile din perioada selectată"}>
                        <Button
                            variant='outlined'
                            style={stilButon}
                            onClick={() => {
                                document.getElementById(chartIds.NumarVanzariZile).style.display = "flex";
                            }}
                        >
                            Număr comenzi
                        </Button>
                    </Tooltip>
                </Grid>
                <Grid item xs={11} sm={4}>
                    <Tooltip title={"Generați grafic referitor la valoarea maximă a comenzililor pe zile din perioada selectată"}>
                        <Button
                            variant='outlined'
                            style={stilButon}
                            onClick={() => {
                                document.getElementById(chartIds.ValoareMaximaZile).style.display = "flex";
                            }}
                        >
                            Valoare maximă comenzi
                        </Button>
                    </Tooltip>
                </Grid>
                <Grid item xs={11} sm={4}>
                    <Tooltip title={"Generați grafic referitor la valoarea minimă a comenzililor pe zile din perioada selectată"}>
                        <Button
                            variant='outlined'
                            style={stilButon}
                            onClick={() => {
                                document.getElementById(chartIds.ValoareMinimaZile).style.display = "flex";
                            }}
                        >
                            Valoare minimă comenzi
                        </Button>
                    </Tooltip>
                </Grid>
            </Grid>
            {datePieStatusComenzi.length == 0 ? (
                nuAuFostPlasateComenzi(chartIds.StatusComanda)
            ) : (
                <Grid
                    container
                    xs={12}
                    sm={12}
                    alignItems='center'
                    id={chartIds.StatusComanda}
                    justifyContent='center'
                    style={{ display: "none", marginBottom: "20px" }}
                >
                    <Grid item xs={12} sm={12} justifyContent='left' style={{ padding: "15px" }}>
                        <InputLabel style={{ fontSize: "large", color: "#616161" }}>
                            {`Statusul comenzilor în perioada selectată`}
                            <Tooltip title={"Ascunde graficul"}>
                                <IconButton
                                    style={{ paddingLeft: "10px" }}
                                    onClick={() => {
                                        comandaFilter.PieStatus = false;
                                        document.getElementById(chartIds.StatusComanda).style.display = "None";
                                        setNeedUpdate(!needUpdate);
                                    }}
                                >
                                    <VisibilityOffIcon style={{ color: "#616161" }} />
                                </IconButton>
                            </Tooltip>
                        </InputLabel>
                    </Grid>
                    <Grid
                        item
                        xs={8}
                        sm={2}
                        justifyContent='center'
                        style={{
                            marginLeft: "10px",
                            marginRight: "10px",
                            marginBottom: "0px",
                        }}
                    >
                        {pieChart(datePieStatusComenzi)}
                    </Grid>
                    <Grid item xs={12} sm={3} justifyContent='center' style={{ marginLeft: "20px", marginRight: "20px" }}>
                        <TableContainer component={Paper} style={stilTabel}>
                            <Table aria-label='simple table'>
                                {tableHeadLegendaPieChart("Status", "Număr comenzi", "%")}
                                <TableBody>{legentPieChart(datePieStatusComenzi)}</TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                </Grid>
            )}
            {datePieValoareCategorie.length == 0 ? (
                nuAuFostPlasateComenzi(chartIds.ValoareCategorie)
            ) : (
                <Grid
                    container
                    xs={12}
                    sm={12}
                    alignItems='center'
                    id={chartIds.ValoareCategorie}
                    justifyContent='center'
                    style={{ display: "none", marginBottom: "20px" }}
                >
                    <Grid item xs={12} sm={12} justifyContent='left' style={{ padding: "15px" }}>
                        <InputLabel style={{ fontSize: "large", color: "#616161" }}>
                            {`Valoarea vândută din fiecare categorie în perioada selectată`}
                            <Tooltip title={"Ascunde graficul"}>
                                <IconButton
                                    style={{ paddingLeft: "10px" }}
                                    onClick={() => {
                                        comandaFilter.PieValoareCategorie = false;
                                        document.getElementById(chartIds.ValoareCategorie).style.display = "None";
                                        setNeedUpdate(!needUpdate);
                                    }}
                                >
                                    <VisibilityOffIcon style={{ color: "#616161" }} />
                                </IconButton>
                            </Tooltip>
                        </InputLabel>
                    </Grid>
                    <Grid
                        item
                        xs={8}
                        sm={2}
                        justifyContent='center'
                        style={{
                            marginLeft: "10px",
                            marginRight: "10px",
                            marginBottom: "10px",
                        }}
                    >
                        {pieChart(datePieValoareCategorie)}
                    </Grid>
                    <Grid item xs={10} sm={3} justifyContent='center' style={{ marginLeft: "20px", marginRight: "20px" }}>
                        <TableContainer component={Paper} style={stilTabel}>
                            <Table aria-label='simple table'>
                                {tableHeadLegendaPieChart("Categorie", "Valoare", "%")}

                                <TableBody>{legentPieChart(datePieValoareCategorie)}</TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                </Grid>
            )}
            {datePieCantitateCategorie.length == 0 ? (
                nuAuFostPlasateComenzi(chartIds.CantitateCategorie)
            ) : (
                <Grid
                    container
                    xs={12}
                    sm={12}
                    alignItems='center'
                    id={chartIds.CantitateCategorie}
                    justifyContent='center'
                    style={{ display: "none", marginBottom: "20px" }}
                >
                    <Grid item xs={12} sm={12} justifyContent='left' style={{ padding: "15px" }}>
                        <InputLabel style={{ fontSize: "large", color: "#616161" }}>
                            {`Cantitatea vândută din fiecare categorie în perioada selectată`}
                            <Tooltip title={"Ascunde graficul"}>
                                <IconButton
                                    style={{ paddingLeft: "10px" }}
                                    onClick={() => {
                                        comandaFilter.PieCantitateCategorie = false;
                                        document.getElementById(chartIds.CantitateCategorie).style.display = "None";
                                        setNeedUpdate(!needUpdate);
                                    }}
                                >
                                    <VisibilityOffIcon style={{ color: "#616161" }} />
                                </IconButton>
                            </Tooltip>
                        </InputLabel>
                    </Grid>
                    <Grid item xs={8} sm={2} justifyContent='center' style={{ marginLeft: "10px", marginRight: "10px" }}>
                        {pieChart(datePieCantitateCategorie)}
                    </Grid>
                    <Grid item xs={10} sm={3} justifyContent='center' style={{ marginLeft: "20px", marginRight: "20px" }}>
                        <TableContainer component={Paper} style={stilTabel}>
                            <Table aria-label='simple table'>
                                {tableHeadLegendaPieChart("Categorie", "Cantitate", "%")}
                                <TableBody>{legentPieChart(datePieCantitateCategorie)}</TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                </Grid>
            )}

            <Grid
                container
                xs={12}
                style={{ marginTop: "20px", marginBottom: "20px", display: "none" }}
                alignItems='center'
                justifyContent='center'
                id={chartIds.StatisticiComenzi}
            >
                <Grid item xs={11} justifyContent='center' style={stilTabel}>
                    <TableContainer component={Paper}>
                        <Table aria-label='simple table'>
                            <TableHead>
                                <TableRow style={stilTableHeadCell}>
                                    <TableCell
                                        align='center'
                                        style={{
                                            fontSize: "15px",
                                            textTransform: "uppercase",
                                        }}
                                    >
                                        Statistici comenzi în perioada selectată
                                        {ascundeGrafic(chartIds.StatisticiComenzi)}
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {dateTabelStatisticiComenzi.map((row) => (
                                    <TableRow>
                                        <TableCell align='center'>{row}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>
            <Grid container justifyContent='center' alignItems='center' style={{ display: "none" }} id={chartIds.ValoareTotalaZile}>
                <Grid item xs={12} justifyContent='center' alignItems='center'>
                    {numarComenzi != 0
                        ? barChart(chartIds.ValoareTotalaZile, titluBarChart.ValoareTotala, graficBarChartValoareTotalaPeZile(rowsBarChartValoareMedie))
                        : nuAuFostPlasateComenzi(chartIds.ValoareTotalaZile)}
                </Grid>
            </Grid>
            <Grid container justifyContent='center' alignItems='center' style={{ display: "none" }} id={chartIds.ValoareMedieZile}>
                <Grid item xs={12} justifyContent='center' alignItems='center'>
                    {numarComenzi != 0
                        ? barChart(chartIds.ValoareMedieZile, titluBarChart.ValoareMedie, graficBarChartValoareMediePeZile(rowsBarChartValoareMedie))
                        : nuAuFostPlasateComenzi(chartIds.ValoareMedieZile)}
                </Grid>
            </Grid>
            <Grid container justifyContent='center' alignItems='center' style={{ display: "none" }} id={chartIds.NumarVanzariZile}>
                <Grid item xs={12} justifyContent='center' alignItems='center'>
                    {numarComenzi != 0
                        ? barChart(chartIds.NumarVanzariZile, titluBarChart.NumarVanzari, graficBarChartNumarComenziPeZile(rowsBarChartValoareMedie))
                        : nuAuFostPlasateComenzi(chartIds.NumarVanzariZile)}
                </Grid>
            </Grid>
            <Grid container justifyContent='center' alignItems='center' style={{ display: "none" }} id={chartIds.ValoareMaximaZile}>
                <Grid item xs={12} justifyContent='center' alignItems='center'>
                    {numarComenzi != 0
                        ? barChart(chartIds.ValoareMaximaZile, titluBarChart.ValoareMaxima, graficBarChartValoareMaximaPeZile(rowsBarChartValoareMedie))
                        : nuAuFostPlasateComenzi(chartIds.ValoareMaximaZile)}
                </Grid>
            </Grid>
            <Grid container justifyContent='center' alignItems='center' style={{ display: "none" }} id={chartIds.ValoareMinimaZile}>
                <Grid item xs={12} justifyContent='center' alignItems='center'>
                    {numarComenzi != 0
                        ? barChart(chartIds.ValoareMinimaZile, titluBarChart.ValoareMinima, graficBarChartValoareMinimaPeZile(rowsBarChartValoareMedie))
                        : nuAuFostPlasateComenzi(chartIds.ValoareMinimaZile)}
                </Grid>
            </Grid>
        </div>
    );
}
