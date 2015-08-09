describe('LatLngBounds', function () {

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
    element = $compile('<gm-map options="{center: [37, -122], zoom: 8}">' + template + '</gm-map>')($scope);
    $scope.$digest();
    $timeout.flush();
    element = element.find('gm-rectangle');
    scope = element.scope();
  }

  it('test array', function () {
    compile('<gm-rectangle options="{bounds: [1, 2, 3, 4]}"></gm-rectangle>');
    expect(scope.rectangle instanceof googleMaps.Rectangle).to.be.equal(true);
    testTools.test.latLngBounds(scope.rectangle.getBounds(), 1, 2, 3, 4);
  });

  it('test array of array as LatLng', function () {
    compile('<gm-rectangle options="{bounds: [[5, 6], [7, 8]]}"></gm-rectangle>');
    expect(scope.rectangle instanceof googleMaps.Rectangle).to.be.equal(true);
    testTools.test.latLngBounds(scope.rectangle.getBounds(), 5, 6, 7, 8);
  });

  it('test array of literal LatLng', function () {
    compile('<gm-rectangle options="{bounds: [{lat: 1, lng: 2}, {lat: 3, lng: 4}]}"></gm-rectangle>');
    expect(scope.rectangle instanceof googleMaps.Rectangle).to.be.equal(true);
    testTools.test.latLngBounds(scope.rectangle.getBounds(), 1, 2, 3, 4);
  });

  it('test array of LatLng', function () {
    $scope.bounds = [new googleMaps.LatLng(5, 6), new googleMaps.LatLng(7, 8)];
    compile('<gm-rectangle bounds="bounds"></gm-rectangle>');
    expect(scope.rectangle instanceof googleMaps.Rectangle).to.be.equal(true);
    testTools.test.latLngBounds(scope.rectangle.getBounds(), 5, 6, 7, 8);
  });

  it('test literal', function () {
    compile('<gm-rectangle options="{bounds: {n:1, e:2, s:3, w:4}}"></gm-rectangle>');
    expect(scope.rectangle instanceof googleMaps.Rectangle).to.be.equal(true);
    testTools.test.latLngBounds(scope.rectangle.getBounds(), 1, 2, 3, 4);
  });

  it('test literal ne, sw array', function () {
    compile('<gm-rectangle options="{bounds: {ne: [5, 6], sw: [7 ,8]}}"></gm-rectangle>');
    expect(scope.rectangle instanceof googleMaps.Rectangle).to.be.equal(true);
    testTools.test.latLngBounds(scope.rectangle.getBounds(), 5, 6, 7, 8);
  });

  it('test literal ne, sw literal', function () {
    compile('<gm-rectangle options="{bounds: {ne: {lat: 1, lng: 2}, sw: {lat: 3, lng: 4}}}"></gm-rectangle>');
    expect(scope.rectangle instanceof googleMaps.Rectangle).to.be.equal(true);
    testTools.test.latLngBounds(scope.rectangle.getBounds(), 1, 2, 3, 4);
  });

  it('test literal ne, sw LatLng', function () {
    $scope.bounds = {ne: new googleMaps.LatLng(5, 6), sw: new googleMaps.LatLng(7, 8)};
    compile('<gm-rectangle bounds="bounds"></gm-rectangle>');
    expect(scope.rectangle instanceof googleMaps.Rectangle).to.be.equal(true);
    testTools.test.latLngBounds(scope.rectangle.getBounds(), 5, 6, 7, 8);
  });

  it('test google.maps.LatLngBounds', function () {
    $scope.bounds = new googleMaps.LatLngBounds(new googleMaps.LatLng(3, 4), new googleMaps.LatLng(1, 2));
    compile('<gm-rectangle bounds="bounds"></gm-rectangle>');
    expect(scope.rectangle instanceof googleMaps.Rectangle).to.be.equal(true);
    testTools.test.latLngBounds(scope.rectangle.getBounds(), 1, 2, 3, 4);
  });

});