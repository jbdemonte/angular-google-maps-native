describe('gmTransitLayer', function () {

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
    element = element.find('gm-transitLayer');
    scope = element.scope();
  }

  it('test simple case', function () {
    compile('<gm-transitLayer></gm-transitLayer>');
    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
    expect(scope.transitLayer instanceof googleMaps.TransitLayer).to.be.equal(true);
    expect(scope.transitLayer.getMap() === scope.map).to.be.equal(true);
  });

  it('test ng-show', function () {
    compile('<gm-transitLayer ng-show="visible"></gm-transitLayer>');
    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
    expect(scope.transitLayer instanceof googleMaps.TransitLayer).to.be.equal(true);
    expect(scope.transitLayer.getMap()).to.be.an('undefined');

    $scope.visible = true;
    $scope.$digest();

    expect(scope.transitLayer.getMap() === scope.map).to.be.equal(true);

    $scope.visible = false;
    $scope.$digest();

    expect(scope.transitLayer.getMap() === scope.map).to.be.equal(false);
    expect(scope.transitLayer.getMap()).to.be.an('null');
  });

  it('test ng-hide', function () {

    $scope.hidden = true;

    compile('<gm-transitLayer ng-hide="hidden"></gm-transitLayer>');
    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
    expect(scope.transitLayer instanceof googleMaps.TransitLayer).to.be.equal(true);
    expect(scope.transitLayer.getMap()).to.be.an('undefined');

    $scope.hidden = false;
    $scope.$digest();

    expect(scope.transitLayer.getMap() === scope.map).to.be.equal(true);

    $scope.hidden = true;
    $scope.$digest();

    expect(scope.transitLayer.getMap() === scope.map).to.be.equal(false);
    expect(scope.transitLayer.getMap()).to.be.an('null');
  });

});