//Adaugarea de activitati unui anumit angajat
//Activitatile adaugate de catre manager tuturor angajatilor
import { useState, useEffect } from "react";
import * as React from "react";
import { get, put } from "../Calls";
import { Button, Paper, Table, TableBody, TableCell, TableRow, TableContainer, Select, Grid, TextField, TableHead } from "@material-ui/core";
import {
    PrimulElementPagina,
    stilTitluPaginaActivitati,
    stilTabel,
    stilButon,
    stilCheckIcon,
    stilContainer,
    stilTableHeadCell,
    stilNotificariIcon,
} from "./ConstanteStil";

import SortIcon from "@material-ui/icons/Sort";
import SearchIcon from "@material-ui/icons/Search";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import MenuItem from "@mui/material/MenuItem";
import TablePagination from "@mui/material/TablePagination";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { link } from "../ApiRoutes";
import { useNavigate } from "react-router-dom";
import FilterListIcon from "@mui/icons-material/FilterList";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import CheckIcon from "@mui/icons-material/Check";
import InputLabel from "@mui/material/InputLabel";
import { styleStareActivitate, createActivitateFilterRoute, actualizeazaModSortare } from "./Functii";
import { formatData } from "./Functii";
import "../App.css";

export default function Activitati() {
    const [activitateFilter, setActivitateFilter] = useState({
        Nume: "",
        Detalii: "",
        DataMaxima: "",
        DataMinima: "",
        Stare: "",
        UtilizatorId: localStorage.UtilizatorId,
        Camp: "",
        Asc: "",
    });
    const [sortare, setSortare] = useState({
        Camp: "Nume",
        Asc: "asc",
    });
    const [optiuni, setOptiuni] = useState({
        filtruVizibil: false,
        ascundeFiltreaza: "Ascunde filtre activitati",
        afiseazaFiltreaza: "Afiseaza filtre activitati",
        angajat: false,
        schimbareStareFiltru: false,
        informatiiAngajat: {},
    });

    const [rows, setRows] = useState([]);
    const [rowsNotificare, setRowsNotificare] = useState([]);
    const [needUpdate, setNeedUpdate] = useState(false);
    const navigate = useNavigate();
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const textFieldIds = ["textFieldNume", "textFieldDetalii", "textFieldDataLimita", "CheckIcon"];
    const cellIds = ["cellNume", "cellDetalii", "cellDataLimita"];
    const filterIds = ["NumeFilter", "DetaliiFilter", "DataLimitaFilter", "StareFilter", "saveActivitateFilter", "resetareFilter"];
    useEffect(async () => {
        {
            if (optiuni.schimbareStareFiltru) {
                optiuni.schimbareStareFiltru = false;
            } else {
                let data = await get(createActivitateFilterRoute(activitateFilter));
                setRows(data);
                let n = await get(link + "Notificari/" + localStorage.UtilizatorId);
                setRowsNotificare(n);
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
    const onChangeActivitateFilter = (e) => {
        setActivitateFilter({
            ...activitateFilter,
            [e.target.name]: e.target.value,
        });
    };
    const saveActivitateFilter = async () => {
        if (activitateFilter.Nume || activitateFilter.Detalii || activitateFilter.Stare || activitateFilter.DataMaxima || activitateFilter.DataMinima) {
            setNeedUpdate(!needUpdate);
        } else {
            alert("Va rugam sa completati cel putin un camp pentru filtrare!!");
        }
    };
    //sortare date
    async function sortareHeader(Camp) {
        activitateFilter.Asc = actualizeazaModSortare(activitateFilter, Camp);
        setNeedUpdate(!needUpdate);
    }
    const handleChangeFilter = (event) => {
        activitateFilter.Stare = event.target.value;
        optiuni.schimbareStareFiltru = true;
        setNeedUpdate(!needUpdate);
    };
    function resetare() {
        activitateFilter.Nume = "";
        activitateFilter.Detalii = "";
        activitateFilter.DataLimita = "";
        activitateFilter.Stare = "";
        activitateFilter.DataMinima = "";
        activitateFilter.DataMaxima = "";
        setNeedUpdate(!needUpdate);
    }
    async function finalizeazaActivitate(ActivitateId) {
        ///stareActivitate/:UtilizatorId/:ActivitateId
        let activitate = await put(link + "stareActivitate/" + localStorage.UtilizatorId, ActivitateId);
        activitateFilter.Nume = "";
        activitateFilter.Stare = "";
        activitateFilter.Detalii = "";
        activitateFilter.DataMinima = "";
        activitateFilter.DataMaxima = "";
        setNeedUpdate(!needUpdate);
    }
    async function actualizeazaNotificari() {
        ///stareActivitate/:UtilizatorId/:ActivitateId
        let activitate = await put(link + "Notificari", localStorage.UtilizatorId);
        setNeedUpdate(!needUpdate);
    }
    return (
        <div>
            <Grid container spacing={3} style={PrimulElementPagina}>
                <Grid item xs={12} sm={12} alignItems='left' justifyContent='left'>
                    <InputLabel style={stilTitluPaginaActivitati}>{`Pagina de activități a utilizatorului ${localStorage.Nume}`}</InputLabel>
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
            <Grid container spacing={3} id='randFiltrare' alignItems='center' style={{ display: "none", width: "100%" }}>
                <Grid item xs={12} sm={4}>
                    <TextField
                        autoFocus
                        margin='dense'
                        id='NumeFilter'
                        name='Nume'
                        label='Nume'
                        variant='outlined'
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        style={{
                            marginLeft: "4%",
                            marginRight: "4%",
                            marginTop: "5%",
                            width: "95%",
                        }}
                        value={activitateFilter.Nume}
                        onChange={(e) => onChangeActivitateFilter(e)}
                    />
                </Grid>
                <Grid item xs={12} sm={4} alignItems='center' justifyContent='center'>
                    <TextField
                        autoFocus
                        margin='dense'
                        id='DetaliiFilter'
                        name='Detalii'
                        label='Detalii'
                        variant='outlined'
                        style={{
                            height: "40px",
                            marginLeft: "4%",
                            marginRight: "4%",
                            marginTop: "5%",
                            width: "95%",
                        }}
                        InputLabelProps={{ shrink: true }}
                        value={activitateFilter.Detalii}
                        fullWidth
                        onChange={(e) => onChangeActivitateFilter(e)}
                    />
                </Grid>
                <Grid item xs={12} sm={4} alignItems='center' justifyContent='center'>
                    <InputLabel id='selectLabelEdit' fullWidth>
                        Stare
                    </InputLabel>
                    <Select
                        labelId='selectLabelEdit'
                        id='selectEdit'
                        value={activitateFilter.Stare}
                        label='Stare'
                        fullWidth
                        variant='outlined'
                        style={{
                            height: "40px",
                            marginLeft: "4%",
                            marginRight: "4%",
                            width: "95%",
                        }}
                        onChange={handleChangeFilter}
                    >
                        <MenuItem value={"Finalizata"}>Finalizata</MenuItem>
                        <MenuItem value={"Nefinalizata"}>Nefinalizata</MenuItem>
                    </Select>
                </Grid>
                <Grid item xs={12} sm={12} alignItems='center' justifyContent='center'>
                    <TextField
                        autoFocus
                        margin='dense'
                        id='DataMinimaFilter'
                        name='DataMinima'
                        label='Data Minimă'
                        InputLabelProps={{ shrink: true }}
                        variant='outlined'
                        style={{
                            marginLeft: "2%",
                            marginRight: "2%",
                            width: "45%",
                        }}
                        value={activitateFilter.DataMinima}
                        type='date'
                        onChange={(e) => onChangeActivitateFilter(e)}
                    />

                    <TextField
                        autoFocus
                        margin='dense'
                        id='DataMaximaFilter'
                        name='DataMaxima'
                        label='Data Maximă'
                        InputLabelProps={{ shrink: true }}
                        variant='outlined'
                        style={{
                            marginLeft: "2%",
                            marginRight: "2%",
                            width: "45%",
                        }}
                        value={activitateFilter.DataMaxima}
                        type='date'
                        onChange={(e) => onChangeActivitateFilter(e)}
                    />
                </Grid>

                <Grid item xs={12} sm={12} alignItems='center' justifyContent='center'>
                    <Button variant='outlined' style={stilButon} size='large' startIcon={<SearchIcon />} onClick={saveActivitateFilter}>
                        Filtrare
                    </Button>
                    <Button variant='outlined' style={stilButon} size='large' startIcon={<RestartAltIcon />} onClick={resetare}>
                        Resetare filtre
                    </Button>
                </Grid>
            </Grid>
            <Grid container spacing={3}>
                {rowsNotificare.length != 0 ? (
                    <Grid item xs={12} sm={12} alignItems='center' justifyContent='center'>
                        <TableContainer component={Paper} style={stilTabel}>
                            <Table aria-label='simple table'>
                                <TableHead style={stilTableHeadCell}>
                                    <TableRow>
                                        <TableCell
                                            colSpan={"5"}
                                            align='center'
                                            style={{
                                                textTransform: "uppercase",
                                            }}
                                        >
                                            Notificări
                                            <Tooltip title='Sterge toate notificarile' align='center'>
                                                <IconButton onClick={actualizeazaNotificari}>
                                                    <MarkEmailReadIcon style={stilNotificariIcon} />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow style={{ textTransform: "uppercase" }}>
                                        <TableCell align='center'>Nume</TableCell>
                                        <TableCell align='center'>Detalii</TableCell>
                                        <TableCell align='center'>Data Limită</TableCell>
                                        <TableCell align='center'>Stare</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {rowsNotificare.map((row, index) => (
                                        <TableRow key={row.ActivitateId}>
                                            <TableCell component='th' scope='row' align='center'>
                                                {row.Nume}
                                            </TableCell>

                                            <TableCell align='center' id={"cellDetalii" + row.ActivitateId}>
                                                {row.Detalii}
                                            </TableCell>

                                            <TableCell align='center' id={"cellDataLimita" + row.ActivitateId}>
                                                {formatData(row.DataLimita)}
                                            </TableCell>

                                            <TableCell
                                                align='center'
                                                style={{
                                                    color: styleStareActivitate(row),
                                                }}
                                            >
                                                {row.Stare}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                ) : null}

                <br />
                <br />
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={12} alignItems='center' justifyContent='center'>
                        <TableContainer component={Paper} style={stilTabel}>
                            <Table aria-label='simple table'>
                                <TableHead style={stilTableHeadCell}>
                                    <TableRow>
                                        <Tooltip
                                            title={
                                                "Ordonare dupa nume " +
                                                (activitateFilter.Camp == "Nume" ? (activitateFilter.Asc == "asc" ? "descendent" : "ascendent") : "ascendent")
                                            }
                                        >
                                            <TableCell
                                                onClick={(e) => {
                                                    sortareHeader("Nume");
                                                }}
                                                align='center'
                                            >
                                                <Button
                                                    variant='text'
                                                    startIcon={
                                                        activitateFilter.Camp == "Nume" ? (
                                                            activitateFilter.Asc == "asc" ? (
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
                                                "Ordonare dupa detalii " +
                                                (activitateFilter.Camp == "Detalii"
                                                    ? activitateFilter.Asc == "asc"
                                                        ? "descendent"
                                                        : "ascendent"
                                                    : "ascendent")
                                            }
                                        >
                                            <TableCell
                                                onClick={(e) => {
                                                    sortareHeader("Detalii");
                                                }}
                                                align='center'
                                            >
                                                <Button
                                                    variant='text'
                                                    startIcon={
                                                        activitateFilter.Camp == "Detalii" ? (
                                                            activitateFilter.Asc == "asc" ? (
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
                                        <Tooltip
                                            title={
                                                "Ordonare dupa data limita " +
                                                (activitateFilter.Camp == "DataLimita"
                                                    ? activitateFilter.Asc == "asc"
                                                        ? "descendent"
                                                        : "ascendent"
                                                    : "ascendent")
                                            }
                                        >
                                            <TableCell
                                                onClick={(e) => {
                                                    sortareHeader("DataLimita");
                                                }}
                                                align='center'
                                            >
                                                <Button
                                                    variant='text'
                                                    startIcon={
                                                        activitateFilter.Camp == "DataLimita" ? (
                                                            activitateFilter.Asc == "asc" ? (
                                                                <ArrowDownwardIcon />
                                                            ) : (
                                                                <ArrowUpwardIcon />
                                                            )
                                                        ) : (
                                                            <SortIcon />
                                                        )
                                                    }
                                                >
                                                    Data Limită
                                                </Button>
                                            </TableCell>
                                        </Tooltip>
                                        <Tooltip
                                            title={
                                                "Ordonare dupa data stare " +
                                                (activitateFilter.Camp == "Stare" ? (activitateFilter.Asc == "asc" ? "descendent" : "ascendent") : "ascendent")
                                            }
                                        >
                                            <TableCell
                                                onClick={(e) => {
                                                    sortareHeader("Stare");
                                                }}
                                                align='center'
                                            >
                                                <Button
                                                    variant='text'
                                                    startIcon={
                                                        activitateFilter.Camp == "Stare" ? (
                                                            activitateFilter.Asc == "asc" ? (
                                                                <ArrowDownwardIcon />
                                                            ) : (
                                                                <ArrowUpwardIcon />
                                                            )
                                                        ) : (
                                                            <SortIcon />
                                                        )
                                                    }
                                                >
                                                    Stare
                                                </Button>
                                            </TableCell>
                                        </Tooltip>

                                        <TableCell
                                            align='center'
                                            style={{
                                                textTransform: "uppercase",
                                            }}
                                        >
                                            Finalizează Activitatea
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                                        <TableRow key={row.ActivitateId}>
                                            <TableCell component='th' scope='row' align='center'>
                                                {row.Nume}
                                            </TableCell>

                                            <TableCell align='center' id={"cellDetalii" + row.ActivitateId}>
                                                {row.Detalii}
                                            </TableCell>

                                            <TableCell align='center' id={"cellDataLimita" + row.ActivitateId}>
                                                {formatData(row.DataLimita)}
                                            </TableCell>

                                            <TableCell
                                                align='center'
                                                style={{
                                                    color: styleStareActivitate(row),
                                                }}
                                            >
                                                {row.Stare}
                                            </TableCell>

                                            {row.Stare == "Nefinalizata" ? (
                                                <TableCell align='center'>
                                                    <Tooltip title='Finalizeaza Activitatea'>
                                                        <IconButton
                                                            style={stilCheckIcon}
                                                            onClick={() => {
                                                                finalizeazaActivitate(row.ActivitateId);
                                                                setNeedUpdate(!needUpdate);
                                                            }}
                                                        >
                                                            <CheckIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            ) : (
                                                <TableCell></TableCell>
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25, 100]}
                            component='div'
                            count={rows.length}
                            rowsPerPage={rowsPerPage}
                            labelRowsPerPage='Rânduri pe pagină'
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </Grid>
                </Grid>
            </Grid>
        </div>
    );
}
