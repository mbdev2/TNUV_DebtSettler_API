const mongoose = require('mongoose');

const nakupiShema = new mongoose.Schema({
  imeTrgovine: {type: String, required: true},
  opisNakupa: {type: String, required: true},
  datumNakupa: {type: Date, "default": Date.now},
  cenaNakupa: {type: Number, required: true},
  avtor: {type: String, required: true},
  kategorijaNakupa: {type: String}
});

mongoose.model('nakupi', nakupiShema, 'nakupi');
