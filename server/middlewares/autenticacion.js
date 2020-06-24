const jwt = require('jsonwebtoken');

//VERIFICAR TOKEN

/**Esta función verifica que el token sea correcto (comprueba con la SEED que defini en config.js) y
 * a la request le agrega el objeto usuario (este objeto usuario se obtuvo del token)
 */
const verificaToken = (req, res, next) => {

    //req.get sirve para obtener los headers 
    const token = req.get('token');

    jwt.verify(token, process.env.SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                err
            });
        }

        req.usuario = decoded.usuario;
        next();
    });
};

/** 
 * VERIFICA ROL
 */

const verificaAdmin_Role = (req, res, next) => {

    const role = req.usuario.role;
    console.log(role);
    if (role !== 'ADMIN_ROLE') {
        return res.status(401).json({
            ok: false,
            err: {
                message: 'Necesita permisos de administrador para esta solicitud'
            }
        });
    }

    next();
}

module.exports = {
    verificaToken,
    verificaAdmin_Role
}