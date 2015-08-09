describe('gmCircle', function () {

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
    element = element.find('gm-circle');
    scope = element.scope();
  }

  it('test simple case', function () {
    compile('<gm-circle options="{center: [1,2], radius: 100000}"></gm-circle>');
    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
    expect(scope.circle instanceof googleMaps.Circle).to.be.equal(true);
    expect(scope.circle.getMap() === scope.map).to.be.equal(true);
    testTools.test.latLng(scope.circle.getCenter(), 1, 2);
  });

  it('use map.center', function () {
    compile('<gm-circle center="map.getCenter()" options="{radius: 100000}"></gm-circle>');
    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
    expect(scope.circle instanceof googleMaps.Circle).to.be.equal(true);
    testTools.test.latLng(scope.circle.getCenter(), scope.map.getCenter());
  });

  it('wait for center', function () {
    compile('<gm-circle center="pos" options="{radius: 100000}"></gm-circle>');
    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
    expect(scope.circle instanceof googleMaps.Circle).to.be.equal(false);
    $scope.pos = [1, 2];
    $scope.$digest();
    expect(scope.circle instanceof googleMaps.Circle).to.be.equal(true);
    testTools.test.latLng(scope.circle.getCenter(), 1, 2);
  });

  it('wait for radius', function () {
    compile('<gm-circle radius="radius" center="map.getCenter()"></gm-circle>');
    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
    expect(scope.circle instanceof googleMaps.Circle).to.be.equal(false);
    $scope.radius = 10000;
    $scope.$digest();
    expect(scope.circle instanceof googleMaps.Circle).to.be.equal(true);
    expect(scope.circle.getRadius()).to.be.equal($scope.radius);
  });

  it('test events', function () {

    $scope.data = {
      clickedOnce: 0,
      clicked: 0,
      centerChanged: 0
    };

    compile('<gm-circle  ' +
        // classic
      'on-click="data.clicked = data.clicked + 1" ' +
        // test "once"
      'once-click="data.clickedOnce = data.clickedOnce + 1" ' +
        // test with name not normalized
      'on-center_changed = "data.centerChanged = data.centerChanged + 1" ' +
      'options="{center: [1, 2], radius: 100000}"></gm-circle>');

    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);

    googleMaps.event.trigger(scope.circle, 'click');
    googleMaps.event.trigger(scope.circle, 'click');
    googleMaps.event.trigger(scope.circle, 'center_changed');
    googleMaps.event.trigger(scope.circle, 'center_changed');
    $scope.$digest();
    $timeout.flush();

    expect(scope.data.clickedOnce).to.be.equal(1);
    expect(scope.data.clicked).to.be.equal(2);
    expect(scope.data.centerChanged).to.be.equal(2);

  });

  it('test ng-show', function () {

    compile('<gm-circle ng-show="visible" options="{center: [1, 2], radius: 100000}"></gm-circle>');
    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
    expect(scope.circle instanceof googleMaps.Circle).to.be.equal(true);
    expect(scope.circle.getMap()).to.be.an('undefined');

    $scope.visible = true;
    $scope.$digest();

    expect(scope.circle.getMap() === scope.map).to.be.equal(true);

    $scope.visible = false;
    $scope.$digest();

    expect(scope.circle.getMap() === scope.map).to.be.equal(false);
    expect(scope.circle.getMap()).to.be.an('null');

  });

  it('test ng-hide', function () {

    $scope.hidden = true;

    compile('<gm-circle ng-hide="hidden" options="{center: [1, 2], radius: 100000}"></gm-circle>');
    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
    expect(scope.circle instanceof googleMaps.Circle).to.be.equal(true);
    expect(scope.circle.getMap()).to.be.an('undefined');

    $scope.hidden = false;
    $scope.$digest();

    expect(scope.circle.getMap() === scope.map).to.be.equal(true);

    $scope.hidden = true;
    $scope.$digest();

    expect(scope.circle.getMap() === scope.map).to.be.equal(false);
    expect(scope.circle.getMap()).to.be.an('null');

  });

});