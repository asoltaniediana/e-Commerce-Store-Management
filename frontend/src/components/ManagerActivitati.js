//Activitatile adaugate de catre manager tuturor angajatilor
import { useState, useEffect } from "react";
import * as React from "react";
import { get, post, put, remove } from "../Calls";
import { Button, Paper, Table, TableBody, TableCell, TableRow, TableContainer, InputLabel, Select, Grid, TextField, TableHead } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import GroupIcon from "@mui/icons-material/Group";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import SearchIcon from "@material-ui/icons/Search";
import TablePagination from "@mui/material/TablePagination";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import SortIcon from "@material-ui/icons/Sort";
import { link, activitateRoute, utilizatorRoute } from "../ApiRoutes";
import { useNavigate } from "react-router-dom";
import FilterListIcon from "@mui/icons-material/FilterList";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import CheckIcon from "@mui/icons-material/Check";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import { numarCaractere } from "./Consts";
import { styleStareActivitate, createActivitateFilterRoute, actualizeazaModSortare, eroareDataLimita } from "./Functii";
import { formatData } from "./Functii";
import "../App.css";
import { Activitate_numarCaractereDetalii, Activitate_numarCaractereNume } from "./Verificari";
import {
    PrimulElementPagina,
    stilTabel,
    stilButon,
    stilTextField,
    stilTitluPaginaActivitati,
    stilSelect,
    stilAddIcon,
    stilEditIcon,
    stilCheckIcon,
    stilTableHeadCell,
} from "./ConstanteStil";
import Meniu from "./Meniu";

export default function ManagerActivitati() {
    const [activitateEdit, setActivitateEdit] = useState({
        ActivitateId: 0,
        Nume: "",
        Detalii: "",
        DataLimita: "",
        Stare: "",
        UtilizatorId: "",
        ManagerId: localStorage.UtilizatorId,
    });
    const [activitateFilter, setActivitateFilter] = useState({
        Nume: "",
        Detalii: "",
        Stare: "",
        DataMinima: "",
        DataMaxima: "",
        Camp: "Nume",
        Asc: "asc",
        ManagerId: localStorage.UtilizatorId,
        filtruActiv: false,
    });
    const [optiuni, setOptiuni] = useState({
        filtruVizibil: false,
        ascundeFiltreaza: "Ascunde filtre activități",
        activitatileMele: "Vizualizați lista personală de activități",
        afiseazaFiltreaza: "Afisează filtre activități",
        vizualizeazaListaAngajati: "Vizualizați lista cu angajații pentru a le adăuga activități",
        angajati: false,
        listaAngajati: [],
    });
    const [randEditare, setRandEditare] = useState({
        randInCursDeModificare: -1,
        editare: false,
    });
    const [rows, setRows] = useState([]);
    const [angajati, setAngajati] = useState([]);
    const [needUpdate, setNeedUpdate] = useState(false);
    const navigate = useNavigate();
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const textFieldIds = ["textFieldNume", "textFieldDetalii", "textFieldDataLimita", "CheckIcon"];
    const cellIds = ["cellNume", "cellDetalii", "cellDataLimita"];
    const filterIds = ["NumeFilter", "DetaliiFilter", "DataLimitaFilter", "StareFilter", "saveActivitateFilter", "resetareFilter"];
    useEffect(async () => {
        if (localStorage.getItem("Tip") == "Angajat") {
            navigate("/Angajat");
        }
        if (optiuni.angajati == false) {
            let data = await get(utilizatorRoute);
            let vector = [];
            for (let i = 0; i < data.length; i++) {
                vector[data[i].UtilizatorId] = data[i];
            }
            optiuni.angajati = true;
            optiuni.listaAngajati = vector;
        }
        if (randEditare.editare) {
            randEditare.editare = false;
        } else {
            let data = await get(createActivitateFilterRoute(activitateFilter));
            setRows(data);
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
    const deleteActivitate = async (activitate, index) => {
        await remove(activitateRoute, activitate.ActivitateId);
        activitateEdit.Nume = "";
        activitateEdit.Pret = "";
        activitateFilter.filtruActiv = false;
        rows.splice(index, 1);
        setRows(rows);
        setNeedUpdate(!needUpdate);
    };
    const onChangeActivitateFilter = (e) => {
        setActivitateFilter({
            ...activitateFilter,
            [e.target.name]: e.target.value,
        });
    };
    const onChangeActivitateEdit = (e) => {
        setActivitateEdit({
            ...activitateEdit,
            [e.target.name]: e.target.value,
        });
    };
    const saveActivitateEdit = async () => {
        if (activitateEdit.Nume && activitateEdit.DataLimita && activitateEdit.Detalii && activitateEdit.Stare) {
            if (activitateEdit.Nume.length >= Activitate_numarCaractereNume) {
                activitateEdit.Notificare = "Da";
                let p = await put(activitateRoute + "/" + localStorage.UtilizatorId, activitateEdit.ActivitateId, activitateEdit);
                resetareCampuriEdit();
                setNeedUpdate(!needUpdate);
            } else {
                alert(`Nume trebuie sa aiba cel putin ${Activitate_numarCaractereNume} caractere`);
            }
        } else {
            alert("Va rugam sa completati toate campurile!!");
        }
    };
    const saveActivitateFilter = async () => {
        //'/activitateFilter/:UtilizatorId/:ManagerId/:Nume/:Detalii/:Stare/:DataMinima/:DataMaxima'
        if (activitateFilter.Nume || activitateFilter.Detalii || activitateFilter.Stare || activitateFilter.DataMinima || activitateFilter.DataMaxima) {
            if (activitateFilter.DataMinima && activitateFilter.DataMaxima) {
                if (activitateFilter.DataMinima > activitateFilter.DataMaxima) {
                    alert("Data maxima trebuie sa fie mai mare decat data minima ");
                    return;
                }
            }
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
    function resetareCampuriEdit() {
        activitateEdit.ActivitateId = "";
        activitateEdit.Detalii = "";
        activitateEdit.DataLimita = "";
        activitateEdit.Stare = "";
        activitateEdit.Nume = "";
    }
    const handleChangeFilter = (event) => {
        activitateFilter.Stare = event.target.value;
        setNeedUpdate(!needUpdate);
    };
    function resetare() {
        activitateFilter.Nume = "";
        activitateFilter.Detalii = "";
        activitateFilter.Stare = "";
        activitateFilter.DataMinima = "";
        activitateFilter.DataMaxima = "";
        activitateFilter.Camp = "";
        activitateFilter.Asc = "";
        setNeedUpdate(!needUpdate);
    }
    return (
        <div>
            <Meniu />
            <Grid container spacing={1} style={PrimulElementPagina}>
                <Grid item xs={12} sm={12} style={{ marginTop: "20px" }} alignItems='left' justifyContent='left'>
                    <InputLabel style={stilTitluPaginaActivitati}>{`Pagina pentru activitățile adăugate de managerul ${localStorage.Nume}`}</InputLabel>
                </Grid>
                <Grid item xs={12} sm={12} spacing={3} alignItems='left' justifyContent='center'>
                    <Tooltip title={optiuni.activitatileMele}>
                        <Button
                            style={stilButon}
                            variant='outlined'
                            startIcon={<FormatListBulletedIcon />}
                            onClick={() => {
                                navigate("/Manager/Activitati");
                            }}
                        >
                            Activitățile mele
                        </Button>
                    </Tooltip>
                    <Tooltip title={optiuni.filtruVizibil == true ? optiuni.ascundeFiltreaza : optiuni.afiseazaFiltreaza}>
                        <Button
                            variant='outlined'
                            style={stilButon}
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
                    <Tooltip title={optiuni.vizualizeazaListaAngajati}>
                        <Button
                            style={stilButon}
                            variant='outlined'
                            startIcon={<GroupIcon />}
                            onClick={() => {
                                navigate("/Manager/Angajati");
                            }}
                        >
                            Listă angajați
                        </Button>
                    </Tooltip>
                </Grid>
            </Grid>

            <Grid container spacing={1} id='randFiltrare' justifyContent='center' style={{ display: "none", width: "100%", marginBottom: "0px" }}>
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
                        style={stilTextField}
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
                        style={stilTextField}
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
                        style={stilSelect}
                        onChange={handleChangeFilter}
                    >
                        <MenuItem value={"Finalizata"}>Finalizata</MenuItem>
                        <MenuItem value={"Nefinalizata"}>Nefinalizata</MenuItem>
                    </Select>
                </Grid>
                <Grid item xs={12} sm={4} alignItems='center' justifyContent='center'>
                    <TextField
                        autoFocus
                        margin='dense'
                        id='DataMinimaFilter'
                        name='DataMinima'
                        label='Data Minima'
                        InputLabelProps={{ shrink: true }}
                        variant='outlined'
                        style={stilTextField}
                        value={activitateFilter.DataMinima}
                        type='date'
                        onChange={(e) => onChangeActivitateFilter(e)}
                    />
                </Grid>
                <Grid item xs={12} sm={4} alignItems='center' justifyContent='center'>
                    <TextField
                        autoFocus
                        margin='dense'
                        id='DataMaximaFilter'
                        name='DataMaxima'
                        label='Data Maxima'
                        InputLabelProps={{ shrink: true }}
                        variant='outlined'
                        style={stilTextField}
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
                                            (activitateFilter.Camp == "Detalii" ? (activitateFilter.Asc == "asc" ? "descendent" : "ascendent") : "ascendent")
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
                                            (activitateFilter.Camp == "DataLimita" ? (activitateFilter.Asc == "asc" ? "descendent" : "ascendent") : "ascendent")
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
                                                Data Limita
                                            </Button>
                                        </TableCell>
                                    </Tooltip>
                                    <Tooltip
                                        title={
                                            "Ordonare dupa stare " +
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
                                    <TableCell align='center'>
                                        <Button>Angajat</Button>
                                    </TableCell>
                                    <TableCell align='center'>
                                        <Button style={{ padding: "0px" }}>Editare Activitate</Button>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                                    <TableRow key={row.ActivitateId}>
                                        <TableCell align='center' id={"cellNume" + row.ActivitateId}>
                                            {row.Nume}
                                        </TableCell>
                                        <TableCell align='center' id={"textFieldNume" + row.ActivitateId} style={{ display: "none" }}>
                                            <TextField
                                                autoFocus
                                                variant='outlined'
                                                name='Nume'
                                                multiline
                                                required
                                                error={activitateEdit.Nume.length >= numarCaractere.Activitate.Nume ? false : true}
                                                helperText={
                                                    activitateEdit.Nume.length >= numarCaractere.Activitate.Nume
                                                        ? " "
                                                        : `Numele activității trebuie să conțină cel puțin ${numarCaractere.Activitate.Nume} caractere`
                                                }
                                                value={activitateEdit.Nume}
                                                onChange={(e) => onChangeActivitateEdit(e)}
                                            />
                                        </TableCell>
                                        <TableCell align='center' id={"cellDetalii" + row.ActivitateId}>
                                            {row.Detalii}
                                        </TableCell>
                                        <TableCell align='center' id={"textFieldDetalii" + row.ActivitateId} style={{ display: "none" }}>
                                            <TextField
                                                autoFocus
                                                variant='outlined'
                                                multiline
                                                name='Detalii'
                                                required
                                                error={activitateEdit.Detalii.length >= numarCaractere.Activitate.Detalii ? false : true}
                                                helperText={
                                                    activitateEdit.Detalii.length >= numarCaractere.Activitate.Detalii
                                                        ? " "
                                                        : `Detaliile activității trebuie să conțină cel puțin ${numarCaractere.Activitate.Detalii} caractere`
                                                }
                                                value={activitateEdit.Detalii}
                                                onChange={(e) => onChangeActivitateEdit(e)}
                                            />
                                        </TableCell>
                                        <TableCell align='center' id={"cellDataLimita" + row.ActivitateId}>
                                            {formatData(row.DataLimita)}
                                        </TableCell>
                                        <TableCell align='center' id={"textFieldDataLimita" + row.ActivitateId} style={{ display: "none" }}>
                                            <TextField
                                                autoFocus
                                                variant='outlined'
                                                type='date'
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                                name='DataLimita'
                                                error={eroareDataLimita(activitateEdit.DataLimita) != " " ? true : false}
                                                helperText={eroareDataLimita(activitateEdit.DataLimita)}
                                                value={activitateEdit.DataLimita}
                                                onChange={(e) => onChangeActivitateEdit(e)}
                                            />
                                        </TableCell>
                                        <TableCell
                                            align='center'
                                            style={{
                                                color: styleStareActivitate(row),
                                            }}
                                        >
                                            {row.Stare}
                                        </TableCell>

                                        <TableCell align='center'>{optiuni.listaAngajati[row.UtilizatorId].Nume}</TableCell>
                                        <TableCell align='right'>
                                            <IconButton>
                                                <Tooltip title='Salveaza modificari' style={stilCheckIcon}>
                                                    <CheckIcon
                                                        className='CheckIcon'
                                                        id={"CheckIcon" + row.ActivitateId}
                                                        style={{
                                                            display: "none",
                                                        }}
                                                        onClick={() => {
                                                            console.log(activitateEdit);
                                                            saveActivitateEdit();
                                                            //const textFieldIds=["textFieldNume","textFieldPret","CheckIcon"];
                                                            for (let i = 0; i < textFieldIds.length; i++) {
                                                                let textField = document.getElementById(textFieldIds[i] + row.ActivitateId);

                                                                textField.style.display = "none";
                                                            }

                                                            for (let i = 0; i < cellIds.length; i++) {
                                                                let cell = document.getElementById(cellIds[i] + row.ActivitateId);
                                                                cell.style.display = "table-cell";
                                                            }
                                                            randEditare.randInCursDeModificare = -1;
                                                            setNeedUpdate(!needUpdate);
                                                        }}
                                                    />
                                                </Tooltip>
                                            </IconButton>
                                            {row.Stare == "Nefinalizata" ? (
                                                <Tooltip title='Editați activitatea'>
                                                    <IconButton
                                                        style={stilEditIcon}
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
                                                            activitateEdit.ActivitateId = row.ActivitateId;
                                                            activitateEdit.Nume = row.Nume;
                                                            activitateEdit.Detalii = row.Detalii;
                                                            activitateEdit.DataLimita = row.DataLimita;
                                                            activitateEdit.Stare = row.Stare;
                                                            activitateEdit.UtilizatorId = row.UtilizatorId;
                                                            randEditare.randInCursDeModificare = row.ActivitateId;
                                                            for (let i = 0; i < textFieldIds.length - 1; i++) {
                                                                let textField = document.getElementById(textFieldIds[i] + randEditare.randInCursDeModificare);
                                                                textField.style.display = "table-cell";
                                                            }
                                                            for (let i = 0; i < cellIds.length; i++) {
                                                                let cell = document.getElementById(cellIds[i] + randEditare.randInCursDeModificare);
                                                                cell.style.display = "none";
                                                            }
                                                            let checkIcon = document.getElementById("CheckIcon" + row.ActivitateId);
                                                            checkIcon.style.display = "initial";
                                                            randEditare.editare = true;
                                                            setNeedUpdate(!needUpdate);
                                                        }}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            ) : (
                                                ""
                                            )}
                                            <Tooltip title='Ștergeți activitatea'>
                                                <IconButton onClick={() => deleteActivitate(row, index)}>
                                                    <DeleteIcon color='secondary' />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={`Adaugati o activitate noua pentru ${optiuni.listaAngajati[row.UtilizatorId].Nume}`}>
                                                <IconButton
                                                    style={stilAddIcon}
                                                    onClick={() => {
                                                        if (row.UtilizatorId != localStorage.UtilizatorId) {
                                                            navigate(`/Manager/Activitati/${row.UtilizatorId}`);
                                                        } else {
                                                            navigate(`/Manager/Activitati`);
                                                        }
                                                    }}
                                                >
                                                    <AddIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
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
