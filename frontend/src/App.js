import logo from "./logo.svg";
import "./App.css";
import Login from "./components/Login.js";
import UtilizatorNou from "./components/UtilizatorNou.js";

import { BrowserRouter, Route, Routes } from "react-router-dom";

import Genereaza from "./components/Genereaza.js";

import Produs from "./components/Produs.js";
import Client from "./components/Client.js";
import Comanda from "./components/Comanda.js";
import ManagerAngajati from "./components/ManagerAngajati.js";
import ManagerActivitati from "./components/ManagerActivitati.js";
import ManagerActivitatiAngajat from "./components/ManagerActivitatiAngajat.js";
import Activitati from "./components/Activitati.js";
import GestioneazaCont from "./components/GestioneazaCont.js";
import ManagerSituatie from "./components/ManagerSituatie.js";
import MainManager from "./components/MainManager.js";
import Schema from "./components/Schema";
import EmailSauMesaj from "./components/EmailSauMesaj.js";
import MainAngajat from "./components/MainAngajat";
import Meniu from "./components/Meniu";

function App() {
    return (
        <div className='App'>
            <BrowserRouter>
                <Routes>
                    {/* Login, Gestionare cont si Cont nou*/}
                    <Route path='/' element={<Login />} />
                    <Route path='/UtilizatorNou' element={<UtilizatorNou />} />
                    <Route
                        path='/:TipUtilizator/Cont'
                        element={
                            <div>
                                <Meniu /> <GestioneazaCont />
                            </div>
                        }
                    />
                    {/*Pagini principale*/}
                    <Route path='/Angajat' element={<MainAngajat />} />
                    <Route path='/Manager' element={<MainManager />} />
                    {/* Produs, Clienti si Comenzi*/}
                    <Route
                        path='/:TipUtilizator/Produs'
                        element={
                            <div>
                                <Meniu />
                                <Produs />
                            </div>
                        }
                    />
                    <Route
                        path='/:TipUtilizator/Client'
                        element={
                            <div>
                                <Meniu />
                                <Client />
                            </div>
                        }
                    />
                    <Route
                        path='/:TipUtilizator/Comanda'
                        element={
                            <div>
                                <Meniu />
                                <Comanda />
                            </div>
                        }
                    />
                    {/* Scheme personalizate*/}
                    <Route
                        path='/:TipUtilizator/Schema'
                        element={
                            <div>
                                <Meniu />
                                <Schema />
                            </div>
                        }
                    />
                    <Route
                        path='/:TipUtilizator/Schema/:Tip'
                        element={
                            <div>
                                <Meniu /> <EmailSauMesaj />
                            </div>
                        }
                    />
                    <Route
                        path='/:TipUtilizator/Schema/:Tip/:SchemaId'
                        element={
                            <div>
                                <Meniu /> <Genereaza />
                            </div>
                        }
                    />
                    {/*Angajati si Activitati*/}
                    <Route path='/:TipUtilizator/Angajati' element={<ManagerAngajati />} />
                    <Route path='/:TipUtilizator/Activitati/Angajati' element={<ManagerActivitati />} />
                    <Route
                        path='/:TipUtilizator/Activitati'
                        element={
                            <div>
                                <Meniu />
                                <Activitati />
                            </div>
                        }
                    />
                    <Route path='/:TipUtilizator/Activitati/:UtilizatorId' element={<ManagerActivitatiAngajat />} />
                    {/*Situatii magazin*/}
                    <Route
                        path='/:TipUtilizator/Situatie'
                        element={
                            <div>
                                <Meniu /> <ManagerSituatie />
                            </div>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
