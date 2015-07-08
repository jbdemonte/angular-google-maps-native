(function(angular) {
  'use strict';

  var googleMap, // will be set when library will be loaded (used to reduce code weight when minifying)
    services;


    /**
     * Handle google.maps services as singleton
     * @param name {string}
     * @return {google.maps.Service}
     */
    services = (function () {
      var instances = {};
      return function (name) {
        if (!instances.hasOwnProperty(name) && googleMap[name]) {
          instances[name] = new googleMap[name];
        }
        return instances[name];
      };
    }());


  /**
   * Create an expression based on ngShow and ngHide to evaluate visibility
   * @param attrs {object}
   * @returns {string}
   */
  function getVisibility(attrs) {
    return (attrs.ngShow ? '(' + attrs.ngShow + ')' : '') + (attrs.ngHide ? (attrs.ngShow ? ' && ' : '') + '!(' + attrs.ngHide + ')' : '') || '';
  }


  /**
   * Convert mix LatLng to a new google.maps.LatLng
   * @param mixed {*} LatLng, [lat, lng], {lat: number, lng: number}
   * @param returnMixed {boolean} (optional, default = false) if true and no result, return mixed
   * @returns {LatLng|*|null}
   */
  function toLatLng(mixed, returnMixed) {
    var result = returnMixed ? mixed : null;
    if (mixed instanceof googleMap.LatLng) {
      result = mixed;
    } else if (angular.isArray(mixed)) {
      result = new googleMap.LatLng(mixed[0], mixed[1]);
    } else if (angular.isObject(mixed) && 'lat' in mixed) {
      result = new googleMap.LatLng(mixed.lat, mixed.lng);
    }
    return result;
  }

  /**
   * Convert mixed bounds to google.maps.LatLngBounds (NE, SW)
   * [LatLng, LatLng], [lat 1, lng 1, lat 2, lng 2], [latLng1, latLng2], {ne: LatLng, sw: LatLng}, {n:number, e:number, s:number, w:number}
   * @param mixed {*}
   * @returns {*}
   */
  function toLatLngBounds(mixed) {
    var ne, sw;
    if (!mixed || mixed instanceof googleMap.LatLngBounds) {
      return mixed || null;
    }
    if (angular.isArray(mixed)) {
      if (mixed.length === 2) {
        ne = toLatLng(mixed[0]);
        sw = toLatLng(mixed[1]);
      } else if (mixed.length === 4) {
        ne = toLatLng([mixed[0], mixed[1]]);
        sw = toLatLng([mixed[2], mixed[3]]);
      }
    } else {
      if (('ne' in mixed) && ('sw' in mixed)) {
        ne = toLatLng(mixed.ne);
        sw = toLatLng(mixed.sw);
      } else if (('n' in mixed) && ('e' in mixed) && ('s' in mixed) && ('w' in mixed)) {
        ne = toLatLng([mixed.n, mixed.e]);
        sw = toLatLng([mixed.s, mixed.w]);
      }
    }
    if (ne && sw) {
      return new googleMap.LatLngBounds(sw, ne);
    }
    return null;
  }


  /**
   * Capitalise first character
   * @param str {string}
   * @returns {string}
   */
  function ucfirst(str) {
    str += '';
    return str.charAt(0).toUpperCase() + str.substr(1);
  }

  /**
   * Return a function only runable only once
   * http://davidwalsh.name/javascript-once
   * @param fn {function}
   * @param context {object} (optional)
   * @returns {Function}
   */
  function once(fn, context) {
    var result;
    return function () {
      if (fn) {
        result = fn.apply(context || this, arguments);
        fn = null;
      }
      return result;
    };
  }


  /**
   * Convert an attribute normalized to a google event: onContentChanged => content_changed
   * @param attribute
   */
  function eventName(attribute) {
    return attribute
      .replace(/([a-z0-9])([A-Z])/g, '$1_$2') // add _
      .replace(/^[^_]+_/, '')                 // remove first item (on / once)
      .toLowerCase();
  }

  angular.module('GoogleMapsNative', [])

    .provider('gmLibrary', function () {
      var deferred,
        loading = false,
        ignore = ['url', 'libraries'],
        options = {
          url: 'https://maps.googleapis.com/maps/api/js',
          v: 3,
          libraries: [],
          language: 'en',
          sensor: 'false',
          callback: '__mapLibraryLoaded'
        };

      /**
       * Build script url based on options
       * @returns {string}
       */
      function url() {
        var result = options.url,
          position = result.indexOf('?');
        if (position === -1) {
          result += '?';
        } else if (position === result.length - 1) {
          result += '&';
        }
        angular.forEach(options, function (value, key) {
          if (ignore.indexOf(key) === -1) {
            result += key + '=' + value + '&';
          }
        });
        if (options.libraries.length) {
          result += 'libraries=' + options.libraries.join(',');
        }
        return result;
      }

      /**
       * Load script
       */
      function load($document, $window, $q) {
        var script, callback = options.callback;

        if (!loading) {
          loading = true;

          // create the deferred which may be used more than once
          deferred = $q.defer();

          // callback function - resolving promise after maps successfully loaded
          $window[callback] = function () {
            delete $window[callback];
            googleMap = $window.google.maps;
            if (!googleMap) {
              throw "google.maps library not found";
            }
            deferred.resolve();
          };

          // append script to dom
          script = $document[0].createElement('script');
          script.type = 'text/javascript';
          script.src = url();
          $document.find("body").append(script);
        }

        return deferred.promise;
      }

      /**
       * Overwrite options
       * @param opts
       */
      this.configure = function (opts) {
        angular.extend(options, opts);
      };

      this.$get = ['$document', '$window', '$rootScope', '$q', function ($document, $window, $rootScope, $q) {
        return {
          /**
           * Populate scope
           * @param scope
           */
          populate: function (scope) {
            scope.google = google;
            $rootScope.google = google;
          },
          /**
           * Async load google map library
           * @returns {Promise}
           */
          load: function () {
            return load($document, $window, $q);
          }
        };
      }];
    })

    .factory('gmTools', ['$parse', '$timeout', 'gmLogger', function ($parse, $timeout, gmLogger) {
      var gmTools = {

        /**
         * Bind events on google map object from attributes
         * @param obj {Google.Maps.Object}
         * @param scope {Scope}
         * @param attrs {Attributes}
         */
        bind: function (obj, scope, attrs) {
          angular.forEach(attrs, function (value, key) {
            var match = key.match(/^on(ce)?[A-Z]/);
            if (match) {
              googleMap.event['addListener' + (match[1] ? 'Once' : '')](obj, eventName(key), function (event) {
                $timeout(function () {
                  scope.$apply(function () {
                    var childScope = scope.$new(false);
                    childScope.event = event;
                    $parse(value)(childScope);
                  });
                });
              });
            }
          });
        },

        /**
         * Observe some attributes and run callback
         * @param scope {Scope}
         * @param attrs {Attributes}
         * @param controller {Controller}
         * @param features {string} space separated attribute names to observes
         * @param callback {function} callback to run
         * @param once {boolean} (optional, default=false) watch only one time
         */
        watch: function (scope, attrs, controller, features, callback, once) {
          angular.forEach(features.split(' '), function (feature) {
            var stop,
              normalised = feature.toLowerCase();
            if (normalised in attrs) {
              stop = scope.$watch(attrs[normalised], function (value) {
                if (angular.isDefined(value)) {
                  if (once) {
                    stop();
                  }
                  callback(value, feature);
                }
              });
            }
          });
        },

        /**
         * Observe some attributes and run google maps generic functions (setX, setY)
         * @param scope {Scope}
         * @param attrs {Attributes}
         * @param controller {Controller}
         * @param features {string} space separated attribute names to observes
         * @param cast {function} (optional) allow to preprocess value observed
         * @param once {boolean} (optional, default=false) watch only one time
         */
        prop: function (scope, attrs, controller, features, cast, once) {
          gmTools.watch(
            scope,
            attrs,
            controller,
            features,
            function (value, feature) {
              controller.then(function (obj) {
                obj['set' + ucfirst(feature)](cast ? cast(value) : value);
              });
            },
            once
          );
        },

        /**
         * Observe some attributes and wait all of them to run a callback
         * @param scope {Scope}
         * @param attrs {Attributes}
         * @param controller {Controller}
         * @param features {string} space separated attribute names to observes
         * @param callback {function} callback to run
         * @param once {boolean} (optional, default=false) watch only one time
         */
        wait: function (scope, attrs, controller, features, callback, once) {

          var handlers = [],
            mandatories = features.split(" "),
            options = {};

          function isComplete() {
            var result = true;
            angular.forEach(mandatories, function (name) {
              result = result && options[name];
            });
            return result;
          }

          // evaluate options from element attribute
          if (attrs.options) {
            options = $parse(attrs.options)(scope);
          }

          if (isComplete()) {
            callback(options);
          }
          if (!once || !isComplete()) {
            angular.forEach(mandatories, function (feature) {
              var normalised = feature.toLowerCase();

              if (normalised in attrs) {
                handlers.push(scope.$watch(attrs[normalised], function (value) {
                  if (angular.isDefined(value)) {
                    options[feature] = value;
                    if (isComplete()) {
                      // stop all watches
                      if (once) {
                        angular.forEach(handlers, function (handler) {
                          handler();
                        });
                      }
                      callback(options);
                    }
                  }
                }));
              } else if (!angular.isDefined(options[feature])) {
                gmLogger.error(feature + ' not defined');
              }
            });
          }
        }
      };
      return gmTools;
    }])

    .factory('gmLogger', function () {
      return {
        error: function () {
          console.error.apply(console, arguments);
        }
      };
    })

    .directive('gmMap', ['$q', '$timeout', '$parse', 'gmLibrary', 'gmTools', function ($q, $timeout, $parse, gmLibrary, gmTools) {
      return {
        restrict: 'E',
        scope: true,
        controller: ['$scope', '$element', '$attrs', function ($scope, $element, $attrs) {
          var map, deferred = $q.defer(),
            target = angular.element(document.createElement('DIV'));

          if (!$element.css('position')) {
            $element.css('position', 'relative');
          }

          target.css({
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
          });

          $element.append(target);

          /**
           * Create the map
           */
          this._build = once(function (element, options) {
            $timeout(function () { // wait until dom element visibility is toggled if needed
              map = new googleMap.Map(target[0], options);
              $scope.map = map;
              gmTools.bind(map, $scope, $attrs);
              deferred.resolve(map);
            }, 100);
          });

          /**
           * Append a function in the promise process
           * @param f
           */
          this.then = function (f) {
            deferred.promise.then(f);
          };

          /**
           * return google map object
           * @returns {*}
           */
          this.get = function () {
            return map;
          };

          // Load library and populate scope
          gmLibrary.load().then(function () {
            gmLibrary.populate($scope);
          });
        }],
        link: function (scope, elem, attrs, controller) {

          /**
           * Create the map
           */
          function create(options) {
            var visibility = getVisibility(attrs);
            // if map visibility is dynamic, evaluate it
            if (visibility) {
              scope.$watch(visibility, function (value) {
                if (value) {
                  var map = controller.get();
                  if (map) {
                    $timeout(function () {
                      googleMap.event.trigger(map, 'resize');
                    });
                  } else {
                    controller._build(elem, options);
                  }
                }
              });
            } else {
              controller._build(elem, options);
            }
          }

          gmLibrary.load().then(function () {
            gmTools.wait(
              scope,
              attrs,
              controller,
              'center zoom',
              function (options) {
                options.center = toLatLng(options.center);
                options.zoom = 1 * options.zoom;
                create(options);

                gmTools.prop(scope, attrs, controller, 'center', toLatLng);

                gmTools.prop(scope, attrs, controller, 'mapTypeId');

                gmTools.prop(scope, attrs, controller, 'heading tilt zoom', function (value) {
                  return 1 * value;
                });
              },
              true // once only
            );
          });
        }
      };
    }])

    .service('gmOverlayBuilder', ['$q', '$timeout', '$parse', 'gmTools', function ($q, $timeout, $parse, gmTools) {
      return {
        /**
         *
         * @param buildOptions
         *          .directive  {string}    current directive name
         *          .name       {string}    object scope name
         *          .cls        {string}    google.maps object class => ie: Marker for google.maps.Marker
         *          .main       {object}    (optional) main property to to wait / watch / observe before creating object
         *            .name     {string}    property name
         *            .cast     {function}  (optional) preprocess value
         *          .require    {array|string} additional constructor to require
         *          .destroy    {function(scope, element, attrs, object)} kinda destructor
         *          .create     {function(scope, element, attrs, controllers, options, create)} kinda constructor
         *                        @param scope
         *                        @param element
         *                        @param attrs
         *                        @param controllers  {array} [main controller, additional controllers, map controller]
         *                        @param options      {object}
         *                        @param create       {function(options)} creating callback to finalize object creation
         *                        @return {boolean} true => processing, false => continue classic creating process
         *          .visibility {function(scope, element, attrs, controllers, value)} toggle visibility handler
         *                        @param scope
         *                        @param element
         *                        @param attrs
         *                        @param controllers
         *                        @param value        {boolean} true = visible, false = hidden
         *
         * @returns {Object}
         */
        builder: function (buildOptions) {
          var require = [buildOptions.directive];
          if (angular.isArray(buildOptions.require)) {
            Array.prototype.push.apply(require, buildOptions.require);
          } else if (buildOptions.require && angular.isString(buildOptions.require)) {
            require.push(buildOptions.require);
          }
          require.push('^gmMap');

          return {
            restrict: 'E',
            scope: true,
            require : require,
            controller: ['$scope', '$element', '$attrs', function ($scope, $element, $attrs) {
              var obj, deferred = $q.defer();


              /**
               * When item is destroyed, remove the overlay from the map
               */
              $scope.$on("$destroy", function () {
                if (obj) {
                  if (buildOptions.destroy) {
                    buildOptions.destroy($scope, $element, $attrs, obj);
                  } else {
                    obj.setMap(null);
                  }
                  obj = null;
                } else {
                  deferred.reject();
                }
              });

              /**
               * Create the object
               */
              this._build = once(function (options, map, visible) {
                if (!visible && options.map) {
                  delete options.map;
                }
                obj = new googleMap[buildOptions.cls](options);
                // some objects does not use "map" from options and need to use a setMap instead of options.map
                if (visible && !options.map && obj.setMap) {
                  obj.setMap(map);
                }
                if (buildOptions.name) {
                  $scope[buildOptions.name] = obj;
                }
                gmTools.bind(obj, $scope, $attrs);
                deferred.resolve(obj);
              });

              /**
               * Append a function in the promise process
               * @param f
               */
              this.then = function (f) {
                deferred.promise.then(f);
              };

              /**
               * return google map object
               * @returns {*}
               */
              this.get = function () {
                return obj;
              };
            }],
            link: function (scope, element, attrs, controllers) {
              var controller = controllers[0],
                mapController = controllers[controllers.length - 1];

              /**
               * Finalise object creation and bind visibility if needed
               */
              function create(options) {
                var visibility = getVisibility(attrs),
                  map = mapController.get();

                // if map visibility is dynamic, evaluate it
                if (visibility) {
                  scope.$watch(visibility, function (value) {
                    var obj = controller.get();
                    if (obj) {
                      if (buildOptions.visibility) {
                        buildOptions.visibility(scope, element, attrs, controllers, value);
                      } else {
                        obj.setMap(value ? map : null);
                      }
                    } else {
                      controller._build(options, map, value);
                      if (buildOptions.visibility) {
                        buildOptions.visibility(scope, element, attrs, controllers, value);
                      }
                    }
                  });
                } else {
                  controller._build(options, map, true);
                }
              }

              mapController.then(function (map) {
                var options = {};

                // if build provide a custom constructor, use it
                if (buildOptions.create) {
                  if (attrs.options) {
                    options = $parse(attrs.options)(scope);
                    if (buildOptions.main && options[buildOptions.main.name]) {
                      options[buildOptions.main.name] = buildOptions.main.cast(options[buildOptions.main.name]);
                    }
                  }
                  // if it satisfy the creation, return
                  if (buildOptions.create(scope, element, attrs, controllers, options, create)) {
                    return;
                  }
                }

                // no custom contructor or does not satisfy the creation, so, use default one
                gmTools.wait(
                  scope,
                  attrs,
                  controller,
                  buildOptions.main.name,
                  function (options) {
                    if (buildOptions.main.cast) {
                      options[buildOptions.main.name] = buildOptions.main.cast(options[buildOptions.main.name]);
                    }
                    options.map = map;
                    create(options);
                    gmTools.prop(scope, attrs, controller, buildOptions.main.name, buildOptions.main.cast);
                  }
                );
              });
            }
          };
        }
      };
    }])

    .directive('gmMarker', ['gmOverlayBuilder', function (gmOverlayBuilder) {
      return gmOverlayBuilder.builder({
        directive: 'gmMarker',  // current directive name
        name: 'marker',         // scope name
        cls: 'Marker',          // google.maps object class => google.maps.Marker
        main: {                 // main property to wait / watch / observe before creating
          name: 'position',
          cast: toLatLng
        }
      });
    }])

    .directive('gmCircle', ['gmOverlayBuilder', function (gmOverlayBuilder) {
      return gmOverlayBuilder.builder({
        directive: 'gmCircle',
        name: 'circle',
        cls: 'Circle',
        main: {
          name: 'center',
          cast: toLatLng
        }
      });
    }])

    .directive('gmRectangle', ['gmOverlayBuilder', function (gmOverlayBuilder) {
      return gmOverlayBuilder.builder({
        directive: 'gmRectangle',
        name: 'rectangle',
        cls: 'Rectangle',
        main: {
          name: 'bounds',
          cast: toLatLngBounds
        }
      });
    }])

    .directive('gmInfowindow', ['$parse', 'gmOverlayBuilder', 'gmTools', function ($parse, gmOverlayBuilder, gmTools) {
      return gmOverlayBuilder.builder({
        directive: 'gmInfowindow',
        require: ['^?gmMarker'],
        name: 'infowindow',
        cls: 'InfoWindow',
        main: {
          name: 'position',
          cast: toLatLng
        },
        destroy: function ($scope, $element, $attrs, infowindow) {
          infowindow.close();
        },
        create: function (scope, element, attrs, controllers, options, create) {
          var infowindowController = controllers[0],
            markerController = controllers[1],
            mapController = controllers[2],

            payload = function (options) {
              create(options);
              if (!attrs.ngShow && !attrs.ngHide) { // visibility is not handled, so, we need to open it
                infowindowController.then(function (infowindow) {
                  infowindow.open(mapController.get(), markerController ? markerController.get() : null);
                });
              }
            };

          if (markerController) {
            markerController.then(function () {
              payload(options);
            });
          } else { // infowindow needs a position
            gmTools.wait(
              scope,
              attrs,
              controllers[0],
              'position',
              function (options) {
                options.position = toLatLng(options.position);
                payload(options);
                gmTools.prop(scope, attrs, controllers[0], 'position', toLatLng);
              },
              true
            );

          }
          return true;
        },
        visibility: function (scope, element, attrs, controllers, value) {
          /*
           controllers:
            [0] : gmInfowindow
            [1] : gmMarker or null
            [2] : gmMap
          */
          var infowindow = controllers[0].get(),
            markerController = controllers[1],
            mapController = controllers[2];
          if (!value) {
            return infowindow.close();
          }
          // else :
          infowindow.open(mapController.get(), markerController ? markerController.get() : null);
        }
      });
    }])

    .directive('gmDirections', ['$q', '$timeout', '$parse', 'gmTools', function ($q, $timeout, $parse, gmTools) {
      return {
        restrict: 'E',
        scope: true,
        require: ['gmDirections', '^gmMap'],
        controller: ['$scope', function ($scope) {
          var deferred = $q.defer(),
            obj = {
              result: null,
              status: ''
            };

          this._run = function (options) {
            options.origin = toLatLng(options.origin, true);
            options.destination = toLatLng(options.destination, true);
            services('DirectionsService').route(
              options,
              function (results, status) {
                obj.result = results;
                obj.status = status;
                $scope.$apply(function () {
                  $scope.directions = {
                    result: results,
                    status: status
                  };
                });
                deferred.resolve(obj);
              }
            );
          };

          /**
           * Append a function in the promise process
           * @param f
           */
          this.then = function (f) {
            deferred.promise.then(f);
          };

          /**
           * return direction
           * @returns {*}
           */
          this.get = function () {
            return obj;
          };
        }],
        link: function (scope, elem, attrs, controllers) {
          var controller = controllers[0],
            mapController = controllers[1];

          mapController.then(function () {
            gmTools.wait(
              scope,
              attrs,
              controller,
              'origin destination travelMode',
              function (options) {
                controller._run(options);
              }
            );
          });
        }
      };
    }])

    .directive('gmRenderer', ['$parse', 'gmOverlayBuilder', function ($parse, gmOverlayBuilder) {
      return gmOverlayBuilder.builder({
        directive: 'gmRenderer',
        name: 'renderer',
        cls: 'DirectionsRenderer',
        require: ['^gmDirections'],
        create: function (scope, element, attrs, controllers, options, create) {
          var controller = controllers[0],
            directionsController = controllers[1],
            mapController = controllers[2];
          directionsController.then(function (data) {
            options.map = mapController.get();
            options.directions = data.result;
            scope.$watch('directions', function (directions) {
              controller.get().setDirections(directions.result);
            });
            create(options);
          });
          return true;
        }
      });
    }])

    .directive('gmPolyline', ['gmOverlayBuilder', function (gmOverlayBuilder) {
      return gmOverlayBuilder.builder({
        directive: 'gmPolyline',
        name: 'polyline',
        cls: 'Polyline',
        main: {
          name: 'path',
          cast: function (path) {
            angular.forEach(path, function (value, index) {
              path[index] = toLatLng(value);
            });
            return path;
          }
        }
      });
    }])

    .directive('gmPolygon', ['gmOverlayBuilder', function (gmOverlayBuilder) {
      return gmOverlayBuilder.builder({
        directive: 'gmPolygon',
        name: 'polygon',
        cls: 'Polygon',
        main: {
          name: 'paths',
          cast: function (paths) {
            angular.forEach(paths, function (value, index) {
              paths[index] = toLatLng(value);
            });
            return paths;
          }
        }
      });
    }])

    .directive('gmTrafficlayer', ['gmOverlayBuilder', function (gmOverlayBuilder) {
      return gmOverlayBuilder.builder({
        directive: 'gmTrafficlayer',
        name: 'trafficLayer',
        cls: 'TrafficLayer',
        create: function (scope, element, attrs, controllers, options, create) {
          if (!attrs.ngShow && !attrs.ngHide) { // visibility is not handled, so, we need to display it after creation
            controllers[0].then(function (layer) {
              layer.setMap(controllers[1].get());
            });
          }
          create(options);
          return true;
        }
      });
    }])

  ;

}(angular));