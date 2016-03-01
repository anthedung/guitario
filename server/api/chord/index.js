'use strict';

var express = require('express');
var controller = require('./chord.controller');

var router = express.Router();

router.get('/', controller.index);

// router.get('/cleanData', controller.cleanData);
router.get('/titles', controller.findAllTitles);
router.get('/titlesWithContent', controller.findAllTitlesWithContent);
router.get('/search', controller.search);
router.get('/randomSingers',  controller.findRandomSingers)

// crawl
router.get('/crawlMp3/:fromPage/:limitPaganiation', controller.crawlMp3);
router.get('/crawlRecursiveStrategy/:target', controller.crawlAllValidChordsToUpsert);

// chords api
router.get('/:category/:categoryValue', controller.findChordsByGeneric);

router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;

// *deprecated*
// router.get('/rhythms/:rhythm/:limit', controller.findChordsByRhythm);
// router.get('/crawlAll', controller.crawlVnMylifeAll);
// router.get('/recrawl', controller.recrawl);
// router.get('/crawl/:rhythm/:fromPage/:limitPaganiation', controller.crawlVnMylife);