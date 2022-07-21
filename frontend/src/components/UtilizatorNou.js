import { useState, useEffect } from "react";
import { get, post, put, remove } from "../Calls";
import { Button, Paper, MenuItem, Grid, TextField, IconButton, InputLabel, Select } from "@material-ui/core";
import LoginIcon from "@mui/icons-material/Login";
import SaveIcon from "@mui/icons-material/Save";
import { utilizatorRoute } from "../ApiRoutes";
import { useNavigate, useParams } from "react-router-dom";
import { stilButonLogin, stilTextField } from "./ConstanteStil";
import { numarCaractereNume, numarCaractereNumeUtilizator, numarCaractereParola, numarCaractere } from "./Consts";
import { eroareUtilizatorNume, eroareParola, eroareNume, verificareDisponibilitateUtilizatorNume } from "./Functii";

export default function UtilizatorNou() {
    const [utilizatorNou, setUtilizatorNou] = useState({
        UtilizatorNume: "",
        Parola: "",
        Tip: "Angajat",
        Nume: "",
    });

    const [needUpdate, setNeedUpdate] = useState(false);
    const navigate = useNavigate();
    useEffect(async () => {}, [needUpdate]);

    const onChangeUtilizatorNou = (e) => {
        setUtilizatorNou({ ...utilizatorNou, [e.target.name]: e.target.value });
    };
    function eroareUtilizatorNou() {
        return (
            eroareParola(utilizatorNou.Parola) != " " &&
            eroareUtilizatorNume(utilizatorNou.UtilizatorNume) != " " &&
            utilizatorNou.Nume.length < numarCaractere.Utilizator.Nume
        );
    }
    const saveUtilizatorNou = async () => {
        if (utilizatorNou.UtilizatorNume && utilizatorNou.Parola && utilizatorNou.Nume) {
            if (!eroareUtilizatorNou()) {
                let verificare = await get(utilizatorRoute + "/UtilizatorNume/" + utilizatorNou.UtilizatorNume);
                if (verificare.length == 0) {
                    let utilizator = await post(utilizatorRoute, utilizatorNou);
                    if (utilizator.status == 400) {
                        alert(utilizator.message);
                    } else {
                        if (utilizator) {
                            localStorage.setItem("UtilizatorId", utilizator.UtilizatorId);
                            localStorage.setItem("UtilizatorNume", utilizator.UtilizatorNume);
                            localStorage.setItem("Parola", utilizator.Parola);
                            localStorage.setItem("Nume", utilizator.Nume);
                            localStorage.setItem("Tip", utilizator.Tip);
                            if (utilizator.Tip == "Manager") {
                                navigate(`/Manager`);
                            } else {
                                navigate(`/Angajat`);
                            }
                        }
                    }
                }
            }
        } else alert("Va rugam sa completati utilizatorul, parola si numele complet!!");
    };

    return (
        <div>
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <Grid container spacing={8} justifyContent='center'>
                <Grid item xs={10} sm={8} md={3}>
                    <TextField
                        autoFocus
                        style={stilTextField}
                        margin='dense'
                        id='UtilizatorNume'
                        name='UtilizatorNume'
                        type='text'
                        fullWidth
                        required
                        label='Nume utilizator'
                        value={utilizatorNou.UtilizatorNume}
                        variant='outlined'
                        error={eroareUtilizatorNume(utilizatorNou.UtilizatorNume) == " " ? false : true}
                        helperText={eroareUtilizatorNume(utilizatorNou.UtilizatorNume)}
                        onChange={(e) => onChangeUtilizatorNou(e)}
                    />
                </Grid>
                <Grid item xs={10} sm={8} md={3}>
                    <TextField
                        autoFocus
                        style={stilTextField}
                        margin='dense'
                        id='Parola'
                        name='Parola'
                        type='password'
                        label='Parola'
                        value={utilizatorNou.Parola}
                        variant='outlined'
                        required
                        error={eroareParola(utilizatorNou.Parola) == " " ? false : true}
                        helperText={eroareParola(utilizatorNou.Parola)}
                        onChange={(e) => onChangeUtilizatorNou(e)}
                    />
                </Grid>
                <Grid item xs={10} sm={8} md={3}>
                    <TextField
                        style={stilTextField}
                        error={eroareNume(utilizatorNou.Nume) == " " ? false : true}
                        margin='dense'
                        id='Nume'
                        name='Nume'
                        type='text'
                        required
                        helperText={eroareNume(utilizatorNou.Nume)}
                        label='Nume complet'
                        variant='outlined'
                        value={utilizatorNou.Nume}
                        onChange={(e) => onChangeUtilizatorNou(e)}
                    />
                </Grid>
            </Grid>
            <br />
            <Button style={stilButonLogin} variant='outlined' startIcon={<SaveIcon />} onClick={saveUtilizatorNou}>
                Crează cont
            </Button>
            <br />
            <br />
            <Button style={stilButonLogin} variant='outlined' startIcon={<LoginIcon />} onClick={() => navigate(`/`)}>
                Autentificare
            </Button>
        </div>
    );
}
