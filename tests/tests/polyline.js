describe('gmPolyline', function () {

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
    element = element.find('gm-polyline');
    scope = element.scope();
  }

  it('test simple case', function () {
    compile('<gm-polyline options="{path:[[1, 2], [3, 4], [5, 6]]}"></gm-polyline>');
    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
    expect(scope.polyline instanceof googleMaps.Polyline).to.be.equal(true);
    expect(scope.polyline.getMap() === scope.map).to.be.equal(true);
    testTools.test.latLng(scope.polyline.getPath()[0], 1, 2);
    testTools.test.latLng(scope.polyline.getPath()[1], 3, 4);
    testTools.test.latLng(scope.polyline.getPath()[2], 5, 6);
  });

  it('wait for path', function () {
    compile('<gm-polyline path="path"></gm-polyline>');
    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
    expect(scope.polyline instanceof googleMaps.Polyline).to.be.equal(false);
    $scope.path = [[1, 2], [3, 4], [5, 6]];
    $scope.$digest();
    expect(scope.polyline instanceof googleMaps.Polyline).to.be.equal(true);
    expect(scope.polyline.getMap() === scope.map).to.be.equal(true);
    testTools.test.latLng(scope.polyline.getPath()[0], 1, 2);
    testTools.test.latLng(scope.polyline.getPath()[1], 3, 4);
    testTools.test.latLng(scope.polyline.getPath()[2], 5, 6);
  });

  it('test events', function () {

    $scope.data = {
      clickedOnce: 0,
      clicked: 0
    };

    compile('<gm-polyline  ' +
        // classic
      'on-click="data.clicked = data.clicked + 1" ' +
        // test "once"
      'once-click="data.clickedOnce = data.clickedOnce + 1" ' +
      'options="{path:[[1, 2], [3, 4], [5, 6]]}"></gm-polyline>');

    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);

    googleMaps.event.trigger(scope.polyline, 'click');
    googleMaps.event.trigger(scope.polyline, 'click');
    $scope.$digest();
    $timeout.flush();

    expect(scope.data.clickedOnce).to.be.equal(1);
    expect(scope.data.clicked).to.be.equal(2);

  });

  it('test ng-show', function () {

    compile('<gm-polyline ng-show="visible" options="{path:[[1, 2], [3, 4], [5, 6]]}"></gm-polyline>');
    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
    expect(scope.polyline instanceof googleMaps.Polyline).to.be.equal(true);
    expect(scope.polyline.getMap()).to.be.an('undefined');

    $scope.visible = true;
    $scope.$digest();

    expect(scope.polyline.getMap() === scope.map).to.be.equal(true);

    $scope.visible = false;
    $scope.$digest();

    expect(scope.polyline.getMap() === scope.map).to.be.equal(false);
    expect(scope.polyline.getMap()).to.be.an('null');

  });

  it('test ng-hide', function () {

    $scope.hidden = true;

    compile('<gm-polyline ng-hide="hidden" options="{path:[[1, 2], [3, 4], [5, 6]]}"></gm-polyline>');
    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
    expect(scope.polyline instanceof googleMaps.Polyline).to.be.equal(true);
    expect(scope.polyline.getMap()).to.be.an('undefined');

    $scope.hidden = false;
    $scope.$digest();

    expect(scope.polyline.getMap() === scope.map).to.be.equal(true);

    $scope.hidden = true;
    $scope.$digest();

    expect(scope.polyline.getMap() === scope.map).to.be.equal(false);
    expect(scope.polyline.getMap()).to.be.an('null');

  });

});