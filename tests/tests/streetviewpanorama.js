describe('gmStreetviewpanorama', function () {

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

  /**
   * Compile template and populate "global" variable
   * @param template
   */
  function compile(template) {
    element = $compile(template)($scope);
    $scope.$digest();
    $timeout.flush();
    scope = element.scope();
  }

  it('test simple case', function () {
    compile('<gm-streetviewpanorama options="{position: [1, 2]}"></gm-streetviewpanorama>');
    expect(scope.streetViewPanorama instanceof googleMaps.StreetViewPanorama).to.be.equal(true);
  });

  it('wait for position', function () {
    compile('<gm-streetviewpanorama position="position"></gm-streetviewpanorama>');
    expect(scope.streetViewPanorama instanceof googleMaps.StreetViewPanorama).to.be.equal(false);

    $scope.position = [1, 2];
    $scope.$digest();
    $timeout.flush();

    expect(scope.streetViewPanorama instanceof googleMaps.StreetViewPanorama).to.be.equal(true);
    testTools.test.latLng(scope.streetViewPanorama.getPosition(), $scope.position);
  });


  it('test watch expressions', function () {
    compile('<gm-streetviewpanorama position="position" pov="pov" zoom="zoom" options="{position: [1, 2], zoom: 3}"></gm-streetviewpanorama>');
    expect(scope.streetViewPanorama instanceof googleMaps.StreetViewPanorama).to.be.equal(true);


    angular.forEach('position pov zoom', function (name) {
      expect(scope.streetViewPanorama.__get(name)).to.be.an('undefined');
    });

    $scope.position = [3, 4];
    $scope.$digest();

    expect(scope.streetViewPanorama.getPosition() instanceof googleMaps.LatLng).to.be.equal(true);
    testTools.test.latLng(scope.streetViewPanorama.getPosition(), $scope.position);


    $scope.pov = {a:1, b:2};
    $scope.$digest();
    expect(scope.streetViewPanorama.getPov()).to.deep.equal($scope.pov);


    $scope.zoom = '10';
    $scope.$digest();
    expect(scope.streetViewPanorama.getZoom()).to.be.a('number');
    expect(scope.streetViewPanorama.getZoom()).to.be.equal(1 * $scope.zoom);

  });


  it('test events', function () {

    $scope.data = {
      resizeOnce: 0,
      resize: 0,
      positionChanged: 0
    };

    compile('<gm-streetviewpanorama  ' +
      // classic
      'on-resize="data.resize = data.resize + 1" ' +
      // test "once"
      'once-resize="data.resizeOnce = data.resizeOnce + 1" ' +
      // test with name not normalized
      'on-position_changed = "data.positionChanged = data.positionChanged + 1" ' +
      'options="{position: [1, 2], zoom: 8}"></gm-streetviewpanorama>');
    expect(scope.streetViewPanorama instanceof googleMaps.StreetViewPanorama).to.be.equal(true);

    googleMaps.event.trigger(scope.streetViewPanorama, 'resize');
    googleMaps.event.trigger(scope.streetViewPanorama, 'resize');
    googleMaps.event.trigger(scope.streetViewPanorama, 'position_changed');
    googleMaps.event.trigger(scope.streetViewPanorama, 'position_changed');
    $scope.$digest();
    $timeout.flush();

    expect(scope.data.resizeOnce).to.be.equal(1);
    expect(scope.data.resize).to.be.equal(2);
    expect(scope.data.positionChanged).to.be.equal(2);

  });

  it('test ng-show', function () {
    var map, catched;

    $scope.data = {
      resize: 0
    };

    compile('<gm-streetviewpanorama ng-show="visible" on-resize="data.resize = data.resize + 1" options="{position: [1, 2], zoom: 8}"></gm-streetviewpanorama>');
    expect(scope.streetViewPanorama instanceof googleMaps.StreetViewPanorama).to.be.equal(false); // because not yet visible
    expect(scope.data.resize).to.be.equal(0);

    $scope.visible = true;
    $scope.$digest();
    $timeout.flush();

    expect(scope.streetViewPanorama instanceof googleMaps.StreetViewPanorama).to.be.equal(true);
    expect(scope.data.resize).to.be.equal(0); // not yet triggered, because is just created

    map = scope.streetViewPanorama; // keep a handler on current object, because it should not be destroyed now

    $scope.visible = false;
    $scope.$digest();
    catched = false;
    try {
      $timeout.flush();
    }
    catch(err) {
      catched = true; // no event to trigger
    }
    expect(catched).to.be.equal(true);

    expect(scope.streetViewPanorama instanceof googleMaps.StreetViewPanorama).to.be.equal(true); // should not be destroyed
    expect(scope.streetViewPanorama === map).to.be.equal(true); // should be the same object
    expect(scope.data.resize).to.be.equal(0); // not yet triggered, because not yet visible

    $scope.visible = true;
    $scope.$digest();
    $timeout.flush();

    expect(scope.streetViewPanorama instanceof googleMaps.StreetViewPanorama).to.be.equal(true); // should not be destroyed
    expect(scope.streetViewPanorama === map).to.be.equal(true); // should be the same object
    expect(scope.data.resize).to.be.equal(1); // should be triggered now

  });

  it('test ng-hide', function () {
    var map, catched;

    $scope.hidden = true;

    $scope.data = {
      resize: 0
    };

    compile('<gm-streetviewpanorama ng-hide="hidden" on-resize="data.resize = data.resize + 1" options="{position: [1, 2], zoom: 8}"></gm-streetviewpanorama>');
    expect(scope.streetViewPanorama instanceof googleMaps.StreetViewPanorama).to.be.equal(false); // because not yet visible
    expect(scope.data.resize).to.be.equal(0);

    $scope.hidden = false;
    $scope.$digest();
    $timeout.flush();

    expect(scope.streetViewPanorama instanceof googleMaps.StreetViewPanorama).to.be.equal(true);
    expect(scope.data.resize).to.be.equal(0); // not yet triggered, because is just created

    map = scope.streetViewPanorama; // keep a handler on current object, because it should not be destroyed now

    $scope.hidden = true;
    $scope.$digest();
    catched = false;
    try {
      $timeout.flush();
    }
    catch(err) {
      catched = true; // no event to trigger
    }
    expect(catched).to.be.equal(true);

    expect(scope.streetViewPanorama instanceof googleMaps.StreetViewPanorama).to.be.equal(true); // should not be destroyed
    expect(scope.streetViewPanorama === map).to.be.equal(true); // should be the same object
    expect(scope.data.resize).to.be.equal(0); // not yet triggered, because not yet visible

    $scope.hidden = false;
    $scope.$digest();
    $timeout.flush();

    expect(scope.streetViewPanorama instanceof googleMaps.StreetViewPanorama).to.be.equal(true); // should not be destroyed
    expect(scope.streetViewPanorama === map).to.be.equal(true); // should be the same object
    expect(scope.data.resize).to.be.equal(1); // should be triggered now

  });

});