angular.module('project', ['Snippets', 'SnippetsThemeBootstrapButtons'])

  .config(function(snippetsProvider) {
    snippetsProvider.content.before(
      "<snippets-pane snippet='" + angular.toJson({
        name: 'Run',
        icon: 'fa fa-cog',
        cls: 'pull-right',
        run: true
      }) + "'><iframe ng-if='current.snippet.run' ng-src='{{trustSrc(path)}}'></iframe></snippets-pane>"
    );
  })

  .controller('MyCtrl', function ($scope, $sce) {
      $scope.trustSrc = function(src) {
        return $sce.trustAsResourceUrl(src);
      };
  })

  .directive('params', function () {
    return {
      restrict: 'E',
      transclude: true,
      scope: {},
      templateUrl: 'partials/params.html',
      controller: function($scope) {
        var items = $scope.items = [];
        this.add = function(item) {
          items.push(item);
          items.sort(function (a, b) {
            return a.name < b.name ? -1 : 1;
          });
        }
      }
    };
  })

  .directive('item', function () {
    return {
      restrict: 'E',
      require: '^params',
      link: function (scope, element, attrs, ctrl) {
        var item = {
          name: attrs.name,
          types: (attrs.type || '').split(','),
          optional: 'optional' in attrs,
          contents: "<p>" + element.html() + "</p>"
        };
        element.remove();
        ctrl.add(item);
      }
    };
  })


;