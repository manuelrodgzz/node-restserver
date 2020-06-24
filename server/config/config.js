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
 * VENCIMIENTO TOKEN
 * (Cree una variable en heroku para que funcione el condicional)
 */

process.env.SEED = process.env.SEED || 'este-es-el-seed-desarrollo'

/**
 * SEED AUTENTICACION
 * 60 seg, 60 min, 24hrs, 30D
 */
process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;

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