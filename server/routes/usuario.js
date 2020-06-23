const express = require('express');
const bcrypt = require('bcrypt');
const app = express();
const Usuario = require('../models/usuario');
const _ = require('underscore');

app.get('/usuario', function(req, res) {


    let desde = req.query.desde || 0 //Desde el registro que indique el usuario o sino desde el primer registro
    desde = Number(desde); //Lo transformamos de string a number

    let limite = req.query.limite || 5
    limite = Number(limite);

    //Como segundo parámetro de find se pueden mandar los campos que deseamos mostrar. Ej. ('nombre email')
    Usuario.find({ estado: true /*aquí iría una condición*/ }, 'nombre email')
        .skip(desde) //Para saltar los primeros 5
        .limit(limite) //Para solo traer máximo 5 registros
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                })
            }

            Usuario.count({ estado: true /*aquí iría una condición*/ }, (err, conteo) => {


                res.json({
                    ok: true,
                    usuarios,
                    cuantos: conteo
                });
            })

        });
})
app.post('/usuario', function(req, res) {

    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        //usuarioDB.password = null


        res.json({
            ok: true,
            usuario: usuarioDB
        });
    })
})
app.put('/usuario/:id', function(req, res) {

    let id = req.params.id;

    //De esta manera, gracias a la librería underscore puedo copiar un objeto solo con las propiedades que yo quiera
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

    /**Agrego el objeto de options con la propiedad new true para que devuelva el usuario actualizado
     * Agrega tambien runValidators para que las validaciones que aplique en el modelo de usuario se apliquen en el
     * UPDATE
     * 
     * Como el objeto body ya esta filtrado, al pasarlo como parámetros ya solo se podran actualizar las propiedades
     * que tiene el objeto body
     */
    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {

        if (err) return res.status(400).json({
            ok: false,
            err
        });

        res.json({
            ok: true,
            usuario: usuarioDB
        })
    })

})

app.delete('/usuario/:id', function(req, res) {

    let id = req.params.id;
    let cambiaEstado = {
        estado: false
    }

    Usuario.findByIdAndUpdate(id, cambiaEstado, { new: true, runValidators: true }, (err, usuarioDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
});

//Así se borra un registro de la bd
// app.delete('/usuario/:id', function(req, res) {

//     let id = req.params.id;

//     Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

//         if (err) {
//             return res.status(400).json({
//                 ok: false,
//                 err
//             });
//         };

//         //Se agrega esta validación porque aunque el usuario no existe no devuelve error
//         if (!usuarioBorrado) {
//             return res.status(400).json({
//                 ok: false,
//                 err: {
//                     message: 'Usuario no encontrado'
//                 }
//             });
//         }

//         res.json({
//             ok: true,
//             usuario: usuarioBorrado
//         });
//     });
// });

module.exports = app