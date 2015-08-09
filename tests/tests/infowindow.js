describe('gmInfowindow', function () {

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
    element = element.find('gm-infowindow');
    scope = element.scope();
  }

  it('test simple case', function () {
    compile('<gm-infowindow options="{position: [1,2]}"></gm-infowindow>');
    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
    expect(scope.infoWindow instanceof googleMaps.InfoWindow).to.be.equal(true);
    expect(scope.infoWindow.__data.__map === scope.map).to.be.equal(true);
    expect(scope.infoWindow.__data.__anchor).to.be.an('null');
    testTools.test.latLng(scope.infoWindow.getPosition(), 1, 2);
  });

  it('use map.center', function () {
    compile('<gm-infowindow position="map.getCenter()"></gm-infowindow>');
    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
    expect(scope.infoWindow instanceof googleMaps.InfoWindow).to.be.equal(true);
    testTools.test.latLng(scope.infoWindow.getPosition(), scope.map.getCenter());
  });

  it('wait for position', function () {
    compile('<gm-infowindow position="pos"></gm-infowindow>');
    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
    expect(scope.infoWindow instanceof googleMaps.InfoWindow).to.be.equal(false);
    $scope.pos = [1, 2];
    $scope.$digest();
    expect(scope.infoWindow instanceof googleMaps.InfoWindow).to.be.equal(true);
    testTools.test.latLng(scope.infoWindow.getPosition(), $scope.pos);
  });

  it('test events', function () {

    $scope.data = {
      clickedOnce: 0,
      clicked: 0,
      contentChanged: 0
    };

    compile('<gm-infowindow  ' +
        // classic
      'on-click="data.clicked = data.clicked + 1" ' +
        // test "once"
      'once-click="data.clickedOnce = data.clickedOnce + 1" ' +
        // test with name not normalized
      'on-content_changed = "data.contentChanged = data.contentChanged + 1" ' +
      'options="{position: [1, 2]}"></gm-infowindow>');

    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);

    googleMaps.event.trigger(scope.infoWindow, 'click');
    googleMaps.event.trigger(scope.infoWindow, 'click');
    googleMaps.event.trigger(scope.infoWindow, 'content_changed');
    googleMaps.event.trigger(scope.infoWindow, 'content_changed');
    $scope.$digest();
    $timeout.flush();

    expect(scope.data.clickedOnce).to.be.equal(1);
    expect(scope.data.clicked).to.be.equal(2);
    expect(scope.data.contentChanged).to.be.equal(2);

  });

  it('test ng-show', function () {

    compile('<gm-infowindow ng-show="visible" options="{position: [1, 2]}"></gm-infowindow>');
    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
    expect(scope.infoWindow instanceof googleMaps.InfoWindow).to.be.equal(true);
    expect(scope.infoWindow.__data.__map).to.be.an('undefined');
    expect(scope.infoWindow.__data.__opened).to.be.equal(false);

    $scope.visible = true;
    $scope.$digest();

    expect(scope.infoWindow.__data.__map === scope.map).to.be.equal(true);
    expect(scope.infoWindow.__data.__opened).to.be.equal(true);

    $scope.visible = false;
    $scope.$digest();

    expect(scope.infoWindow.__data.__opened).to.be.equal(false);

  });

  it('test ng-hide', function () {

    $scope.hidden = true;

    compile('<gm-infowindow ng-hide="hidden" options="{position: [1, 2]}"></gm-infowindow>');
    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
    expect(scope.infoWindow instanceof googleMaps.InfoWindow).to.be.equal(true);
    expect(scope.infoWindow.__data.__map).to.be.an('undefined');
    expect(scope.infoWindow.__data.__opened).to.be.equal(false);

    $scope.hidden = false;
    $scope.$digest();

    expect(scope.infoWindow.__data.__map === scope.map).to.be.equal(true);
    expect(scope.infoWindow.__data.__opened).to.be.equal(true);

    $scope.hidden = true;
    $scope.$digest();

    expect(scope.infoWindow.__data.__opened).to.be.equal(false);

  });

  it('test child of a marker', function () {
    compile('<gm-marker position="map.getCenter()"><gm-infowindow></gm-infowindow></gm-marker>');
    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
    expect(scope.infoWindow instanceof googleMaps.InfoWindow).to.be.equal(true);
    expect(scope.infoWindow.__data.__map === scope.map).to.be.equal(true);
    expect(scope.infoWindow.__data.__anchor instanceof googleMaps.Marker).to.be.equal(true);
  });

});