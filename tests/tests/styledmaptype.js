describe('gmStyledMaptype', function () {

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
    element = element.find('gm-styledmaptype');
    scope = element.scope();
  }

  it('test simple case', function () {
    compile('<gm-styledmaptype id="style1" options="{opt: 123}" styles="{style: 456}"></gm-styledmaptype>');
    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
    expect(scope.map.__data.__mapTypes.length).to.be.equal(1);
    expect(scope.map.__data.__mapTypes[0].id).to.be.equal('style1');
    expect(scope.map.__data.__mapTypes[0].styles.__data.options.opt).to.be.equal(123);
    expect(scope.map.__data.__mapTypes[0].styles.__data.styles.style).to.be.equal(456);
  });

  it('test without options', function () {
    compile('<gm-styledmaptype id="style1" styles="{style: 456}"></gm-styledmaptype>');
    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
    expect(scope.map.__data.__mapTypes.length).to.be.equal(1);
    expect(scope.map.__data.__mapTypes[0].id).to.be.equal('style1');
    expect(scope.map.__data.__mapTypes[0].styles.__data.options).to.be.an('undefined');
    expect(scope.map.__data.__mapTypes[0].styles.__data.styles.style).to.be.equal(456);
  });

});