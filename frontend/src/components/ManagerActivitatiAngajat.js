//Adaugarea de activitati unui anumit angajat
//Activitatile adaugate de catre manager tuturor angajatilor
import { useState, useEffect } from "react";
import * as React from "react";
import { get, post, put, remove } from "../Calls";
import { Button, Paper, Table, TableBody, TableCell, TableRow, TableContainer, Select, Grid, TextField, TableHead } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import SaveIcon from "@material-ui/icons/Save";
import SortIcon from "@material-ui/icons/Sort";
import SearchIcon from "@material-ui/icons/Search";
import MenuItem from "@mui/material/MenuItem";
import TablePagination from "@mui/material/TablePagination";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { link, activitateRoute, utilizatorRoute } from "../ApiRoutes";
import { useNavigate, useParams } from "react-router-dom";
import FilterListIcon from "@mui/icons-material/FilterList";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import CheckIcon from "@mui/icons-material/Check";
import InputLabel from "@mui/material/InputLabel";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import "../App.css";
import { formatData } from "./Functii";
import { styleStareActivitate, eroareDataLimita } from "./Functii";
import { createActivitateFilterRoute, actualizeazaModSortare } from "./Functii";
import { Activitate_numarCaractereDetalii, Activitate_numarCaractereNume } from "./Verificari";
import { PrimulElementPagina, stilTitluPaginaActivitati, stilTabel, stilButon, stilTextField, stilSelect, stilTableHeadCell } from "./ConstanteStil";
import Meniu from "./Meniu";
import { numarCaractere } from "./Consts";
export default function ManagerActivitatiAngajat() {
    const routerParams = useParams();
    const [activitateEdit, setActivitateEdit] = useState({
        ActivitateId: 0,
        Nume: "",
        Detalii: "",
        DataLimita: "",
        Stare: "",
        UtilizatorId: routerParams.UtilizatorId,
        ManagerId: localStorage.UtilizatorId,
    });
    const [activitateAdd, setActivitateAdd] = useState({
        Nume: "",
        Detalii: "",
        DataLimita: "",
        Stare: "",
        Notificare: "Da",
        UtilizatorId: routerParams.UtilizatorId,
        ManagerId: localStorage.UtilizatorId,
    });
    const [activitateFilter, setActivitateFilter] = useState({
        Nume: "",
        Detalii: "",
        DataLimita: "",
        Stare: "",
        Camp: "Nume",
        Asc: "asc",
        UtilizatorId: routerParams.UtilizatorId,
        ManagerId: localStorage.UtilizatorId,
    });

    const [optiuni, setOptiuni] = useState({
        filtruVizibil: false,
        ascundeFiltreaza: "Ascunde filtre activitati",
        afiseazaFiltreaza: "Afiseaza filtre activitati",
        angajat: false,
        informatiiAngajat: {},
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
    const textFieldIds = ["textFieldNume", "textFieldDetalii", "textFieldDataLimita", "CheckIcon"];
    const cellIds = ["cellNume", "cellDetalii", "cellDataLimita"];
    const [dataCurenta, setDataCurenta] = useState({ Data: "" });
    useEffect(async () => {
        dataCurenta.Data = new Date();
        dataCurenta.Data.setHours(dataCurenta.Data.getHours() + 3);

        console.log(new Date(activitateAdd.Data) <= dataCurenta.Data);
        if (localStorage.getItem("Tip") == "Angajat") {
            navigate("/Angajat");
        }
        if (optiuni.angajat == false) {
            let data = await get(utilizatorRoute, routerParams.UtilizatorId);
            optiuni.angajat = true;
            optiuni.informatiiAngajat = data;
        }
        if (randEditare.editare) {
            randEditare.editare = false;
        } else {
            let data = await get(createActivitateFilterRoute(activitateFilter));
            setRows(data);
        }
        console.log(dataCurenta.Data);
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
    const saveActivitateAdd = async () => {
        if (activitateAdd.Nume && activitateAdd.DataLimita && activitateAdd.Detalii) {
            if (activitateAdd.Nume.length >= 3) {
                activitateFilter.filtruActiv = false;
                activitateAdd.Stare = "Nefinalizata";
                let c = await post(`${activitateRoute}/${routerParams.UtilizatorId}/${localStorage.UtilizatorId}`, activitateAdd);
                if (c.message) {
                    alert(c.message);
                } else {
                    activitateAdd.Nume = "";
                    activitateAdd.Detalii = "";
                    activitateAdd.DataLimita = "";
                    setNeedUpdate(!needUpdate);
                }
            } else {
                alert("Nume trebuie sa aiba cel putin 3 caractere");
            }
        } else {
            alert("Va rugam sa completati toate campurile!!");
        }
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
    const onChangeActivitateAdd = (e) => {
        setActivitateAdd({ ...activitateAdd, [e.target.name]: e.target.value });
    };
    const saveActivitateEdit = async () => {
        if (activitateEdit.Nume && activitateEdit.DataLimita && activitateEdit.Detalii && activitateEdit.Stare) {
            if (activitateEdit.Nume.length >= Activitate_numarCaractereNume) {
                activitateFilter.filtruActiv = false;
                activitateEdit.Notificare = "Da";
                let p = await put(activitateRoute + "/" + localStorage.UtilizatorId, activitateEdit.ActivitateId, activitateEdit);
                activitateEdit.ActivitateId = "";
                activitateEdit.Detalii = "";
                activitateEdit.DataLimita = "";
                activitateEdit.Stare = "";
                activitateEdit.Nume = "";
                setNeedUpdate(!needUpdate);
            } else {
                alert(`Nume trebuie sa aiba cel putin ${Activitate_numarCaractereNume} caractere`);
            }
        } else {
            alert("Va rugam sa completati toate campurile!!");
        }
    };
    const saveActivitateFilter = async () => {
        if (activitateFilter.Nume || activitateFilter.Detalii || activitateFilter.Stare) {
            activitateFilter.filtruActiv = true;
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
            <Grid container style={PrimulElementPagina}>
                <Grid item xs={12} sm={12} alignItems='left' style={{ marginTop: "20px" }} justifyContent='left'>
                    <InputLabel style={stilTitluPaginaActivitati}>{`Pagina de activități a utilizatorului ${optiuni.informatiiAngajat.Nume}`}</InputLabel>
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

                <Grid item xs={12} sm={12} alignItems='center' justifyContent='center'>
                    <Tooltip title={optiuni.adaugareVizibila == true ? optiuni.ascundeAdauga : optiuni.afiseazaAdauga}>
                        <Button
                            style={stilButon}
                            variant='outlined'
                            startIcon={<AddIcon />}
                            onClick={() => {
                                if (optiuni.adaugareVizibila == true) {
                                    optiuni.adaugareVizibila = false;
                                    document.getElementById("randAdaugare").style.display = "none";
                                } else {
                                    optiuni.adaugareVizibila = true;
                                    document.getElementById("randAdaugare").style.display = "flex";
                                }
                                setNeedUpdate(!needUpdate);
                            }}
                        >
                            Adauga activitate noua
                        </Button>
                    </Tooltip>
                </Grid>
            </Grid>
            <Grid container id='randAdaugare' style={{ display: "none" }}>
                <Grid item xs={12} sm={4} alignItems='center' justifyContent='center'>
                    <TextField
                        autoFocus
                        margin='dense'
                        id='NumeAdd'
                        name='Nume'
                        label='Nume'
                        variant='outlined'
                        required
                        error={activitateAdd.Nume.length >= numarCaractere.Activitate.Nume ? false : true}
                        helperText={
                            activitateAdd.Nume.length >= numarCaractere.Activitate.Nume
                                ? " "
                                : `Numele activității trebuie să conțină cel puțin ${numarCaractere.Activitate.Nume} caractere`
                        }
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                        style={stilTextField}
                        value={activitateAdd.Nume}
                        onChange={(e) => onChangeActivitateAdd(e)}
                    />
                </Grid>
                <Grid item xs={12} sm={4} alignItems='center' justifyContent='center'>
                    <TextField
                        autoFocus
                        margin='dense'
                        id='DetaliiAdd'
                        name='Detalii'
                        label='Detalii'
                        variant='outlined'
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                        style={stilTextField}
                        value={activitateAdd.Detalii}
                        required
                        error={activitateAdd.Detalii.length >= numarCaractere.Activitate.Detalii ? false : true}
                        helperText={
                            activitateAdd.Detalii.length >= numarCaractere.Activitate.Detalii
                                ? " "
                                : `Detaliile activității trebuie să conțină cel puțin ${numarCaractere.Activitate.Detalii} caractere`
                        }
                        onChange={(e) => onChangeActivitateAdd(e)}
                    />
                </Grid>
                <Grid item xs={12} sm={4} alignItems='center' justifyContent='center'>
                    <TextField
                        autoFocus
                        margin='dense'
                        id='DataLimitaAdd'
                        name='DataLimita'
                        label='Data Limită'
                        variant='outlined'
                        type='date'
                        style={stilTextField}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                        value={activitateAdd.DataLimita}
                        required
                        error={eroareDataLimita(activitateAdd.DataLimita) != " " ? true : false}
                        helperText={eroareDataLimita(activitateAdd.DataLimita)}
                        onChange={(e) => onChangeActivitateAdd(e)}
                    />
                </Grid>
                <Grid item xs={12} sm={12} alignItems='center' justifyContent='center' style={{ marginTop: "20px" }}>
                    <Button style={stilButon} size='large' variant='outlined' startIcon={<SaveIcon />} onClick={saveActivitateAdd}>
                        Adaugă activitate
                    </Button>
                    <Button
                        variant='outlined'
                        style={stilButon}
                        size='large'
                        startIcon={<RestartAltIcon />}
                        onClick={() => {
                            activitateAdd.Nume = "";
                            activitateAdd.Detalii = "";
                            activitateAdd.DataLimita = "";

                            setNeedUpdate(!needUpdate);
                        }}
                    >
                        Resetează câmpuri
                    </Button>
                </Grid>
            </Grid>
            <Grid container id='randFiltrare' justifyContent='center' style={{ display: "none" }}>
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

            <br />
            <br />
            <Grid container>
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
                                    <TableCell align='center' style={{ textTransform: "uppercase" }}>
                                        Editare Activitate
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
                                                value={activitateEdit.Nume}
                                                onChange={(e) => onChangeActivitateEdit(e)}
                                                required
                                                error={activitateEdit.Nume.length >= numarCaractere.Activitate.Nume ? false : true}
                                                helperText={
                                                    activitateEdit.Nume.length >= numarCaractere.Activitate.Nume
                                                        ? " "
                                                        : `Numele activității trebuie să conțină cel puțin ${numarCaractere.Activitate.Nume} caractere`
                                                }
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
                                                required
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

                                        <TableCell align='center'>
                                            <IconButton>
                                                <Tooltip title='Salveaza modificari'>
                                                    <CheckIcon
                                                        className='CheckIcon'
                                                        id={"CheckIcon" + row.ActivitateId}
                                                        style={{
                                                            display: "none",
                                                        }}
                                                        onClick={() => {
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
                                            <IconButton
                                                onClick={() => {
                                                    if (randEditare.randInCursDeModificare != -1) {
                                                        for (let i = 0; i < textFieldIds.length; i++) {
                                                            let textField = document.getElementById(textFieldIds[i] + randEditare.randInCursDeModificare);
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
                                                <EditIcon color='primary' />
                                            </IconButton>
                                            <IconButton onClick={() => deleteActivitate(row, index)}>
                                                <DeleteIcon color='secondary' />
                                            </IconButton>
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
