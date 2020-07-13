const express = require('express');
const fs = require('fs');
const path = require('path');
const {verificaToken} = require('../middlewares/autenticacion')

const app = express();

app.get('/imagen/:tipo/:img', verificaToken, (req, res) => {

    const tipo = req.params.tipo;
    const img = req.params.img;

    const pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${img}`);

    if(fs.existsSync(pathImagen))
        res.sendFile(pathImagen)
    else{

        const noImgPath = path.resolve(__dirname, '../assets/no-image.jpg');
        res.sendFile(noImgPath);
    }
});


module.exports = app;