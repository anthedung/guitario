'use strict';
// for scrolling

angular.module('guitariosApp')
  .controller('MainCtrl', function ($http, ChordService, $log, $q, $location, $rootScope) {
    var vm = this;
    var LIMIT = 20;
    vm.infiniteDistance = LIMIT / 20;
    vm.chords = [];
    vm.bannerVisible = true;
    vm.chipRhythms = {};
    var pageNoToScroll = 2;
    vm.chordsByRhythm = [];
    vm.getStandardDescLength = ChordService.getStandardDescLength;

    // loading some chords
    $http.get('/api/chords?random=true').success(function (chords) {
      vm.chords = ChordService.processChords(chords);
      console.log("vm.chords.length: " + vm.chords.length)

      vm.randomChordsForGlobe = ChordService.getRandomSubarray(vm.chords, 8);

      // ensure canvas will start with some delays
      setTimeout(function () {
        startCanvas();
      }, 500);
      // page =1 load by default already
    });

    vm.join = ChordService.join;

    vm.searchRemote = true;
    vm.isDisabled = false;
    // list of `state` value/display objects
    vm.querySearch = querySearch;
    vm.selectedItemChange = selectedItemChange;
    vm.searchTextChange = searchTextChange;
    vm.randomChord = randomChord;
    function randomChord(state) {
      // alert("Sorry! You'll need to create a Constituion for " + state + " first!");
    }

    function querySearch(query) {
      $http.get('api')
      var results = query ? vm.chords.filter(createFilterFor(query)) : vm.chords,
        deferred;
      if (vm.searchRemote) {
        deferred = $q.defer();
        var url = 'api/chords/search?q=';
        $http.get(url + query).success(function (chords) {
          deferred.resolve(chords);
        })

        return deferred.promise;
      } else {
        return results;
      }
    }

    function searchTextChange(text) {
      $log.info('Text changed to ' + text);
    }

    function selectedItemChange(item) {
      $log.info('Item changed to ' + JSON.stringify(item));
    }

    /**
     * Create filter function for a query string
     */
    function createFilterFor(query) {
      var lowercaseQuery = angular.lowercase(query);
      return function filterFn(chord) {
        return
        (chord.title.toLowerCase().indexOf(lowercaseQuery) > -1)
        || (chord.titleEnChar.toLowerCase().indexOf(lowercaseQuery) > -1)
      };
    }

    //vm.rythms34 = ['Everything', 'Boston', 'Slow Rock', 'Valse', 'Twist', 'Pop'];
    //vm.rythms = [];


    // load chips
    (function prepareChips() {
      var rhythms = ['Boston', 'Slow Rock', 'Valse', 'Twist', 'Pop','Slow', 'Blues', 'Rhumba', 'Ballade', 'Chachacha', 'Tango', 'Disco', 'Rock'];
      var singers = ['Aerosmith', 'Adele', 'Ariana Grande', 'Ben E. King', 'Bob Dylan', 'Bob Marley', 'Boyce Avenue', 'Bruno Mars', 'Bryan Adams', 'Christina Perri', 'Coldplay',
        'Creedence Clearwater Revival', 'David Bowie', 'David Crowder Band', 'Drake', 'Eagles', 'Ed Sheeran', 'Ellie Goulding', 'Elton John', 'Elvis Presley', 'Eric Clapton', 'Extreme', 'Fleetwood Mac', 'Frank Sinatra', 'Frozen', 'Green Day', "Guns N' Roses", 'Hillsong United', 'Hozier', "Israel Kamakawiwo'ole", 'James Blunt', 'Jason Mraz', 'Jeff Buckley', 'Jessie J', 'John Denver', 'John Legend', 'John Lennon', 'Journey', 'Justin Bieber', 'Led Zeppelin', 'Lukas Graham', 'Magic!', 'Maroon 5', 'Metallica', 'Neil Young', 'Nirvana', 'Oasis', 'Passenger', 'Pink Floyd'];
      var first = 6;
      var last = 8;

      singers = singers.filter(function (singer) {
        return singer.length < 9;
      });


      if (ChordService.isMobileBrowser()) {
        first = 3;
        last = 3;
      }

      vm.rythms34 = ChordService.getRandomSubarray(rhythms, first);
      if (ChordService.isMobileBrowser()) {
        vm.rythms34[1] = 'Everything';//put in the middle
      }
      vm.rythms = ChordService.getRandomSubarray(singers, last);

    })();

    // helpers
    function getChordTitlesFromChords(arr) {
      return arr.map(function (chord) {
        if (chord.title.length > 20)
          return chord.title.substring(0, 17) + "...";
        return chord.title;
      });
    }

  });
