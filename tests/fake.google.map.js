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
    prop: 'center div heading mapTypeId projection streetView tilt zoom'
  });

  maps.LatLng = function (lat, lng) {

    this.lat = function () {
      return lat;
    };

    this.lng = function () {
      return lng;
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


  return {maps: maps}
}());