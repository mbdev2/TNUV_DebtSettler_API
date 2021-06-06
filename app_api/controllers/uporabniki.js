const mongoose = require('mongoose');
const Nakupi = mongoose.model('nakupi');
const Uporabniki = mongoose.model('uporabniki');
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

const pridobiVseUporabnike = (req, res) => {
    Uporabniki
     .find()
     .exec((napaka, uporabniki) => {
        if (!uporabniki) {
          return res.status(404).json({
           "sporočilo":
              "Ne najdem nobenega uporabnika!"
          });
        } else if (napaka) {
          return res.status(500).json(napaka);
        }
        res.status(200).json(uporabniki);
     });
};

const izbrisiUporabnika = (req, res) => {
  vrniUpId(req, res, (req, res, idUporabnika) => {
       if (!idUporabnika) {
         return res.status(404).json({
           "sporočilo":
             "Ne najdem uporabnika, " +
             "userID je obvezen parameter."
         });
       }
       if (req.headers.uporabnik != 'null') {
            //console.log("Tukaj 1");
            Uporabniki
              .findById(req.headers.uporabnik)
              .exec((napaka, uporabnik) => {
                if (!uporabnik) {
                  return res.status(404).json({"sporočilo": "Ne najdem uporabnika."});
                } else if (napaka) {
                  return res.status(500).json(napaka);
                } else {
                    uporabnik.remove()
                    res.status(204).json(null);
                }
             });
       } else {
            //console.log("Tukaj 1");
            Uporabniki
              .findById(idUporabnika)
              .exec((napaka, uporabnik) => {
                if (!uporabnik) {
                  return res.status(404).json({"sporočilo": "Ne najdem uporabnika."});
                } else if (napaka) {
                  return res.status(500).json(napaka);
                } else {
                    uporabnik.remove()
                    res.status(204).json(null);
                }
             });
       }

  });
};

const seznamMojihNakupov = (req, res) => {
     vrniUpId(req, res, (req, res, idUporabnika) => {
       limita = 100;
       if (!idUporabnika) {
         return res.status(400).json({
           "sporočilo": "Id uporabnika je obvezen."
         });
       }

       Nakupi
         .find()
         .where("avtor").equals(idUporabnika)
         .limit(limita)
         .exec((napaka, mojiNakupi) => {
           if (napaka) {
             res.status(500).json(napaka);
           } else {
             res.status(200).json(mojiNakupi);
           }
         });
     });
};

const uporabnikPosodobiBarvo = (req, res) => {
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
               uporabnik.barvaUporabnika = req.body.barvaUp;
               uporabnik.save((napaka, posodUp) => {
                    if (napaka) {
                      res.status(400).json(napaka);
                    } else {
                      res.status(200).json("uspesno posdobljen");
                   }
               });
             }
         });
     });
};

const vrniUpIdJAvno = (req, res) => {
  if (req.payload && req.payload.email) {
    Uporabniki
      .findOne({email: req.payload.email})
      .exec((napaka, uporabnik) => {
        if (!uporabnik)
          return res.status(404).json({"sporočilo": "Ne najdem uporabnika"});
        else if (napaka)
          return res.status(500).json(napaka);
        return res.status(200).json(uporabnik._id);
      });
  } else {
    return res.status(400).json({"sporočilo": "Ni podatka o uporabniku"});
  }
};

module.exports = {
  vrniUpId,
  pridobiVseUporabnike,
  izbrisiUporabnika,
  uporabnikPosodobiBarvo,
  seznamMojihNakupov,
  vrniUpIdJAvno
};
