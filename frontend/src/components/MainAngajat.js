import { useState, useEffect } from "react";
import * as React from "react";
import { get, put } from "../Calls";
import { Button, Paper, Table, TableBody, TableCell, TableRow, TableContainer, InputLabel, Grid, TableHead } from "@material-ui/core";
import { PieChart } from "react-minimal-pie-chart";
import { legentPieChart, label, stareActivitate } from "./Functii.js";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { link, utilizatorRoute } from "../ApiRoutes";
import { useNavigate } from "react-router-dom";
import { procentFinalizare, formatData, styleStareActivitate } from "./Functii.js";
import "../App.css";
import { PrimulElementPagina, stilNotificariIcon, stilTabel, stilTableHeadCell, stilTableHeadCellLight } from "./ConstanteStil";
import Meniu from "./Meniu";
export default function MainAngajat() {
    const [needUpdate, setNeedUpdate] = useState(false);
    const navigate = useNavigate();
    const [rows, setRows] = useState([]);
    const [rowsNotificare, setRowsNotificare] = useState([]);
    const [datePieStareActivitati, setDatePieStareActivitati] = useState({});
    const [stilHeadLegenda, setStilHeadLegenda] = useState({
        padding: "1px",
        textTransform: "uppercase",
        fontSize: "medium",
    });
    useEffect(async () => {
        let data = await get(utilizatorRoute);
        data.sort((a, b) => procentFinalizare(b.Activitati) - procentFinalizare(a.Activitati));
        setDatePieStareActivitati(await genereazaPieChartStareActivitati());
        document.getElementById("Chart1").style.display = "flex";
        let n = await get(link + "Notificari/" + localStorage.UtilizatorId);
        setRowsNotificare(n);
        console.log(n);
        let saptamanaAceasta = new Date();
        saptamanaAceasta.setDate(saptamanaAceasta.getDate() + 7);
        console.log(saptamanaAceasta.getFullYear());
        console.log(saptamanaAceasta.getMonth() + 1);
        console.log(saptamanaAceasta.getUTCDate());

        let saptamana =
            saptamanaAceasta.getFullYear() +
            "-" +
            (saptamanaAceasta.getMonth() < 9 ? "0" + (saptamanaAceasta.getMonth() + 1) : saptamanaAceasta.getMonth() + 1) +
            "-" +
            (saptamanaAceasta.getUTCDate < 10 ? "" + "0" + saptamanaAceasta.getUTCDate() : saptamanaAceasta.getUTCDate());
        console.log(saptamana);
        // /activitateFilter/:UtilizatorId/:ManagerId/:Nume/:Detalii/:Stare/:DataMinima/:DataMaxima/:Camp/:Asc
        data = await get(link + "activitateFilter/" + localStorage.UtilizatorId + "/-/-/-/Nefinalizata/-/" + saptamana + "/-/-/");
        setRows(data);
    }, [needUpdate]);
    async function genereazaPieChartStareActivitati() {
        let route = link + "activitateFilter/" + localStorage.UtilizatorId + "/-/-/-/-/-/-/-/-/";
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
        console.log(data);
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
    async function actualizeazaNotificari() {
        ///stareActivitate/:UtilizatorId/:ActivitateId
        let activitate = await put(link + "Notificari", localStorage.UtilizatorId);
        setNeedUpdate(!needUpdate);
    }
    function nuExistaNotificari() {
        document.getElementById("TableHead").style.display = "none";
        return (
            <TableRow>
                <TableCell colSpan={"5"}>Nu aveți notificări</TableCell>
            </TableRow>
        );
    }
    return (
        <div>
            <Meniu />
            <Grid container style={PrimulElementPagina} alignItems='center' justifyContent='center' direction='row'>
                <Grid item xs={12} md={Object.keys(datePieStareActivitati).length > 0 ? 8 : 12} style={{ marginTop: "40px" }}>
                    <TableContainer component={Paper} style={stilTabel}>
                        {rowsNotificare.length == 0 ? (
                            <Table aria-label='simple table'>
                                <TableHead id='TableHead'>
                                    <TableRow style={stilTableHeadCellLight}>
                                        <TableCell
                                            colSpan={"5"}
                                            align='center'
                                            style={{
                                                textTransform: "uppercase",
                                            }}
                                        >
                                            Nu există notificări
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                            </Table>
                        ) : (
                            <Table aria-label='simple table'>
                                <TableHead style={stilTableHeadCellLight}>
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
                        )}
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
                    {Object.keys(datePieStareActivitati).length > 0 ? (
                        <Grid container alignItems='center' justifyContent='center' style={{ marginTop: "20px" }}>
                            <Grid item xs={12} sm={12} alignItems='left' justifyContent='left' style={{ paddingBottom: "15px" }}>
                                <InputLabel style={{ fontSize: "large", color: "#616161" }}>{`Statusul activităților`}</InputLabel>
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
                    ) : null}
                </Grid>
                {rows.length != 0 ? (
                    <Grid item xs={12} sm={12} alignItems='center' style={{ marginTop: "20px", marginBottom: "40px" }} justifyContent='center'>
                        <TableContainer component={Paper} style={stilTabel}>
                            <Table aria-label='simple table'>
                                <TableHead style={stilTableHeadCellLight}>
                                    <TableRow>
                                        <TableCell
                                            colSpan={"4"}
                                            align='center'
                                            style={{
                                                textTransform: "uppercase",
                                            }}
                                        >
                                            Activități care trebuie finalizate în următoarea săptămână
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
                                    {rows.map((row, index) => (
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
                ) : (
                    <Grid item xs={12} style={{ marginTop: "20px" }}>
                        <TableContainer style={stilTabel}>
                            <Table>
                                <TableHead>
                                    <TableRow style={stilTableHeadCellLight}>
                                        <TableCell align='center'>NU AVEȚI ACTIVITĂȚI CARE TREBUIE FINALIZATE ÎN URMĂTOAREA SĂPTĂMÂNĂ</TableCell>
                                    </TableRow>
                                </TableHead>
                            </Table>
                        </TableContainer>
                    </Grid>
                )}
            </Grid>
        </div>
    );
}
