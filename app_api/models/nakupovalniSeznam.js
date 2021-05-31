const mongoose = require('mongoose');

const nakupovalniSeznamShema = new mongoose.Schema({
  naslov: {type: String, required: true},
  opis: {type: String, required: true}
});

mongoose.model('nakupovalniSeznam', nakupovalniSeznamShema, 'nakupovalniSeznam');
