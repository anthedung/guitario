'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ChordSchema = new Schema({
	title: String,
	rhymth: String,
	songAuthor: String,
	chordAuthor: String,
	version: Number,
	created: String,
	mp3s: [],
	videos: [],
	active: Boolean
});

module.exports = mongoose.model('Chord', ChordSchema);