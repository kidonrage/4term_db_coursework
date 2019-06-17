const mysql = require('mysql');
const express = require('express');
const bodyParser = require('body-parser');
const dateFormat = require('dateformat');

var app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));
// Import js and css files for Bootstrap
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/js', express.static(__dirname + '/node_modules/tether/dist/js'));
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/css', express.static(__dirname + '/styles'));
// Configure tamplate engine
app.set('view engine', 'ejs');

var db_config = {
  host: 'localhost',
	user: 'root',
	password: 'toortest',
	database: 'dbcoursework'
};

var mysqlConnection;

function handleDisconnect() {
  mysqlConnection = mysql.createConnection(db_config); // Recreate the connection, since
                                                  // the old one cannot be reused.

  mysqlConnection.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }                                     // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
	mysqlConnection.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
}

handleDisconnect();

const siteTitle = "DB COURSEWORK";
const baseURL = "http://localhost:8080";

mysqlConnection.connect((err) => {
	if(!err) {
		console.log('DB connection succeded.')
	} else {
		console.log('DB connection failed:\n' + JSON.stringify(err))
	}
});

app.listen(8080, () => console.log('Express server is up and running on :8080!'));

// Redirect from the root url
app.get('/', (req, res) => {
	res.redirect(baseURL + '/sells');
})

// Render sells page
app.get('/sells', (req, res) => {
	mysqlConnection.query('SELECT * FROM clients', (err, rows, fields) => {
		if (!err) {
			res.render('pages/sells', {
				siteTitle: siteTitle,
				pageTitle: 'Все продажи',
				items: rows
			});
			console.log(rows)
		} else {
			console.log("Error! " + err);
		}
	})
})


// Render goods page
app.get('/goods', (req, res) => {
	mysqlConnection.query('SELECT * FROM clients', (err, rows, fields) => {
		if (!err) {
			res.render('pages/goods', {
				siteTitle: siteTitle,
				pageTitle: 'Все товары',
				items: rows
			});
			console.log(rows)
		} else {
			console.log("Error! " + err);
		}
	})
})


// Render sellers page
app.get('/sellers', (req, res) => {
	mysqlConnection.query('SELECT * FROM clients', (err, rows, fields) => {
		if (!err) {
			res.render('pages/sellers', {
				siteTitle: siteTitle,
				pageTitle: 'Все продавцы',
				items: rows
			});
			console.log(rows)
		} else {
			console.log("Error! " + err);
		}
	})
})

// Render clients page
app.get('/clients', (req, res) => {
	mysqlConnection.query('SELECT * FROM clients', (err, rows, fields) => {
		if (!err) {
			res.render('pages/clients', {
				siteTitle: siteTitle,
				pageTitle: 'Все покупатели',
				items: rows
			});
			console.log(rows)
		} else {
			console.log("Error! " + err);
		}
	})
})

// Add
app.get('/test/add', (req, res) => {
	res.render('pages/add-client', {
		siteTitle: siteTitle,
		pageTitle: 'Добавить нового покупателя',
	});
})
app.post('/test/add/', (req, res) => {
	var query = 	'INSERT INTO clients values(';
	query += 			"'" + req.body.name + "'";
	query += 			", '" + req.body.inn + "'";
	query += 			", '" + req.body.director + "'";
	query += 			", '" + req.body.phoneDir + "'";
	query += 			", '" + req.body.address + "'";
	query += 			", '" + req.body.bank + "'";
	query += 			", '" + req.body.account + "'";
	query += 			');';

	mysqlConnection.query(query, (err, rows, fields) => {
		if (!err) {
			res.redirect(baseURL);
		} else {
			console.log('Error! ' + err);
		}
	});
})

// Edit
app.get('/test/edit/:id', (req, res) => {
	mysqlConnection.query('SELECT * FROM testTable where id=\'' + req.params.id + '\'', (err, rows) => {
		if (!err) {
			res.render('pages/edit', {
				siteTitle: siteTitle,
				pageTitle: 'Editing: ' + rows[0].name,
				item: rows
			});
		} else {
			console.log('Error!\n' + err)
		}
	});
});
app.post('/test/edit/:id', (req, res) => {
	var query = "UPDATE testTable SET ";
	query += "name='" + req.body.name + "' ";
	query += "where id=" + req.body.id;

	mysqlConnection.query(query, (err, rows) => {
		if (rows.affectedRows) {
			res.redirect(baseURL)
		} else {
			console.log('Error!\n' + err)
		}
	});
});

// Delete
app.get('/test/delete/:id', (req, res) => {
	mysqlConnection.query('DELETE FROM clients where InnClient=\'' + req.params.id + '\'', (err, rows) => {
		if (rows.affectedRows) {
			res.redirect(baseURL)
		} else {
			console.log('Error!\n' + err)
		}
	});
});


app.get('/getHelpData/:type', (req, res) => {
	mysqlConnection.query('SELECT * FROM ' + req.params.type, (err, rows) => {
		if (!err) {
			res.send(rows)
		} else {
			console.log('Error fetching banks: ' + err)
		}
	});
});
app.post('/addHelpData', (req, res) => {
	var query = 	'INSERT INTO ' + req.body.target + ' (name) values(';
	query += 			"'" + req.body.name + "'";
	query += 			');';
	mysqlConnection.query(query, (err, rows, fields) => {
		if (!err) {
			res.send({
				request: req.body,
				id: rows.insertId
			})
			console.log("Row for " + req.body.name + " help data added! " + rows.insertId)
		} else {
			console.log('Error! ' + err);
		}
	});
})
app.get('/deleteHelpData/:type/:id', (req, res) => {
	mysqlConnection.query('DELETE FROM '+ req.params.type +' where id=\'' + req.params.id + '\'', (err, rows) => {
		if (rows.affectedRows) {
			res.send(req.params.id)
		} else {
			console.log('Error!\n' + err)
		}
	});
});