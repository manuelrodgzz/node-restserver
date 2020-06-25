const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);
const app = express();
const Usuario = require('../models/usuario');

app.post('/login', (req, res) => {

    let body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: '(Usuario) o contraseña incorrectos'
                }
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {

            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o (contraseña) incorrectos'
                }
            });
        }

        const token = jwt.sign({
                usuario: usuarioDB
            }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN }) //Expira en 30 días

        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        });
    });

});


//Configuraciones de Google
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    
    console.log(payload.name);
    console.log(payload.email);
    console.log(payload.picture);

    return{
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

/**Esta ruta sirve para iniciar sesión mediante google. Si el usuario ya se había registrado por autenticacion normal
 * (Usuario y contraseña) no debe de poder ingresar con google, y viceversa.
 */
app.post('/google', async(req, res) => {
    const token = req.body.idtoken;

    //verify(); es una función de google-auth-library para verificar que el token no haya sido manipulado
    const googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                err: e
            });
        });

    //Si ya existía un usuario con el mismo email que el de a cuenta de google ingresada
    Usuario.findOne({email: googleUser.email}, (err, usuarioDB) => {

        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }

        //Si se encontró un usuario con el correo ingresado por google
        if(usuarioDB) {

            /*Y si el usuario encontrado no se registró con google, entonces mandamos error para que entre mediante 
            correo y contraseña*/
            if(usuarioDB.google === false){
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Debe de usar su autenticación normal'
                    }
                });
            }else{ //Pero si el usuario se registró con google desde el principio, entonces creo el token

                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, {expiresIn: process.env.CADUCIDAD_TOKEN})


                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            }
        }else{ //Si el correo de google no existe en la BD, entonces es un usuario nuevo y se registra

            let usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)'
            /**Ingresamos una password cualquier ya que es requerida para la BD, pero con esta no se podrá iniciar sesión */

            usuario.save((err, usuarioDB) => {

                if(err){
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }

                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, {expiresIn: process.env.CADUCIDAD_TOKEN})


                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            });
        }

    });
});



module.exports = app