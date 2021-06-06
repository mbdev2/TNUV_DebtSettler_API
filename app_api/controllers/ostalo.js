const mongoose = require('mongoose');
const Uporabniki = mongoose.model('uporabniki');
const Nakupi = mongoose.model('nakupi');
const NakupSeznam = mongoose.model('nakupovalniSeznam');
const axios = require('axios');

var dbURI = 'mongodb://localhost/etv';
if (process.env.NODE_ENV === 'production') {
  dbURI = process.env.MONGODB_CLOUD_URI;
} else if (process.env.NODE_ENV === 'docker') {
  dbURI = 'mongodb://sp-etv-mongodb/etv';
}

var apiParametri = {
  streznik: 'http://localhost:' + (process.env.PORT || 3000)
};
if (process.env.NODE_ENV === 'production') {
  apiParametri.streznik = 'INSERT YOUR PRODUCTION URL HERE';
}

const vrniUpId = (req, res, pkOdgovor) => {
  if (req.payload && req.payload.email) {
    Uporabniki
      .findOne({email: req.payload.email})
      .exec((napaka, uporabnik) => {
        if (!uporabnik)
          return res.status(404).json({"sporočilo": "Ne najdem uporabnika"});
        else if (napaka)
          return res.status(500).json(napaka);
        pkOdgovor(req, res, uporabnik._id);
      });
  } else {
    return res.status(400).json({"sporočilo": "Ni podatka o uporabniku"});
  }
};

const najdiUporabnika = (req, res) => {
  vrniUpId(req, res, (req, res, idUporabnika) => {
  Uporabniki
    .findById(idUporabnika)
    .exec((napaka, uporabnik) => {
      res.status(200).json(uporabnik.ime);
    });
  });
};

const brisiDB = (req, res) => {
  mongoose.connect(dbURI,function(){
    mongoose.connection.db.dropDatabase();
  });
  res.status(200).json("Uspesno izbrisana baza.");
};

const polniDB = (req, res) => {
        var jsonUporabniki = require('../models/uporabnikiData.json');
        var jsonNakupi = require('../models/nakupiData.json');
        var jsonSeznam = require('../models/nakupovalniSeznamData.json');

        Uporabniki.insertMany(jsonUporabniki, function(napaka, uporabniki) {
          if (napaka) {
            res.status(500).json(napaka);
          }
        });
        Nakupi.insertMany(jsonNakupi, function(napaka, nakupi) {
          if (napaka) {
            res.status(500).json(napaka);
          }
        });
        NakupSeznam.insertMany(jsonSeznam, function(napaka, seznam) {
          if (napaka) {
            res.status(500).json(napaka);
          }
        });
        var delayInMilliseconds = 2000; //2 second

        setTimeout(function() {
          res.status(201).json("Uspesno napolnjena baza.");
        }, delayInMilliseconds);
};

module.exports = {
  najdiUporabnika,
  brisiDB,
  polniDB
};
