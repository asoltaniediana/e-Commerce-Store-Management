import { useState, useEffect } from "react";
import * as React from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { get, post, put, remove } from "../Calls";
import {
    Input,
    IconButton,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableRow,
    TableContainer,
    InputLabel,
    Grid,
    TextField,
    TableHead,
} from "@material-ui/core";
import SortIcon from "@material-ui/icons/Sort";
import SearchIcon from "@material-ui/icons/Search";
import AddIcon from "@material-ui/icons/Add";
import TablePagination from "@mui/material/TablePagination";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import Tooltip from "@mui/material/Tooltip";
import { actualizeazaModSortare, createProdusFilterRoute } from "./Functii";
import { stilTabel, stilButon, stilTextField, stilTableHeadCell, stilInformatiiImport, stilTitluPaginaActivitati } from "./ConstanteStil";
import { link, produsRoute } from "../ApiRoutes";
import { useNavigate } from "react-router-dom";
import { numarCaractereNumeProdus } from "./Consts.js";
import FilterListIcon from "@mui/icons-material/FilterList";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import "../App.css";
import { PrimulElementPagina } from "./ConstanteStil";
export default function Produs() {
    const [produsFilter, setProdusFilter] = useState({
        Nume: "",
        Pret: "",
        Camp: "Nume",
        Asc: "asc",
        Descriere: "",
        Categorie: "",
        filtruActiv: false,
    });
    const [optiuni, setOptiuni] = useState({
        filtruVizibil: false,
        importVizibil: false,
        ascundeImport: "Ascunde importul de produse noi",
        afiseazaImport: "Importati produse noi",
        ascundeFiltreaza: "Ascunde filtre produse",
        afiseazaFiltreaza: "Afiseaza filtre produse",
    });
    const [rows, setRows] = useState([]);
    const [camp, setCamp] = useState(["ProdusId", "Nume", "Pret", "Imagine", "Descriere", "Categorie"]);
    const [needUpdate, setNeedUpdate] = useState(false);
    const navigate = useNavigate();
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    useEffect(async () => {
        let data = await get(createProdusFilterRoute(produsFilter));
        setRows(data);
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
    //Verificarea datelor citite din fisierul CSV sau Excel
    async function verificareImport(rowsImportate) {
        let lungimeDescriere = 9999;
        let lungimeNume = 299;
        let adaugare = [];
        let actualizare = [];
        for (let i = 0; i < rowsImportate.length; i++) {
            let gasit = false;
            for (let j = 0; j < rows.length; j++) {
                if (rowsImportate[i].ProdusId == rows[j].ProdusId) {
                    gasit = true;
                    let identic = true;
                    for (let k = 0; k < camp.length; k++) {
                        if (rowsImportate[i][camp[k]] != rows[j][camp[k]]) identic = false;
                    }
                    if (identic == false) {
                        rowsImportate[i]["Descriere"] = rowsImportate[i]["Descriere"].substring(0, lungimeDescriere);
                        rowsImportate[i]["Nume"] = rowsImportate[i]["Nume"].substring(0, lungimeNume);
                        actualizare.push(rowsImportate[i]);
                    }
                }
            }
            if (gasit == false) {
                rowsImportate[i]["Descriere"] = rowsImportate[i]["Descriere"].substring(0, lungimeDescriere);
                rowsImportate[i]["Nume"] = rowsImportate[i]["Nume"].substring(0, lungimeNume);
                adaugare.push(rowsImportate[i]);
            }
        }
        console.log(adaugare);
        console.log(actualizare);
        if (localStorage.Tip == "Manager") {
            for (let i = 0; i < actualizare.length; i++) {
                let p = await put(produsRoute + "/" + localStorage.UtilizatorId, actualizare[i].ProdusId, actualizare[i]);
            }
        }
        for (let i = 0; i < adaugare.length; i++) {
            let a = await post(produsRoute, adaugare[i]);
        }
        document.getElementById("FisierImport").value = "";
        setNeedUpdate(!needUpdate);
    }
    const onChangeProdusFilter = (e) => {
        setProdusFilter({
            ...produsFilter,
            [e.target.name]: e.target.value,
        });
    };
    //Salvarea filtrului pentru produse
    const saveProdusFilter = async () => {
        if (produsFilter.Nume || produsFilter.Pret || produsFilter.Descriere || produsFilter.Categorie) {
            setPage(0);
            setNeedUpdate(!needUpdate);
        } else {
            alert("Va rugam sa completati cel putin un camp pentru filtrare!!");
        }
    };
    //Sortare Produse
    async function sortareHeader(Camp) {
        setPage(0);
        produsFilter.Asc = actualizeazaModSortare(produsFilter, Camp);
        setNeedUpdate(!needUpdate);
    }
    function resetare() {
        produsFilter.Nume = "";
        produsFilter.Pret = "";
        produsFilter.Descriere = "";
        produsFilter.Categorie = "";
        setNeedUpdate(!needUpdate);
    }
    //Citire produse din fisier Excel
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
    //Citire fisier CSV
    function citireCSV(e) {
        const files = e.target.files;
        if (files) {
            let produse = [];
            Papa.parse(files[0], {
                complete: function (rezultate) {
                    let headers = rezultate.data[0];
                    let gasit = 0;
                    if (headers.length != camp.length) {
                        alert("Campurile din fisierul selectat nu sunt valide!");
                        return;
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
                        return;
                    }
                    for (let i = 1; i < rezultate.data.length; i++) {
                        let obj = {};
                        for (let j = 0; j < rezultate.data[i].length; j++) {
                            obj[rezultate.data[0][j]] = rezultate.data[i][j];
                        }
                        produse[i - 1] = obj;
                    }
                    verificareImport(produse);
                },
            });
        }
    }
    function onChangeFisierImport(e) {
        const files = e.target.files;
        const extensie = files[0].name.split(".").pop();
        console.log(extensie);
        if (extensie == "csv") {
            citireCSV(e);
        } else {
            if (extensie == "xlsx") {
                citireExcel(e);
            } else {
                alert("Se pot importa produse doar din fișiere CSV sau XLSX");
            }
        }
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
                            Import produse
                        </Button>
                    </Tooltip>
                </Grid>
                <Grid container xs={12} sm={12} alignItems='center' id='randImport' justifyContent='center' style={{ display: "none" }}>
                    <Grid item xs={12} sm={12} alignItems='center' justifyContent='center'>
                        <InputLabel style={stilInformatiiImport}>
                            {`Pentru a importa un fișier CSV sau XLSX acesta trebuie să conțină următoarele câmpuri: ProdusId, Nume, Pret, Imagine, Descriere, Categorie `}
                        </InputLabel>
                    </Grid>
                    <Grid item xs={12} sm={12} alignItems='center'>
                        <TextField
                            autoFocus
                            margin='dense'
                            id='FisierImport'
                            name='Fisier'
                            label='Fisier import'
                            variant='outlined'
                            fullWidth
                            type='file'
                            style={{
                                marginLeft: "5%",
                                marginRight: "5%",
                                width: "60%",
                                alignContent: "center",
                            }}
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
                </Grid>
            </Grid>
            <Grid container spacing={3} id='randFiltrare' justifyContent='center' alignItems='center' style={{ display: "none" }}>
                <Grid item xs={12} sm={4} alignItems='center' justifyContent='center'>
                    <TextField
                        autoFocus
                        margin='dense'
                        id='NumeFilter'
                        name='Nume'
                        label='Numele să conțină'
                        variant='outlined'
                        style={stilTextField}
                        fullWidth
                        value={produsFilter.Nume}
                        onChange={(e) => onChangeProdusFilter(e)}
                    />
                </Grid>
                <Grid item xs={12} sm={4} alignItems='center' justifyContent='center'>
                    <TextField
                        autoFocus
                        margin='dense'
                        id='PretFilter'
                        name='Pret'
                        label='Preț Minim'
                        type='number'
                        variant='outlined'
                        style={stilTextField}
                        InputLabelProps={{ shrink: true }}
                        value={produsFilter.Pret}
                        onChange={(e) => onChangeProdusFilter(e)}
                    />
                </Grid>
                <Grid item xs={12} sm={4} alignItems='center' justifyContent='center'>
                    <TextField
                        autoFocus
                        margin='dense'
                        id='DescriereFilter'
                        name='Descriere'
                        label='Descrierea să conțină'
                        variant='outlined'
                        fullWidth
                        style={stilTextField}
                        value={produsFilter.Descriere}
                        onChange={(e) => onChangeProdusFilter(e)}
                    />
                </Grid>
                <Grid item xs={12} sm={4} alignItems='center' justifyContent='center' style={{ marginLeft: "5px", marginRight: "-5px" }}>
                    <TextField
                        autoFocus
                        margin='dense'
                        id='CategorieFilter'
                        name='Categorie'
                        label='Categoria să conțină'
                        variant='outlined'
                        style={stilTextField}
                        fullWidth
                        value={produsFilter.Categorie}
                        onChange={(e) => onChangeProdusFilter(e)}
                    />
                </Grid>
                <Grid item xs={12} sm={2} alignItems='center' justifyContent='center'>
                    <Button variant='outlined' style={stilButon} size='large' startIcon={<SearchIcon />} onClick={saveProdusFilter}>
                        Filtrare
                    </Button>
                </Grid>
                <Grid item xs={12} sm={3} alignItems='center' justifyContent='center'>
                    <Button variant='outlined' style={stilButon} size='large' startIcon={<RestartAltIcon />} onClick={resetare}>
                        Resetare filtre
                    </Button>
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12} sm={12} alignItems='center' justifyContent='center'>
                    <TableContainer component={Paper} style={stilTabel}>
                        <Table aria-label='simple table'>
                            <TableHead>
                                <TableRow>
                                    <TableCell align='center' className='TableHeadCell' style={stilTableHeadCell}>
                                        Imagine
                                    </TableCell>
                                    <Tooltip
                                        title={
                                            "Ordonare dupa nume " +
                                            (produsFilter.Camp == "Nume" ? (produsFilter.Asc == "asc" ? "descendent" : "ascendent") : "ascendent")
                                        }
                                    >
                                        <TableCell
                                            style={stilTableHeadCell}
                                            onClick={(e) => {
                                                sortareHeader("Nume");
                                            }}
                                            align='center'
                                        >
                                            <Button
                                                variant='text'
                                                style={stilTableHeadCell}
                                                startIcon={
                                                    produsFilter.Camp == "Nume" ? (
                                                        produsFilter.Asc == "asc" ? (
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
                                            "Ordonare dupa preț " +
                                            (produsFilter.Camp == "Pret" ? (produsFilter.Asc == "asc" ? "descendent" : "ascendent") : "ascendent")
                                        }
                                    >
                                        <TableCell
                                            style={stilTableHeadCell}
                                            onClick={(e) => {
                                                sortareHeader("Pret");
                                            }}
                                            align='center'
                                        >
                                            <Button
                                                variant='text'
                                                style={stilTableHeadCell}
                                                startIcon={
                                                    produsFilter.Camp == "Pret" ? (
                                                        produsFilter.Asc == "asc" ? (
                                                            <ArrowDownwardIcon />
                                                        ) : (
                                                            <ArrowUpwardIcon />
                                                        )
                                                    ) : (
                                                        <SortIcon />
                                                    )
                                                }
                                            >
                                                Preț
                                            </Button>
                                        </TableCell>
                                    </Tooltip>
                                    <Tooltip
                                        title={
                                            "Ordonare dupa descriere " +
                                            (produsFilter.Camp == "Descriere" ? (produsFilter.Asc == "asc" ? "descendent" : "ascendent") : "ascendent")
                                        }
                                    >
                                        <TableCell
                                            style={stilTableHeadCell}
                                            onClick={(e) => {
                                                sortareHeader("Descriere");
                                            }}
                                            align='center'
                                        >
                                            <Button
                                                variant='text'
                                                style={stilTableHeadCell}
                                                startIcon={
                                                    produsFilter.Camp == "Descriere" ? (
                                                        produsFilter.Asc == "asc" ? (
                                                            <ArrowDownwardIcon />
                                                        ) : (
                                                            <ArrowUpwardIcon />
                                                        )
                                                    ) : (
                                                        <SortIcon />
                                                    )
                                                }
                                            >
                                                Descriere
                                            </Button>
                                        </TableCell>
                                    </Tooltip>
                                    <Tooltip
                                        title={
                                            "Ordonare dupa categorie " +
                                            (produsFilter.Camp == "Categorie" ? (produsFilter.Asc == "asc" ? "descendent" : "ascendent") : "ascendent")
                                        }
                                    >
                                        <TableCell
                                            style={stilTableHeadCell}
                                            onClick={(e) => {
                                                sortareHeader("Categorie");
                                            }}
                                            align='center'
                                        >
                                            <Button
                                                variant='text'
                                                style={stilTableHeadCell}
                                                startIcon={
                                                    produsFilter.Camp == "Categorie" ? (
                                                        produsFilter.Asc == "asc" ? (
                                                            <ArrowDownwardIcon />
                                                        ) : (
                                                            <ArrowUpwardIcon />
                                                        )
                                                    ) : (
                                                        <SortIcon />
                                                    )
                                                }
                                            >
                                                Categorie
                                            </Button>
                                        </TableCell>
                                    </Tooltip>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                                    <TableRow key={row.ProdusId}>
                                        <TableCell align='center'>
                                            <a href={`${row.Imagine}`}>
                                                <img
                                                    style={{
                                                        width: "60px",
                                                        height: "60px",
                                                    }}
                                                    srcSet={`${row.Imagine}`}
                                                    alt={row.Nume}
                                                />
                                            </a>
                                        </TableCell>
                                        <TableCell align='center'>{row.Nume}</TableCell>
                                        <TableCell align='center'>{row.Pret}</TableCell>
                                        <TableCell align='center'>{row.Descriere}</TableCell>
                                        <TableCell align='center'>{row.Categorie}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25, 100]}
                        component='div'
                        count={rows.length}
                        labelRowsPerPage='Rânduri pe pagină'
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
