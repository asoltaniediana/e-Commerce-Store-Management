import { useState, useEffect } from "react";
import { get, post, put, remove } from "../Calls";
import { Button, Paper, MenuItem, Grid, TextField, IconButton, InputLabel, Select } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";

import LoginIcon from "@mui/icons-material/Login";

import { utilizatorRoute } from "../ApiRoutes";
import { useNavigate, useParams } from "react-router-dom";
import { stilButon, stilButonLogin, stilInformatiiImport, stilTextField } from "./ConstanteStil";
export default function Login() {
    const [login, setLogin] = useState({
        UtilizatorId: "",
        UtilizatorNume: "",
        Parola: "",
        Tip: "Angajat",
        Nume: "",
    });

    const [needUpdate, setNeedUpdate] = useState(false);
    const navigate = useNavigate();

    useEffect(async () => {}, [needUpdate]);

    const onChangeLogin = (e) => {
        setLogin({ ...login, [e.target.name]: e.target.value });
    };

    const saveLogin = async () => {
        if (login.UtilizatorNume && login.Parola) {
            let verificare = await get(utilizatorRoute + "/UtilizatorNume/" + login.UtilizatorNume);
            if (verificare.length > 0) {
                if (login.Parola == verificare[0].Parola) {
                    localStorage.setItem("UtilizatorId", verificare[0].UtilizatorId);
                    localStorage.setItem("UtilizatorNume", verificare[0].UtilizatorNume);
                    localStorage.setItem("Parola", verificare[0].Parola);
                    localStorage.setItem("Nume", verificare[0].Nume);
                    localStorage.setItem("Tip", verificare[0].Tip);
                    if (verificare[0].Tip == "Manager") {
                        navigate(`/Manager`);
                    } else {
                        navigate(`/Angajat`);
                    }
                } else {
                    alert("Parola incorecta");
                }
            } else alert("Acest nume de utilizator nu exista");
        } else alert("Va rugam sa completati utilizatorul si parola!!");
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
            <Grid container justifyContent='center' fullWidth>
                <Grid item xs={10} sm={4}>
                    <TextField
                        autoFocus
                        margin='dense'
                        id='UtilizatorNume'
                        style={stilTextField}
                        name='UtilizatorNume'
                        type='text'
                        fullwidth
                        label='Nume utilizator'
                        variant='outlined'
                        value={login.UtilizatorNume}
                        onChange={(e) => onChangeLogin(e)}
                    />
                </Grid>
            </Grid>
            <Grid container justifyContent='center' fullWidth>
                <Grid item xs={10} sm={4}>
                    <TextField
                        autoFocus
                        margin='dense'
                        id='Parola'
                        name='Parola'
                        style={stilTextField}
                        type='password'
                        fullWidth
                        label='Parola'
                        value={login.Parola}
                        variant='outlined'
                        onChange={(e) => onChangeLogin(e)}
                    />
                </Grid>
            </Grid>
            <br />
            <Button variant='outlined' style={stilButonLogin} startIcon={<LoginIcon />} onClick={saveLogin}>
                Autentificare
            </Button>
            <br />
            <br />
            <Button variant='outlined' style={stilButonLogin} startIcon={<AddIcon />} onClick={() => navigate(`/UtilizatorNou`)}>
                Crează cont
            </Button>
        </div>
    );
}
