const mysql = require('mysql');
const express = require('express');
const bodyParser = require('body-parser');
const dateFormat = require('dateformat');
const multer = require('multer');
const path = require('path');

var app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));

// Setup storage
const storage = multer.diskStorage({
	destination: './public/uploads/',
	filename: function(req, file, cb) {
		cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
	}
});

// Init upload
const upload = multer({
	storage: storage
}).single('picture');

// Import js and css files for Bootstrap
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/js', express.static(__dirname + '/node_modules/tether/dist/js'));
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/js', express.static(__dirname + '/scripts'));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/css', express.static(__dirname + '/styles'));
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));
// Configure tamplate engine
app.set('view engine', 'ejs');

var db_config = {
  host: 'YOUR_HOST_HERE',
	user: 'YOUR_USER_HERE',
	password: 'YOUR_PASSWORD_HERE',
	database: 'dbcoursework',
	multipleStatements: true
};

var mysqlConnection;

function handleDisconnect() {
	mysqlConnection = mysql.createConnection(db_config); // Recreate the connection, since the old one cannot be reused.
	
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
const baseURL = "YOUR_HOST_HERE";

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
	mysqlConnection.query('SELECT * FROM goods ORDER BY GoodsID DESC', (err, rows, fields) => {
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
app.post('/goods/add', (req, res) => {
	upload(req, res, (err) => {
		if (!err) {
			var query = 	'INSERT INTO goods (Goods, Picture, Category, DateStart, Period, Manufacturer, Unit, CostUnit, Count) values(';
			query +=      "'"+ req.body.goodsName +"', ";
			query +=      "'"+ req.file.filename +"', ";
			query +=      "'"+ req.body.category +"', ";
			query +=      "'"+ dateFormat(req.body.dateStart, "yyyy-mm-dd") +"', ";
			query +=      + req.body.period +", ";
			query +=      "'"+ req.body.manufacturer +"', ";
			query +=      "'"+ req.body.unit +"', ";
			query +=      + req.body.costUnit + ", ";
			query +=      + req.body.count;
			query += 			');';
			mysqlConnection.query(query, (err, rows, fields) => {
				if (!err) {
					res.redirect(baseURL + '/goods')
					console.log("New row for goods table added. ID:" + rows.insertId);
				} else {
					console.log('Error inserting row for goods table: ' + err);
				}
			});
		} else {
			console.log("Error uploading image on disk: " + err);
		}
	});
})
// Delete Goods
app.get('/goods/delete/:id', (req, res) => {
	mysqlConnection.query('DELETE FROM clients where GoodsID=\'' + req.params.id + '\'', (err, rows) => {
		if (rows.affectedRows) {
			res.redirect(baseURL + '/goods')
		} else {
			console.log('Error!\n' + err)
		}
	});
});


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


// Help Data methods
app.get('/getHelpData/:type', (req, res) => {
	if (req.params.type === "all") {
		var sendObject = {
			goodsCategories: [],
			banks: [],
			manufacturers: [],
		};
		mysqlConnection.query('select * from goodsCategories; select * from banks; select * from manufacturers', [1, 2, 3], (err, rows) => {
			if (!err) {
				res.send({
					goodsCategories: rows[0],
					banks: rows[1],
					manufacturers: rows[2]
				});
				console.log("YASSSS");
			} else {
				console.log('Error fetching help data: ' + err)
			}
	});
	} else {
		mysqlConnection.query('SELECT * FROM ' + req.params.type, (err, rows) => {
			if (!err) {
				res.send(rows)
			} else {
				console.log('Error fetching help data: ' + err)
			}
		});
	}
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