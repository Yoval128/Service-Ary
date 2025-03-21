const mysql = require('mysql');

const connection = mysql.createConnection({
/*   host: 'db.xdn.com.mx',
  user: 'ary',
  password: 'BkJaHuM0dJjB8Ilo',
  database: 'ary' */
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ary'
});


connection.connect((err) => {
  if (err) {
    console.error('Error de conexión a la base de datos:', err);
    return;
  }
  console.log('Conexión a la base de datos exitosa');
});

module.exports = connection;
