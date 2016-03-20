'use strict';

var express = require('express');
var controller = require('./chord.controller');

var router = express.Router();

router.get('/', controller.index);

router.get('/titles', controller.findAllTitles);
router.get('/titlesWithContent', controller.findAllTitlesWithContent);

router.get('/crawlAll', controller.crawlVnMylifeAll);
router.get('/recrawl', controller.recrawl);
router.get('/crawl/:rhythm/:fromPage/:limitPaganiation', controller.crawlVnMylife);

router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;