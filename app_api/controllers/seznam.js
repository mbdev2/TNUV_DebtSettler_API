const mongoose = require('mongoose');
const Uporabniki = mongoose.model('uporabniki');
const Seznam = mongoose.model('nakupovalniSeznam');
const axios = require('axios');

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

const vnesiNovArtikelNaSeznam = (req, res) => {
  vrniUpId(req, res, (req, res, idUporabnika) => {
    Uporabniki
     .findById(idUporabnika)
     .exec((napaka, uporabnik) => {
          if (!uporabnik) {
               return res.status(404).json({
                 "sporočilo":
                   "Ne najdem uporabnika s podanim enoličnim identifikatorjem idOsebe.+"
          });
          } else if (napaka) {
               return res.status(500).json(napaka);
          } else {
            Seznam.create({
               naslov: req.body.naslov,
               opis: req.body.opis
            }, (napaka, artikel) => {
              if (napaka) {
                res.status(400).json(napaka);
              } else {
                res.status(201).json(artikel);
              }
            });
          }
     });
  });
};

const izbrisiArtikelIzSeznama = (req, res) => {
  vrniUpId(req, res, (req, res, idUporabnika) => {
       const idArtikla = req.params.idArtikla;
       if (!idArtikla) {
         console.log("Napak je tukaj");
         return res.status(404).json({
           "sporočilo":
             "Ne najdem artikla, " +
             "idArtikla je obvezen parameter."
         });
       }
       Seznam
         .findById(idArtikla)
         .exec((napaka, artikel) => {
           if (!artikel) {
             console.log("Napak je tam");
             return res.status(404).json({"sporočilo": "Ne najdem artikel."});
           } else if (napaka) {
             return res.status(500).json(napaka);
           } else {
               artikel.remove()
               res.status(204).json(null);
           }
        });
  });
};

const pridobiVseArtikleIzSeznama = (req, res) => {
        Seznam
         .find()
         .exec((napaka, vsiArtikli) => {
            if (!vsiArtikli) {
              return res.status(404).json({
               "sporočilo":
                  "Ne najdem nobenega artikla!"
              });
            } else if (napaka) {
              return res.status(500).json(napaka);
            }
            res.status(200).json(vsiArtikli);
         });
};

const izbrisiCelSeznam = (req, res) => {
  Seznam.deleteMany({}, function(napaka, success) {
    if (napaka) {
      res.status(500).json(napaka);
    }
    else{
      res.status(204).json(null);
    }
  });
};


module.exports = {
  vnesiNovArtikelNaSeznam,
  izbrisiArtikelIzSeznama,
  izbrisiCelSeznam,
  pridobiVseArtikleIzSeznama
};
