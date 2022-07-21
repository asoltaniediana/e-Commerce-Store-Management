import { useState, useEffect } from "react";
import * as React from "react";
import { get, post, put, remove } from "../Calls";
import { Button, Paper, Table, TableBody, TableCell, TableRow, TableContainer, InputLabel, Select, Grid, TextField, TableHead } from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import IconButton from "@mui/material/IconButton";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import Tooltip from "@mui/material/Tooltip";
import { link, schemaRoute } from "../ApiRoutes";
import { useNavigate, useParams } from "react-router-dom";
import "../App.css";
import { createSchemaFilterRoute } from "./Functii";
import { PrimulElementPagina, stilTabel, stilTextField, stilButon, stilTableHeadCell } from "./ConstanteStil";
export default function EmailSauMesaj() {
    const routerParams = useParams();
    const [schemaFilter, setSchemaFilter] = useState({
        SchemaNume: "",
        Continut: "",
        Tip: routerParams.Tip,
        Camp: "",
        Asc: "",
        filtruActiv: true,
    });

    const [rows, setRows] = useState([]);
    const [needUpdate, setNeedUpdate] = useState(false);
    const navigate = useNavigate();

    useEffect(async () => {
        let data = await get(createSchemaFilterRoute(schemaFilter));
        setRows(data);
    }, [needUpdate]);
    const onChangeSchemaFilter = (e) => {
        setSchemaFilter({ ...schemaFilter, [e.target.name]: e.target.value });
    };
    const saveSchemaFilter = async () => {
        if (schemaFilter.SchemaNume || schemaFilter.Continut) {
            schemaFilter.filtruActiv = true;
            setNeedUpdate(!needUpdate);
        } else {
            alert("Va rugam sa completati cel putin un camp pentru filtrare!!");
        }
    };
    function resetare() {
        schemaFilter.Continut = "";
        schemaFilter.SchemaNume = "";
        setNeedUpdate(!needUpdate);
    }
    return (
        <div>
            <Grid container spacing={1} alignItems='center' justifyContent='center' style={PrimulElementPagina}>
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
            </Grid>
            <Grid container spacing={1} xs={12} sm={12} alignItems='center' justifyContent='center'>
                <Button variant='outlined' startIcon={<SearchIcon />} onClick={saveSchemaFilter} style={stilButon}>
                    Filtrare
                </Button>

                <Button variant='outlined' style={stilButon} startIcon={<SearchIcon />} onClick={resetare}>
                    Resetare filtre
                </Button>
            </Grid>
            <br />
            <Grid container spacing={3}>
                <Grid item xs={12} sm={12} alignItems='center' justifyContent='center'>
                    <TableContainer component={Paper} style={stilTabel}>
                        <Table aria-label='simple table'>
                            <TableHead style={stilTableHeadCell}>
                                <TableRow>
                                    <TableCell align='center'>Nume</TableCell>
                                    <TableCell align='center'>Conținut</TableCell>
                                    <TableCell align='center'>Număr Generări</TableCell>
                                    <TableCell align='center'>Generează</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.map((row, index) => (
                                    <TableRow key={row.SchemaId}>
                                        <TableCell align='center'>{row.SchemaNume}</TableCell>
                                        <TableCell align='center'>{row.Continut}</TableCell>
                                        <TableCell align='center'>{row.Generate.length}</TableCell>
                                        <TableCell align='center'>
                                            <Tooltip title='Genereaza'>
                                                <IconButton onClick={() => navigate(`/${localStorage.Tip}/Schema/${row.Tip}/${row.SchemaId}`)}>
                                                    <ArrowCircleRightIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>
        </div>
    );
}
