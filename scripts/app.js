angular.module('project', [])

  .directive('onLast', function ($timeout, $parse) {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        if (scope.$last === true) {
          $timeout(function () {
            $parse(attrs.onLast)(scope);
          });
        }
      }
    }
  })

  .directive('tabs', function() {
    return {
      restrict: 'E',
      transclude: true,
      scope: {},
      controller: function($scope) {
        var first = true,
          panes = $scope.panes = [];

        $scope.select = function(pane) {
          angular.forEach(panes, function(pane) {
            pane.selected = false;
          });
          pane.selected = true;
        };

        this.addPane = function(pane) {
          if (first || pane.selected) {
            $scope.select(pane); // select at least first item (required if none are unavailable)
            first = pane.error; // wait for first available
          }
          panes.push(pane);
        };
      },
      template: '<ul class="nav-tabs">' +
                  '<li ng-repeat="pane in panes" ng-class="{active:pane.selected, \'{{pane.align}}\': pane.align}" ng-attr-error="{{pane.error}}">' +
                    '<a href="" ng-click="!pane.error && select(pane)"><i ng-if="pane.icon" class="fa {{pane.icon}}"></i>{{pane.title}}</a>' +
                  '</li>' +
                '</ul>' +
                '<div class="tab-content" ng-transclude></div>'
    };
  })

  .directive('pane', function() {
    return {
      require: '^tabs',
      restrict: 'E',
      transclude: true,
      scope: {
        title: '@',
        error: '@',
        icon: '@',
        selected: '@',
        align: '@'
      },
      link: function(scope, element, attrs, tabsCtrl) {
        tabsCtrl.addPane(scope);
      },
      template: '<div class="tab-pane" ng-show="selected" ng-transclude></div>'
    };
  })

  .directive('snippets', function ($templateRequest, $parse) {
    return {
      restrict: 'E',
      template: '<tabs>' +
                  '<pane ng-repeat="item in items" title="{{item.name}}" ng-attr-error="{{item.error}}" on-last="last()"><pre class="code language-{{item.type}}" ng-bind="item.content"></pre></pane>' +
                  '<pane selected="true" ng-if="path" title="run" icon="fa-cog" align="right"><iframe ng-src="{{path}}"></iframe></pane>' +
                '</tabs>',
      link: function (scope, elem, attrs) {
        var files = $parse(attrs.files)(scope),
          done = 0,
          items = [],
          languages = { // these which needed to be renamed for prism (css => language-css : no need)
            html: 'markup',
            js: 'javascript'
          };

        scope.last = function () {
          angular.forEach(elem.find("pre"), function (pre) {
            Prism.highlightElement(pre);
          });
        };

        if (attrs.path && files && files.length) {
          angular.forEach(files, function (name) {
            var ext = name.replace(/^.*\./, ''),
              item = {name: name, type: languages[ext] || ext};
            items.push(item);
            $templateRequest('snippets/' + attrs.path + '/' + name, true)
              .then(
                function (content) {
                  item.content = content;
                },
                function () {
                  item.error = true;
                }
              )
              .finally(function () {
                done++;
                if (done === files.length) {
                  scope.items = items;
                  scope.path = 'snippets/' + attrs.path + '/';
                }
              });
          });
        }
      }
    }
  })

;