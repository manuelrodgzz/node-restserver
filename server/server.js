require('./config/config');
const express = require('express')
const mongoose = require('mongoose');
const app = express()
const bodyParser = require('body-parser');
const path = require('path'); //Sirve para trabajar con los directorios

//app.use = middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json()) //Sirve para convertir los parametros del body a json

//Configuración global de rutas
app.use(require('./routes/index'));

//De esta manera permitimos el acceso a la carpeta public desde el explorador
//*__dirname trae el path de la carpeta en donde esta este archivo de js*
app.use(express.static(path.resolve(__dirname, '../public')));

mongoose.connect(process.env.URLDB, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true },
    (err, res) => {

        if (err) throw err;

        console.log('Base de datos online');
    })

app.listen(process.env.PORT, () => console.log('Escuchando en puerto: ', process.env.PORT));