var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));

var fs = require('fs');
var dbFile = './.data/sqlite.db';
var exists = fs.existsSync(dbFile);
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(dbFile);

db.serialize(function() {
  if (!exists) {
    db.run('CREATE TABLE Donors (donor_name TEXT, donations_count INT)');
    db.run('CREATE TABLE DonationsMeta (counter_name TEXT, donations_count INT)');
    console.log('New table Donors and DonationsMeta created!');

    // insert default donations
    db.serialize(function() {
      db.run('INSERT INTO Donors (donor_name, donations_count) VALUES ("johnny", 1)');
      db.run('INSERT INTO DonationsMeta (counter_name, donations_count) VALUES ("anonymous", 0)');
      db.run('INSERT INTO DonationsMeta (counter_name, donations_count) VALUES ("named", 1)');
    });
  } else {
    console.log('Database "Donors" and "DonationsMeta" ready to go!');
  }
});

app.get('/', function(request, response) {
  // response.sendFile(__dirname + "/views/index.html");
  response.status(200).send('OK');
});

// anonymous donor
app.get('/donate', (req, res) => {
  // db.get('SELECT 1 FROM DonationsMeta WHERE id = "anonymous"')
  db.run('UPDATE DonationsMeta SET donations_count = donations_count + 1 WHERE id = "anonymous"');
});

app.get('/test', (req, res) => {
  let finalResults = {
    donors: {},
    donationsMeta: {}
  };
  db.all('SELECT * FROM Donors', (err_1, res_1) => {
    finalResults.donors = res_1;
    db.all('SELECT * FROM DonationsMeta', (err_2, res_2) => {
      console.log(res_2);
      finalResults.donationsMeta = res_2;
      res.status(200).send(JSON.stringify(finalResults));
    });
  });
});

app.get('/donate/:donor', (req, res) => {
  // If donor exists, increment value at that donor name. Otherwise, create a new entry with that name with a value of 1.
  if (req && req.params && req.params.donor) {
    let donorName = req.params.donor;
    if (typeof donorName === 'string' && donorName.length > 1 && !/[^a-zA-Z0-9]/.test(donorName)) {
      donorName = donorName.toLowerCase();
      const getDonationsCount = `SELECT donations_count FROM Donors WHERE donor_name = "${donorName}"`;
      db.get(getDonationsCount, (err, entry) => {
        if (err) {
          res.status(404).send('Not found. Error:\n' + JSON.stringify(err));
          return console.log('Not found. Error:\n', JSON.stringify(err));
        }
        if (entry && entry.donations_count && !isNaN(Number(entry.donations_count))) {
          const donationsCount = entry.donations_count + 1;
          console.log('total donations for', donorName, donationsCount);
          const incrementDonationsCount = `UPDATE Donors SET donations_count = ${donationsCount} WHERE donor_name = "${donorName}"`;
          const incrementNamedDonationsCount = 'UPDATE DonationsMeta SET donations_count = donations_count + 1 WHERE counter_name = "named"';

          db.serialize(() => {
            db.run(incrementDonationsCount);
            db.run(incrementNamedDonationsCount);
          });
          res.status(200).send(`total donations: ${donationsCount}`);
        } else {
          const addNewDonor = `INSERT INTO Donors (donor_name, donations_count) VALUES ("${donorName}", 1)`;
          db.run(addNewDonor);
          res.status(200).send(`Added new donor ${donorName}!`)
        }
      });
    }
  }
});

app.get('/donations', (req, res) => {
  db.all('SELECT * from Donors', (err, rows) => {
    res.send(JSON.stringify(rows));
  });
});

// app.get("/getDreams", function(request, response) {
//   db.all("SELECT * from Dreams", function(err, rows) {
//     response.send(JSON.stringify(rows));
//   });
// });

var listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
