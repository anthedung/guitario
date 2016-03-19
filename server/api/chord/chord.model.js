'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ChordSchema = new Schema({
	title: String,
	content: String,
	rhymth: String,
	songAuthor: String,
	chordAuthor: String,
	singers: [],
	version: Number,
	created: Date,
	mp3s: [],
	videos: [],
	active: Boolean
});

module.exports = mongoose.model('Chord', ChordSchema);