'use strict';

angular.module('guitariosApp')
  .controller('ShellCtrl', function ($mdSidenav, $mdDialog, $location, ChordService) {
    var vm = this;

    var singers = ['Aerosmith', 'Adele', 'Ariana Grande', 'Ben E. King', 'Bob Dylan', 'Bob Marley', 'Boyce Avenue', 'Bruno Mars', 'Bryan Adams', 'Christina Perri', 'Coldplay',
        'Creedence Clearwater Revival', 'David Bowie', 'David Crowder Band', 'Drake', 'Eagles', 'Ed Sheeran', 'Ellie Goulding', 'Elton John', 'Elvis Presley', 'Eric Clapton', 'Extreme', 'Fleetwood Mac', 'Frank Sinatra', 'Frozen', 'Green Day', "Guns N' Roses", 'Hillsong United', 'Hozier', "Israel Kamakawiwo'ole", 'James Blunt', 'Jason Mraz', 'Jeff Buckley', 'Jessie J', 'John Denver', 'John Legend', 'John Lennon', 'Journey', 'Justin Bieber', 'Led Zeppelin', 'Lukas Graham', 'Magic!', 'Maroon 5', 'Metallica', 'Neil Young', 'Nirvana', 'Oasis', 'Passenger', 'Pink Floyd'];
    var rhythms = ['Boston', 'Slow Rock', 'Valse', 'Twist', 'Pop','Slow', 'Blues', 'Rhumba', 'Ballade', 'Chachacha', 'Tango', 'Disco', 'Rock'];
    
    vm.singers = ChordService.getRandomSubarray(singers, 13);
    vm.rhythms = ChordService.getRandomSubarray(rhythms, 11);

    console.log("singers: " + vm.singers.length);

    vm.say = function(){
      console.log("say: " + vm.singers.length);

    }

    vm.close = function() {
      $mdSidenav('left').close();
    }

    vm.isActive = function(route) {
      return route === $location.path();
    };

    vm.toggleLeft = function() {
      $mdSidenav('left').toggle();
    };

    var originatorEv;
    vm.openMenu = function($mdOpenMenu, ev) {
      originatorEv = ev;
      $mdOpenMenu(ev);
    };

    vm.notificationsEnabled = true;
    vm.toggleNotifications = function() {
      vm.notificationsEnabled = !vm.notificationsEnabled;
    };

    vm.redial = function() {
      $mdDialog.show(
        $mdDialog.alert()
          .targetEvent(originatorEv)
          .clickOutsideToClose(true)
          .parent('body')
          .title('Suddenly, a redial')
          .content('You just called a friend; who told you the most amazing story. Have a cookie!')
          .ok('That was easy')
        );
      originatorEv = null;
    };

    vm.checkVoicemail = function() {
      // This never happens.
    };

    vm.showAddDialog = function($event) {
      var parentEl = angular.element(document.body);
      $mdDialog.show({
        parent: parentEl,
        targetEvent: $event,
        templateUrl: 'components/shell/dialog/dialog.html',
        controller: 'DialogController'
      });
    };
  });
