require('./config/config');
const express = require('express')
const mongoose = require('mongoose');
const app = express()
const bodyParser = require('body-parser');

//app.use = middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json()) //Sirve para convertir los parametros del body a json

//Configuración global de rutas
app.use(require('./routes/index'));


mongoose.connect(process.env.URLDB, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true },
    (err, res) => {

        if (err) throw err;

        console.log('Base de datos online');
    })

app.listen(process.env.PORT, () => console.log('Escuchando en puerto: ', process.env.PORT));