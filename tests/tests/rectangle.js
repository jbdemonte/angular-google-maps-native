describe('gmRectangle', function () {

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

  it('test simple case', function () {
    compile('<gm-rectangle options="{bounds: {n:1, e:2, s:3, w:4}}"></gm-rectangle>');
    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
    expect(scope.rectangle instanceof googleMaps.Rectangle).to.be.equal(true);
    expect(scope.rectangle.getMap() === scope.map).to.be.equal(true);
    testTools.test.latLngBounds(scope.rectangle.getBounds(), 1, 2, 3, 4);
  });


  it('wait for valid bounds', function () {
    compile('<gm-rectangle bounds="bounds"></gm-rectangle>');
    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
    expect(scope.rectangle instanceof googleMaps.Rectangle).to.be.equal(false);
    $scope.bounds = [1, 2, 'a', 4];
    $scope.$digest();
    expect(scope.rectangle).to.be.an('undefined');

    $scope.bounds = [1, 2, 3, 4];
    $scope.$digest();
    expect(scope.rectangle).not.to.be.an('undefined');

    expect(scope.rectangle instanceof googleMaps.Rectangle).to.be.equal(true);
    testTools.test.latLngBounds(scope.rectangle.getBounds(), 1, 2, 3, 4);
  });

  it('test events', function () {

    $scope.data = {
      clickedOnce: 0,
      clicked: 0,
      boundsChanged: 0
    };

    compile('<gm-rectangle  ' +
        // classic
      'on-click="data.clicked = data.clicked + 1" ' +
        // test "once"
      'once-click="data.clickedOnce = data.clickedOnce + 1" ' +
        // test with name not normalized
      'on-bounds_changed = "data.boundsChanged = data.boundsChanged + 1" ' +
      'options="{bounds: {n:1, e:2, s:3, w:4}}"></gm-rectangle>');

    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);

    googleMaps.event.trigger(scope.rectangle, 'click');
    googleMaps.event.trigger(scope.rectangle, 'click');
    googleMaps.event.trigger(scope.rectangle, 'bounds_changed');
    googleMaps.event.trigger(scope.rectangle, 'bounds_changed');
    $scope.$digest();
    $timeout.flush();

    expect(scope.data.clickedOnce).to.be.equal(1);
    expect(scope.data.clicked).to.be.equal(2);
    expect(scope.data.boundsChanged).to.be.equal(2);

  });

  it('test ng-show', function () {

    compile('<gm-rectangle ng-show="visible" options="{bounds: {n:1, e:2, s:3, w:4}}"></gm-rectangle>');
    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
    expect(scope.rectangle instanceof googleMaps.Rectangle).to.be.equal(true);
    expect(scope.rectangle.getMap()).to.be.an('undefined');

    $scope.visible = true;
    $scope.$digest();

    expect(scope.rectangle.getMap() === scope.map).to.be.equal(true);

    $scope.visible = false;
    $scope.$digest();

    expect(scope.rectangle.getMap() === scope.map).to.be.equal(false);
    expect(scope.rectangle.getMap()).to.be.an('null');

  });

  it('test ng-hide', function () {

    $scope.hidden = true;

    compile('<gm-rectangle ng-hide="hidden" options="{bounds: {n:1, e:2, s:3, w:4}}"></gm-rectangle>');
    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
    expect(scope.rectangle instanceof googleMaps.Rectangle).to.be.equal(true);
    expect(scope.rectangle.getMap()).to.be.an('undefined');

    $scope.hidden = false;
    $scope.$digest();

    expect(scope.rectangle.getMap() === scope.map).to.be.equal(true);

    $scope.hidden = true;
    $scope.$digest();

    expect(scope.rectangle.getMap() === scope.map).to.be.equal(false);
    expect(scope.rectangle.getMap()).to.be.an('null');

  });

});