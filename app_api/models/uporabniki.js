const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const uporabnikiShema = new mongoose.Schema({
  ime: {type: String, required: true},
  email: {type: String, required: true},
  stanjeDenarja: {type: Number, required: true},
  barvaUporabnika: {type: String, required: true},
  nakljucnaVrednost: {type: String, required: true},
  zgoscenaVrednost: {type: String, required: true}
});

uporabnikiShema.methods.nastaviGeslo = function (geslo) {
  this.nakljucnaVrednost = crypto.randomBytes(16).toString('hex');
  this.zgoscenaVrednost = crypto
    .pbkdf2Sync(geslo, this.nakljucnaVrednost, 1000, 64, 'sha512')
    .toString('hex');
};

uporabnikiShema.methods.preveriGeslo = function (geslo) {
  let zgoscenaVrednost = crypto
    .pbkdf2Sync(geslo, this.nakljucnaVrednost, 1000, 64, 'sha512')
    .toString('hex');
  return this.zgoscenaVrednost == zgoscenaVrednost;
};

uporabnikiShema.methods.generirajJwt = function () {

  return jwt.sign({
    _id: this._id,
    email: this.email,
    ime: this.ime,
    exp: 317125598071
  }, process.env.JWT_GESLO);
};

mongoose.model('uporabniki', uporabnikiShema, 'uporabniki');
