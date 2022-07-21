import { useState, useEffect } from "react";
import * as React from "react";
import { get, post, put, remove } from "../Calls";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import {
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableRow,
    TableContainer,
    Grid,
    TextField,
    TableHead,
    InputLabel,
    MenuItem,
    Select,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import FilterListIcon from "@mui/icons-material/FilterList";
import TablePagination from "@mui/material/TablePagination";
import SortIcon from "@material-ui/icons/Sort";
import { link, clientRoute, comandaRoute, produsRoute } from "../ApiRoutes";
import { useNavigate } from "react-router-dom";
import { latimiColoane } from "./Consts";
import Tooltip from "@mui/material/Tooltip";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { formatData, actualizeazaModSortare, createComandaFilterRoute, traducereStatus, getVectorClientiIndex, getVectorProduseIndex } from "./Functii";
import { totalValoare, totalBucati } from "./Functii";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import "../App.css";
import { PrimulElementPagina, stilTabel, stilButon, stilTextField, stilTableHeadCell, stilInformatiiImport, stilTableHeadCellLight } from "./ConstanteStil";
export default function ManagerComanda() {
    const [comandaAdd, setComandaAdd] = useState({
        ClientId: "",
        Adresa: "",
        Data: "",
        UtilizatorId: localStorage.UtilizatorId,
        ClientId: "",
        ComandaProduse: [],
    });

    const [campComenzi, setCampComenzi] = useState(["ComandaId", "ClientId", "Adresa", "Data", "Status", "Detalii"]);
    const [campRandComenzi, setRandCampComenzi] = useState(["ComandaId", "ProdusId", "Cantitate", "Pret"]);
    const [clientFilter, setClientFilter] = useState({
        ClientNume: "",
        Email: "",
        Telefon: "",
        filtruActiv: false,
    });
    const [comandaFilter, setComandaFilter] = useState({
        Adresa: "",
        DataMinima: "",
        DataMaxima: "",
        Detalii: "",
        Status: "",
        Camp: "",
        Asc: "",
    });

    const [produsFilter, setProdusFilter] = useState({
        Nume: "",
        Pret: "",
        filtruActiv: false,
    });
    const [client, setClient] = useState({
        ClientNume: "",
        Email: "",
        Telefon: "",
    });
    const [optiuni, setOptiuni] = useState({
        filtruVizibil: false,
        ascundeFiltreaza: "Ascunde filtrele pentru comenzi",
        afiseazaFiltreaza: "Afișează filtrele pentru comenzi",
        importVizibil: false,
        ascundeImport: "Ascunde importul de comenzi noi",
        afiseazaImport: "Importați comenzi noi",
    });
    async function verificareImport(rowsImportate, randComenzi) {
        let adaugare = [];
        let actualizare = [];

        for (let j = 0; j < rowsImportate.length; j++) {
            rowsImportate[j].ComandaProduse = [];
        }
        for (let i = 0; i < randComenzi.length; i++) {
            for (let j = 0; j < rowsImportate.length; j++) {
                if (randComenzi[i].ComandaId == rowsImportate[j].ComandaId) {
                    rowsImportate[j].ComandaProduse.push(randComenzi[i]);
                }
            }
        }

        for (let i = 0; i < rowsImportate.length; i++) {
            let gasit = false;
            for (let j = 0; j < rows.length; j++) {
                if (rowsImportate[i].ComandaId == rows[j].ComandaId) {
                    gasit = true;
                    let identic = true;
                    for (let k = 0; k < campComenzi.length; k++) {
                        if (rowsImportate[i][campComenzi[k]] != rows[j][campComenzi[k]]) identic = false;
                    }
                    if (identic == false) {
                        actualizare.push(rowsImportate[i]);
                    }
                }
            }
            if (gasit == false) {
                adaugare.push(rowsImportate[i]);
            }
        }

        for (let i = 0; i < adaugare.length; i++) {
            adaugare[i].UtilizatorId = localStorage.UtilizatorId;
            console.log(adaugare[i]);
            let a = await post(comandaRoute + "/" + adaugare[i].ClientId + "/" + localStorage.UtilizatorId, adaugare[i]);
        }
        document.getElementById("FisierImport").value = "";
        setNeedUpdate(!needUpdate);
    }
    function comparaNumeClient(ClientId1, ClientId2, mod) {
        if (rowsClient[ClientId1].ClientNume >= rowsClient[ClientId2].ClientNume) return 1 * mod;
        else return -1 * mod;
    }
    function citireExcel(e) {
        const [file] = e.target.files;
        const reader = new FileReader();

        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: "binary" });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws);

            const wsname2 = wb.SheetNames[1];
            const ws2 = wb.Sheets[wsname2];
            const data2 = XLSX.utils.sheet_to_json(ws2);

            verificareImport(data, data2);
        };

        reader.readAsBinaryString(file);
    }
    function citireCSV(e) {
        const files = e.target.files;

        if (files) {
            let clienti = [];
            Papa.parse(files[0], {
                complete: function (rezultate) {
                    let headers = rezultate.data[0];
                    let gasit = 0;
                    if (headers.length != campComenzi.length) {
                        alert("Campurile din fisierul selectat nu sunt valide!");
                    }
                    for (let i = 0; i < headers.length; i++) {
                        for (let j = 0; j < campComenzi.length; j++) {
                            if (headers[i] == campComenzi[j]) {
                                gasit++;
                                j = campComenzi.length + 3;
                            }
                        }
                    }
                    if (gasit != campComenzi.length) {
                        alert("Campurile din fisierul selectat nu sunt valide!");
                    }

                    for (let i = 1; i < rezultate.data.length; i++) {
                        let obj = {};
                        for (let j = 0; j < rezultate.data[i].length; j++) {
                            obj[rezultate.data[0][j]] = rezultate.data[i][j];
                        }
                        clienti[i - 1] = obj;
                    }

                    verificareImport(clienti);
                },
            });
        }
    }
    function onChangeFisierImport(e) {
        const files = e.target.files;
        const extensie = files[0].name.split(".").pop();
        if (extensie == "csv") {
            citireCSV(e);
        } else {
            citireExcel(e);
        }
    }
    const [rowsClient, setRowsClient] = useState([]);
    const [rows, setRows] = useState([]);
    const [rowsProdus, setRowsProdus] = useState([]);
    const [needUpdate, setNeedUpdate] = useState(false);
    const navigate = useNavigate();
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    useEffect(async () => {
        if (rowsClient.length == 0) {
            setRowsClient(await getVectorClientiIndex());
        }
        if (rowsProdus.length == 0) {
            setRowsProdus(await getVectorProduseIndex());
        }
        if (comandaFilter.SchimbaStatus == true) {
            comandaFilter.SchimbaStatus = false;
        } else {
            let data = await get(createComandaFilterRoute(comandaFilter));

            if (comandaFilter.Camp == "NumeClient") {
                let modSortare = 0;
                if (comandaFilter.Asc == "asc") {
                    modSortare = -1;
                } else {
                    modSortare = 1;
                }
                let copie = data.sort((a, b) => comparaNumeClient(a.ClientId, b.ClientId, modSortare));
                setRows(copie);
            } else {
                setRows(data);
            }
        }
    }, [needUpdate]);

    const onChangeComandaFilter = (e) => {
        setComandaFilter({ ...comandaFilter, [e.target.name]: e.target.value });
    };

    //schimbare numar de randuri per pagina din tabel
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };
    //schimbare numar de randuri per pagina din tabel
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    //sortare date
    async function sortareHeader(Camp) {
        comandaFilter.Asc = actualizeazaModSortare(comandaFilter, Camp);
        comandaFilter.Camp = Camp;
        setNeedUpdate(!needUpdate);
    }
    //Salvarea filtrului pentru produse
    const saveComandaFilter = async () => {
        if (comandaFilter.Adresa != "" || comandaFilter.Data != "" || comandaFilter.Descriere != "" || comandaFilter.Categorie != "") {
            setNeedUpdate(!needUpdate);
        } else {
            alert("Va rugam sa completati cel putin un camp pentru filtrare!!");
        }
    };
    function resetare() {
        comandaFilter.filtruActiv = false;
        comandaFilter.Adresa = "";
        comandaFilter.Detalii = "";
        comandaFilter.DataMinima = "";
        comandaFilter.DataMaxima = "";
        comandaFilter.Status = "";
        setNeedUpdate(!needUpdate);
    }
    return (
        <div>
            <br />
            <Grid container spacing={1} xs={12} sm={12} style={PrimulElementPagina} alignItems='center' justifyContent='center'>
                <Grid item xs={12} sm={12} alignItems='center' justifyContent='center'>
                    <Tooltip title={optiuni.importVizibil == true ? optiuni.ascundeImport : optiuni.afiseazaImport}>
                        <Button
                            style={stilButon}
                            variant='outlined'
                            startIcon={<AddIcon />}
                            onClick={() => {
                                if (optiuni.importVizibil == true) {
                                    optiuni.importVizibil = false;
                                    document.getElementById("randImport").style.display = "none";
                                } else {
                                    optiuni.importVizibil = true;
                                    document.getElementById("randImport").style.display = "flex";
                                }
                                setNeedUpdate(!needUpdate);
                            }}
                        >
                            Import comenzi
                        </Button>
                    </Tooltip>
                </Grid>
                <Grid container xs={12} id='randImport' style={{ display: "none" }} alignItems='center' justifyContent='center'>
                    <Grid item xs={12} sm={12} alignItems='center' justifyContent='center'>
                        <InputLabel style={stilInformatiiImport}>
                            {`Pentru a importa un fișier XLSX cu comenzile acesta trebuie să conțină două foi de calcul: 
                    Comenzi, care conține informații generale referitoare la comenzi, cu câmpurile: ComandaId  ClientId  Adresa  Data  Status  Detalii, și foaia de calcul 
                    RandComenzi, care conține informații referitoare la produsele din fiecare comandă, cu câmpurile: ComandaId  ProdusId  Cantitate  Pret.`}
                        </InputLabel>
                    </Grid>

                    <Grid item xs={12} sm={5} alignItems='center' justifyContent='center'>
                        <TextField
                            autoFocus
                            margin='dense'
                            id='FisierImport'
                            name='Nume'
                            label='Fisier import'
                            variant='outlined'
                            style={stilTextField}
                            type='file'
                            InputLabelProps={{ shrink: true }}
                            accept='.xlsx'
                            onChange={(e) => onChangeFisierImport(e)}
                        />
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={12} sm={12} alignItems='center' justifyContent='center'>
                <Tooltip title={optiuni.filtruVizibil == true ? optiuni.ascundeFiltreaza : optiuni.afiseazaFiltreaza}>
                    <Button
                        style={stilButon}
                        variant='outlined'
                        startIcon={<FilterListIcon />}
                        onClick={() => {
                            if (optiuni.filtruVizibil == true) {
                                optiuni.filtruVizibil = false;
                                document.getElementById("randFiltrare").style.display = "none";
                            } else {
                                optiuni.filtruVizibil = true;
                                document.getElementById("randFiltrare").style.display = "flex";
                            }
                            setNeedUpdate(!needUpdate);
                        }}
                    >
                        Filtrare
                    </Button>
                </Tooltip>
                <Tooltip title='Pagina pentru adăugarea de clienți'>
                    <Button
                        style={stilButon}
                        variant='outlined'
                        startIcon={<AddIcon />}
                        onClick={() => {
                            navigate(`/Manager/Client`);
                        }}
                    >
                        Adaugă client
                    </Button>
                </Tooltip>
            </Grid>

            <Grid container spacing={3} id='randFiltrare' style={{ display: "none" }}>
                <Grid item xs={12} sm={4} alignItems='center' justifyContent='center'>
                    <TextField
                        autoFocus
                        style={stilTextField}
                        margin='dense'
                        id='AdresaFilter'
                        name='Adresa'
                        label='Adresa'
                        variant='outlined'
                        fullWidth
                        value={comandaFilter.Adresa}
                        onChange={(e) => onChangeComandaFilter(e)}
                    />
                </Grid>
                <Grid item xs={12} sm={4} alignItems='center' justifyContent='center'>
                    <TextField
                        autoFocus
                        style={stilTextField}
                        margin='dense'
                        id='DetaliiFilter'
                        name='Detalii'
                        label='Detalii'
                        variant='outlined'
                        fullWidth
                        value={comandaFilter.Detalii}
                        onChange={(e) => onChangeComandaFilter(e)}
                    />
                </Grid>

                <Grid item xs={12} sm={4} alignItems='center' justifyContent='center' id='StatusFilter'>
                    <InputLabel id='StatusLabel' fullWidth>
                        Status
                    </InputLabel>
                    <Select
                        labelId='StatusLabel'
                        value={comandaFilter.Status}
                        fullWidth
                        variant='outlined'
                        style={{
                            height: "30px",
                            marginLeft: "4%",
                            marginRight: "4%",
                            width: "95%",
                        }}
                        onChange={(event) => {
                            comandaFilter.Status = event.target.value;
                            comandaFilter.SchimbaStatus = true;
                            setNeedUpdate(!needUpdate);
                        }}
                    >
                        <MenuItem value={"Awaiting Fulfillment"}>{traducereStatus("Awaiting Fulfillment")}</MenuItem>
                        <MenuItem value={"Awaiting Payment"}>{traducereStatus("Awaiting Payment")}</MenuItem>
                        <MenuItem value={"Awaiting Shipment"}>{traducereStatus("Awaiting Shipment")}</MenuItem>
                        <MenuItem value={"Cancelled"}>{traducereStatus("Cancelled")}</MenuItem>
                        <MenuItem value={"Completed"}>{traducereStatus("Completed")}</MenuItem>
                        <MenuItem value={"Partially Refunded"}>{traducereStatus("Partially Refunded")}</MenuItem>
                        <MenuItem value={"Partially Shipped"}>{traducereStatus("Partially Shipped")}</MenuItem>
                        <MenuItem value={"Refunded"}>{traducereStatus("Refunded")}</MenuItem>
                        <MenuItem value={"Shipped"}>{traducereStatus("Shipped")}</MenuItem>
                        <MenuItem value={""}>-</MenuItem>
                    </Select>
                </Grid>
                <Grid container alignItems='center' justifyContent='center'>
                    <Grid item xs={12} sm={4} alignItems='center' justifyContent='center'>
                        <TextField
                            autoFocus
                            margin='dense'
                            id='DataMinimaFilter'
                            name='DataMinima'
                            style={stilTextField}
                            label='Data Minima'
                            InputLabelProps={{ shrink: true }}
                            variant='outlined'
                            fullWidth
                            value={comandaFilter.DataMinima}
                            type='date'
                            onChange={(e) => onChangeComandaFilter(e)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4} alignItems='center' justifyContent='center'>
                        <TextField
                            autoFocus
                            margin='dense'
                            id='DataMaximaFilter'
                            name='DataMaxima'
                            style={stilTextField}
                            label='DataMaxima'
                            InputLabelProps={{ shrink: true }}
                            variant='outlined'
                            fullWidth
                            value={comandaFilter.DataMaxima}
                            type='date'
                            onChange={(e) => onChangeComandaFilter(e)}
                        />
                    </Grid>
                </Grid>
                <Grid item xs={12} sm={12} alignItems='center' justifyContent='center'>
                    <Button size='large' style={stilButon} variant='outlined' startIcon={<FilterListIcon />} onClick={saveComandaFilter}>
                        Filtrare
                    </Button>
                    <Button size='large' style={stilButon} variant='outlined' startIcon={<RestartAltIcon />} onClick={resetare}>
                        Resetare filtrare
                    </Button>
                </Grid>
            </Grid>
            <Grid container alignItems='center' justifyContent='center'>
                <Grid item xs={12} sm={12} alignItems='center' justifyContent='center'>
                    <TableContainer component={Paper} style={stilTabel}>
                        <Table>
                            <TableHead style={{ fontWeight: "bold" }}>
                                <TableRow style={stilTableHeadCell}>
                                    <Tooltip
                                        title={
                                            "Ordonare dupa numele clientului " +
                                            (comandaFilter.Camp == "NumeClient" ? (comandaFilter.Asc == "asc" ? "descendent" : "ascendent") : "ascendent")
                                        }
                                    >
                                        <TableCell
                                            className='head'
                                            align='center'
                                            style={{
                                                width: latimiColoane.NumeClient,
                                            }}
                                            onClick={() => {
                                                comandaFilter.Camp == "NumeClient"
                                                    ? comandaFilter.Asc == "asc"
                                                        ? (comandaFilter.Asc = "desc")
                                                        : (comandaFilter.Asc = "asc")
                                                    : (comandaFilter.Asc = "asc");
                                                comandaFilter.Camp = "NumeClient";

                                                setNeedUpdate(!needUpdate);
                                            }}
                                        >
                                            <Button
                                                variant='text'
                                                startIcon={
                                                    comandaFilter.Camp == "NumeClient" ? (
                                                        comandaFilter.Asc == "asc" ? (
                                                            <ArrowDownwardIcon />
                                                        ) : (
                                                            <ArrowUpwardIcon />
                                                        )
                                                    ) : (
                                                        <SortIcon />
                                                    )
                                                }
                                            >
                                                Nume Client
                                            </Button>{" "}
                                        </TableCell>
                                    </Tooltip>
                                    <Tooltip
                                        title={
                                            "Ordonare dupa adresa " +
                                            (comandaFilter.Camp == "Adresa" ? (comandaFilter.Asc == "asc" ? "descendent" : "ascendent") : "ascendent")
                                        }
                                    >
                                        <TableCell
                                            className='head'
                                            onClick={(e) => {
                                                sortareHeader("Adresa");
                                            }}
                                            align='center'
                                            style={{
                                                width: latimiColoane.Adresa,
                                            }}
                                        >
                                            <Button
                                                variant='text'
                                                startIcon={
                                                    comandaFilter.Camp == "Adresa" ? (
                                                        comandaFilter.Asc == "asc" ? (
                                                            <ArrowDownwardIcon />
                                                        ) : (
                                                            <ArrowUpwardIcon />
                                                        )
                                                    ) : (
                                                        <SortIcon />
                                                    )
                                                }
                                            >
                                                Adresa
                                            </Button>
                                        </TableCell>
                                    </Tooltip>
                                    <Tooltip
                                        title={
                                            "Ordonare dupa data " +
                                            (comandaFilter.Camp == "Data" ? (comandaFilter.Asc == "asc" ? "descendent" : "ascendent") : "ascendent")
                                        }
                                    >
                                        <TableCell
                                            className='head'
                                            onClick={(e) => {
                                                sortareHeader("Data");
                                            }}
                                            align='center'
                                            style={{
                                                width: latimiColoane.Data,
                                            }}
                                        >
                                            <Button
                                                variant='text'
                                                startIcon={
                                                    comandaFilter.Camp == "Data" ? (
                                                        comandaFilter.Asc == "asc" ? (
                                                            <ArrowDownwardIcon />
                                                        ) : (
                                                            <ArrowUpwardIcon />
                                                        )
                                                    ) : (
                                                        <SortIcon />
                                                    )
                                                }
                                            >
                                                Data
                                            </Button>
                                        </TableCell>
                                    </Tooltip>
                                    <Tooltip
                                        title={
                                            "Ordonare dupa status " +
                                            (comandaFilter.Camp == "Status" ? (comandaFilter.Asc == "asc" ? "descendent" : "ascendent") : "ascendent")
                                        }
                                    >
                                        <TableCell
                                            className='head'
                                            onClick={(e) => {
                                                sortareHeader("Status");
                                            }}
                                            align='center'
                                            style={{
                                                width: latimiColoane.Status,
                                            }}
                                        >
                                            <Button
                                                variant='text'
                                                startIcon={
                                                    comandaFilter.Camp == "Status" ? (
                                                        comandaFilter.Asc == "asc" ? (
                                                            <ArrowDownwardIcon />
                                                        ) : (
                                                            <ArrowUpwardIcon />
                                                        )
                                                    ) : (
                                                        <SortIcon />
                                                    )
                                                }
                                            >
                                                Status
                                            </Button>
                                        </TableCell>
                                    </Tooltip>
                                    <Tooltip
                                        className='head'
                                        title={
                                            "Ordonare dupa detalii " +
                                            (comandaFilter.Camp == "Detalii" ? (comandaFilter.Asc == "asc" ? "descendent" : "ascendent") : "ascendent")
                                        }
                                    >
                                        <TableCell
                                            onClick={(e) => {
                                                sortareHeader("Detalii");
                                            }}
                                            align='center'
                                            style={{
                                                width: latimiColoane.Detalii,
                                            }}
                                        >
                                            <Button
                                                variant='text'
                                                startIcon={
                                                    comandaFilter.Camp == "Detalii" ? (
                                                        comandaFilter.Asc == "asc" ? (
                                                            <ArrowDownwardIcon />
                                                        ) : (
                                                            <ArrowUpwardIcon />
                                                        )
                                                    ) : (
                                                        <SortIcon />
                                                    )
                                                }
                                            >
                                                Detalii
                                            </Button>
                                        </TableCell>
                                    </Tooltip>
                                </TableRow>
                            </TableHead>
                            {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                                <TableBody>
                                    <TableRow key={row.ComandaId}>
                                        <TableCell align='center'>{rowsClient[row.ClientId].ClientNume}</TableCell>
                                        <TableCell align='center'>{row.Adresa}</TableCell>
                                        <TableCell align='center'>{formatData(row.Data)}</TableCell>
                                        <TableCell align='center'>{traducereStatus(row.Status)}</TableCell>
                                        <TableCell align='center'>{row.Detalii}</TableCell>
                                    </TableRow>

                                    <TableRow>
                                        <TableCell colspan='6'>
                                            <TableContainer component={Paper}>
                                                <Table aria-label='simple table'>
                                                    <TableHead
                                                        style={{
                                                            fontWeight: "bold",
                                                        }}
                                                    >
                                                        <TableRow
                                                            style={{
                                                                color: "#616161",
                                                                fontSize: "medium",
                                                                textTransform: "uppercase",
                                                                backgroundColor: "#f2eceb",
                                                            }}
                                                        >
                                                            <TableCell align='center' colspan={"5"}>
                                                                Listă Produse
                                                            </TableCell>
                                                        </TableRow>
                                                        <TableRow style={stilTableHeadCellLight}>
                                                            <TableCell
                                                                align='center'
                                                                style={{
                                                                    width: latimiColoane.Nume,
                                                                }}
                                                            >
                                                                Nume Produs
                                                            </TableCell>
                                                            <TableCell
                                                                align='center'
                                                                style={{
                                                                    width: latimiColoane.Imagine,
                                                                }}
                                                            >
                                                                Imagine
                                                            </TableCell>
                                                            <TableCell
                                                                align='center'
                                                                style={{
                                                                    width: latimiColoane.Pret,
                                                                }}
                                                            >
                                                                Preț
                                                            </TableCell>
                                                            <TableCell
                                                                align='center'
                                                                style={{
                                                                    width: latimiColoane.Cantitate,
                                                                }}
                                                            >
                                                                Cantitate
                                                            </TableCell>
                                                            <TableCell
                                                                align='center'
                                                                style={{
                                                                    width: latimiColoane.PretTotal,
                                                                }}
                                                            >
                                                                Preț total
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {row.ComandaProduse.map((rowComandaProdus, index) => (
                                                            <TableRow>
                                                                <TableCell align='center'>{rowsProdus[rowComandaProdus.ProdusId].Nume}</TableCell>
                                                                <TableCell align='center'>
                                                                    <a href={`${rowsProdus[rowComandaProdus.ProdusId].Imagine}`}>
                                                                        <img
                                                                            style={{
                                                                                width: "60px",
                                                                                height: "60px",
                                                                            }}
                                                                            srcSet={`${rowsProdus[rowComandaProdus.ProdusId].Imagine}`}
                                                                            alt={rowsProdus[rowComandaProdus.ProdusId].Nume}
                                                                        />
                                                                    </a>
                                                                </TableCell>
                                                                <TableCell align='center'>{rowComandaProdus.Pret}</TableCell>
                                                                <TableCell align='center'>{rowComandaProdus.Cantitate}</TableCell>

                                                                <TableCell align='center'>
                                                                    {(rowComandaProdus.Cantitate * rowComandaProdus.Pret).toFixed(2) + " $"}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                        <TableRow
                                                            style={{
                                                                fontWeight: "bold",
                                                            }}
                                                        >
                                                            <TableCell
                                                                align='center'
                                                                style={{
                                                                    fontWeight: "bold",
                                                                }}
                                                            >
                                                                Total
                                                            </TableCell>
                                                            <TableCell align='center'></TableCell>
                                                            <TableCell align='center'></TableCell>
                                                            <TableCell
                                                                align='center'
                                                                style={{
                                                                    fontWeight: "bold",
                                                                }}
                                                            >
                                                                {totalBucati(row.ComandaProduse).toFixed(0) +
                                                                    (totalBucati(row.ComandaProduse).toFixed(0) > 1 ? " bucăți" : " bucată")}
                                                            </TableCell>

                                                            <TableCell
                                                                align='center'
                                                                style={{
                                                                    fontWeight: "bold",
                                                                }}
                                                            >
                                                                {totalValoare(row.ComandaProduse).toFixed(2) + " $"}
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            ))}
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25, 100]}
                        component='div'
                        labelRowsPerPage='Rânduri pe pagină'
                        count={rows.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Grid>
            </Grid>
        </div>
    );
}
