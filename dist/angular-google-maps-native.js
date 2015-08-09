/*! angular-google-maps-native v2.0.0 | 2015-08-09 | DEMONTE Jean-Baptiste | jbdemonte@gmail.com | GPL v3 */
(function(angular, undefined) {
  'use strict';

  var googleMap, // will be set when library will be loaded (used to reduce code weight when minifying)
    services,
    $q, $parse, $timeout,
    forEach = angular.forEach,
    isDefined = angular.isDefined,
    lowercase = angular.lowercase,
    gmAddress = 'gmAddress';


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
   * A service for converting between an address and a LatLng.
   * @param request {GeocoderRequest}
   * @returns {Promise}
   */
  function geocode(request) {
    var deferred = $q.defer();
    services('Geocoder').geocode(
      angular.isString(request) ? {address: request} : request,
      function (results, status) {
        if (status === googleMap.GeocoderStatus.OK) {
          deferred.resolve(results[0].geometry.location, results);
        }  else {
          error("geocode: " + status);
          deferred.reject();
        }
      }
    );
    return deferred.promise;
  }

  /**
   * log error
   */
  function error() {
    if (console) {
      console.error.apply(console, arguments);
    }
  }


  /**
   * Create an expression based on ngShow and ngHide to evaluate visibility
   * @param attrs {object}
   * @returns {string}
   */
  function getVisibility(attrs) {
    return (attrs.ngShow ? '(' + attrs.ngShow + ')' : '') + (attrs.ngHide ? (attrs.ngShow ? ' && ' : '') + '!(' + attrs.ngHide + ')' : '') || '';
  }

  /**
   * No operation cast
   * @param value
   * @returns {*}
   */
  function toNop(value) {
    return value;
  }

  /**
   * Cast to number
   * @param value {string|number}
   * @returns {number}
   */
  function toNumber(value) {
    value = 1 * value;
    if (!isNaN(value)) {
      return value;
    }
  }


  /**
   * Convert mix LatLng to a new google.maps.LatLng
   * @param mixed {*} LatLng, [lat, lng], {lat: number, lng: number}
   * @param returnMixed {boolean} (optional, default = false) if true and no result, return mixed
   * @returns {LatLng|*|undefined}
   */
  function toLatLng(mixed) {
    var lat, lng, result;
    if (mixed instanceof googleMap.LatLng) {
      return mixed;
    }
    if (angular.isArray(mixed)) {
      lat = toNumber(mixed[0]);
      lng = toNumber(mixed[1]);
    } else if (angular.isObject(mixed)) {
      lat = toNumber(mixed.lat);
      lng = toNumber(mixed.lng);
    }
    if (isDefined(lat) && isDefined(lng)) {
      result = new googleMap.LatLng(lat, lng);
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
    var ne, sw, result;
    if (!mixed || mixed instanceof googleMap.LatLngBounds) {
      return mixed || undefined;
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
      result = new googleMap.LatLngBounds(sw, ne);
    }
    return result;
  }


  /**
   * Lower first character
   * @param str {string}
   * @returns {string}
   */
  function lcfirst(str) {
    str += '';
    return lowercase(str.charAt(0)) + str.substr(1);
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
    return lowercase(
      attribute
        .replace(/([a-z0-9])([A-Z])/g, '$1_$2') // add _
        .replace(/^[^_]+_/, '')                 // remove first item (on / once)
      );
  }

  /**
   * Bind events on google map object from attributes
   * @param obj {Google.Maps.Object}
   * @param scope {Scope}
   * @param attrs {Attributes}
   */
  function bind(obj, scope, attrs) {
    forEach(attrs, function (value, key) {
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
  }

  /**
   * Watch "gm-address" attribute
   * @param scope
   * @param attrs
   * @param callback {function}
   * @returns {undefined|function()} deregistration function
   */
  function address(scope, attrs, callback) {
    var lastValue, handler;
    if (gmAddress in attrs) {
      handler = scope.$watch(attrs[gmAddress], function (value) {
        // address may change before getting geocoder result, so, we need to ensure that this is the latest value
        lastValue = value;
        if (value) {
          geocode(value).then(function (latLng) {
            if (angular.equals(lastValue, value)) { // result is still valid, request does not changed
              callback(latLng);
            }
          });
        }
      })
    }
    return handler;
  }

  /**
   * Watch some attributes and run google maps generic functions (setX, setY)
   * @param scope {Scope}
   * @param attrs {Attributes}
   * @param controller {Controller}
   * @param feature {string} attribute name to observes
   * @param cast {function} preprocess value observed
   */
  function prop(scope, attrs, controller, feature, cast) {
    var normalised = lowercase(feature);

    function callback(value) {
      controller.then(function (obj) {
        value = cast(value);
        if (isDefined(value)) {
          obj['set' + ucfirst(feature)](value);
        }
      });
    }

    if (normalised in attrs) {
      scope.$watch(attrs[normalised], function (value) {
        if (isDefined(value)) {
          callback(value);
        }
      });
    }
    if (cast === toLatLng) {
      address(
        scope,
        attrs,
        function (latLng) {
          callback(latLng);
        }
      );
    }
  }

  /**
   * prop handler + options object
   * @param scope {Scope}
   * @param attrs {Attributes}
   * @param controller {Controller}
   * @param features {object}
   *                    [name]: cast
   *                      name     {string}    property name
   *                      cast     {function}  (optional) preprocess value
   *
   */
  function props(scope, attrs, controller, features) {
    forEach(features, function (cast, name) {
      prop(scope, attrs, controller, name, cast);
    });
    if ('options' in attrs) {
      prop(scope, attrs, controller, 'options', function (value) {
        forEach(features, function (cast, name) {
          if (name in value) {
            value[name] = cast(value[name]);
          }
        });
        return value;
      });
    }
  }

  /**
   * Observe some attributes and wait all of them to run a callback
   * @param scope {Scope}
   * @param attrs {Attributes}
   * @param features {string|object} string: space separated attribute names to observes; object: {name:cast}
   * @param callback {function} callback to run
   * @param once {boolean} (optional, default=false) watch only one time
   */
  function wait(scope, attrs, features, callback, once) {

    var mandatories, handler,
      handlers = [],
      options = {};

    if (angular.isString(features)) {
      mandatories = features.split(" ");
      features = {}; // all features has no cast function associated
    } else {
      mandatories = Object.keys(features);
    }

    /**
     * Return True if all mandatories are provided
     * @returns {boolean}
     */
    function isComplete() {
      var result = true;
      forEach(mandatories, function (name) {
        // cast if needed
        if (isDefined(options[name]) && features[name]) {
          options[name] = features[name](options[name]);
        }
        result = result && isDefined(options[name]);
      });
      return result;
    }

    /**
     * Test mandatories, unbind if needed and run callback handler
     * Return True if process is finished
     */
    function check() {
      if (isComplete()) {
        // stop all watches
        if (once) {
          forEach(handlers, function (handler) {
            handler();
          });
        }
        callback(options);
        return once;
      }
    }

    // evaluate options from element attribute
    if (attrs.options) {
      options = $parse(attrs.options)(scope);
    }

    if (!check()) {
      forEach(mandatories, function (name) {
        var watched = false,
          normalised = lowercase(name);

        if (normalised in attrs) {
          watched = true;
          handlers.push(scope.$watch(attrs[normalised], function (value) {
            if (isDefined(value)) {
              options[name] = value;
              check();
            }
          }));
        }
        if (features[name] === toLatLng) {
          handler = address(
            scope,
            attrs,
            function (latLng) {
              options[name] = latLng;
              check();
            }
          );
          if (handler) {
            watched = true;
            handlers.push(handler);
          }
        }
        if (!watched && !isDefined(options[name])) {
          error(name + ' missing');
        }
      });
    }
  }

  /**
   * Directive builder for overlays
   * @param cls           {string}    google.maps object class => ie: Marker for google.maps.Marker
   * @param buildOptions  {object}
   *          .directive  {string}    (optional) current directive name (default is 'gm' + cls)
   *          .name       {string}    (optional) object scope name (default is lcfirst(cls))
   *          .main       {object}    (optional) main property to to wait / watch / observe before creating object
   *                [name]: cast
   *                  name     {string}    property name
   *                  cast     {function}  (optional) preprocess value
   *          .opts       {boolean}   use a subobject (opts) as options constructor (default = false)
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
   *          .instantiate  {function(scope, element, attrs, options)} low level google.maps.Object instantiation
   *                        @param scope
   *                        @param element
   *                        @param attrs
   *                        @param options
   *                        @return {Object}
   *          .visibility {function(scope, element, attrs, controllers, value)} toggle visibility handler
   *                        @param scope
   *                        @param element
   *                        @param attrs
   *                        @param controllers
   *                        @param value        {boolean} true = visible, false = hidden
   *
   * @returns {Object}
   */
  function buildOverlay (cls, buildOptions) {
    var require = [buildOptions.directive || 'gm' + ucfirst(lowercase(cls))];
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
        var obj, build, mapController, controllers,
          scopeName = buildOptions.name || lcfirst(cls),
          self = this,
          deferred = $q.defer();


        /**
         * When item is destroyed, remove the overlay from the map
         */
        $scope.$on("$destroy", function () {
          if (obj) {
            if (buildOptions.destroy) {
              buildOptions.destroy($scope, $element, $attrs, obj);
            } else {
              obj.setMap(undefined);
            }
            obj = undefined;
            delete $scope[scopeName];
          } else {
            deferred.reject();
          }
        });

        /**
         * Create the object
         */
        build = once(function (options, map, visible) {
          var opts = buildOptions.opts ? options.opts || {} : options;
          if (!visible && opts.map) {
            delete opts.map;
          }
          obj = buildOptions.instantiate ? buildOptions.instantiate($scope, $element, $attrs, options) : new googleMap[cls](options);
          // some objects does not use "map" from options and need to use a setMap instead of options.map
          if (visible && !opts.map && obj.setMap) {
            obj.setMap(map);
          }
          $scope[scopeName] = obj;
          bind(obj, $scope, $attrs);
          deferred.resolve(obj);
        });

        /**
         * Handle the creation the object depending on its visibility
         */
        function create(options) {
          var visibility = getVisibility($attrs),
            map = mapController.get();

          // if map visibility is dynamic, evaluate it
          if (visibility) {
            $scope.$watch(visibility, function (value) {
              if (obj) {
                if (buildOptions.visibility) {
                  buildOptions.visibility($scope, $element, $attrs, controllers, value);
                } else {
                  obj.setMap(value ? map : null);
                }
              } else {
                build(options, map, value);
                if (buildOptions.visibility) {
                  buildOptions.visibility($scope, $element, $attrs, controllers, value);
                }
              }
            });
          } else {
            build(options, map, true);
          }
        }

        self.init = once(function (_controllers_) {
          controllers =_controllers_;
          mapController = controllers[controllers.length - 1];

          mapController.then(function (map) {
            var options = {};

            // if build provide a custom constructor, use it
            if (buildOptions.create) {
              if ($attrs.options) {
                options = $parse($attrs.options)($scope);
                forEach(buildOptions.main, function (cast, name) {
                  if (name in options) {
                    options[name] = cast(options[name]);
                  }
                });
              }
              // if it satisfy the creation, return
              if (buildOptions.create($scope, $element, $attrs, controllers, options, create)) {
                return;
              }
            }

            // no custom constructor or does not satisfy the creation, so, use default one
            wait(
              $scope,
              $attrs,
              buildOptions.main,
              function (options) {
                if (buildOptions.opts) {
                  options.opts = options.opts || {};
                  options.opts.map = map;
                } else {
                  options.map = map;
                }
                create(options);
                props($scope, $attrs, self, buildOptions.main);
              },
              true // once only
            );
          });

          if ($attrs.gmThen) {
            self.then(function () {
              $parse($attrs.gmThen)($scope.$new(false));
            });
          }
        });

        /**
         * Append a function in the promise process
         * @param f
         */
        self.then = function (f) {
          deferred.promise.then(f);
        };

        /**
         * return google map object
         * @returns {*}
         */
        self.get = function () {
          return obj;
        };
      }],
      link: function (scope, element, attrs, controllers) {
        controllers[0].init(controllers);
      }
    };
  }

  /**
   * Directive builder for Layers
   * @param buildOptions (see buildOverlay)
   * @returns {Object}
   */
  function buildLayer(cls, buildOptions) {
    return buildOverlay(
      cls,
      angular.extend(
        {
          create: function (scope, element, attrs, controllers, options, create) {
            if (!attrs.ngShow && !attrs.ngHide) { // visibility is not handled, so, we need to display it after creation
              controllers[0].then(function (layer) {
                layer.setMap(controllers[1].get());
              });
            }
            create(options);
            return true;
          }
        },
        buildOptions
      )
    );
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
        forEach(options, function (value, key) {
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
      function load($document, $window) {
        var script, callback = options.callback;

        if (!loading) {
          loading = true;

          // create the deferred which may be used more than once
          deferred = $q.defer();

          // user already load google maps libraries, so, we have to trust him (even regarding libraries) because library
          // can't be loaded more than once else trigger errors
          if ($window.google && $window.google.maps) {
            deferred.resolve();
            googleMap = $window.google.maps;
          } else {

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

      this.$get = ['$document', '$window', '$rootScope', '$q', '$parse', '$timeout', function ($document, $window, $rootScope, _$q_, _$parse_, _$timeout_) {
        $q =  _$q_;
        $parse =_$parse_;
        $timeout = _$timeout_;
        return {
          /**
           * Populate scope
           * @param scope
           */
          populate: function (scope) {
            scope.google = $window.google;
            $rootScope.google = $window.google;
          },
          /**
           * Async load google map library
           * @returns {Promise}
           */
          load: function () {
            var deferred;
            if (options.load) {
              deferred = $q.defer();
              options.load(deferred);
              return deferred.promise.then(function () {
                return load($document, $window);
              })
            } else {
              return load($document, $window);
            }
          }
        };
      }];
    })

    .directive('gmMap', ['gmLibrary', function (gmLibrary) {
      return {
        restrict: 'E',
        scope: true,
        controller: ['$scope', '$element', '$attrs', function ($scope, $element, $attrs) {
          var map, build,
            self = this,
            deferred = $q.defer(),
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

          $scope.$on("$destroy", function () {
            if (map) {
              map = undefined;
              delete $scope.map;
            } else {
              deferred.reject();
            }
          });

          /**
           * Create the map
           */
          build = once(function (options) {
            $timeout(function () { // wait until dom element visibility is toggled if needed
              map = new googleMap.Map(target[0], options);
              $scope.map = map;
              bind(map, $scope, $attrs);
              deferred.resolve(map);
            }, 100);
          });

          /**
           * Create the map
           */
          function create(options) {
            var visibility = getVisibility($attrs);
            // if map visibility is dynamic, evaluate it
            if (visibility) {
              $scope.$watch(visibility, function (value) {
                if (value) {
                  if (map) {
                    $timeout(function () {
                      googleMap.event.trigger(map, 'resize');
                    });
                  } else {
                    build(options);
                  }
                }
              });
            } else {
              build(options);
            }
          }

          self.init = function () {
            gmLibrary.load().then(function () {

              gmLibrary.populate($scope);

              wait(
                $scope,
                $attrs,
                {center: toLatLng, zoom: toNumber},
                function (options) {
                  create(options);

                  props($scope, $attrs, self, {
                    center: toLatLng,
                    zoom: toNumber,
                    mapTypeId: toNop,
                    heading: toNumber,
                    tilt: toNumber
                  });
                },
                true // once only
              );
            });

            if ($attrs.gmThen) {
              self.then(function () {
                $parse($attrs.gmThen)($scope.$new(false));
              });
            }
          };

          /**
           * Append a function in the promise process
           * @param f
           */
          self.then = function (f) {
            deferred.promise.then(f);
          };

          /**
           * return google map object
           * @returns {*}
           */
          self.get = function () {
            return map;
          };
        }],
        link: function (scope, elem, attrs, controller) {
          controller.init();
        }
      };
    }])

    .directive('gmMarker', function () {
      return buildOverlay('Marker', {
        main: {                 // main property to wait / watch / observe before creating
          position: toLatLng
        }
      });
    })

    .directive('gmCircle', function () {
      return buildOverlay('Circle', {
        main: {
          center: toLatLng,
          radius: toNumber
        }
      });
    })

    .directive('gmRectangle', function () {
      return buildOverlay('Rectangle', {
        main: {
          bounds: toLatLngBounds
        }
      });
    })

    .directive('gmInfowindow', function () {
      return buildOverlay('InfoWindow', {
        require: '^?gmMarker',
        main: {
          position: toLatLng
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
            wait(
              scope,
              attrs,
              {position: toLatLng},
              function (options) {
                payload(options);
                props(scope, attrs, controllers[0], {position: toLatLng});
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
    })

    .directive('gmDirections', function () {
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
            options.origin = toLatLng(options.origin) || options.origin;
            options.destination = toLatLng(options.destination) || options.destination;
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
            wait(
              scope,
              attrs,
              'origin destination travelMode',
              function (options) {
                controller._run(options);
              }
            );
          });
        }
      };
    })

    .directive('gmRenderer', function () {
      return buildOverlay('DirectionsRenderer', {
        directive: 'gmRenderer',
        name: 'renderer',
        require: '^gmDirections',
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
    })

    .directive('gmPolyline', function () {
      return buildOverlay('Polyline', {
        main: {
          path: function (path) {
            forEach(path, function (value, index) {
              path[index] = toLatLng(value);
            });
            return path;
          }
        }
      });
    })

    .directive('gmPolygon', function () {
      return buildOverlay('Polygon', {
        main: {
          paths: function (paths) {
            forEach(paths, function (value, index) {
              paths[index] = toLatLng(value);
            });
            return paths;
          }
        }
      });
    })

    .directive('gmGroundoverlay', function () {
      return buildOverlay('GroundOverlay', {
        opts: true,
        instantiate: function (scope, element, attrs, options) {
          return new googleMap.GroundOverlay(options.url, options.bounds, options.opts);
        },
        create: function (scope, element, attrs, controllers, options, create) {
          controllers[1].then(function () { // mapController
            wait(
              scope,
              attrs,
              'url bounds',
              function (options) {
                options.bounds = toLatLngBounds(options.bounds);
                create(options); // will handle the setMap
              },
              true // once only
            );
          });
          return true;
        }
      });
    })

    .directive('gmKmllayer', function () {
      return buildOverlay('KmlLayer', {
        opts: true,
        main: {
          url: toNop
        },
        instantiate: function (scope, element, attrs, options) {
          return new googleMap.KmlLayer(options.url, options.opts);
        }
      });
    })

    .directive('gmStyledmaptype', function () {
      return {
        restrict: 'E',
        require: '^gmMap',
        link: function (scope, elem, attrs, mapController) {
          mapController.then(function (map) {
            scope.map = map;
            map.mapTypes.set(attrs.id, new googleMap.StyledMapType($parse(attrs.styles)(scope), attrs.options ? $parse(attrs.options)(scope) : undefined));
          })
        }
      };
    })

    .directive('gmTrafficlayer', function () {
      return buildLayer('TrafficLayer');
    })

    .directive('gmBicyclinglayer', function () {
      return buildLayer('BicyclingLayer');
    })

    .directive('gmTransitlayer', function () {
      return buildLayer('TransitLayer');
    })

    .directive('gmStreetviewpanorama', ['gmLibrary', function (gmLibrary) {
      return {
        restrict: 'E',
        scope: true,
        controller: ['$scope', '$element', '$attrs', function ($scope, $element, $attrs) {
          var streetViewPanorama, build,
            self = this,
            deferred = $q.defer();

          $scope.$on("$destroy", function () {
            if (streetViewPanorama) {
              streetViewPanorama = undefined;
              delete $scope.streetViewPanorama;
            } else {
              deferred.reject();
            }
          });

          /**
           * Create the streetViewPanorama
           */
          build = once(function (options) {
            $timeout(function () { // wait until dom element visibility is toggled if needed
              streetViewPanorama = new googleMap.StreetViewPanorama($element[0], options);
              $scope.streetViewPanorama = streetViewPanorama;
              bind(streetViewPanorama, $scope, $attrs);
              deferred.resolve(streetViewPanorama);
            }, 100);
          });

          /**
           * Handle the creation the streetViewPanorama depending on its visibility
           */
          function create(options) {
            var visibility = getVisibility($attrs);
            // if visibility is dynamic, evaluate it
            if (visibility) {
              $scope.$watch(visibility, function (value) {
                if (value) {
                  if (streetViewPanorama) {
                    $timeout(function () {
                      googleMap.event.trigger(streetViewPanorama, 'resize');
                    });
                  } else {
                    build(options);
                  }
                }
              });
            } else {
              build(options);
            }
          }

          self.init = once(function () {
            gmLibrary.load().then(function () {

              gmLibrary.populate($scope);

              wait(
                $scope,
                $attrs,
                {position: toLatLng},
                function (options) {
                  create(options);
                  props($scope, $attrs, self, {
                    position: toLatLng,
                    pov: toNop,
                    zoom: toNumber
                  });
                },
                true // once only
              );
            });

            if ($attrs.gmThen) {
              self.then(function () {
                $parse($attrs.gmThen)($scope.$new(false));
              });
            }
          });

          /**
           * Append a function in the promise process
           * @param f
           */
          self.then = function (f) {
            deferred.promise.then(f);
          };

          /**
           * return google map object
           * @returns {*}
           */
          self.get = function () {
            return streetViewPanorama;
          };
        }],
        link: function (scope, elem, attrs, controller) {
          controller.init();
        }
      };
    }])

  ;

}(angular));