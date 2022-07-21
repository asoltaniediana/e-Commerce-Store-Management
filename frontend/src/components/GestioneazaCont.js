import { useState, useEffect } from "react";
import * as React from "react";
import { get, post, put, remove } from "../Calls";
import { Button, Grid, TextField } from "@material-ui/core";

import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { link, utilizatorRoute } from "../ApiRoutes";
import { useNavigate } from "react-router-dom";

import "../App.css";
import { verificareUtilizatorNume, verificareParola, Utilizator_numarCaractereNumeUtilizator, Utilizator_numarCaractereNume } from "./Verificari";

import { stilButon, PrimulElementPagina } from "./ConstanteStil";
export default function GestioneazaCont() {
    const [cont, setCont] = useState({
        UtilizatorId: localStorage.UtilizatorId,
        Nume: localStorage.Nume,
        UtilizatorNume: localStorage.UtilizatorNume,
        Tip: localStorage.Tip,
        Parola: localStorage.Parola,
    });

    const [contModificat, setContModificat] = useState({
        ParolaVeche: "",
        ParolaNoua1: "",
        ParolaNoua2: "",
        NumeVechi: "",
        NumeNou: "",
        UtilizatorNumeVechi: "",
        UtilizatorNumeNou: "",
    });

    const [stilTextField] = useState({
        margin: "10px 20px",
        width: "90%",
    });
    const [optiuni, setOptiuni] = useState({
        schimbaParola: false,
        schimbaNume: false,
        schimbaUtilizatorNume: false,
    });

    const [needUpdate, setNeedUpdate] = useState(false);
    const navigate = useNavigate();
    useEffect(async () => {}, [needUpdate]);

    const onChangeContModificat = (e) => {
        setContModificat({ ...contModificat, [e.target.name]: e.target.value });
    };

    const saveParola = async () => {
        if (contModificat.ParolaVeche != cont.Parola) {
            alert("Parola veche introdusa nu este corecta");
            return;
        }
        if (contModificat.ParolaNoua1 != contModificat.ParolaNoua2) {
            alert("Parola noua nu a fost introdusa de doua ori corect");
            return;
        }
        if (!verificareParola(contModificat.ParolaNoua1)) {
            alert(verificareParola(contModificat.ParolaNoua1));
            return;
        }
        cont.Parola = contModificat.ParolaNoua1;
        let p = await put(utilizatorRoute, cont.UtilizatorId, cont);
        contModificat.ParolaVeche = "";
        contModificat.ParolaNoua1 = "";
        contModificat.ParolaNoua2 = "";
        setNeedUpdate(!needUpdate);
    };
    const saveNume = async () => {
        console.log(cont);
        //verificari
        if (contModificat.NumeVechi != cont.Nume) {
            alert("Numele vechi introdus nu este corect");
            return;
        }
        if (contModificat.NumeNou.length < Utilizator_numarCaractereNume) {
            alert(`Numele trebuie sa contina cel putin ${Utilizator_numarCaractereNume} caractere`);
            return;
        }
        cont.Nume = contModificat.NumeNou;
        let p = await put(utilizatorRoute, cont.UtilizatorId, cont);
        console.log(p);
        contModificat.NumeNou = "";
        contModificat.NumeVechi = "";
        setNeedUpdate(!needUpdate);
    };
    const saveUtilizatorNume = async () => {
        ///utilizator/UtilizatorNume/:UtilizatorNume
        console.log(cont);
        //verificari
        if (contModificat.UtilizatorNumeVechi != cont.UtilizatorNume) {
            alert("Numele de utilizator vechi introdus nu este corect");
            return;
        }
        if (contModificat.UtilizatorNumeNou.length < Utilizator_numarCaractereNumeUtilizator) {
            alert(`Numele  de utilizator trebuie sa contina cel putin ${Utilizator_numarCaractereNumeUtilizator} caractere`);
            return;
        }
        let u = await get(utilizatorRoute + "/UtilizatorNume", contModificat.UtilizatorNumeNou);
        console.log(u);
        console.log(u.length);
        if (u.length != 0) {
            alert(`Numele  de utilizator ales nu este disponibil`);
            return;
        }
        cont.UtilizatorNume = contModificat.UtilizatorNumeNou;
        console.log(cont);
        let p = await put(utilizatorRoute, cont.UtilizatorId, cont);
        console.log(p);
        contModificat.UtilizatorNumeNou = "";
        contModificat.UtilizatorNumeVechi = "";
        setNeedUpdate(!needUpdate);
    };

    return (
        <div>
            <Grid container justifyContent='center' spacing={1} xs={12} sm={12} style={PrimulElementPagina}>
                <Grid item xs={12} sm={7} alignItems='center'>
                    <Button
                        size='large'
                        variant='outlined'
                        style={stilButon}
                        onClick={() => {
                            if (optiuni.schimbaNume == true) {
                                optiuni.schimbaNume = false;
                                document.getElementById("nume").style.display = "none";
                            } else {
                                optiuni.schimbaNume = true;
                                document.getElementById("nume").style.display = "flex";
                            }
                            setNeedUpdate(!needUpdate);
                        }}
                    >
                        Schimbă Nume
                    </Button>
                </Grid>
                <Grid container spacing={1} justifyContent='center' id='nume' style={{ display: "none" }}>
                    <Grid item xs={12} sm={7} alignItems='center'>
                        <TextField
                            autoFocus
                            margin='dense'
                            id='NumeVechi'
                            name='NumeVechi'
                            label='Nume Vechi'
                            variant='outlined'
                            style={stilTextField}
                            fullWidth
                            value={contModificat.NumeVechi}
                            onChange={(e) => onChangeContModificat(e)}
                        />
                    </Grid>

                    <Grid item xs={12} sm={7} alignItems='center' justifyContent='center'>
                        <TextField
                            autoFocus
                            margin='dense'
                            id='NumeNou'
                            name='NumeNou'
                            label='Nume Nou'
                            variant='outlined'
                            style={stilTextField}
                            fullWidth
                            value={contModificat.NumeNou}
                            onChange={(e) => onChangeContModificat(e)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={12}>
                        <Button style={stilButon} variant='outlined' size='large' startIcon={<CheckBoxIcon />} onClick={saveNume}>
                            Salvează nume
                        </Button>
                    </Grid>
                </Grid>
                <Grid item xs={12} sm={12} alignItems='center' justifyContent='center'>
                    <Button
                        style={stilButon}
                        size='large'
                        variant='outlined'
                        onClick={() => {
                            if (optiuni.schimbaUtilizatorNume == true) {
                                optiuni.schimbaUtilizatorNume = false;
                                document.getElementById("utilizatorNume").style.display = "none";
                            } else {
                                optiuni.schimbaUtilizatorNume = true;
                                document.getElementById("utilizatorNume").style.display = "flex";
                            }
                            setNeedUpdate(!needUpdate);
                        }}
                    >
                        Schimbă Numele de Utilizator
                    </Button>
                </Grid>
                <Grid container spacing={1} id='utilizatorNume' justifyContent='center' style={{ display: "none" }}>
                    <Grid item xs={12} sm={7} alignItems='center' justifyContent='center'>
                        <TextField
                            autoFocus
                            margin='dense'
                            id='UtilizatorNumeVechi'
                            name='UtilizatorNumeVechi'
                            label='Nume Utilizator Vechi'
                            variant='outlined'
                            style={stilTextField}
                            fullWidth
                            value={contModificat.UtilizatorNumeVechi}
                            onChange={(e) => onChangeContModificat(e)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={7} alignItems='center' justifyContent='center'>
                        <TextField
                            autoFocus
                            margin='dense'
                            id='UtilizatorNumeNou'
                            name='UtilizatorNumeNou'
                            label='Nume Utilizator Nou'
                            variant='outlined'
                            style={stilTextField}
                            fullWidth
                            value={contModificat.UtilizatorNumeNou}
                            onChange={(e) => onChangeContModificat(e)}
                        />
                    </Grid>

                    <Grid item xs={12} sm={12}>
                        <Button style={stilButon} variant='outlined' size='large' startIcon={<CheckBoxIcon />} onClick={saveUtilizatorNume}>
                            Salvează numele de utilizator
                        </Button>
                    </Grid>
                </Grid>
                <Grid item xs={12} sm={12} alignItems='center' justifyContent='center'>
                    <Button
                        size='large'
                        variant='outlined'
                        style={stilButon}
                        onClick={() => {
                            if (optiuni.schimbaParola == true) {
                                optiuni.schimbaParola = false;
                                document.getElementById("parola").style.display = "none";
                            } else {
                                optiuni.schimbaParola = true;
                                document.getElementById("parola").style.display = "flex";
                            }
                            setNeedUpdate(!needUpdate);
                        }}
                    >
                        Schimbă Parola
                    </Button>
                </Grid>
            </Grid>

            <Grid container spacing={1} id='parola' style={{ display: "none" }} justifyContent='center'>
                <Grid item xs={12} sm={7} alignItems='center' justifyContent='center'>
                    <TextField
                        autoFocus
                        margin='dense'
                        id='ParolaVeche'
                        name='ParolaVeche'
                        label='Parola Veche'
                        variant='outlined'
                        type='password'
                        style={stilTextField}
                        fullWidth
                        value={contModificat.ParolaVeche}
                        onChange={(e) => onChangeContModificat(e)}
                    />
                </Grid>
                <Grid item xs={12} sm={7} alignItems='center' justifyContent='center'>
                    <TextField
                        autoFocus
                        margin='dense'
                        id='ParolaNoua1'
                        name='ParolaNoua1'
                        label='Parola Noua 1'
                        variant='outlined'
                        style={stilTextField}
                        type='password'
                        fullWidth
                        value={contModificat.ParolaNoua1}
                        onChange={(e) => onChangeContModificat(e)}
                    />
                </Grid>
                <Grid item xs={12} sm={7} alignItems='center' justifyContent='center'>
                    <TextField
                        autoFocus
                        margin='dense'
                        id='ParolaNoua2'
                        name='ParolaNoua2'
                        label='Parola Noua 2'
                        variant='outlined'
                        style={stilTextField}
                        type='password'
                        fullWidth
                        value={contModificat.ParolaNoua2}
                        onChange={(e) => onChangeContModificat(e)}
                    />
                </Grid>
                <Grid item xs={12} sm={12}>
                    <Button variant='outlined' size='large' style={stilButon} startIcon={<CheckBoxIcon />} onClick={saveParola}>
                        Salvează parola nouă
                    </Button>
                </Grid>
            </Grid>
        </div>
    );
}
