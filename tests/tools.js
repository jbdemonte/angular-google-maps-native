var testTools = {

  mokeGMLibrary: function () {
    var $document, $window, $rootScope, $q, $parse, $timeout,
      provider;

    beforeEach(function () {
      var fakeModule = angular.module('test.app.config', function () {});

      fakeModule.config(function (gmLibraryProvider) {
        provider = gmLibraryProvider;
      });

      module('GoogleMapsNative', 'test.app.config');

      inject(function () {});
    });

    beforeEach(inject(function(_$window_, _$document_, _$rootScope_, _$q_, _$parse_, _$timeout_) {
      $window = _$window_;
      $document = _$document_;
      $rootScope = _$rootScope_;
      $q = _$q_;
      $parse =_$parse_;
      $timeout = _$timeout_;
    }));



    beforeEach(function(){

      var gmLibrary;

      provider.configure({
        url: 'http://url',
        callback: '__callback'
      });

      gmLibrary = provider.$get[6]($document, $window, $rootScope, $q, $parse, $timeout);

      gmLibrary.load().then(function () {
        gmLibrary.populate($rootScope);
      });

      // simulate load ends
      $window.__callback();

      // required for promise to be resolved
      $rootScope.$digest();

      expect($rootScope.google).not.to.be.an('undefined');
    });
  },

  test: {
    /**
     * Test a LatLng
     * @param latLng {google.maps.LatLng}
     * @param mixedLat {Number|google.maps.LatLng|Array}
     * @param lng {number} optional
     */
    latLng: function (latLng, mixedLat, lng) {
      if (angular.isArray(mixedLat)) {
        testTools.test.latLng(latLng, mixedLat[0], mixedLat[1]);
      } else if (mixedLat instanceof google.maps.LatLng) {
        testTools.test.latLng(latLng, mixedLat.lat(), mixedLat.lng());
      } else {
        expect(latLng.lat()).to.be.equal(mixedLat);
        expect(latLng.lng()).to.be.equal(lng);
      }
    },
    latLngBounds: function (latLngBounds, n, e, s, w) {
      expect(latLngBounds.ne().lat()).to.be.equal(n);
      expect(latLngBounds.ne().lng()).to.be.equal(e);
      expect(latLngBounds.sw().lat()).to.be.equal(s);
      expect(latLngBounds.sw().lng()).to.be.equal(w);
    }
  }

};