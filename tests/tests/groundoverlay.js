describe('gmGroundoverlay', function () {

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
    element = element.find('gm-groundOverlay');
    scope = element.scope();
  }

  it('test simple case', function () {
    compile('<gm-groundOverlay options="{url:\'http://url\', bounds:[1,2,3,4], opts: {opacity:0.8}}"></gm-groundOverlay>');
    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
    expect(scope.groundOverlay instanceof googleMaps.GroundOverlay).to.be.equal(true);
    expect(scope.groundOverlay.getMap() === scope.map).to.be.equal(true);
    expect(scope.groundOverlay.getUrl()).to.be.equal('http://url');
    testTools.test.latLngBounds(scope.groundOverlay.getBounds(), 1, 2, 3, 4);
    expect(scope.groundOverlay.getOpacity()).to.be.equal(0.8);
  });

  it('wait for url & bounds', function () {
    compile('<gm-groundOverlay url="url" bounds="bounds" options="{opts: {opacity:0.8}}"></gm-groundOverlay>');
    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
    expect(scope.groundOverlay instanceof googleMaps.GroundOverlay).to.be.equal(false);
    $scope.url = "http://url";
    $scope.$digest();
    expect(scope.groundOverlay instanceof googleMaps.GroundOverlay).to.be.equal(false);
    $scope.bounds = [1,2,3,4];
    $scope.$digest();
    expect(scope.groundOverlay instanceof googleMaps.GroundOverlay).to.be.equal(true);
    expect(scope.groundOverlay.getMap() === scope.map).to.be.equal(true);
    expect(scope.groundOverlay.getUrl()).to.be.equal('http://url');
    testTools.test.latLngBounds(scope.groundOverlay.getBounds(), 1, 2, 3, 4);
    expect(scope.groundOverlay.getOpacity()).to.be.equal(0.8);
  });

  it('wait for bounds & url', function () {
    compile('<gm-groundOverlay url="url" bounds="bounds" options="{opts: {opacity:0.8}}"></gm-groundOverlay>');
    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
    expect(scope.groundOverlay instanceof googleMaps.GroundOverlay).to.be.equal(false);
    $scope.bounds = [1,2,3,4];
    $scope.$digest();
    expect(scope.groundOverlay instanceof googleMaps.GroundOverlay).to.be.equal(false);
    $scope.url = "http://url";
    $scope.$digest();
    expect(scope.groundOverlay instanceof googleMaps.GroundOverlay).to.be.equal(true);
    expect(scope.groundOverlay.getMap() === scope.map).to.be.equal(true);
    expect(scope.groundOverlay.getUrl()).to.be.equal('http://url');
    testTools.test.latLngBounds(scope.groundOverlay.getBounds(), 1, 2, 3, 4);
    expect(scope.groundOverlay.getOpacity()).to.be.equal(0.8);
  });

  it('test events', function () {

    $scope.data = {
      clickedOnce: 0,
      clicked: 0
    };

    compile('<gm-groundOverlay  ' +
        // classic
      'on-click="data.clicked = data.clicked + 1" ' +
        // test "once"
      'once-click="data.clickedOnce = data.clickedOnce + 1" ' +
      'options="{url:\'http://url\', bounds:[1,2,3,4], opts: {opacity:0.8}}"></gm-groundOverlay>');

    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);

    googleMaps.event.trigger(scope.groundOverlay, 'click');
    googleMaps.event.trigger(scope.groundOverlay, 'click');
    $scope.$digest();
    $timeout.flush();

    expect(scope.data.clickedOnce).to.be.equal(1);
    expect(scope.data.clicked).to.be.equal(2);

  });

  it('test ng-show', function () {

    compile('<gm-groundOverlay ng-show="visible" options="{url:\'http://url\', bounds:[1,2,3,4], opts: {opacity:0.8}}"></gm-groundOverlay>');
    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
    expect(scope.groundOverlay instanceof googleMaps.GroundOverlay).to.be.equal(true);
    expect(scope.groundOverlay.getMap()).to.be.an('undefined');

    $scope.visible = true;
    $scope.$digest();

    expect(scope.groundOverlay.getMap() === scope.map).to.be.equal(true);

    $scope.visible = false;
    $scope.$digest();

    expect(scope.groundOverlay.getMap() === scope.map).to.be.equal(false);
    expect(scope.groundOverlay.getMap()).to.be.an('null');

  });

  it('test ng-hide', function () {

    $scope.hidden = true;

    compile('<gm-groundOverlay ng-hide="hidden" options="{url:\'http://url\', bounds:[1,2,3,4], opts: {opacity:0.8}}"></gm-groundOverlay>');
    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
    expect(scope.groundOverlay instanceof googleMaps.GroundOverlay).to.be.equal(true);
    expect(scope.groundOverlay.getMap()).to.be.an('undefined');

    $scope.hidden = false;
    $scope.$digest();

    expect(scope.groundOverlay.getMap() === scope.map).to.be.equal(true);

    $scope.hidden = true;
    $scope.$digest();

    expect(scope.groundOverlay.getMap() === scope.map).to.be.equal(false);
    expect(scope.groundOverlay.getMap()).to.be.an('null');

  });

});