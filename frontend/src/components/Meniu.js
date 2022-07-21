import * as React from "react";
import { useState, useEffect } from "react";
import { get, post, put, remove } from "../Calls";

import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import PersonAdd from "@mui/icons-material/PersonAdd";
import Settings from "@mui/icons-material/Settings";
import Logout from "@mui/icons-material/Logout";
import WidgetsIcon from "@mui/icons-material/Widgets";
import { MenuCell, MenuCellButton } from "./ConstanteStil";
import { Button, Paper, Table, TableBody, TableCell, TableRow, TableContainer, InputLabel, Select, Grid, TextField, TableHead } from "@material-ui/core";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";

import { utilizatorRoute } from "../ApiRoutes";
import { useNavigate, useParams } from "react-router-dom";
import Widgets from "@mui/icons-material/Widgets";
export default function Meniu() {
    const [utilizator, setUtilizator] = useState({
        UtilizatorId: "",
        UtilizatorNume: "",
        Parola: "",
        Tip: localStorage.getItem("Tip"),
        Nume: "",
    });

    const [needUpdate, setNeedUpdate] = useState(false);
    const navigate = useNavigate();
    const routerParams = useParams();
    useEffect(async () => {
        utilizator.UtilizatorId = localStorage.getItem("UtilizatorId");
        utilizator.UtilizatorNume = localStorage.getItem("UtilizatorNume");
        utilizator.Parola = localStorage.getItem("Parola");
        utilizator.Tip = localStorage.getItem("Tip");
        utilizator.Nume = localStorage.getItem("Nume");
        let tip = routerParams.TipUtilizator;
        if (tip != utilizator.Tip) {
            navigate(`/${utilizator.Tip}`);
        }
        if (!utilizator.UtilizatorId || !utilizator.Nume || !utilizator.UtilizatorNume || !utilizator.Parola || !utilizator.Tip) {
            navigate(`/`);
        }
    }, [needUpdate]);
    return (
        <div>
            <React.Fragment>
                <Grid
                    container
                    spacing={3}
                    style={{
                        position: "fixed",
                        opacity: "1",
                        top: "0",
                        zIndex: "99999",
                    }}
                >
                    <Grid item justifyContent='left' xs={12}>
                        <Table aria-label='simple table'>
                            <TableHead className='TableHead'>
                                <TableRow className='MenuRow'>
                                    <TableCell align='left' style={MenuCell}>
                                        <Tooltip title='Gestionare produse'>
                                            <Button style={MenuCellButton} onClick={() => navigate(`/${utilizator.Tip}/Produs`)}>
                                                Produse
                                            </Button>
                                        </Tooltip>
                                        <Tooltip title='Gestionare clienți'>
                                            <Button style={MenuCellButton} onClick={() => navigate(`/${utilizator.Tip}/Client`)}>
                                                Clienți
                                            </Button>
                                        </Tooltip>
                                        <Tooltip title='Gestionare comenzi'>
                                            <Button style={MenuCellButton} onClick={() => navigate(`/${utilizator.Tip}/Comanda`)}>
                                                Comenzi
                                            </Button>
                                        </Tooltip>
                                        <Tooltip title='Gestionare scheme'>
                                            <Button style={MenuCellButton} onClick={() => navigate(`/${utilizator.Tip}/Schema`)}>
                                                Scheme
                                            </Button>
                                        </Tooltip>
                                        <Tooltip title='Gestionare Activități'>
                                            <Button
                                                style={MenuCellButton}
                                                onClick={() =>
                                                    utilizator.Tip == "Angajat"
                                                        ? navigate(`/${utilizator.Tip}/Activitati`)
                                                        : navigate(`/${utilizator.Tip}/Activitati/Angajati`)
                                                }
                                            >
                                                Activități
                                            </Button>
                                        </Tooltip>
                                        {utilizator.Tip == "Manager" ? (
                                            <Tooltip title='Gestionează Angajați'>
                                                <Button style={MenuCellButton} onClick={() => navigate(`/${utilizator.Tip}/Angajati`)}>
                                                    Angajați
                                                </Button>
                                            </Tooltip>
                                        ) : null}
                                        {utilizator.Tip == "Manager" ? (
                                            <Tooltip title='Generează Situație Magazin'>
                                                <Button style={MenuCellButton} onClick={() => navigate(`/${utilizator.Tip}/Situatie`)}>
                                                    Situații
                                                </Button>
                                            </Tooltip>
                                        ) : null}
                                    </TableCell>

                                    <TableCell style={MenuCell} align='right'>
                                        <Tooltip title='Pagina principală'>
                                            <IconButton onClick={() => navigate(`/${utilizator.Tip}`)}>
                                                <Widgets className='Widget' />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title='Gestionare cont'>
                                            <IconButton onClick={() => navigate(`/${utilizator.Tip}/Cont`)} size='small' sx={{ ml: 2 }} aria-haspopup='true'>
                                                <ManageAccountsOutlinedIcon
                                                    className='IconButtonMenu'
                                                    sx={{
                                                        width: 25,
                                                        height: 25,
                                                    }}
                                                />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title='Logout'>
                                            <IconButton
                                                onClick={() => {
                                                    localStorage.setItem("UtilizatorId", 0);
                                                    localStorage.setItem("UtilizatorNume", "");
                                                    localStorage.setItem("Parola", "");
                                                    localStorage.setItem("Nume", "");
                                                    localStorage.setItem("Tip", "");
                                                    navigate(`/`);
                                                }}
                                                size='small'
                                                sx={{ ml: 2 }}
                                                aria-haspopup='true'
                                            >
                                                <Logout
                                                    className='IconButtonMenu'
                                                    sx={{
                                                        width: 25,
                                                        height: 25,
                                                    }}
                                                />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                        </Table>
                    </Grid>
                </Grid>
            </React.Fragment>
        </div>
    );
}
