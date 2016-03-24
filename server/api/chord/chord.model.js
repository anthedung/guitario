'use strict';

var mongoose = require('mongoose');
var paginator = require('mongoose-paginator');
var Schema = mongoose.Schema;


var ChordSchema = new Schema({
  title: String,
  content: String,
  rhythms: [],
  songAuthors: [],
  chordAuthor: String,
  singers: [],
  version: Number,
  created: Date,
  mp3s: [],
  videos: [],
  active: Boolean,
  creditUrl: String
});

ChordSchema.plugin(paginator, {
  limit: 20,
  defaultKey: '_id',
  direction: 1
});

module.exports = mongoose.model('Chord', ChordSchema);
