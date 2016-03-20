'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ChordSchema = new Schema({
	_id : Number,
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

module.exports = mongoose.model('Chord', ChordSchema);