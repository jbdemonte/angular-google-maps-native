var google = (function () {

  function ucfirst(str) {
    str += '';
    return str.charAt(0).toUpperCase() + str.substr(1);
  }


  function createGenericObject(options) {
    function F() {
      this.__data = {};
      this.__events = {};
      this.__get = function (name) {
        return this.__data[name];
      };
      if (options.constructor) {
        if (options.constructor === true) { // generic: function (options) { }
          if (angular.isObject(arguments[0])) {
            angular.extend(this.__data, arguments[0]);
          }
        } else {
          options.constructor.apply(this, arguments)
        }
      }
    }

    // append getter / setter for property list
    angular.forEach((options.prop || '').split(' '), function (feature) {
      var uc = ucfirst(feature);
      F.prototype['set' + uc] = function (value) {
        this.__data[feature] = value;
      };
      F.prototype['get' + uc] = function () {
        return this.__data[feature];
      };
    });
    return F;
  }

  var maps = {};

  maps.Map = createGenericObject({
    prop: 'center div heading mapTypeId projection streetView tilt zoom',
    constructor: function (mapDiv, options) {
      this.__data.__mapDiv = mapDiv;
      angular.extend(this.__data, options);
    }
  });

  maps.Marker = createGenericObject({
    prop: 'animation attribution clickable cursor draggable icon map opacity place position shape title visible zIndex',
    constructor: true
  });

  maps.Circle = createGenericObject({
    prop: 'bounds center draggable editable map radius visible',
    constructor: true
  });

  maps.Rectangle = createGenericObject({
    prop: 'bounds draggable editable map visible',
    constructor: true
  });

  maps.InfoWindow = createGenericObject({
    prop: 'content position zIndex',
    constructor: true
  });

  maps.Polyline = createGenericObject({
    prop: 'draggable editable map path visible',
    constructor: true
  });

  maps.Polygon = createGenericObject({
    prop: 'draggable editable map path paths visible',
    constructor: true
  });

  maps.InfoWindow.prototype.open = function (map, anchor) {
    this.__data.__map = map;
    this.__data.__anchor = anchor;
    this.__data.__opened = true;
  };

  maps.InfoWindow.prototype.close = function () {
    this.__data.__opened = false;
  };

  maps.DirectionsRenderer = createGenericObject({
    prop: 'map directions',
    constructor: true
  });

  maps.LatLng = function (lat, lng) {

    this.lat = function () {
      return lat;
    };

    this.lng = function () {
      return lng;
    };
  };

  maps.LatLngBounds = function (sw, ne) {

    this.sw = function () {
      return sw;
    };

    this.ne = function () {
      return ne;
    };
  };



  maps.event = (function () {

    function add(obj, name, fn, once) {
      obj.__events[name] = (obj.__events[name] || []);
      obj.__events[name].push({fn: fn, once: once});
      return obj.__events[name]. length - 1;
    }

    return {
      addListener: function (obj, name, fn) {
        return add(obj, name, fn, false);
      },
      addListenerOnce: function (obj, name, fn) {
        return add(obj, name, fn, true);
      },
      trigger: function (obj, name) {
        if (obj && obj.__events && obj.__events[name]) {
          angular.forEach(obj.__events[name], function (item, key) {
            if (item) {
              if (item.once) {
                obj.__events[name][key] = null;
              }
              item.fn();
            }
          });
        }
      }
    };
  }());


  maps.DirectionsService = function () {
    this.route = function (options, callback) {
      setTimeout(function () {
        callback({options: options}, 'status');
      });
    }
  };


  return {maps: maps}
}());