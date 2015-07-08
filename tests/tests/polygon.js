describe('gmPolygon', function () {

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
    element = element.find('gm-polygon');
    scope = element.scope();
  }

  it('test simple case', function () {
    compile('<gm-polygon options="{paths:[[1, 2], [3, 4], [5, 6]]}"></gm-polygon>');
    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
    expect(scope.polygon instanceof googleMaps.Polygon).to.be.equal(true);
    expect(scope.polygon.getMap() === scope.map).to.be.equal(true);
    testTools.test.latLng(scope.polygon.getPaths()[0], 1, 2);
    testTools.test.latLng(scope.polygon.getPaths()[1], 3, 4);
    testTools.test.latLng(scope.polygon.getPaths()[2], 5, 6);
  });

  it('wait for paths', function () {
    compile('<gm-polygon paths="paths"></gm-polygon>');
    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
    expect(scope.polygon instanceof googleMaps.Polygon).to.be.equal(false);
    $scope.paths = [[1, 2], [3, 4], [5, 6]];
    $scope.$digest();
    expect(scope.polygon instanceof googleMaps.Polygon).to.be.equal(true);
    expect(scope.polygon.getMap() === scope.map).to.be.equal(true);
    testTools.test.latLng(scope.polygon.getPaths()[0], 1, 2);
    testTools.test.latLng(scope.polygon.getPaths()[1], 3, 4);
    testTools.test.latLng(scope.polygon.getPaths()[2], 5, 6);
  });

  it('test events', function () {

    $scope.data = {
      clickedOnce: 0,
      clicked: 0
    };

    compile('<gm-polygon  ' +
        // classic
      'on-click="data.clicked = data.clicked + 1" ' +
        // test "once"
      'once-click="data.clickedOnce = data.clickedOnce + 1" ' +
      'options="{paths:[[1, 2], [3, 4], [5, 6]]}"></gm-polygon>');

    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);

    googleMaps.event.trigger(scope.polygon, 'click');
    googleMaps.event.trigger(scope.polygon, 'click');
    $scope.$digest();
    $timeout.flush();

    expect(scope.data.clickedOnce).to.be.equal(1);
    expect(scope.data.clicked).to.be.equal(2);

  });

  it('test ng-show', function () {

    compile('<gm-polygon ng-show="visible" options="{paths:[[1, 2], [3, 4], [5, 6]]}"></gm-polygon>');
    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
    expect(scope.polygon instanceof googleMaps.Polygon).to.be.equal(true);
    expect(scope.polygon.getMap()).to.be.an('undefined');

    $scope.visible = true;
    $scope.$digest();

    expect(scope.polygon.getMap() === scope.map).to.be.equal(true);

    $scope.visible = false;
    $scope.$digest();

    expect(scope.polygon.getMap() === scope.map).to.be.equal(false);
    expect(scope.polygon.getMap()).to.be.an('null');

  });

  it('test ng-hide', function () {

    $scope.hidden = true;

    compile('<gm-polygon ng-hide="hidden" options="{paths:[[1, 2], [3, 4], [5, 6]]}"></gm-polygon>');
    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
    expect(scope.polygon instanceof googleMaps.Polygon).to.be.equal(true);
    expect(scope.polygon.getMap()).to.be.an('undefined');

    $scope.hidden = false;
    $scope.$digest();

    expect(scope.polygon.getMap() === scope.map).to.be.equal(true);

    $scope.hidden = true;
    $scope.$digest();

    expect(scope.polygon.getMap() === scope.map).to.be.equal(false);
    expect(scope.polygon.getMap()).to.be.an('null');

  });

});