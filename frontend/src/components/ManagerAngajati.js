import { useState, useEffect } from "react";
import * as React from "react";
import { get, post, put, remove } from "../Calls";
import { Button, Paper, Table, TableBody, TableCell, TableRow, TableContainer, InputLabel, Select, Grid, TextField, TableHead } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import SortIcon from "@material-ui/icons/Sort";
import SearchIcon from "@material-ui/icons/Search";
import MenuItem from "@mui/material/MenuItem";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import PublishedWithChangesIcon from "@mui/icons-material/PublishedWithChanges";
import { link, utilizatorRoute, tipUtilizatorRoute } from "../ApiRoutes";
import { useNavigate } from "react-router-dom";
import TablePagination from "@mui/material/TablePagination";
import { procentFinalizare } from "./Functii.js";
import "../App.css";
import { PrimulElementPagina, stilButon, stilSelect, stilTabel, stilTableHeadCell, stilTextField } from "./ConstanteStil";
import Meniu from "./Meniu";
export default function ManagerAngajati() {
    const [angajatFilter, setAngajatFilter] = useState({
        Tip: "",
        Nume: "",
        SchimbaTip: false,
    });
    const [sortare, setSortare] = useState({
        Camp: "Nume",
        Asc: "asc",
    });
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [rows, setRows] = useState([]);
    const [needUpdate, setNeedUpdate] = useState(false);
    const navigate = useNavigate();
    //schimbare pagina din tabel
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };
    //schimbare numar de randuri per pagina din tabel
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };
    useEffect(async () => {
        if (localStorage.getItem("Tip") == "Angajat") {
            navigate("/Angajat");
        }
        if (angajatFilter.SchimbaTip) {
            angajatFilter.SchimbaTip = false;
        } else {
            if (angajatFilter.Nume == "" && angajatFilter.Tip == "") {
                let data = await get(utilizatorRoute);
                data = data.filter((obj) => obj.UtilizatorId != localStorage.UtilizatorId);
                setRows(data);
            } else {
                ///utilizatorFilter/UtilizatorNume/:UtilizatorNume/Tip/:Tip/Nume/:Nume
                let route = link + "utilizatorFilter/UtilizatorNume/-/Tip/";
                if (angajatFilter.Tip == "") {
                    route += "-/Nume/";
                } else {
                    route += angajatFilter.Tip + "/Nume/";
                }
                if (angajatFilter.Nume == "") {
                    route += "-";
                } else {
                    route += angajatFilter.Nume;
                }
                let data = await get(route);
                data = data.filter((obj) => obj.UtilizatorId != localStorage.UtilizatorId);
                setRows(data);
            }
        }
    }, [needUpdate]);

    const onChangeAngajatFilter = (e) => {
        setAngajatFilter({ ...angajatFilter, [e.target.name]: e.target.value });
    };
    const saveAngajatFilter = async () => {
        if (angajatFilter.Nume || angajatFilter.Tip) {
            // if(angajatFilter.UtilizatorNume.includes(" ")||angajatFilter.Nume.includes(" ")||angajatFilter.Tip.includes(" ")){
            //     alert("Filtrele nu pot contine spatii");
            //     return;
            // }
            setNeedUpdate(!needUpdate);
        } else {
            alert("Va rugam sa completati cel putin un camp pentru filtrare!!");
        }
    };
    function resetare() {
        angajatFilter.UtilizatorNume = "";
        angajatFilter.Nume = "";
        angajatFilter.Tip = "";
        setNeedUpdate(!needUpdate);
    }
    async function actualizeazaTipAngajat(UtilizatorId) {
        ///tipUtilizator/:UtilizatorId/:ManagerId

        if (UtilizatorId == localStorage.UtilizatorId) {
            alert("Nu va puteti schimba tipul utilizatorului in acest fel");
        } else {
            let angajat = await put(tipUtilizatorRoute + "/" + UtilizatorId, localStorage.UtilizatorId);
            angajatFilter.Nume = "";
            angajatFilter.Tip = "";
            angajatFilter.UtilizatorNume = "";

            setNeedUpdate(!needUpdate);
        }
    }
    //Sortare Produse
    async function sortareHeader(Camp) {
        setPage(0);
        if (sortare.Camp != Camp) {
            sortare.Asc = "asc";
            sortare.Camp = Camp;
        } else {
            if (sortare.Asc == "asc") {
                sortare.Asc = "desc";
            } else {
                sortare.Asc = "asc";
            }
        }
        let data = await get(utilizatorRoute + "/sortat/" + sortare.Camp + "/" + sortare.Asc);
        setRows(data);
    }
    const handleChangeTipFilter = (event) => {
        angajatFilter.Tip = event.target.value;
        angajatFilter.SchimbaTip = true;
        setNeedUpdate(!needUpdate);
    };
    return (
        <div>
            <Meniu />
            <Grid container alignItems='center' justifyContent='center' style={PrimulElementPagina}>
                <Grid item xs={12} sm={4}>
                    <TextField
                        autoFocus
                        margin='dense'
                        id='NumeFilter'
                        name='Nume'
                        label='Numele angajatului sa contina'
                        style={stilTextField}
                        variant='outlined'
                        fullWidth
                        value={angajatFilter.Nume}
                        onChange={(e) => onChangeAngajatFilter(e)}
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <InputLabel id='selectLabelFilter' fullWidth>
                        Tip
                    </InputLabel>
                    <Select
                        labelId='selectLabelFilter'
                        id='selectFilter'
                        value={angajatFilter.Tip}
                        label='Tip'
                        fullWidth
                        variant='outlined'
                        style={stilSelect}
                        onChange={handleChangeTipFilter}
                    >
                        <MenuItem value={"Angajat"}>Angajat</MenuItem>
                        <MenuItem value={"Manager"}>Manager</MenuItem>
                    </Select>
                </Grid>
            </Grid>
            <Grid container xs={12} sm={12} alignItems='center' justifyContent='center'>
                <Grid item xs={12} sm={4}>
                    <Button style={stilButon} variant='outlined' startIcon={<SearchIcon />} onClick={saveAngajatFilter}>
                        Filtrare
                    </Button>{" "}
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Button style={stilButon} variant='outlined' startIcon={<SearchIcon />} onClick={resetare}>
                        Resetare filtre
                    </Button>
                </Grid>
            </Grid>
            <br />
            <Grid>
                <Grid item xs={12} sm={12} alignItems='center' justifyContent='center'>
                    <TableContainer component={Paper} style={stilTabel}>
                        <Table aria-label='simple table'>
                            <TableHead style={stilTableHeadCell}>
                                <TableRow>
                                    <Tooltip
                                        title={
                                            "Ordonare dupa nume " + (sortare.Camp == "Nume" ? (sortare.Asc == "asc" ? "descendent" : "ascendent") : "ascendent")
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
                                                    sortare.Camp == "Nume" ? sortare.Asc == "asc" ? <ArrowDownwardIcon /> : <ArrowUpwardIcon /> : <SortIcon />
                                                }
                                            >
                                                Nume
                                            </Button>
                                        </TableCell>
                                    </Tooltip>
                                    <Tooltip
                                        title={
                                            "Ordonare dupa tip " + (sortare.Camp == "Tip" ? (sortare.Asc == "asc" ? "descendent" : "ascendent") : "ascendent")
                                        }
                                    >
                                        <TableCell
                                            onClick={(e) => {
                                                sortareHeader("Tip");
                                            }}
                                            align='center'
                                        >
                                            <Button
                                                variant='text'
                                                startIcon={
                                                    sortare.Camp == "Tip" ? sortare.Asc == "asc" ? <ArrowDownwardIcon /> : <ArrowUpwardIcon /> : <SortIcon />
                                                }
                                            >
                                                Tip
                                            </Button>
                                        </TableCell>
                                    </Tooltip>
                                    <Tooltip title={"Schimbati tipul utilizatorilor din angajat in manager"}>
                                        <TableCell align='center'>
                                            <Button variant='text'>Schimbă Tip</Button>
                                        </TableCell>
                                    </Tooltip>
                                    <Tooltip title={"Accesare pagina pentru a adauga activitati fiecarui angajat "}>
                                        <TableCell align='center'>
                                            <Button variant='text'>Adaugă Activități</Button>
                                        </TableCell>
                                    </Tooltip>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                                    <TableRow key={row.UtilizatorId}>
                                        <TableCell align='center'>{row.Nume}</TableCell>
                                        <TableCell align='center'>{row.Tip}</TableCell>

                                        {row.Tip == "Angajat" ? (
                                            <TableCell align='center'>
                                                <Tooltip title='Schimba Tip'>
                                                    <IconButton
                                                        onClick={() => {
                                                            if (row.Tip == "Angajat") {
                                                                actualizeazaTipAngajat(row.UtilizatorId);
                                                                setNeedUpdate(!needUpdate);
                                                            }
                                                        }}
                                                    >
                                                        <PublishedWithChangesIcon color='primary' />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        ) : (
                                            <TableCell></TableCell>
                                        )}

                                        <TableCell align='center'>
                                            <Tooltip title='Adauga Activitati'>
                                                <IconButton onClick={() => navigate(`/Manager/Activitati/${row.UtilizatorId}`)}>
                                                    <AddIcon
                                                        style={{
                                                            color: "#00acc1",
                                                        }}
                                                    />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
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
                    </TableContainer>
                </Grid>
            </Grid>
        </div>
    );
}
