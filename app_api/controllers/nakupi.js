const mongoose = require('mongoose');
const Nakupi = mongoose.model('nakupi');
const Uporabniki = mongoose.model('uporabniki');
const axios = require('axios');

var apiParametri = {
  streznik: 'http://localhost:' + (process.env.PORT || 3000)
};
if (process.env.NODE_ENV === 'production') {
  apiParametri.streznik = 'https://debtsettler.herokuapp.com';
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

const vnesiNakup = (req, res) => {
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
            Nakupi.create({
               imeTrgovine: req.body.imeTrgovine,
               opisNakupa: req.body.opisNakupa,
               cenaNakupa: req.body.cenaNakupa,
               avtor: uporabnik._id
            }, (napaka, nakup) => {
              if (napaka) {
                res.status(400).json(napaka);
              } else {
                //console.log(uporabnik.stanjeDenarja);
                uporabnik.stanjeDenarja = uporabnik.stanjeDenarja +  parseInt(req.body.cenaNakupa);
                uporabnik.save((napaka, posodUp) => {
                     if (napaka) {
                       res.status(400).json(napaka);
                     } else {
                       console.log("uspesno posdobljen");
                        }
                });
                res.status(201).json(nakup);
              }
            });
         }
     });
  });
};

const izbrisiNakup = (req, res) => {
  vrniUpId(req, res, (req, res, idUporabnika) => {
       const idNakupa = req.params.idNakupa;
       if (!idNakupa) {
         return res.status(404).json({
           "sporočilo":
             "Ne najdem artikla, " +
             "idNakupa je obvezen parameter."
         });
       }
       Nakupi
         .findById(idNakupa)
         .exec((napaka, nakup) => {
           if (!nakup) {
             return res.status(404).json({"sporočilo": "Ne najdem nakup."});
           } else if (napaka) {
             return res.status(500).json(napaka);
           } else {
             Uporabniki
               .findById(idUporabnika)
               .exec((napaka, uporabnik) => {
                 if (!uporabnik) {
                   return res.status(404).json({"sporočilo": "Ne najdem uporabnika."});
                 } else if (napaka) {
                   return res.status(500).json(napaka);
                 } else {
                   uporabnik.stanjeDenarja = uporabnik.stanjeDenarja -  nakup.cenaNakupa;
                   uporabnik.save((napaka, posodUp) => {
                        if (napaka) {
                          res.status(400).json(napaka);
                        } else {
                          console.log("Uspesno izbrisano")
                           }
                   });
                 }
               });
             nakup.remove()
             res.status(204).json(null);
           }
        });
  });
};

const pridobiVseNakupe = (req, res) => {
        Nakupi
         .find()
         .exec((napaka, vsiNakupi) => {
            if (!vsiNakupi) {
              return res.status(404).json({
               "sporočilo":
                  "Ne najdem nobenega artikla!"
              });
            } else if (napaka) {
              return res.status(500).json(napaka);
            }
            res.status(200).json(vsiNakupi);
         });
};

const poravnavaDolga = (req, res) => {
  vrniUpId(req, res, (req, res, idUporabnika) => {
    Uporabniki
     .findById(idUporabnika)
     .exec((napaka, uporabnikA) => {
          if (!uporabnikA) {
               return res.status(404).json({
                 "sporočilo":
                   "Ne najdem uporabnika s podanim enoličnim identifikatorjem idOsebe.+"
          });
          } else if (napaka) {
               return res.status(500).json(napaka);
          } else {
            Uporabniki
             .findById(req.body.idUporabnikaB)
             .exec((napaka, uporabnikB) => {
                  if (!uporabnikB) {
                       return res.status(404).json({
                         "sporočilo":
                           "Ne najdem uporabnika s podanim enoličnim identifikatorjem idOsebe.+"
                  });
                  } else if (napaka) {
                       return res.status(500).json(napaka);
                  } else {
                        Nakupi.create({
                           imeTrgovine: "Poravnava: "+ uporabnikA.ime+" -> "+uporabnikB.ime,
                           opisNakupa: req.body.opisNakupa,
                           cenaNakupa: req.body.cenaNakupa,
                           avtor: uporabnikA._id
                        }, (napaka, nakup) => {
                          if (napaka) {
                            res.status(400).json(napaka);
                          } else {
                            //console.log(uporabnik.stanjeDenarja);
                            uporabnikA.stanjeDenarja = uporabnikA.stanjeDenarja +  parseInt(req.body.cenaNakupa);
                            uporabnikA.save((napaka, posodUp) => {
                                 if (napaka) {
                                   res.status(400).json(napaka);
                                 } else {
                                   console.log("uspesno posdobljen uporabnikA");
                                    }
                            });
                            uporabnikB.stanjeDenarja = uporabnikB.stanjeDenarja -  parseInt(req.body.cenaNakupa);
                            uporabnikB.save((napaka, posodUp) => {
                                 if (napaka) {
                                   res.status(400).json(napaka);
                                 } else {
                                   console.log("uspesno posdobljen uporabnikB");
                                    }
                            });
                            res.status(201).json(nakup);
                          }
                        });
                      }
                  });
         }
     });
  });
};

module.exports = {
  vnesiNakup,
  izbrisiNakup,
  poravnavaDolga,
  pridobiVseNakupe
};
