import { useState, useEffect } from "react";
import * as React from "react";
import { get, post, put, remove } from "../Calls";
import { Button, Paper, Table, TableBody, TableCell, TableRow, TableContainer, InputLabel, Select, Grid, TextField, TableHead } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import { PieChart } from "react-minimal-pie-chart";
import { numarActivitatiNefinalizate, legentPieChart, label, stareActivitate } from "./Functii.js";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { link, utilizatorRoute, tipUtilizatorRoute } from "../ApiRoutes";
import { useNavigate } from "react-router-dom";
import { procentFinalizare } from "./Functii.js";
import "../App.css";
import { PrimulElementPagina, stilButon, stilTableHeadCell } from "./ConstanteStil";
import Meniu from "./Meniu";
export default function MainManager() {
    const [rowsProcentFinalizare, setRowsProcentFinalizare] = useState([]);
    const [rowsTop, setRowsTop] = useState([]);
    const [needUpdate, setNeedUpdate] = useState(false);
    const navigate = useNavigate();
    const [datePieStareActivitati, setDatePieStareActivitati] = useState({});
    const [stilHeadLegenda, setStilHeadLegenda] = useState({
        padding: "1px",
        textTransform: "uppercase",
        fontSize: "medium",
    });
    useEffect(async () => {
        let data = await get(utilizatorRoute);
        data = data.filter((obj) => obj.UtilizatorId != localStorage.UtilizatorId);
        data.sort((a, b) => procentFinalizare(b.Activitati) - procentFinalizare(a.Activitati));
        setRowsProcentFinalizare(data);
        setDatePieStareActivitati(await genereazaPieChartStareActivitati());
        document.getElementById("Chart1").style.display = "flex";
    }, [needUpdate]);
    async function genereazaPieChartStareActivitati() {
        let route = link + "activitateFilter/-/" + localStorage.UtilizatorId + "/-/-/-/-/-/-/-/";
        let stariActivitati = {
            Nefinalizata: {
                Valoare: 0,
                Culoare: "#FFD740",
            },
            TimpExpirat: {
                Valoare: 0,
                Culoare: "#FF7043",
            },
            Finalizata: {
                Valoare: 0,
                Culoare: "#81C784",
            },
        };

        let data = await get(route);
        for (let i in data) {
            if (stareActivitate(data[i]) == "Nefinalizata") {
                stariActivitati.Nefinalizata.Valoare++;
            } else {
                if (stareActivitate(data[i]) == "Finalizata") {
                    stariActivitati.Finalizata.Valoare++;
                } else {
                    stariActivitati.TimpExpirat.Valoare++;
                }
            }
        }
        let datePie = [];
        for (let camp in stariActivitati) {
            if (stariActivitati[camp].Valoare != 0)
                datePie.push({
                    title: camp == "TimpExpirat" ? "Timp Expirat" : camp,
                    value: stariActivitati[camp].Valoare,
                    color: stariActivitati[camp].Culoare,
                    percent: ((stariActivitati[camp].Valoare / data.length) * 100).toFixed(2),
                });
        }
        datePie.sort((a, b) => b.percent - a.percent);

        return datePie;
    }
    return (
        <div>
            <Meniu />
            <br />
            <Grid container spacing={3} alignItems='center' justifyContent='center' style={PrimulElementPagina}>
                <Grid
                    item
                    xs={12}
                    sm={12}
                    md={8}
                    alignItems='center'
                    justifyContent='center'
                    style={{
                        marginLeft: "2%",
                        marginRight: "2%",
                        width: "94%",
                    }}
                >
                    <TableContainer component={Paper}>
                        <Table aria-label='simple table'>
                            <TableHead>
                                <TableRow style={stilTableHeadCell}>
                                    <Tooltip title={"Accesare pagina cu toti utilizatorii "}>
                                        <TableCell align='center' colSpan={2} onClick={() => navigate(`/Manager/Angajati`)}>
                                            <Button variant='outlined' style={stilButon}>
                                                Vizualizați toți utilizatorii
                                            </Button>
                                        </TableCell>
                                    </Tooltip>
                                    <Tooltip title={"Accesare pagina cu toate activitatile adaugate de tine "}>
                                        <TableCell align='center' colSpan={2} onClick={() => navigate(`/Manager/Activitati/Angajati`)}>
                                            <Button variant='outlined' style={stilButon}>
                                                Activități adăugate
                                            </Button>
                                        </TableCell>
                                    </Tooltip>
                                </TableRow>
                                <TableRow>
                                    <TableCell align='center' colSpan={4}>
                                        TOP 3 ANGAJAȚI CARE AU CEA MAI MARE RATĂ DE FINALIZARE A ACTIVITĂȚILOR
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell align='center' style={{ textTransform: "uppercase" }}>
                                        Nume
                                    </TableCell>
                                    <TableCell align='center' style={{ textTransform: "uppercase" }}>
                                        Procent finalizare activitați
                                    </TableCell>
                                    <Tooltip title={"Accesare pagina pentru a adauga activitati unui angajat "}>
                                        <TableCell
                                            align='center'
                                            style={{
                                                textTransform: "uppercase",
                                            }}
                                        >
                                            Adaugă Activități
                                        </TableCell>
                                    </Tooltip>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rowsProcentFinalizare.slice(0, 3).map((row, index) => (
                                    <TableRow key={row.UtilizatorId}>
                                        <TableCell align='center'>{row.Nume}</TableCell>
                                        <TableCell align='center'>
                                            {procentFinalizare(row.Activitati) == -1 ? "Nu exista activitati" : procentFinalizare(row.Activitati) + "%"}
                                        </TableCell>
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
                    </TableContainer>
                </Grid>
                <Grid
                    item
                    xs={12}
                    sm={4}
                    md={3}
                    alignItems='center'
                    id='Chart1'
                    justifyContent='center'
                    style={{
                        display: "none",
                        marginLeft: "2%",
                        marginRight: "2%",
                        width: "94%",
                    }}
                >
                    <Grid container alignItems='center' justifyContent='center'>
                        <Grid item xs={12} sm={12} alignItems='left' justifyContent='left' style={{ paddingBottom: "15px" }}>
                            <InputLabel style={{ fontSize: "large", color: "#616161" }}>{`Statusul activităților adăugate`}</InputLabel>
                        </Grid>
                        <Grid item xs={7} sm={6} alignItems='center' justifyContent='center' style={{ marginBottom: "0px" }}>
                            <PieChart
                                data={datePieStareActivitati}
                                lineWidth={55}
                                paddingAngle={1}
                                startAngle={180}
                                label={({ dataEntry }) => label(dataEntry)}
                                labelPosition={100 - 55 / 2}
                                labelStyle={{
                                    fill: "#FAFAFA",
                                    fontFamily: '"Nunito Sans", -apple-system, Helvetica, Arial, sans-serif',
                                    fontSize: "8px",
                                    opacity: 0.8,
                                    fontWeight: "bolder",
                                    pointerEvents: "none",
                                }}
                            />
                        </Grid>

                        <Grid
                            item
                            xs={12}
                            sm={12}
                            alignItems='center'
                            justifyContent='center'
                            style={{
                                marginLeft: "10px",
                                marginRight: "10px",
                                marginTop: "20px",
                            }}
                        >
                            <TableContainer component={Paper}>
                                <Table aria-label='simple table'>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell style={stilHeadLegenda} align='center'>
                                                Status
                                            </TableCell>
                                            <TableCell style={stilHeadLegenda} align='center'>
                                                Număr
                                            </TableCell>
                                            <TableCell style={stilHeadLegenda} align='center' colSpan={2}>
                                                %
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>{legentPieChart(datePieStareActivitati)}</TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </div>
    );
}
