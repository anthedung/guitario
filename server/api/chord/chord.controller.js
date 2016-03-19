'use strict';

var _ = require('lodash');
var Chord = require('./chord.model');

// Get list of chords
exports.index = function(req, res) {
  Chord.find(function (err, chords) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(chords);
  });
};

// Get a single chord
exports.show = function(req, res) {
  Chord.findById(req.params.id, function (err, chord) {
    if(err) { return handleError(res, err); }
    if(!chord) { return res.status(404).send('Not Found'); }
    return res.json(chord);
  });
};

// Creates a new chord in the DB.
exports.create = function(req, res) {
  Chord.create(req.body, function(err, chord) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(chord);
  });
};

// Updates an existing chord in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Chord.findById(req.params.id, function (err, chord) {
    if (err) { return handleError(res, err); }
    if(!chord) { return res.status(404).send('Not Found'); }
    var updated = _.merge(chord, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(chord);
    });
  });
};

// Deletes a chord from the DB.
exports.destroy = function(req, res) {
  Chord.findById(req.params.id, function (err, chord) {
    if(err) { return handleError(res, err); }
    if(!chord) { return res.status(404).send('Not Found'); }
    chord.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}