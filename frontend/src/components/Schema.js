import { useState, useEffect } from "react";
import * as React from "react";
import { get, post, put, remove } from "../Calls";
import { Button, Paper, Table, TableBody, TableCell, TableRow, TableContainer, InputLabel, Select, Grid, TextField, TableHead } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";
import EmailIcon from "@mui/icons-material/Email";
import EditIcon from "@material-ui/icons/Edit";
import MessageIcon from "@mui/icons-material/Message";
import FilterListIcon from "@mui/icons-material/FilterList";
import SaveIcon from "@material-ui/icons/Save";
import SearchIcon from "@material-ui/icons/Search";
import TablePagination from "@mui/material/TablePagination";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import SortIcon from "@material-ui/icons/Sort";
import { stilTabel, stilButon, stilTableHeadCell, stilTextField, stilEditIcon, stilSelect } from "./ConstanteStil";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import Tooltip from "@mui/material/Tooltip";
import { schemaRoute } from "../ApiRoutes";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { PrimulElementPagina } from "./ConstanteStil";
import { createSchemaFilterRoute, actualizeazaModSortare, eroareSchemaContinut, eroareSchemaNume } from "./Functii";
export default function Schema() {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [rows, setRows] = useState([]);
    const [needUpdate, setNeedUpdate] = useState(false);
    const navigate = useNavigate();
    const [schemaEdit, setSchemaEdit] = useState({
        SchemaId: 0,
        SchemaNume: "",
        Continut: "",
        Tip: "Email",
        SchimbaTip: false,
        UtilizatorId: localStorage.UtilizatorId,
    });
    const [schemaAdd, setSchemaAdd] = useState({
        SchemaNume: "",
        Continut: "",
        Tip: "Email",
        SchimbaTip: false,
        UtilizatorId: localStorage.UtilizatorId,
    });
    const [optiuni, setOptiuni] = useState({
        adaugareVizibila: false,
        filtruVizibil: false,
        editareVizibila: false,
        ascundeEditare: "Ascunde editare schema",
        afiseazaEditare: "Afiseaza editare schema",
        ascundeAdauga: "Ascunde adaugare schema noua",
        afiseazaAdauga: "Adauga schema noua",
        ascundeFiltreaza: "Ascunde filtre schema",
        afiseazaFiltreaza: "Afiseaza filtre schema",
    });
    const [schemaFilter, setSchemaFilter] = useState({
        SchemaNume: "",
        Continut: "",
        Tip: "",
        Camp: "",
        Asc: "",
        SchimbaTip: false,
        filtruActiv: false,
    });
    const [randEditare, setRandEditare] = useState({
        randInCursDeModificare: -1,
        editare: false,
    });
    useEffect(async () => {
        if (schemaAdd.SchimbaTip || schemaFilter.SchimbaTip || schemaEdit.SchimbaTip) {
            schemaAdd.SchimbaTip = false;
            schemaFilter.SchimbaTip = false;
            schemaEdit.SchimbaTip = false;
        } else {
            if (randEditare.editare) {
                randEditare.editare = false;
            } else {
                let data = await get(createSchemaFilterRoute(schemaFilter));
                setRows(data);
            }
        }
    }, [needUpdate]);
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };
    //schimbare numar de randuri per pagina din tabel
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };
    const deleteSchema = async (schema, index) => {
        if (schema.Generate.length != 0) {
            alert(`Nu puteți șterge schema ${schema.SchemaNume} deoarece acesta a fost folosită`);
        } else {
            await remove(schemaRoute, schema.SchemaId);
            schemaEdit.SchemaNume = "";
            schemaEdit.Continut = "";
            schemaEdit.Tip = "";
            schemaEdit.SchemaId = "";
            schemaEdit.UtilizatorId = "";
            schemaFilter.filtruActiv = false;
            rows.splice(index, 1);
            setRows(rows);
            setNeedUpdate(!needUpdate);
        }
    };
    const onChangeSchemaAdd = (e) => {
        setSchemaAdd({
            ...schemaAdd,
            [e.target.name]: e.target.value,
        });
    };
    const onChangeSchemaFilter = (e) => {
        setSchemaFilter({
            ...schemaFilter,
            [e.target.name]: e.target.value,
        });
    };
    const onChangeSchemaEdit = (e) => {
        setSchemaEdit({
            ...schemaEdit,
            [e.target.name]: e.target.value,
        });
    };
    const saveSchemaEdit = async () => {
        schemaEdit.UtilizatorId = localStorage.UtilizatorId;
        if (schemaEdit.SchemaNume && schemaEdit.Continut && schemaEdit.Tip) {
            if (eroareSchemaContinut(schemaEdit.Continut) == " " && eroareSchemaNume(schemaEdit.SchemaNume) == " ") {
                schemaFilter.filtruActiv = false;
                let c = await put(schemaRoute + "/" + localStorage.UtilizatorId, schemaEdit.SchemaId, schemaEdit);
                if (c.message) {
                    alert(c.message);
                } else {
                    schemaEdit.SchemaId = "";
                    schemaEdit.SchemaNume = "";
                    schemaEdit.Continut = "";
                    schemaEdit.Tip = "";
                    schemaEdit.UtilizatorId = "";
                    setNeedUpdate(!needUpdate);
                }
            } else {
                alert("Vă rugăm să rezolvați erorile!");
            }
        } else {
            alert("Va rugam sa completati toate campurile!!");
        }
    };
    const saveSchemaAdd = async () => {
        if (eroareSchemaContinut(schemaAdd.Continut) == " " && eroareSchemaNume(schemaAdd.SchemaNume) == " ") {
            let c = await post(schemaRoute + "/" + localStorage.UtilizatorId, schemaAdd);
            if (!c.message) {
                schemaFilter.filtruActiv = false;
                schemaAdd.SchemaNume = "";
                schemaAdd.Continut = "";
                schemaAdd.Tip = "";
                setNeedUpdate(!needUpdate);
            } else {
                alert(c.message);
            }
        } else {
            alert("Vă rugăm să rezolvați erorile!");
        }
    };
    const saveSchemaFilter = async () => {
        if (schemaFilter.SchemaNume || schemaFilter.Continut || schemaFilter.Tip) {
            setNeedUpdate(!needUpdate);
        } else {
            alert("Va rugam sa completati cel putin un camp pentru filtrare!!");
        }
    };
    function resetare() {
        schemaFilter.SchemaNume = "";
        schemaFilter.Tip = "";
        schemaFilter.Continut = "";
        setNeedUpdate(!needUpdate);
    }
    const handleChangeTipEdit = (event) => {
        schemaEdit.Tip = event.target.value;
        schemaEdit.SchimbaTip = true;
        setNeedUpdate(!needUpdate);
    };
    const handleChangeTipAdd = (event) => {
        schemaAdd.Tip = event.target.value;
        schemaAdd.SchimbaTip = true;
        setNeedUpdate(!needUpdate);
    };
    const handleChangeTipFilter = (event) => {
        schemaFilter.Tip = event.target.value;
        schemaFilter.SchimbaTip = true;
        setNeedUpdate(!needUpdate);
    };
    async function sortareHeader(Camp) {
        setPage(0);
        schemaFilter.Asc = actualizeazaModSortare(schemaFilter, Camp);
        setNeedUpdate(!needUpdate);
    }
    return (
        <div>
            <Grid container spacing={1} alignItems='center' justifyContent='center' style={PrimulElementPagina}>
                <Grid item style={{ display: "flex" }}>
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
                            Adaugă schemă
                        </Button>
                    </Tooltip>
                </Grid>
                {localStorage.Tip == "Manager" ? (
                    <Grid item>
                        <Tooltip title='Actualizează schema selectată'>
                            <Button
                                variant='outlined'
                                style={stilButon}
                                startIcon={<EditIcon />}
                                onClick={() => {
                                    if (optiuni.editareVizibila == true) {
                                        document.getElementById("randEditare").style.display = "none";
                                        optiuni.editareVizibila = false;
                                    } else {
                                        document.getElementById("randEditare").style.display = "flex";
                                        optiuni.editareVizibila = true;
                                    }
                                }}
                            >
                                Actualizează
                            </Button>
                        </Tooltip>
                    </Grid>
                ) : null}

                <Grid item>
                    <Tooltip title={optiuni.filtruVizibil == true ? optiuni.ascundeFiltreaza : optiuni.afiseazaFiltreaza}>
                        <Button
                            variant='outlined'
                            style={stilButon}
                            startIcon={<FilterListIcon />}
                            onClick={() => {
                                if (optiuni.filtruVizibil == true) {
                                    let filtru = document.getElementById("filtru");
                                    filtru.style.display = "none";
                                    optiuni.filtruVizibil = false;
                                } else {
                                    let filtru = document.getElementById("filtru");
                                    filtru.style.display = "flex";
                                    optiuni.filtruVizibil = true;
                                }
                                setNeedUpdate(!needUpdate);
                            }}
                        >
                            Filtrează
                        </Button>
                    </Tooltip>
                </Grid>
                <Grid item>
                    <Tooltip title='Navigați către pagina cu mesaje'>
                        <Button
                            variant='outlined'
                            style={stilButon}
                            startIcon={<MessageIcon />}
                            onClick={() => {
                                navigate(`/${localStorage.Tip}/Schema/Mesaj`);
                            }}
                        >
                            Mesaje
                        </Button>
                    </Tooltip>
                </Grid>
                <Grid item>
                    <Tooltip title='Navigați către pagina cu emailuri'>
                        <Button
                            variant='outlined'
                            style={stilButon}
                            startIcon={<EmailIcon />}
                            onClick={() => {
                                navigate(`/${localStorage.Tip}/Schema/Email`);
                            }}
                        >
                            Email
                        </Button>
                    </Tooltip>
                </Grid>
            </Grid>
            {localStorage.Tip == "Manager" ? (
                <Grid container alignItems='center' justifyContent='center' id='randEditare' style={{ display: "none" }}>
                    <Grid item xs={11} sm={4}>
                        <TextField
                            autoFocus
                            margin='dense'
                            id='SchemaNumeEdit'
                            name='SchemaNume'
                            label='Nume'
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            variant='outlined'
                            style={stilTextField}
                            value={schemaEdit.SchemaNume}
                            required
                            error={eroareSchemaNume(schemaEdit.SchemaNume) == " " ? false : true}
                            helperText={eroareSchemaNume(schemaEdit.SchemaNume)}
                            onChange={(e) => onChangeSchemaEdit(e)}
                        />
                    </Grid>

                    <Grid item xs={11} sm={4}>
                        <InputLabel id='selectLabelEdit' fullWidth>
                            Tip
                        </InputLabel>
                        <Select
                            labelId='selectLabelEdit'
                            id='selectEdit'
                            value={schemaEdit.Tip}
                            label='Tip'
                            fullWidth
                            variant='outlined'
                            style={stilSelect}
                            onChange={handleChangeTipEdit}
                        >
                            <MenuItem value={"Email"}>Email</MenuItem>
                            <MenuItem value={"Mesaj"}>Mesaj</MenuItem>
                        </Select>
                    </Grid>
                    <Grid item xs={11}>
                        <TextField
                            autoFocus
                            margin='dense'
                            id='ContinutEdit'
                            name='Continut'
                            label='Continut'
                            fullWidth
                            multiline
                            required
                            variant='outlined'
                            style={stilTextField}
                            InputLabelProps={{ shrink: true }}
                            value={schemaEdit.Continut}
                            error={eroareSchemaContinut(schemaEdit.Continut) == " " ? false : true}
                            helperText={eroareSchemaContinut(schemaEdit.Continut)}
                            onChange={(e) => onChangeSchemaEdit(e)}
                        />
                    </Grid>
                    <Button variant='outlined' style={stilButon} startIcon={<SaveIcon />} onClick={saveSchemaEdit}>
                        Actualizează
                    </Button>
                </Grid>
            ) : null}
            <Grid container spacing={1} alignItems='center' justifyContent='center' id='randAdaugare' style={{ display: "none" }}>
                <Grid item xs={11} sm={4}>
                    <TextField
                        autoFocus
                        margin='dense'
                        id='SchemaNumeAdd'
                        name='SchemaNume'
                        label='Nume'
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                        required
                        variant='outlined'
                        style={stilTextField}
                        error={eroareSchemaNume(schemaAdd.SchemaNume) == " " ? false : true}
                        helperText={eroareSchemaNume(schemaAdd.SchemaNume)}
                        value={schemaAdd.SchemaNume}
                        onChange={(e) => onChangeSchemaAdd(e)}
                    />
                </Grid>
                <Grid item xs={11} sm={4}>
                    <TextField
                        autoFocus
                        margin='dense'
                        id='ContinutAdd'
                        name='Continut'
                        label='Continut'
                        fullWidth
                        multiline
                        variant='outlined'
                        style={stilTextField}
                        InputLabelProps={{ shrink: true }}
                        value={schemaAdd.Continut}
                        required
                        error={eroareSchemaContinut(schemaAdd.Continut) == " " ? false : true}
                        helperText={eroareSchemaContinut(schemaAdd.Continut)}
                        onChange={(e) => onChangeSchemaAdd(e)}
                    />
                </Grid>

                <Grid item xs={11} sm={4}>
                    <InputLabel id='selectLabelAdd' fullWidth>
                        Tip
                    </InputLabel>
                    <Select
                        labelId='selectLabelAdd'
                        id='selectAdd'
                        value={schemaAdd.Tip}
                        label='Tip'
                        fullWidth
                        variant='outlined'
                        style={stilSelect}
                        onChange={handleChangeTipAdd}
                    >
                        <MenuItem value={"Email"}>Email</MenuItem>
                        <MenuItem value={"Mesaj"}>Mesaj</MenuItem>
                    </Select>
                </Grid>

                <Button startIcon={<AddIcon />} onClick={saveSchemaAdd} style={stilButon} variant='outlined'>
                    Adaugă
                </Button>
            </Grid>

            <Grid container spacing={1} alignItems='center' justifyContent='center' id='filtru' style={{ display: "none" }}>
                <Grid item xs={11} sm={4}>
                    <TextField
                        autoFocus
                        margin='dense'
                        id='SchemaNumeFilter'
                        name='SchemaNume'
                        label='Numele schemei sa contina'
                        variant='outlined'
                        style={stilTextField}
                        fullWidth
                        value={schemaFilter.SchemaNume}
                        onChange={(e) => onChangeSchemaFilter(e)}
                    />
                </Grid>
                <Grid item xs={11} sm={4}>
                    <TextField
                        autoFocus
                        margin='dense'
                        id='ContinutFilter'
                        name='Continut'
                        label='Continutul schemei sa contina'
                        variant='outlined'
                        style={stilTextField}
                        fullWidth
                        value={schemaFilter.Continut}
                        onChange={(e) => onChangeSchemaFilter(e)}
                    />
                </Grid>
                <Grid item xs={11} sm={4}>
                    <InputLabel id='selectLabelFilter' fullWidth>
                        Tip
                    </InputLabel>
                    <Select
                        labelId='selectLabelFilter'
                        id='selectFilter'
                        value={schemaFilter.Tip}
                        label='Tip'
                        fullWidth
                        variant='outlined'
                        style={stilSelect}
                        onChange={handleChangeTipFilter}
                    >
                        <MenuItem value={"Email"}>Email</MenuItem>
                        <MenuItem value={"Mesaj"}>Mesaj</MenuItem>
                    </Select>
                </Grid>
                <Grid item xs={11} sm={4}>
                    <Button variant='outlined' style={stilButon} startIcon={<SearchIcon />} onClick={saveSchemaFilter}>
                        Filtrare
                    </Button>{" "}
                </Grid>
                <Grid item xs={11} sm={4}>
                    <Button variant='outlined' style={stilButon} startIcon={<SearchIcon />} onClick={resetare}>
                        Resetare filtre
                    </Button>
                </Grid>
            </Grid>

            <br />
            <Grid container>
                <Grid item xs={12} sm={12} alignItems='center' justifyContent='center'>
                    <TableContainer component={Paper} style={stilTabel}>
                        <Table aria-label='simple table'>
                            <TableHead>
                                <TableRow>
                                    <Tooltip
                                        title={
                                            "Ordonare dupa nume " +
                                            (schemaFilter.Camp == "SchemaNume" ? (schemaFilter.Asc == "asc" ? "descendent" : "ascendent") : "ascendent")
                                        }
                                    >
                                        <TableCell
                                            style={stilTableHeadCell}
                                            onClick={(e) => {
                                                sortareHeader("SchemaNume");
                                            }}
                                            align='center'
                                        >
                                            <Button
                                                variant='text'
                                                style={stilTableHeadCell}
                                                startIcon={
                                                    schemaFilter.Camp == "SchemaNume" ? (
                                                        schemaFilter.Asc == "asc" ? (
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
                                            "Ordonare dupa continut " +
                                            (schemaFilter.Camp == "Continut" ? (schemaFilter.Asc == "asc" ? "descendent" : "ascendent") : "ascendent")
                                        }
                                    >
                                        <TableCell
                                            style={stilTableHeadCell}
                                            onClick={(e) => {
                                                sortareHeader("Continut");
                                            }}
                                            align='center'
                                        >
                                            <Button
                                                variant='text'
                                                style={stilTableHeadCell}
                                                startIcon={
                                                    schemaFilter.Camp == "Continut" ? (
                                                        schemaFilter.Asc == "asc" ? (
                                                            <ArrowDownwardIcon />
                                                        ) : (
                                                            <ArrowUpwardIcon />
                                                        )
                                                    ) : (
                                                        <SortIcon />
                                                    )
                                                }
                                            >
                                                Conținut
                                            </Button>
                                        </TableCell>
                                    </Tooltip>
                                    <Tooltip
                                        title={
                                            "Ordonare dupa tip " +
                                            (schemaFilter.Camp == "Tip" ? (schemaFilter.Asc == "asc" ? "descendent" : "ascendent") : "ascendent")
                                        }
                                    >
                                        <TableCell
                                            style={stilTableHeadCell}
                                            onClick={(e) => {
                                                sortareHeader("Tip");
                                            }}
                                            align='center'
                                        >
                                            <Button
                                                variant='text'
                                                style={stilTableHeadCell}
                                                startIcon={
                                                    schemaFilter.Camp == "Tip" ? (
                                                        schemaFilter.Asc == "asc" ? (
                                                            <ArrowDownwardIcon />
                                                        ) : (
                                                            <ArrowUpwardIcon />
                                                        )
                                                    ) : (
                                                        <SortIcon />
                                                    )
                                                }
                                            >
                                                Tip
                                            </Button>
                                        </TableCell>
                                    </Tooltip>

                                    <TableCell align='center' style={stilTableHeadCell}>
                                        Număr Generări
                                    </TableCell>
                                    {localStorage.Tip == "Manager" ? (
                                        <TableCell align='center' style={stilTableHeadCell}>
                                            Editare
                                        </TableCell>
                                    ) : (
                                        <TableCell align='center' style={stilTableHeadCell}>
                                            Generează
                                        </TableCell>
                                    )}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                                    <TableRow key={row.SchemaId}>
                                        <TableCell align='center'>{row.SchemaNume}</TableCell>
                                        <TableCell align='center'>{row.Continut}</TableCell>
                                        <TableCell align='center'>{row.Tip}</TableCell>
                                        <TableCell align='center'>{row.Generate.length}</TableCell>

                                        {localStorage.Tip == "Manager" ? (
                                            <TableCell align='center'>
                                                <Tooltip title='Editeaza'>
                                                    <IconButton
                                                        onClick={() => {
                                                            schemaEdit.SchemaId = row.SchemaId;
                                                            schemaEdit.SchemaNume = row.SchemaNume;
                                                            schemaEdit.Continut = row.Continut;
                                                            schemaEdit.Tip = row.Tip;

                                                            setNeedUpdate(!needUpdate);
                                                        }}
                                                    >
                                                        <EditIcon style={stilEditIcon} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title='Sterge'>
                                                    <IconButton onClick={() => deleteSchema(row, index)}>
                                                        <DeleteIcon color='secondary' />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title='Genereaza'>
                                                    <IconButton onClick={() => navigate(`/${localStorage.Tip}/Schema/${row.Tip}/${row.SchemaId}`)}>
                                                        <ArrowCircleRightIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        ) : (
                                            <TableCell align='center'>
                                                <Tooltip title='Genereaza'>
                                                    <IconButton onClick={() => navigate(`/${localStorage.Tip}/Schema/${row.Tip}/${row.SchemaId}`)}>
                                                        <ArrowCircleRightIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
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
