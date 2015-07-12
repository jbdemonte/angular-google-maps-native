/*
  address is handle on LatLng process, so, no need to test all directives
*/
describe('gm-address', function () {

  var $compile, $rootScope, $scope, $timeout,
    element, scope, googleMaps;


  //---------------------------------------------------------------------------
  // Load Library
  //---------------------------------------------------------------------------

  testTools.mokeGMLibrary();

  //---------------------------------------------------------------------------
  // Inject required
  //---------------------------------------------------------------------------
  beforeEach(inject(function(_$rootScope_, _$timeout_, _$compile_) {
    $rootScope = _$rootScope_;
    $timeout = _$timeout_;
    $compile = _$compile_;
    $scope = $rootScope.$new();
    googleMaps = $rootScope.google.maps;
  }));


  //---------------------------------------------------------------------------
  // TESTS
  //---------------------------------------------------------------------------


  it('test on map', function (done) {
    /*
     Test process:
       - not defined: no map
       - set: map init
       - update: map update
     */

    element = $compile('<gm-map gm-address="address" options="{zoom: 8}"></gm-map>')($scope);
    $scope.$digest();
    $timeout.flush();
    scope = element.scope();

    expect(scope.map).to.be.an('undefined');

    $scope.address = {address: '1,2'};
    $scope.$digest();

    // geocode is async
    setTimeout(function() {
      $scope.$digest();
      $timeout.flush();
      expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
      testTools.test.latLng(scope.map.getCenter(), 1, 2);

      $scope.address = {address: '3,4'};
      $scope.$digest();

      setTimeout(function() {
        $scope.$digest();
        $timeout.flush();
        testTools.test.latLng(scope.map.getCenter(), 3, 4);
        done();
      }, 10);

    }, 10);

  });


  it('test error', function (done) {
    /*
      Test process:
         - ERROR: map should not be initialised
         - OK: map should be initialised
         - ERROR: map should not change
         - OK: map should update
     */

    element = $compile('<gm-map gm-address="address" options="{zoom: 8}"></gm-map>')($scope);
    $scope.$digest();
    $timeout.flush();
    scope = element.scope();

    expect(scope.map).to.be.an('undefined');

    $scope.address = {address: googleMaps.GeocoderStatus.ERROR};
    $scope.$digest();

    setTimeout(function() {
      $scope.$digest();
      $timeout.flush();
      expect(scope.map).to.be.an('undefined');

      $scope.address = {address: '1,2'};
      $scope.$digest();

      setTimeout(function() {
        $scope.$digest();
        $timeout.flush();
        expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
        testTools.test.latLng(scope.map.getCenter(), 1, 2);

        $scope.address = {address: googleMaps.GeocoderStatus.ERROR};
        $scope.$digest();

        setTimeout(function() {
          $scope.$digest();
          $timeout.flush();
          expect(scope.map instanceof googleMaps.Map).to.be.equal(true); // should not change
          testTools.test.latLng(scope.map.getCenter(), 1, 2);

          $scope.address = {address: '3,4'};
          $scope.$digest();

          setTimeout(function() {
            $scope.$digest();
            $timeout.flush();
            testTools.test.latLng(scope.map.getCenter(), 3, 4);
            done();
          }, 10);

        }, 10);

      }, 10);

    }, 10);

  });

  it('test on marker', function (done) {
    /*
     Test process:
       - not defined: no map
       - set: map init
       - update: map update
     */

    element = $compile('<gm-map options="{center: [1,2], zoom: 8}"><gm-marker gm-address="address"></gm-marker></gm-map>')($scope);
    $scope.$digest();
    $timeout.flush();
    element = element.find('gm-marker');
    scope = element.scope();

    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
    expect(scope.marker).to.be.an('undefined');

    $scope.address = {address: '3,4'};
    $scope.$digest();

    setTimeout(function() {
      $scope.$digest();
      $timeout.flush();
      expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
      expect(scope.marker instanceof googleMaps.Marker).to.be.equal(true);
      testTools.test.latLng(scope.marker.getPosition(), 3, 4);

      $scope.address = {address: '5,6'};
      $scope.$digest();

      setTimeout(function() {
        $scope.$digest();
        $timeout.flush();
        testTools.test.latLng(scope.marker.getPosition(), 5, 6);
        done();
      }, 10);

    }, 10);

  });

  it('test both legacy attribute in options and gm-address', function (done) {
    /*
      Legacy attribute should be used first, and then address is binded
     */

    element = $compile('<gm-map gm-address="address" options="{center: [1, 2], zoom: 8}"></gm-map>')($scope);
    $scope.$digest();
    $timeout.flush();
    scope = element.scope();

    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
    testTools.test.latLng(scope.map.getCenter(), 1, 2);


    $scope.address = {address: '3,4'};
    $scope.$digest();

    setTimeout(function() {
      $scope.$digest();
      $timeout.flush();
      testTools.test.latLng(scope.map.getCenter(), 3, 4);
      done();
    }, 10);

  });

  it('test both legacy attribute binded and gm-address started by legacy', function (done) {
    /*
     Test process:
       - none defined: no map
       - set center: map init
       - set address: map update
       - set center: map update
       - set address: map update
     */

    element = $compile('<gm-map gm-address="address" center="center" options="{zoom: 8}"></gm-map>')($scope);
    $scope.$digest();
    $timeout.flush();
    scope = element.scope();

    $scope.center = [1, 2];
    $scope.$digest();
    $timeout.flush();

    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
    testTools.test.latLng(scope.map.getCenter(), 1, 2);

    $scope.address =  {address: '3,4'};
    $scope.$digest();

    setTimeout(function() {
      $scope.$digest();
      $timeout.flush();
      testTools.test.latLng(scope.map.getCenter(), 3, 4);

      $scope.center = [5, 6];
      $scope.$digest();
      testTools.test.latLng(scope.map.getCenter(), 5, 6);

      $scope.address =  {address: '7,8'};
      $scope.$digest();

      setTimeout(function() {
        $scope.$digest();
        $timeout.flush();
        testTools.test.latLng(scope.map.getCenter(), 7, 8);
        done();
      }, 10);

    }, 10);

  });

  it('test both legacy attribute binded and gm-address started by address', function (done) {
    /*
     Test process:
     - none defined: no map
     - set address: map init
     - set center: map update
     - set center: map update
     - set address: map update
     */

    element = $compile('<gm-map gm-address="address" center="center" options="{zoom: 8}"></gm-map>')($scope);
    $scope.$digest();
    $timeout.flush();
    scope = element.scope();

    expect(scope.map).to.be.an('undefined');

    $scope.address = {address: '1,2'};
    $scope.$digest();

    setTimeout(function() {
      $scope.$digest();
      $timeout.flush();
      expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
      testTools.test.latLng(scope.map.getCenter(), 1, 2);

      $scope.center = [3, 4];
      $scope.$digest();
      testTools.test.latLng(scope.map.getCenter(), 3, 4);

      $scope.address = {address: '5,6'};
      $scope.$digest();

      setTimeout(function() {
        $scope.$digest();
        $timeout.flush();
        testTools.test.latLng(scope.map.getCenter(), 5, 6);
        done();
      }, 10);

    }, 10);

  });


});