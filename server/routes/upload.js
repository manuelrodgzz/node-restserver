const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const fs = require('fs');
const path = require('path');
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

app.use(fileUpload({useTempFiles: true}));

app.put('/upload/:tipo/:id', function(req,res){
    
    const tipo = req.params.tipo;
    const id = req.params.id;

    if(!req.files){
        return res.status(404).json({
            ok:false,
            err: {
                message: 'No se ha cargado ningún archivo'
            }
        });
    }


    //Validar tipo
    const tiposValidos = ['productos', 'usuarios'];
    if(!tiposValidos.includes(tipo)){
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Los tipos validos son: ' + tiposValidos.join(', '),
                tipo
            }
        })
    }

    //req.files.[nombre de input de file upload]
    let archivo = req.files.archivo;

    //Extensiones permitidas
    const extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
    const nombreCortado = archivo.name.split('.');
    const extension = nombreCortado[nombreCortado.length-1];

    if(!extensionesValidas.includes(extension)){
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las extensiones validas son: ' + extensionesValidas.join(', '),
                ext: extension
            }
        })
    }
    
    //Cambiar nombre al archivo
    /*Agrego milisegundos para así cada que se actualice la imagen aunque tenga el mismo nombre no cause problemas el cache
    del explorador*/
    const nombreArchivo = `${id}-${new Date().getMilliseconds() }.${extension}`;
    
    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
        
        if(err)
            return res.status(500).json({
                ok: false,
                err
            });

        if(tipo === 'usuarios')
            imagenUsuario(id, res, nombreArchivo)

        if(tipo === 'productos')
            imagenProducto(id, res, nombreArchivo)
        
    });
});

//La funcion recibirá la response como parametro ya que como es objeto, usa valor por referencia y puedo enviar la res.
function imagenUsuario(id, res, nombreArchivo){
    
    Usuario.findById(id, (err, usuarioBD) => {
        if(err){

            borraArchivo(nombreArchivo, 'usuarios') //Si ocurrió un error entonces borro la imagen nueva ya que no se usó
            return res.status(500).json({
                ok:false,
                err
            });
        }
        
        if(!usuarioBD){
            borraArchivo(nombreArchivo, 'usuarios') //Si no existe el usuario entonces borro la imagen nueva ya que no se usó
            return res.status(400).json({
                ok:false,
                err: {
                    mssage: 'El usuario no existe'
                }
            });
        }

        borraArchivo(usuarioBD.img, 'usuarios')
        
        usuarioBD.img = nombreArchivo;

        usuarioBD.save((err, usuarioGuardado) => {

            if(err){
                return res.status(500).json({
                    ok:false,
                    err
                });
            }
            
            res.json({
                ok:true,
                usuario: usuarioGuardado
            })


        });
    });
}

function imagenProducto(id, res, nombreArchivo){

    Producto.findById(id, (err, productoBD) => {

        if(err){
            borraArchivo(nombreArchivo, 'productos')
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!productoBD){
            borraArchivo(nombreArchivo, 'productos')
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El producto no existe'
                }
            });
        }
        
        if(productoBD.img)
            borraArchivo(productoBD.img, 'productos');

        productoBD.img = nombreArchivo

        productoBD.save((err, productoGuardado) => {

            if(err)
                return res.status(500).json({
                    ok: false,
                    err
                });

            res.json({
                ok: true,
                producto: productoGuardado
            });
        });
    });


}

function borraArchivo(nombreImagen, tipo){

    //Obtengo el url de la imagen antigua del usuario para posteriormente borrarla
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);

    if(fs.existsSync(pathImagen)){

        fs.unlinkSync(pathImagen) //Se borra la imagen del servidor si es que existe
    }
}
module.exports = app