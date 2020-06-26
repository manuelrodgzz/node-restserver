const express = require('express');
let {verificaToken, verificaAdmin_Role} = require('../middlewares/autenticacion');
let app = express();
const Categoria = require('../models/categoria');
const _ = require('underscore');

//Muestra todas las categorías
app.get('/categoria', verificaToken, (req, res) => {

    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre email') //<- Sirve para mostrar los datos de la tabla usuario, ya que está su ID en coleccion categoria
        .exec((err, categoriasDB) => {

        if(err){
            return res.status(400).json({
                ok: false,
                err
            });
        }

        Categoria.countDocuments((err, conteo) => {

            if(err){
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            return res.json({
                ok: true,
                categoriasDB,
                conteo
            });
        });
    });
});


//Mostrar una categoría por ID
app.get('/categoria/:id', (req, res) => {

    const id = req.params.id;

    Categoria.findById(id, (err, categoriaDB) => {
        if(err){
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    })
});

//Regresa la nueva categoria
app.post('/categoria', verificaToken, (req, res) => {

    const body = req.body;

    const categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id //En la request tengo el usuario que envió la petición gracias a verificaToken
    });

    categoria.save((err, categoriaDB) => {

        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!categoriaDB){
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});



//Actualizar categoría (nombre de categoria)
app.put('/categoria/:id', verificaToken, (req, res) => {

    const id = req.params.id;

    const body = _.pick(req.body, ['descripcion']);

    if(!id) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Debe ingresar un ID de categoría'
            }
        });
    }

    Categoria.findByIdAndUpdate(id, body, {new: true, runValidators: true}, (err, categoriaDB) => {

        if(err){
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});


//Borrar categoría. SOlo un ADMIN puede borrar. No se desactiva, se borra directamente
app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {

    const id = req.params.id;

    if(!id){
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Debe ingresar un ID de catergoría'
            }
        });
    }

    Categoria.findByIdAndRemove(id, (err, categoriaBorrada) => {

        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!categoriaBorrada){
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Categoría no encontrada'
                }
            });
        }

        res.json({
            ok: true,
            categoria: categoriaBorrada
        });
    });
});

module.exports = app