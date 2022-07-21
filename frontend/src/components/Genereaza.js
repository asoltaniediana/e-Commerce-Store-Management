import { useState, useEffect } from "react";
import { get, post, put, remove } from "../Calls";
import { Button, Paper, Table, TableBody, TableCell, TableRow, TableContainer, Grid, TextField, TableHead, InputLabel } from "@material-ui/core";
import SaveIcon from "@material-ui/icons/Save";
import { schemaRoute, generatRoute, variabileSchemaRoute } from "../ApiRoutes";
import { useNavigate, useParams } from "react-router-dom";
import { PrimulElementPagina, stilButon, stilTabel, stilTableHeadCell } from "./ConstanteStil";
export default function Genereaza() {
    const routerParams = useParams();
    const [generatAdd, setGeneratAdd] = useState({
        SchemaNume: "",
        Continut: "",
        UtilizatorId: localStorage.UtilizatorId,
        SchemaId: routerParams.SchemaId,
    });
    const [schema, setSchema] = useState({
        SchemaId: routerParams.SchemaId,
        SchemaNume: "",
        Continut: "",
        Tip: routerParams.Tip,
        Generat: false,
        UtilizatorId: 0,
        Generate: [],
    });
    const [stilTextField] = useState({
        width: "90%",
        margin: "10px",
    });
    const [rows, setRows] = useState([]);
    const [needUpdate, setNeedUpdate] = useState(false);
    const navigate = useNavigate();
    const [variabile, setVariabile] = useState([]);
    const [valoriVariabile, setValoriVariabile] = useState([]);
    function variabileSchema(Continut) {
        let v = [];
        let variabila = "";
        for (let i = 0; i < Continut.length; i++) {
            if (Continut[i] == "{" && Continut[i + 1] == "{") {
                i = i + 2;
                while ((Continut[i] != "}" && Continut[i + 1] != "}") || (Continut[i] != "}" && Continut[i + 1] == "}")) {
                    variabila = variabila.concat(Continut[i]);
                    i++;
                }
                i++;
                v.push(variabila);
                variabila = "";
            }
        }
        return v;
    }
    function completeazaSchema(ContinutSchema, variabileSchema, Variabile) {
        let completat = ContinutSchema;
        for (let i = 0; i < variabileSchema.length; i++) {
            completat = completat.replace(`{{${variabileSchema[i]}}}`, Variabile[i]);
        }
        return completat;
    }
    useEffect(async () => {
        let data = await get(schemaRoute + "/" + routerParams.SchemaId);
        if (!data) {
            if (localStorage.Tip == "Manager") {
                navigate("/Manager/Schema");
            } else {
                navigate("/Angajat/Schema");
            }
        }
        if (data.Tip != schema.Tip) {
            navigate(`/${localStorage.Tip}/Schema/${data.Tip}/${data.SchemaId}`);
        }
        schema.Continut = data.Continut;
        schema.SchemaId = data.SchemaId;
        schema.Tip = data.Tip;
        schema.SchemaNume = data.SchemaNume;
        schema.UtilizatorId = data.UtilizatorId;
        generatAdd.SchemaNume = schema.SchemaNume;
        setRows(data.Generate);
        data = variabileSchema(schema.Continut);
        setVariabile(data);
        setValoriVariabile([]);
    }, [needUpdate]);
    function onChange(i, e) {
        valoriVariabile[i] = e.target.value;
    }
    const saveGeneratAdd = async () => {
        let verificare = 0;
        for (let i = 0; i < valoriVariabile.length; i++) {
            if (valoriVariabile[i] != "") {
                verificare++;
            }
        }
        if (variabile.length == verificare) {
            console.log(completeazaSchema(schema.Continut, variabile, valoriVariabile));
            generatAdd.Continut = completeazaSchema(schema.Continut, variabile, valoriVariabile);
            await post(generatRoute + "/" + generatAdd.SchemaId + "/" + generatAdd.UtilizatorId, generatAdd);
            schema.Generat = true;
            navigator.clipboard.writeText(generatAdd.Continut);
            setNeedUpdate(!needUpdate);
        } else alert("Trebuie sa completati toate campurile");
    };
    return (
        <div>
            <Grid container style={PrimulElementPagina}>
                <Grid container justifyContent='center'>
                    <Grid item xs={12}>
                        <InputLabel style={{ padding: "10px" }}>{schema.Continut}</InputLabel>
                    </Grid>
                    {variabile.map((row, index) => (
                        <Grid item xs={12} sm={7}>
                            <TextField
                                variant='outlined'
                                autoFocus
                                margin='dense'
                                label={row}
                                fullwidth
                                size='large'
                                style={stilTextField}
                                value={valoriVariabile[index]}
                                onChange={(e) => onChange(index, e)}
                            />
                        </Grid>
                    ))}
                </Grid>
                <br />
                <br />
                <br />
                <Grid container justifyContent='center'>
                    <Grid item alignItems='center' xs={11} sm={6} justifyContent='center'>
                        <Button variant='outlined' startIcon={<SaveIcon />} style={stilButon} onClick={saveGeneratAdd}>
                            Generează
                        </Button>
                    </Grid>
                    {schema.Tip == "Email" ? (
                        <Grid item alignItems='center' xs={12} sm={7} justifyContent='center'>
                            <TextField
                                multiline
                                autoFocus
                                margin='dense'
                                variant='outlined'
                                label='Subiect'
                                style={stilTextField}
                                value={generatAdd.SchemaNume}
                            />
                        </Grid>
                    ) : null}

                    <Grid item alignItems='center' xs={12} sm={7} justifyContent='center'>
                        <TextField multiline autoFocus margin='dense' variant='outlined' label='Conținut' style={stilTextField} value={generatAdd.Continut} />
                    </Grid>
                    {schema.Generat == true ? (
                        <Grid item alignItems='center' xs={12} sm={7} justifyContent='center'>
                            <InputLabel style={{ padding: "10px" }}>{`Conținutul generat a fost copiat cu succes!`}</InputLabel>
                        </Grid>
                    ) : null}
                </Grid>
                <br />
                <br />
            </Grid>
            <Grid container xs={12}>
                <Grid item xs={12}>
                    <TableContainer component={Paper} style={stilTabel}>
                        <Table aria-label='simple table'>
                            <TableHead>
                                <TableRow>
                                    <TableCell align='center' style={stilTableHeadCell}>
                                        Generări pentru această schemă
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.map((row, index) => (
                                    <TableRow>
                                        <TableCell align='center'>{row.Continut}</TableCell>
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
