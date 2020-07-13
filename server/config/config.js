/**PUERTO
 * Si existe la variable PORT en el environment se usará ese puerto, si no, el 8080
 */
process.env.PORT = process.env.PORT || 8080

/**
 * ENTORNO
 */
//NODE_ENV es una variable que crea heroku. Si existe no pasa nada, pero si no existe esta variable se entiende que es local
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

/**
 * SEED AUTENTICACION
 * (Cree una variable en heroku para que funcione el condicional)
 */

process.env.SEED = process.env.SEED || 'este-es-el-seed-desarrollo'

/**
 * VENCIMIENTO TOKEN
 */
process.env.CADUCIDAD_TOKEN = '48h'

/**
 * BASE DE DATOS
 */

/**Guarde una variable de entorno en heroku llamada MONGO_URL con la url a la db de atlas. Le concateno el 
 * '&w=majority' porque al ingresar esos caracteres en lina de comandos detecta que w=majority es un nuevo comando.
 */
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe'
} else {
    urlDB = process.env.MONGO_URL + '&w=majority';
}

process.env.URLDB = urlDB;


/**
 * Google Client ID Esto se agregó por si fueramos a cambiar el ID, pero debería se siempre funcionar con el
 * que da por defecto google
 */

 process.env.CLIENT_ID = process.env.CLIENT_ID || '111702688539-q85k6fqtfjotfvj2rtk7mlf4ghbtmibj.apps.googleusercontent.com';