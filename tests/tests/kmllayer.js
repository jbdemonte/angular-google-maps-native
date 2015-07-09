describe('gmKmllayer', function () {

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
    element = element.find('gm-kmlLayer');
    scope = element.scope();
  }

  it('test simple case', function () {
    compile('<gm-kmlLayer options="{url:\'http://url\', opts: {suppressInfoWindows:true}}"></gm-kmlLayer>');
    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
    expect(scope.kmlLayer instanceof googleMaps.KmlLayer).to.be.equal(true);
    expect(scope.kmlLayer.getMap() === scope.map).to.be.equal(true);
    expect(scope.kmlLayer.getUrl()).to.be.equal('http://url');
    expect(scope.kmlLayer.__data.suppressInfoWindows).to.be.equal(true);
  });

  it('wait for url', function () {
    compile('<gm-kmlLayer url="url"></gm-kmlLayer>');
    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
    expect(scope.kmlLayer instanceof googleMaps.KmlLayer).to.be.equal(false);
    $scope.url = "http://url";
    $scope.$digest();
    expect(scope.kmlLayer instanceof googleMaps.KmlLayer).to.be.equal(true);
    expect(scope.kmlLayer.getMap() === scope.map).to.be.equal(true);
    expect(scope.kmlLayer.getUrl()).to.be.equal('http://url');
  });

  it('test events', function () {

    $scope.data = {
      clickedOnce: 0,
      clicked: 0
    };

    compile('<gm-kmlLayer  ' +
        // classic
      'on-click="data.clicked = data.clicked + 1" ' +
        // test "once"
      'once-click="data.clickedOnce = data.clickedOnce + 1" ' +
      'options="{url:\'http://url\'}"></gm-kmlLayer>');

    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);

    googleMaps.event.trigger(scope.kmlLayer, 'click');
    googleMaps.event.trigger(scope.kmlLayer, 'click');
    $scope.$digest();
    $timeout.flush();

    expect(scope.data.clickedOnce).to.be.equal(1);
    expect(scope.data.clicked).to.be.equal(2);

  });

  it('test ng-show', function () {

    compile('<gm-kmlLayer ng-show="visible" options="{url:\'http://url\'}"></gm-kmlLayer>');
    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
    expect(scope.kmlLayer instanceof googleMaps.KmlLayer).to.be.equal(true);
    expect(scope.kmlLayer.getMap()).to.be.an('undefined');

    $scope.visible = true;
    $scope.$digest();

    expect(scope.kmlLayer.getMap() === scope.map).to.be.equal(true);

    $scope.visible = false;
    $scope.$digest();

    expect(scope.kmlLayer.getMap() === scope.map).to.be.equal(false);
    expect(scope.kmlLayer.getMap()).to.be.an('null');

  });

  it('test ng-hide', function () {

    $scope.hidden = true;

    compile('<gm-kmlLayer ng-hide="hidden" options="{url:\'http://url\'}"></gm-kmlLayer>');
    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
    expect(scope.kmlLayer instanceof googleMaps.KmlLayer).to.be.equal(true);
    expect(scope.kmlLayer.getMap()).to.be.an('undefined');

    $scope.hidden = false;
    $scope.$digest();

    expect(scope.kmlLayer.getMap() === scope.map).to.be.equal(true);

    $scope.hidden = true;
    $scope.$digest();

    expect(scope.kmlLayer.getMap() === scope.map).to.be.equal(false);
    expect(scope.kmlLayer.getMap()).to.be.an('null');

  });

});