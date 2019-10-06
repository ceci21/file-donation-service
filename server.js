const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const timeout = require('connect-timeout');

app.use(timeout('5s'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const fs = require('fs');
const dbFile = './.data/sqlite.db';
const exists = fs.existsSync(dbFile);
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(dbFile);

db.serialize(function() {
  if (!exists) {
    db.run('CREATE TABLE Donors (donor_name TEXT, donation_count INT)');
    db.run('CREATE TABLE DonationsMeta (counter_name TEXT, donation_count INT)');
    console.log('New table Donors and DonationsMeta created!');

    // insert default donations
    db.serialize(function() {
      db.run('INSERT INTO Donors (donor_name, donation_count) VALUES ("johnny", 1)');
      db.run('INSERT INTO DonationsMeta (counter_name, donation_count) VALUES ("anonymous", 0)');
      db.run('INSERT INTO DonationsMeta (counter_name, donation_count) VALUES ("named", 1)');
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
  try {
    db.run('UPDATE DonationsMeta SET donation_count = donation_count + 1 WHERE counter_name = "anonymous"');
    res.status(200).send('Successful anonymous donation');
  } catch (err) {
    console.log(err);
    res.status(500).send(JSON.stringify(err));
  }
});

app.get('/donationData', (req, res) => {
  // Route for general donation statistics
  try {
    db.get('SELECT * FROM DonationsMeta', (dbErr, result) => {
      if (dbErr) {
        res.status(500).send(dbErr);
        return console.log(dbErr);
      }
      return res.status(200).send(JSON.stringify(result));
    });
  } catch (err) {
    console.log(err);
    res.status(500).send(JSON.stringify(err));
  }
});

app.get('/test', (req, res) => {
  try {
    let finalResults = {
      donors: {},
      donationsMeta: {}
    };
    db.all('SELECT * FROM Donors', (err_1, res_1) => {
      finalResults.donors = res_1;
      db.all('SELECT * FROM DonationsMeta', (err_2, res_2) => {
        finalResults.donationsMeta = res_2;
        res.status(200).send(JSON.stringify(finalResults));
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).send(JSON.stringify(err));
  }
});

app.get('/rst/:donor', (req, res) => {

});

app.get('/rmv/:donor', (req, res) => {

});

app.get('/donate/:donor', (req, res) => {
  /*
    If donor, add 1 to their donation count.
    If no donor, create donor entry with a donation count of 1.
    Increment named donor count statistic.
  */

  if (req && req.params && req.params.donor) {
    let donorName = req.params.donor;

    if (typeof donorName === 'string' && donorName.length > 1 && !/[^a-zA-Z0-9]/.test(donorName)) {
      donorName = donorName.toLowerCase();
      const getDonationCount = `SELECT donation_count FROM Donors WHERE donor_name = "${donorName}"`;

      db.get(getDonationCount, (err, entry) => {
        if (err) {
          res.status(404).send(JSON.stringify(err));
          return console.log(JSON.stringify(err));
        }
        const incrementNamedDonationCount = 'UPDATE DonationsMeta SET donation_count = donation_count + 1 WHERE counter_name = "named"';

        if (entry && entry.donation_count && !isNaN(Number(entry.donation_count))) {
          const donationCount = entry.donation_count + 1;
          const incrementDonationCount = `UPDATE Donors SET donation_count = ${donationCount} WHERE donor_name = "${donorName}"`;
          // If no donor, create donor entry with a donation count of 1.
          db.run(incrementDonationCount);
          res.status(200).send(`total donations: ${donationCount}`);
        } else {
          const addNewDonor = `INSERT INTO Donors (donor_name, donation_count) VALUES ("${donorName}", 1)`;
          db.run(addNewDonor);
          res.status(200).send(`Added new donor ${donorName}!`);
        }
        // Increment named donor count statistic.
        db.run(incrementNamedDonationCount);
      });
    }
  }
});

// Get donors
app.get('/donors', (req, res) => {
  try {
    db.all('SELECT * from Donors', (dbErr, donors) => {
      if (dbErr) {
        console.log(dbErr);
        return res.status(500).send(JSON.stringify(dbErr));
      }
      return res.status(200).send(JSON.stringify(donors));
    });
  } catch (err) {
    console.log(err);
    res.status(500).send(JSON.stringify(err));
  }
});

const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
