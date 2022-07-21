import { useState, useEffect } from "react";
import * as React from "react";
import { get, post, put, remove } from "../Calls";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Button, Table, TableBody, TableCell, TableRow, TableContainer, InputLabel, Select, Grid, TextField, TableHead } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import { numarCaractere } from "./Consts";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import IconButton from "@mui/material/IconButton";
import SortIcon from "@material-ui/icons/Sort";
import SearchIcon from "@material-ui/icons/Search";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import TablePagination from "@mui/material/TablePagination";
import CheckIcon from "@mui/icons-material/Check";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { link, clientRoute } from "../ApiRoutes";
import { useNavigate } from "react-router-dom";
import FilterListIcon from "@mui/icons-material/FilterList";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import "../App.css";
import { eroareClientNume, verificareFormatTelefon, verificareFormatEmail, createClientFilterRoute, actualizeazaModSortare } from "./Functii";
import { PrimulElementPagina, stilTabel, stilTableHeadCell, stilButon, stilTextField, stilInformatiiImport, stilEditIcon, stilSelect } from "./ConstanteStil";
export default function Client() {
    const [clientEdit, setClientEdit] = useState({
        ClientId: "",
        ClientNume: "",
        Email: "",
        TipClient: "Basic",
        TipPersoana: "Persoana Fizica",
        Telefon: "",
    });
    const [clientAdd, setClientAdd] = useState({
        ClientNume: "",
        Email: "",
        Telefon: "",
    });
    const [clientFilter, setClientFilter] = useState({
        ClientNume: "",
        Email: "",
        Telefon: "",
        TipClient: "",
        TipPersoana: "",
        SchimbaTip: false,
        Camp: "ClientNume",
        Asc: "asc",
    });
    const [camp, setCamp] = useState(["ClientId", "ClientNume", "Telefon", "Email", "TipPersoana", "TipClient"]);
    const [optiuni, setOptiuni] = useState({
        filtruVizibil: false,
        importVizibil: false,
        ascundeImport: "Ascunde importul de clienti noi",
        afiseazaImport: "Importati clienti noi",
        ascundeFiltreaza: "Ascunde filtre clienti",
        afiseazaFiltreaza: "Afiseaza filtre clienti",
    });
    const [randEditare, setRandEditare] = useState({
        randInCursDeModificare: -1,
        editare: false,
    });

    const [rows, setRows] = useState([]);
    const [needUpdate, setNeedUpdate] = useState(false);
    const navigate = useNavigate();
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const textFieldIds = ["textFieldClientNume", "textFieldEmail", "textFieldTelefon", "textFieldTipClient", "textFieldTipPersoana", "CheckIcon"];
    const cellIds = ["cellClientNume", "cellEmail", "cellTelefon", "cellTipClient", "cellTipPersoana"];
    const filterIds = ["ClientNumeFilter", "EmailFilter", "TelefonFilter", "TipClientFilter", "TipPersoanaFilter", "butoaneClientFilter"];
    useEffect(async () => {
        if (clientFilter.SchimbaTip == true) {
            clientFilter.SchimbaTip = false;
        } else {
            if (randEditare.editare) {
                randEditare.editare = false;
            } else {
                let data = await get(createClientFilterRoute(clientFilter));
                setRows(data);
            }
        }
    }, [needUpdate]);
    //schimbare pagina din tabel
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };
    //schimbare numar de randuri per pagina din tabel
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };
    //stergere client din tabel si baza de date
    const deleteClient = async (client, index) => {
        if (client.Comenzi.length != 0) {
            alert(`Nu puteti sterge clientul ${client.ClientNume} deoarece acesta a plasat comenzi`);
        } else {
            await remove(clientRoute, client.ClientId);
            clientEdit.ClientNume = "";
            clientEdit.Telefon = "";
            clientEdit.Email = "";
            clientFilter.filtruActiv = false;
            rows.splice(index, 1);
            setRows(rows);
            setNeedUpdate(!needUpdate);
        }
    };
    //schimbare campuri adaugare client
    const onChangeClientAdd = (e) => {
        setClientAdd({
            ...clientAdd,
            [e.target.name]: e.target.value,
        });
    };
    //schimbare campuri filtrare client
    const onChangeClientFilter = (e) => {
        setClientFilter({
            ...clientFilter,
            [e.target.name]: e.target.value,
        });
    };
    //schimbare campuri editare client
    const onChangeClientEdit = (e, ClientId) => {
        setClientEdit({
            ...clientEdit,
            [e.target.name]: e.target.value,
        });
    };
    //salvare valori noi pentru clientul editat
    const saveClientEdit = async () => {
        if (clientEdit.ClientNume && clientEdit.Email && clientEdit.Telefon) {
            if (clientEdit.ClientNume.length >= numarCaractere.Client.ClientNume) {
                clientFilter.filtruActiv = false;
                let c = await put(clientRoute + "/" + localStorage.UtilizatorId, clientEdit.ClientId, clientEdit);
                if (c.message) {
                    alert(c.message);
                } else {
                    clientEdit.ClientId = "";
                    clientEdit.ClientNume = "";
                    clientEdit.Email = "";
                    clientEdit.Telefon = "";
                    setNeedUpdate(!needUpdate);
                }
            } else {
                alert(`Nume trebuie sa aiba cel putin ${numarCaractere.Client.ClientNume} caractere`);
            }
        } else {
            alert("Va rugam sa completati toate campurile!!");
        }
    };
    //salvare valori noi pentru filtre si populare tabela cu valori filtrate
    const saveClientFilter = async () => {
        if (
            clientFilter.ClientNume != "" ||
            clientFilter.Telefon != "" ||
            clientFilter.Email != "" ||
            clientFilter.TipClient != "" ||
            clientFilter.TipPersoana != ""
        ) {
            setNeedUpdate(!needUpdate);
        } else {
            alert("Va rugam sa completati cel putin un camp pentru filtrare!!");
        }
    };
    async function verificareImport(rowsImportate) {
        let adaugare = [];
        let actualizare = [];
        for (let i = 0; i < rowsImportate.length; i++) {
            let gasit = false;
            for (let j = 0; j < rows.length; j++) {
                if (rowsImportate[i].ClientId == rows[j].ClientId) {
                    gasit = true;
                    let identic = true;
                    for (let k = 0; k < camp.length; k++) {
                        if (rowsImportate[i][camp[k]] != rows[j][camp[k]]) identic = false;
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
        if (localStorage.Tip == "Manager") {
            for (let i = 0; i < actualizare.length; i++) {
                let c = await put(clientRoute + "/" + localStorage.UtilizatorId, actualizare[i].ClientId, actualizare[i]);
            }
        }
        for (let i = 0; i < adaugare.length; i++) {
            let a = await post(clientRoute, adaugare[i]);
        }
        document.getElementById("FisierImport").value = "";
        setNeedUpdate(!needUpdate);
    }
    function citireExcel(e) {
        const [file] = e.target.files;
        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, {
                type: "binary",
            });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws);
            verificareImport(data);
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
                    if (headers.length != camp.length) {
                        alert("Campurile din fisierul selectat nu sunt valide!");
                    }
                    for (let i = 0; i < headers.length; i++) {
                        for (let j = 0; j < camp.length; j++) {
                            if (headers[i] == camp[j]) {
                                gasit++;
                                j = camp.length + 3;
                            }
                        }
                    }
                    if (gasit != camp.length) {
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
    //clientFilter.date
    async function sortareHeader(Camp) {
        clientFilter.Asc = actualizeazaModSortare(clientFilter, Camp);
        clientFilter.Camp = Camp;
        setNeedUpdate(!needUpdate);
    }
    //resetare filtre si datele nefiltrate
    function resetare() {
        clientFilter.ClientNume = "";
        clientFilter.Email = "";
        clientFilter.Telefon = "";
        clientFilter.TipClient = ``;
        clientFilter.TipPersoana = ``;
        setNeedUpdate(!needUpdate);
    }
    return (
        <div>
            <Grid container spacing={3} style={PrimulElementPagina}>
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
                            Import clienți
                        </Button>
                    </Tooltip>
                </Grid>
                <Grid container xs={12} sm={12} alignItems='center' id='randImport' justifyContent='center' style={{ display: "none" }}>
                    <Grid item xs={12} sm={12} alignItems='center' justifyContent='center'>
                        <InputLabel style={stilInformatiiImport}>
                            {`Pentru a importa un fișier CSV sau XLSX acesta trebuie să conțină următoarele câmpuri: ClientId, ClientNume, Telefon, Email, TipPersoana, TipClient`}
                        </InputLabel>
                    </Grid>
                    <Grid item xs={11} sm={3} alignItems='center' justifyContent='center'>
                        <TextField
                            autoFocus
                            margin='dense'
                            id='FisierImport'
                            name='Nume'
                            label='Fișier import'
                            variant='outlined'
                            fullWidth
                            type='file'
                            style={stilTextField}
                            InputLabelProps={{ shrink: true }}
                            onChange={(e) => onChangeFisierImport(e)}
                        />
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
                                    for (let i = 0; i < filterIds.length; i++) {
                                        let textField = document.getElementById(filterIds[i]);
                                        textField.style.display = "none";
                                    }
                                    optiuni.filtruVizibil = false;
                                } else {
                                    for (let i = 0; i < filterIds.length; i++) {
                                        let textField = document.getElementById(filterIds[i]);
                                        textField.style.display = "flex";
                                    }
                                    optiuni.filtruVizibil = true;
                                }
                                setNeedUpdate(!needUpdate);
                            }}
                        >
                            Filtrare
                        </Button>
                    </Tooltip>
                </Grid>
                <Grid item xs={12} sm={4} id='ClientNumeFilter' style={{ display: "none" }}>
                    <TextField
                        autoFocus
                        margin='dense'
                        variant='outlined'
                        name='ClientNume'
                        label='Numele să conțină'
                        fullWidth
                        style={stilTextField}
                        value={clientFilter.ClientNume}
                        onChange={(e) => onChangeClientFilter(e)}
                    />
                </Grid>
                <Grid item xs={12} sm={4} id='EmailFilter' style={{ display: "none" }}>
                    <TextField
                        autoFocus
                        margin='dense'
                        name='Email'
                        variant='outlined'
                        label='Email-ul să conțină'
                        fullWidth
                        style={stilTextField}
                        value={clientFilter.Email}
                        onChange={(e) => onChangeClientFilter(e)}
                    />
                </Grid>
                <Grid item xs={12} sm={4} id='TelefonFilter' style={{ display: "none" }}>
                    <TextField
                        autoFocus
                        margin='dense'
                        name='Telefon'
                        variant='outlined'
                        label='Telefonul să conțină'
                        fullWidth
                        style={stilTextField}
                        value={clientFilter.Telefon}
                        onChange={(e) => onChangeClientFilter(e)}
                    />
                </Grid>
                <Grid container alignItems='center' justifyContent='center'>
                    <Grid item xs={11} sm={4} alignItems='center' justifyContent='center' id='TipClientFilter' style={{ display: "none" }}>
                        <InputLabel id='TipClientLabel' fullWidth>
                            Tip Client
                        </InputLabel>
                        <Select
                            labelId='TipClientLabel'
                            value={clientFilter.TipClient}
                            fullWidth
                            variant='outlined'
                            style={stilSelect}
                            onChange={(event) => {
                                clientFilter.TipClient = event.target.value;
                                clientFilter.SchimbaTip = true;
                                setNeedUpdate(!needUpdate);
                            }}
                        >
                            <MenuItem value={"Basic"}>Basic</MenuItem>
                            <MenuItem value={"Silver"}>Silver</MenuItem>
                            <MenuItem value={"Gold"}>Gold</MenuItem>
                            <MenuItem value={"Premium"}>Premium</MenuItem>
                            <MenuItem value={``}>-</MenuItem>
                        </Select>
                    </Grid>
                    <Grid item xs={11} sm={4} alignItems='center' justifyContent='center' id='TipPersoanaFilter' style={{ display: "none" }}>
                        <InputLabel id='TipPersoanaLabel'>Tip Persoană</InputLabel>
                        <Select
                            labelId='TipPersoanaLabel'
                            value={clientFilter.TipPersoana}
                            fullWidth
                            variant='outlined'
                            style={stilSelect}
                            onChange={(event) => {
                                clientFilter.TipPersoana = event.target.value;
                                clientFilter.SchimbaTip = true;
                                setNeedUpdate(!needUpdate);
                            }}
                        >
                            <MenuItem value={"Persoana Fizica"}>Persoană Fizică</MenuItem>
                            <MenuItem value={"Persoana Juridica"}>Persoană Juridică</MenuItem>
                            <MenuItem value={``}>-</MenuItem>
                        </Select>
                    </Grid>
                </Grid>
                <Grid item xs={12} alignItems='center' justifyContent='center' id='butoaneClientFilter' style={{ display: "none" }}>
                    <Button style={stilButon} variant='outlined' startIcon={<SearchIcon />} onClick={saveClientFilter}>
                        Filtrare
                    </Button>

                    <Button style={stilButon} variant='outlined' startIcon={<RestartAltIcon />} onClick={resetare}>
                        Resetare filtre
                    </Button>
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12} sm={12} alignItems='center' justifyContent='center'>
                    <TableContainer mx={{ maxHeight: 200 }} style={stilTabel}>
                        <Table aria-label='sticky table'>
                            <TableHead className='TableHead'>
                                <TableRow>
                                    <Tooltip
                                        title={
                                            "Ordonare după nume " +
                                            (clientFilter.Camp == "ClientNume" ? (clientFilter.Asc == "asc" ? "descendent" : "ascendent") : "ascendent")
                                        }
                                    >
                                        <TableCell
                                            onClick={(e) => {
                                                sortareHeader("ClientNume");
                                            }}
                                            align='center'
                                            style={stilTableHeadCell}
                                        >
                                            <Button
                                                variant='text'
                                                style={stilTableHeadCell}
                                                startIcon={
                                                    clientFilter.Camp == "ClientNume" ? (
                                                        clientFilter.Asc == "asc" ? (
                                                            <ArrowDownwardIcon />
                                                        ) : (
                                                            <ArrowUpwardIcon />
                                                        )
                                                    ) : (
                                                        <SortIcon />
                                                    )
                                                }
                                            >
                                                Nume
                                            </Button>
                                        </TableCell>
                                    </Tooltip>
                                    <Tooltip
                                        title={
                                            "Ordonare după email " +
                                            (clientFilter.Camp == "Email" ? (clientFilter.Asc == "asc" ? "descendent" : "ascendent") : "ascendent")
                                        }
                                    >
                                        <TableCell
                                            onClick={(e) => {
                                                sortareHeader("Email");
                                            }}
                                            align='center'
                                            style={stilTableHeadCell}
                                        >
                                            <Button
                                                variant='text'
                                                style={stilTableHeadCell}
                                                startIcon={
                                                    clientFilter.Camp == "Email" ? (
                                                        clientFilter.Asc == "asc" ? (
                                                            <ArrowDownwardIcon />
                                                        ) : (
                                                            <ArrowUpwardIcon />
                                                        )
                                                    ) : (
                                                        <SortIcon />
                                                    )
                                                }
                                            >
                                                Email reprezentant
                                            </Button>
                                        </TableCell>
                                    </Tooltip>
                                    <Tooltip
                                        title={
                                            "Ordonare după telefon " +
                                            (clientFilter.Camp == "Telefon" ? (clientFilter.Asc == "asc" ? "descendent" : "ascendent") : "ascendent")
                                        }
                                    >
                                        <TableCell
                                            onClick={(e) => {
                                                sortareHeader("Telefon");
                                            }}
                                            align='center'
                                            style={stilTableHeadCell}
                                        >
                                            <Button
                                                variant='text'
                                                style={stilTableHeadCell}
                                                startIcon={
                                                    clientFilter.Camp == "Telefon" ? (
                                                        clientFilter.Asc == "asc" ? (
                                                            <ArrowDownwardIcon />
                                                        ) : (
                                                            <ArrowUpwardIcon />
                                                        )
                                                    ) : (
                                                        <SortIcon />
                                                    )
                                                }
                                            >
                                                Telefon reprezentant
                                            </Button>
                                        </TableCell>
                                    </Tooltip>

                                    <Tooltip
                                        title={
                                            "Ordonare după tip persoana " +
                                            (clientFilter.Camp == "TipPersoana" ? (clientFilter.Asc == "asc" ? "descendent" : "ascendent") : "ascendent")
                                        }
                                    >
                                        <TableCell
                                            onClick={(e) => {
                                                sortareHeader("TipPersoana");
                                            }}
                                            align='center'
                                            style={stilTableHeadCell}
                                        >
                                            <Button
                                                variant='text'
                                                style={stilTableHeadCell}
                                                startIcon={
                                                    clientFilter.Camp == "TipPersoana" ? (
                                                        clientFilter.Asc == "asc" ? (
                                                            <ArrowDownwardIcon />
                                                        ) : (
                                                            <ArrowUpwardIcon />
                                                        )
                                                    ) : (
                                                        <SortIcon />
                                                    )
                                                }
                                            >
                                                Tip Persoană
                                            </Button>
                                        </TableCell>
                                    </Tooltip>
                                    <Tooltip
                                        title={
                                            "Ordonare dupa tip client " +
                                            (clientFilter.Camp == "TipClient" ? (clientFilter.Asc == "asc" ? "descendent" : "ascendent") : "ascendent")
                                        }
                                    >
                                        <TableCell
                                            onClick={(e) => {
                                                sortareHeader("TipClient");
                                            }}
                                            align='center'
                                            style={stilTableHeadCell}
                                        >
                                            <Button
                                                variant='text'
                                                style={stilTableHeadCell}
                                                startIcon={
                                                    clientFilter.Camp == "TipClient" ? (
                                                        clientFilter.Asc == "asc" ? (
                                                            <ArrowDownwardIcon />
                                                        ) : (
                                                            <ArrowUpwardIcon />
                                                        )
                                                    ) : (
                                                        <SortIcon />
                                                    )
                                                }
                                            >
                                                Tip Client
                                            </Button>
                                        </TableCell>
                                    </Tooltip>
                                    <Tooltip
                                        title={
                                            "Ordonare dupa numărul de comenzi " +
                                            (clientFilter.Camp == "NumarComenzi" ? (clientFilter.Asc == "asc" ? "descendent" : "ascendent") : "ascendent")
                                        }
                                    >
                                        <TableCell
                                            align='center'
                                            style={stilTableHeadCell}
                                            onClick={() => {
                                                if (clientFilter.Camp == "NumarComenzi") {
                                                    clientFilter.Asc = clientFilter.Asc == "asc" ? "desc" : "asc";
                                                } else {
                                                    clientFilter.Asc = "asc";
                                                    clientFilter.Camp = "NumarComenzi";
                                                }
                                                setNeedUpdate(!needUpdate);
                                            }}
                                        >
                                            <Button
                                                variant='text'
                                                style={stilTableHeadCell}
                                                startIcon={
                                                    clientFilter.Camp == "NumarComenzi" ? (
                                                        clientFilter.Asc == "asc" ? (
                                                            <ArrowDownwardIcon />
                                                        ) : (
                                                            <ArrowUpwardIcon />
                                                        )
                                                    ) : (
                                                        <SortIcon />
                                                    )
                                                }
                                            >
                                                Număr Comenzi
                                            </Button>
                                        </TableCell>
                                    </Tooltip>
                                    {localStorage.Tip == "Manager" ? (
                                        <TableCell align='center' style={stilTableHeadCell}>
                                            Editare
                                        </TableCell>
                                    ) : (
                                        <TableCell style={{ display: "none" }}></TableCell>
                                    )}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                                    <TableRow key={row.ClientId}>
                                        <TableCell align='center' id={"cellClientNume" + row.ClientId}>
                                            {row.ClientNume}
                                        </TableCell>
                                        <TableCell align='center' id={"textFieldClientNume" + row.ClientId} style={{ display: "none" }}>
                                            <TextField
                                                autoFocus
                                                variant='outlined'
                                                name='ClientNume'
                                                value={clientEdit.ClientNume}
                                                error={eroareClientNume(clientEdit.ClientNume) == " " ? false : true}
                                                helperText={eroareClientNume(clientEdit.ClientNume)}
                                                onChange={(e) => onChangeClientEdit(e)}
                                            />
                                        </TableCell>
                                        <TableCell align='center' id={"cellEmail" + row.ClientId}>
                                            {row.Email}
                                        </TableCell>
                                        <TableCell align='center' id={"textFieldEmail" + row.ClientId} style={{ display: "none" }}>
                                            <TextField
                                                autoFocus
                                                variant='outlined'
                                                helperText={verificareFormatEmail(clientEdit.Email)}
                                                name='Email'
                                                error={verificareFormatEmail(clientEdit.Email) == " " ? false : true}
                                                value={clientEdit.Email}
                                                onChange={(e) => onChangeClientEdit(e)}
                                            />
                                        </TableCell>
                                        <TableCell align='center' id={"cellTelefon" + row.ClientId}>
                                            {row.Telefon}
                                        </TableCell>
                                        <TableCell align='center' id={"textFieldTelefon" + row.ClientId} style={{ display: "none" }}>
                                            <TextField
                                                autoFocus
                                                variant='outlined'
                                                name='Telefon'
                                                helperText={verificareFormatTelefon(clientEdit.Telefon)}
                                                error={verificareFormatTelefon(clientEdit.Telefon) == " " ? false : true}
                                                value={clientEdit.Telefon}
                                                onChange={(e) => onChangeClientEdit(e)}
                                            />
                                        </TableCell>
                                        <TableCell align='center' id={"cellTipPersoana" + row.ClientId}>
                                            {row.TipPersoana}
                                        </TableCell>
                                        <TableCell id={"textFieldTipPersoana" + row.ClientId} style={{ display: "none" }}>
                                            <Select
                                                labelId='selectLabelEdit'
                                                fullWidth
                                                value={clientEdit.TipPersoana}
                                                defaultValue={"Persoana Fizica"}
                                                label='Tip Persoană'
                                                onChange={(event) => {
                                                    clientEdit.TipPersoana = event.target.value;
                                                    clientFilter.SchimbaTip = true;
                                                    setNeedUpdate(!needUpdate);
                                                }}
                                            >
                                                <MenuItem value={"Persoana Fizica"}>Persoană Fizică</MenuItem>
                                                <MenuItem value={"Persoana Juridica"}>Persoană Juridică</MenuItem>
                                            </Select>
                                        </TableCell>
                                        <TableCell align='center' id={"cellTipClient" + row.ClientId}>
                                            {row.TipClient}
                                        </TableCell>
                                        <TableCell id={"textFieldTipClient" + row.ClientId} style={{ display: "none" }}>
                                            <Select
                                                labelId='selectLabelEdit'
                                                fullWidth
                                                value={clientEdit.TipClient}
                                                defaultValue='Basic'
                                                label='Tip Client'
                                                onChange={(event) => {
                                                    clientEdit.TipClient = event.target.value;
                                                    clientFilter.SchimbaTip = true;
                                                    setNeedUpdate(!needUpdate);
                                                }}
                                            >
                                                <MenuItem value={"Basic"}>Basic</MenuItem>
                                                <MenuItem value={"Silver"}>Silver</MenuItem>
                                                <MenuItem value={"Gold"}>Gold</MenuItem>
                                                <MenuItem value={"Premium"}>Premium</MenuItem>
                                            </Select>
                                        </TableCell>
                                        <TableCell align='center'>{row.Comenzi.length}</TableCell>
                                        {localStorage.Tip == "Manager" ? (
                                            <TableCell align='center'>
                                                <IconButton>
                                                    <Tooltip title='Salvează modificări'>
                                                        <CheckIcon
                                                            className='CheckIcon'
                                                            id={"CheckIcon" + row.ClientId}
                                                            style={{
                                                                display: "none",
                                                                color: "#81C784",
                                                            }}
                                                            onClick={() => {
                                                                saveClientEdit();
                                                                for (let i = 0; i < textFieldIds.length; i++) {
                                                                    let textField = document.getElementById(textFieldIds[i] + row.ClientId);
                                                                    textField.style.display = "none";
                                                                }
                                                                for (let i = 0; i < cellIds.length; i++) {
                                                                    let cell = document.getElementById(cellIds[i] + row.ClientId);
                                                                    cell.style.display = "table-cell";
                                                                }
                                                                randEditare.randInCursDeModificare = -1;
                                                                setNeedUpdate(!needUpdate);
                                                            }}
                                                        />
                                                    </Tooltip>
                                                </IconButton>
                                                <Tooltip title={`Editează clientul ${row.ClientNume}`}>
                                                    <IconButton
                                                        onClick={() => {
                                                            if (randEditare.randInCursDeModificare != -1) {
                                                                for (let i = 0; i < textFieldIds.length; i++) {
                                                                    let textField = document.getElementById(
                                                                        textFieldIds[i] + randEditare.randInCursDeModificare
                                                                    );
                                                                    textField.style.display = "none";
                                                                }
                                                                for (let i = 0; i < cellIds.length; i++) {
                                                                    let cell = document.getElementById(cellIds[i] + randEditare.randInCursDeModificare);
                                                                    cell.style.display = "table-cell";
                                                                }
                                                            }
                                                            clientEdit.ClientId = row.ClientId;
                                                            clientEdit.ClientNume = row.ClientNume;
                                                            clientEdit.Email = row.Email;
                                                            clientEdit.Telefon = row.Telefon;
                                                            clientEdit.TipPersoana = row.TipPersoana;
                                                            clientEdit.TipClient = row.TipClient;
                                                            randEditare.randInCursDeModificare = row.ClientId;
                                                            for (let i = 0; i < textFieldIds.length - 1; i++) {
                                                                let textField = document.getElementById(textFieldIds[i] + randEditare.randInCursDeModificare);
                                                                textField.style.display = "table-cell";
                                                            }
                                                            for (let i = 0; i < cellIds.length; i++) {
                                                                let cell = document.getElementById(cellIds[i] + randEditare.randInCursDeModificare);
                                                                cell.style.display = "none";
                                                            }
                                                            let checkIcon = document.getElementById("CheckIcon" + row.ClientId);
                                                            checkIcon.style.display = "initial";
                                                            randEditare.editare = true;
                                                            setNeedUpdate(!needUpdate);
                                                        }}
                                                    >
                                                        <EditIcon style={stilEditIcon} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title={`Șterge clientul ${row.ClientNume}`}>
                                                    <IconButton onClick={() => deleteClient(row, index)}>
                                                        <DeleteIcon color='secondary' />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        ) : (
                                            <TableCell style={{ display: "none" }}></TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
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
