var app = angular.module('lastfm-crawl', ['ui.router', 'ngResource']);

app.factory('Artists', ['$resource', function($resource) {
return $resource('/lastfm', null,
    {
    	'query': {method: 'GET', params:{method:'artist.search'}},
    	'get':{method:'GET', params:{method:'artist.getInfo'}},
    	'getTracks':{
    		method:'GET', params:
    		{method:'artist.getTopTracks', limit:12}
    	},
    	'getAlbums':{
    		method:'GET', params:
    		{method:'artist.getTopAlbums', limit:12}
    	}
    });
}]);


app.controller('ArtistCtrl', function($scope, $state, Artists){
	$scope.query = "jack";
	$scope.artists = [];
	
	$scope.search = function(name) {		
		Artists.query({artist:name}, function(res){
			console.log(res);
			if (res.error == null) {
				var artistMatches = res.results.artistmatches.artist;
				$scope.artists = artistMatches;
				console.log($scope.artists[0]);
			}
		});
	}

	$scope.detail = function(artist) {
		$state.transitionTo("detail-artist", {mbid:artist.mbid});		
	}
});

app.controller('AlbumCtrl', function($scope){
	$scope.albums = [
	{
		name: 'one', profile: 'two'
	},
	{
		name: 'one', profile: 'two'
	}

	];
});

app.config(function($stateProvider, $urlRouterProvider) {    
    $urlRouterProvider.otherwise('/artists');
    
    $stateProvider
        
        // HOME STATES AND NESTED VIEWS ========================================
        .state('artists', {
            url: '/artists',
            templateUrl: 'partial/list-artists.html',
            controller: 'ArtistCtrl'
        })
        .state('albums', {
        	url: '/albums',
        	templateUrl: 'partial/list-albums.html',
        	controller: 'AlbumCtrl'
        })
                
});