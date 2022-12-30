const mysql = require('mysql');
const process = require('process');

const connection = mysql.createConnection({
	host: 'localhost',
	user: 'admin',
	password: 'keyboardcat',
	database: 'data-converter',
	timezone:'Asia/Tokyo'
});

const execute = (sql, args) => {
	return new Promise( (resolve, reject) => {
		connection.query(sql, args, (err, results, fields) => {
			if(err) {
				return reject(err);
			}
			resolve(results);
		});
	});
}

process.on('beforeExit', (code) => {
	console.log('before exit');
	connection.close();
});

process.on('exit', (code) => {
	console.log('process exit with code ', code);
});


module.exports = { execute };

