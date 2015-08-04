describe('gmMap', function () {

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
    compile('<gm-map options="{center: [37, -122], zoom: 8}"></gm-map>');
    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
  });

  it('wait for valid center and zoom', function () {
    compile('<gm-map center="center" zoom="zoom"></gm-map>');
    expect(scope.map instanceof googleMaps.Map).to.be.equal(false);

    expect(scope.map).to.be.an('undefined');

    $scope.center = [];
    $scope.zoom = 'a';
    $scope.$digest();

    expect(scope.map).to.be.an('undefined');

    $scope.zoom = 4;
    $scope.$digest();
    testTools.test.noFlush($timeout);

    expect(scope.map).to.be.an('undefined');

    $scope.center = [37, -122];
    $scope.$digest();
    $timeout.flush();

    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
    testTools.test.latLng(scope.map.getCenter(), $scope.center);
  });


  it('test watch expressions', function () {
    compile('<gm-map center="center" mapTypeId="mapTypeId" heading="heading" tilt="tilt" zoom="zoom" options="{center: [37, -122], zoom: 8}"></gm-map>');
    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);


    angular.forEach('center mapTypeId heading tilt zoom', function (name) {
      expect(scope.map.__get(name)).to.be.an('undefined');
    });

    $scope.center = [37, -122];
    $scope.$digest();

    expect(scope.map.getCenter() instanceof googleMaps.LatLng).to.be.equal(true);
    testTools.test.latLng(scope.map.getCenter(), $scope.center);


    $scope.mapTypeId = "xxx";
    $scope.$digest();
    expect(scope.map.getMapTypeId()).to.be.equal($scope.mapTypeId);

    angular.forEach('heading tilt zoom'.split(" "), function (name) {
      $scope[name] = "123"; // voluntary set string to test cast to int
      $scope.$digest();
      expect(scope.map.__get(name)).to.be.a('number');
      expect(scope.map.__get(name)).to.be.equal(1 * $scope[name]);
    });

  });


  it('test events', function () {

    $scope.data = {
      clickedOnce: 0,
      clicked: 0,
      centerChanged: 0
    };

    compile('<gm-map  ' +
      // classic
      'on-click="data.clicked = data.clicked + 1" ' +
      // test "once"
      'once-click="data.clickedOnce = data.clickedOnce + 1" ' +
      // test with name not normalized
      'on-center_changed = "data.centerChanged = data.centerChanged + 1" ' +
      'options="{center: [37, -122], zoom: 8}"></gm-map>');
    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);

    googleMaps.event.trigger(scope.map, 'click');
    googleMaps.event.trigger(scope.map, 'click');
    googleMaps.event.trigger(scope.map, 'center_changed');
    googleMaps.event.trigger(scope.map, 'center_changed');
    $scope.$digest();
    $timeout.flush();

    expect(scope.data.clickedOnce).to.be.equal(1);
    expect(scope.data.clicked).to.be.equal(2);
    expect(scope.data.centerChanged).to.be.equal(2);

  });

  it('test ng-show', function () {
    var map, catched;

    $scope.data = {
      resize: 0
    };

    compile('<gm-map ng-show="visible" on-resize="data.resize = data.resize + 1" options="{center: [37, -122], zoom: 8}"></gm-map>');
    expect(scope.map instanceof googleMaps.Map).to.be.equal(false); // because not yet visible
    expect(scope.data.resize).to.be.equal(0);

    $scope.visible = true;
    $scope.$digest();
    $timeout.flush();

    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
    expect(scope.data.resize).to.be.equal(0); // not yet triggered, because is just created

    map = scope.map; // keep a handler on current object, because it should not be destroyed now

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

    expect(scope.map instanceof googleMaps.Map).to.be.equal(true); // should not be destroyed
    expect(scope.map === map).to.be.equal(true); // should be the same object
    expect(scope.data.resize).to.be.equal(0); // not yet triggered, because not yet visible

    $scope.visible = true;
    $scope.$digest();
    $timeout.flush();

    expect(scope.map instanceof googleMaps.Map).to.be.equal(true); // should not be destroyed
    expect(scope.map === map).to.be.equal(true); // should be the same object
    expect(scope.data.resize).to.be.equal(1); // should be triggered now

  });

  it('test ng-hide', function () {
    var map, catched;

    $scope.hidden = true;

    $scope.data = {
      resize: 0
    };

    compile('<gm-map ng-hide="hidden" on-resize="data.resize = data.resize + 1" options="{center: [37, -122], zoom: 8}"></gm-map>');
    expect(scope.map instanceof googleMaps.Map).to.be.equal(false); // because not yet visible
    expect(scope.data.resize).to.be.equal(0);

    $scope.hidden = false;
    $scope.$digest();
    $timeout.flush();

    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
    expect(scope.data.resize).to.be.equal(0); // not yet triggered, because is just created

    map = scope.map; // keep a handler on current object, because it should not be destroyed now

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

    expect(scope.map instanceof googleMaps.Map).to.be.equal(true); // should not be destroyed
    expect(scope.map === map).to.be.equal(true); // should be the same object
    expect(scope.data.resize).to.be.equal(0); // not yet triggered, because not yet visible

    $scope.hidden = false;
    $scope.$digest();
    $timeout.flush();

    expect(scope.map instanceof googleMaps.Map).to.be.equal(true); // should not be destroyed
    expect(scope.map === map).to.be.equal(true); // should be the same object
    expect(scope.data.resize).to.be.equal(1); // should be triggered now

  });

});