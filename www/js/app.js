// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter', ['ionic'])
app.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})
app.service('todoService', function($http) {
  var me = this;
  var API = 'http://localhost:3000/'
  var todos = $http.get(API + 'todos').then(function (res){
    return res.data;
  })

  me.get = function() {
    return todos;
  }

  me.add = function(todo) {
    todos.splice(0, 0, todo);
  }

});

app.controller('todoController', ['$scope', 'todoService',
  function($scope, todoService) {

    todoService.get().then(function (res){
      $scope.todos = res;
    });
    $scope.addTodo = function(todo) {
      todo.completed=false;
      todoService.add(angular.copy(todo));
      todo.title = '';
    }
  }
]);
