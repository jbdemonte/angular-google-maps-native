var testTools = {

  mokeGMLibrary: function () {
    var $document, $window, $rootScope, $q,
      provider;

    beforeEach(function () {
      var fakeModule = angular.module('test.app.config', function () {});

      fakeModule.config(function (gmLibraryProvider) {
        provider = gmLibraryProvider;
      });

      module('GoogleMapsNative', 'test.app.config');

      inject(function () {});
    });

    beforeEach(inject(function(_$window_, _$document_, _$rootScope_, _$q_) {
      $window = _$window_;
      $document = _$document_;
      $rootScope = _$rootScope_;
      $q = _$q_;
    }));



    beforeEach(function(){

      var gmLibrary;

      provider.configure({
        url: 'http://url',
        callback: '__callback'
      });

      gmLibrary = provider.$get[4]($document, $window, $rootScope, $q);

      gmLibrary.load().then(function () {
        gmLibrary.populate($rootScope);
      });

      // simulate load ends
      $window.__callback();

      // required for promise to be resolved
      $rootScope.$digest();

      expect($rootScope.google).not.to.be.an('undefined');
    });
  }
};