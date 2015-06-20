
angular.module('ExampleTools', [])

  .service('console', function () {
    var items = [];
    function add(item) {
      var dt = new Date(),
        h = dt.getHours(),
        m = dt.getMinutes(),
        s = dt.getSeconds(),
        t = (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
      item.msg = '<time>' + t + '</time> ' + item.msg;
      items.push(item);
      items.splice(0, items.length - 10); // only keep last 10 entries
    }
    return {
      log: function (msg) {
        add({msg: msg, type: 'log'});
      },
      warn: function (msg) {
        add({msg: msg, type: 'warn'});
      },
      error: function (msg) {
        add({msg: msg, type: 'error'});
      },
      items: items
    };
  })

  .directive('console', function (console) {
    return {
      restrict: 'E',
      template: '<div class="console" ng-if="console.items.length">' +
      '<p ng-repeat="item in console.items track by $index" ng-bind-html="item.msg | unsafe"></p>' +
      '</div>',
      link: function (scope, element, attrs) {
        scope.console = console;
      }
    }
  })

  .filter('unsafe', function($sce) {
    return function(val) {
      return $sce.trustAsHtml(val);
    };
  })
;