describe('scope', function () {

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
    scope = element.scope();
  }

  it('test child scope "isolation"', function () {
    var marker, circle, markerScope, circleScope;

    compile('<gm-marker options="{position: [1,2]}"></gm-marker><gm-circle options="{center: [1,2], radius: 100000}"></gm-circle>');
    expect(scope.google).not.to.be.an('undefined');
    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
    expect(scope.marker).to.be.an('undefined');
    expect(scope.circle).to.be.an('undefined');

    marker = element.find('gm-marker');
    markerScope = marker.scope();

    circle = element.find('gm-circle');
    circleScope = circle.scope();

    expect(markerScope.google).not.to.be.an('undefined');
    expect(markerScope.map instanceof googleMaps.Map).to.be.equal(true);
    expect(markerScope.marker instanceof googleMaps.Marker).to.be.equal(true);
    expect(markerScope.circle).to.be.an('undefined');

    expect(circleScope.google).not.to.be.an('undefined');
    expect(circleScope.map instanceof googleMaps.Map).to.be.equal(true);
    expect(circleScope.circle instanceof googleMaps.Circle).to.be.equal(true);
    expect(circleScope.marker).to.be.an('undefined');

    expect(scope.map === markerScope.map).to.be.equal(true);
    expect(scope.map === circleScope.map).to.be.equal(true);

  });


  it('test events', function () {

    var marker, circle, markerScope, circleScope;

    $scope.data = {
      map: 0,
      marker: 0,
      circle: 0
    };

    element = $compile(
      '<gm-map options="{center: [37, -122], zoom: 8}" on-click="data.map = data.map + 1">' +
        '<gm-marker options="{position: [1,2]}" on-click="data.marker = data.marker + 1"></gm-marker>' +
        '<gm-circle options="{center: [1,2], radius: 100000}"  on-click="data.circle = data.circle + 1"></gm-circle>' +
      '</gm-map>'
    )($scope);

    $scope.$digest();
    $timeout.flush();
    scope = element.scope();

    marker = element.find('gm-marker');
    markerScope = marker.scope();

    circle = element.find('gm-circle');
    circleScope = circle.scope();

    googleMaps.event.trigger(scope.map, 'click');
    $scope.$digest();
    $timeout.flush();

    expect(scope.data.map).to.be.equal(1);
    expect(scope.data.marker).to.be.equal(0);
    expect(scope.data.circle).to.be.equal(0);

    googleMaps.event.trigger(markerScope.marker, 'click');
    $scope.$digest();
    $timeout.flush();

    expect(scope.data.map).to.be.equal(1);
    expect(scope.data.marker).to.be.equal(1);
    expect(scope.data.circle).to.be.equal(0);

    googleMaps.event.trigger(circleScope.circle, 'click');
    $scope.$digest();
    $timeout.flush();

    expect(scope.data.map).to.be.equal(1);
    expect(scope.data.marker).to.be.equal(1);
    expect(scope.data.circle).to.be.equal(1);

    googleMaps.event.trigger(markerScope.marker, 'click');
    $scope.$digest();
    $timeout.flush();

    expect(scope.data.map).to.be.equal(1);
    expect(scope.data.marker).to.be.equal(2);
    expect(scope.data.circle).to.be.equal(1);

    googleMaps.event.trigger(scope.map, 'click');
    $scope.$digest();
    $timeout.flush();

    expect(scope.data.map).to.be.equal(2);
    expect(scope.data.marker).to.be.equal(2);
    expect(scope.data.circle).to.be.equal(1);

  });

});