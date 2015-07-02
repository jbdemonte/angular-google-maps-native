var google = (function () {

  var maps = {};

  maps.Map = function () {
    var data = this.__data = {};

    this.setCenter = function (center) {
      data.center = center;
    };

  };

  maps.LatLng = function (lat, lng) {

    this.lat = function () {
      return lat;
    };

    this.lng = function () {
      return lng;
    };
  };

  maps.event = function () {
    function add(obj, name, fn, once) {
      obj.__events = (obj.__events || {});
      obj.__events[name] = (obj.__events[name] || []);
      obj.__events[name].push({fn: fn, once: once})
    }
    this.addListener = function (obj, name, fn) {
      add(obj, name, fn);
    };
    this.addListenerOnce = function () {
      add(obj, name, fn, true);
    };
  };


  return {maps: maps}
}());