describe('LatLng', function () {

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

  function compile(template) {
    element = $compile(template)($scope);
    $scope.$digest();
    $timeout.flush();
    scope = element.scope();
  }

  it('test array', function () {
    compile('<gm-map options="{center: [1, 2], zoom: 8}"></gm-map>');
    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
    testTools.test.latLng(scope.map.getCenter(), 1, 2);
  });

  it('test literal', function () {
    compile('<gm-map options="{center: {lat:3, lng: 4}, zoom: 8}"></gm-map>');
    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
    testTools.test.latLng(scope.map.getCenter(), 3, 4);
  });

  it('test google.maps.LatLng', function () {
    $scope.center = new googleMaps.LatLng(5, 6);
    compile('<gm-map center="center" options="{zoom: 8}"></gm-map>');
    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
    testTools.test.latLng(scope.map.getCenter(), 5, 6);
  });


});