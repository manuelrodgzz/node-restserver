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
 * BASE DE DATOS
 */

let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe'
} else {
    urlDB = 'mongodb+srv://cafe-user:210897mm@cluster0-wgfmj.mongodb.net/cafe?retryWrites=true&w=majority';
}

process.env.URLDB = urlDB;