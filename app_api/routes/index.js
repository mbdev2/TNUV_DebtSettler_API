const express = require('express');
const router = express.Router();

// Token za avtentikacijo uporabnikov
const jwt = require('express-jwt');
const avtentikacija = jwt({
  secret: process.env.JWT_GESLO,
  userProperty: 'payload',
  algorithms: ['HS256']
});

const ctrlOstalo = require('../controllers/ostalo');
const ctrlNakupi = require('../controllers/nakupi');
const ctrlSeznam = require('../controllers/seznam');
const ctrlUporabniki = require('../controllers/uporabniki');
const ctrlAvtentikacija = require('../controllers/avtentikacija');

// Registracija/ Prijava
router.post('/registracija', ctrlAvtentikacija.registracija);
router.post('/prijava', ctrlAvtentikacija.prijava);

// Uporabniki
router.get('/users', ctrlUporabniki.pridobiVseUporabnike);
router.post('/users/pridobiid', avtentikacija, ctrlUporabniki.vrniUpIdJAvno);
router.get('/users/nakupi', avtentikacija, ctrlUporabniki.seznamMojihNakupov);
router.post('/users/posodobibarvo', avtentikacija, ctrlUporabniki.uporabnikPosodobiBarvo);
router.delete('/users/izbrisi', avtentikacija, ctrlUporabniki.izbrisiUporabnika);

// Nakupi
router.get('/nakupi', ctrlNakupi.pridobiVseNakupe);
router.post('/dodajnakup', avtentikacija, ctrlNakupi.vnesiNakup);
router.post('/poravnavadolga', avtentikacija, ctrlNakupi.poravnavaDolga);
router.delete('/nakupi/:idNakupa', avtentikacija, ctrlNakupi.izbrisiNakup);

// Nakupovalni seznam
router.get('/seznam', ctrlSeznam.pridobiVseArtikleIzSeznama);
router.post('/seznam', avtentikacija, ctrlSeznam.vnesiNovArtikelNaSeznam);
router.delete('/seznam', avtentikacija, ctrlSeznam.izbrisiCelSeznam);
router.delete('/seznam/:idArtikla', avtentikacija, ctrlSeznam.izbrisiArtikelIzSeznama);

// Podatkovna baza
router.get('/brisidb', ctrlOstalo.brisiDB);
router.get('/polnidb', ctrlOstalo.polniDB);

module.exports = router;
