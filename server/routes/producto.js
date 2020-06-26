const express = require('express');
const {verificaToken, verificaAdmin_Role} = require('../middlewares/autenticacion');
let app = express();
let Producto = require('../models/producto');
const _ = require('underscore');


//========================
//Obtener productos
//========================
app.get('/productos', verificaToken, (req, res) => {

    /**Trae los productos
     * populate: usuario categoria
     * paginado
     */

     const desde = req.params.desde;
     const hasta = req.params.hasta;

    Producto.find({})
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .skipe(desde)
        .limit(hasta)
        .exec((err, productosDB) => {
            if(err){
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos: productosDB
            });
        });
});

//========================
//Obtener producto por ID
//========================
app.get('/productos/:id', verificaToken, (req, res) => {

    /**
     * populate: usuario categoria
     * paginado
     */

     const id = req.params.id;

     Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {
        
            if(err){
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
    
            if(!productoDB){
                return res.status(404).json({
                    ok:false,
                    err: {
                        message: 'No se encontró producto'
                    }
                });
            }
    
            res.json({
                ok: true,
                productoDB
            })
        });
});

//========================
//Buscar productos
//========================
app.get('/productos/buscar/:termino', verificaToken, (req, res) => {

    /**Esta ruta sirve para realizar busquedas sin la necesidad de que se escriba tal cual la descripcion de la 
     * categoría
     */
    const termino = req.params.termino;
    const regex = new RegExp(termino, 'i'); //La i en regex es para que no sea sensible a mayusculas ni minusculas

    Producto.find({nombre: regex})
    .populate('categoria', 'descripcion')
    .exec((err, productos) => {

        if(err){
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            productos
        })
    });
});

//========================
//Crear un nuevo producto
//========================
app.post('/productos', verificaToken, (req, res) => {

    /**Grabar usuario
     * Grabar una categoria del listado
     * 
     */

    const body = req.body;

     let productoNuevo = new Producto({

        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.categoria,
        usuario: req.usuario._id
     });

     productoNuevo.save((err, productoBD) => {

        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!productoBD){
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            producto: productoBD
        });
     });
});

//========================
//Actualizar productos
//========================
app.put('/productos/:id', verificaToken, (req, res) => {

    const id = req.params.id;
    const body = _.pick(req.body, ['nombre', 'precioUni', 'descripcion', 'disponible','categoria']);

    if(!id){
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Debe ingresar ID de producto'
            }
        });
    }

    Producto.findByIdAndUpdate(id, body, {new: true, runValidators: true}, (err, productoDB) => {

        if(err){
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });
    });
});

//========================
//Borrar productos
//========================
app.delete('/productos/:id', verificaToken, (req, res) => {

    /**
     * Modificar el estado del producto (disponible: false)
     */

    const id = req.params.id;
    const noDisponible = {disponible: false}

    if(!id){
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Debe ingresar ID de producto'
            }
        });
    }



    Producto.findByIdAndUpdate(id, noDisponible, {new: true, runValidators: true}, (err, productoDB) => {

        if(err){
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });
    });
});


module.exports = app;