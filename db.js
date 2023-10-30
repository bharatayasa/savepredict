require('dotenv').config();
const mysql = require('mysql');

const dbConfig = {
    host     : process.env.DB_HOST,
    user     : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database : process.env.DB_DATABASE,
};

const conn = mysql.createConnection(dbConfig);

conn.connect((err) => {
    if (err) {
        console.error('Koneksi ke database gagal: ' + err.message);
    } else {
        console.log('Koneksi ke database berhasil');
    }
});

module.exports = conn;
