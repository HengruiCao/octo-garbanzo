var fmapi = require("../lastfm");
var utils = require("../utils");
var db = require("../database");

var Artist = module.exports = {};

var search = Artist.search = function(params, callBack) {
	params = utils._.defaults(params, {page: 1});
	fmapi.SearchArtist(params,
		function(result, err) {
			if (!err && result.results){
				var totalCount = result.results["opensearch:totalResults"];
				var startIndex = result.results["opensearch:startIndex"];
				var count = result.results["opensearch:itemsPerPage"];

				var artists = result
					.results.artistmatches.artist;

				if (artists.length < 1)
					return (callBack && callBack());

				var next = function() {
					if (count + startIndex < totalCount) {
					params.page += 1;
					search(params, callBack);
					}
				}

				var conv = [];
				utils._.each(artists, function(elem) {
					elem.id = elem.mbid;
					elem.raw = JSON.stringify(elem);
					conv.push(db.Artist.value(elem));
				});
				db.Artist.insert({values: conv}, function(res, err){
					!err && callBack && callBack(res.rows,
						(startIndex + count < totalCount) ? next : null);
					err && console.error(err);
				});
				callBack || next();
			}
		});
}

//param name
var detail = Artist.detail = function(param, callBack) {
	fmapi.GetArtistInfo({artist: param.name, id:param.id},
		function(result, err) {
			if (!err && result.artist){
				var artist = result.artist;
				artist.id = artist.mbid;
				artist.raw = JSON.stringify(artist);
				var obj = db.Artist.value(artist);
				db.Artist.update({
					where: {name:artist.name},
					values: obj
				});
				callBack && callBack(artist);
			}
	})
};

var getAlbums = Artist.albums = function(param, callBack) {
	param = utils._.defaults(param, {page: 1});
	param = utils._.extend(param, {artist: param.name, id:param.id});
	fmapi.GetArtistAlbums(param,
		function(result, err) {
			if (!err && result.topalbums){
				var elems = result.topalbums.album;
				var pagecount = result.topalbums["@attr"].totalPages;

				var next = function() {
					if (param.page < pagecount) {
						param.page += 1;
						getAlbums(param, callBack);
					}
				}
				if (elems.length > 0) {
					var conv = [];
					utils._.each(elems, function(elem){
						elem.id = elem.mbid || '';
						elem.artist_name = param.artist;
						elem.artist_id = param.id || '';
						elem.raw = JSON.stringify(elem);
						conv.push(db.Album.value(elem));
					});
					db.Album.insert({values: conv}, function(res, err){
						!err && callBack && callBack(res.rows, next);
						err && console.error(err);
					});
					callBack || next();
				}
			}
	})
}

var getTracks = Artist.tracks = function(param, callBack) {
	param = utils._.defaults(param, {page: 1});
	param = utils._.extend(param, {artist: param.name, id:param.id});

	fmapi.GetArtistTracks(param,
		function(result, err) {
			if (!err && result.toptracks){
				var tracks = result.toptracks.track;
				var pagecount = result.toptracks["@attr"].totalPages;

				var next = function() {
					if (param.page < pagecount) {
						param.page += 1;
						getTracks(param, callBack);
					}
				}

				if (tracks.length > 0) {
					var conv = [];
					utils._.each(tracks, function(elem){
						elem.id = elem.mbid || '';
						elem.artist_name = param.artist;
						elem.artist_id = param.id || '';
						conv.push(db.Track.value(elem));
					});
					db.Track.insert({values: conv}, function(res, err){
						!err && callBack && callBack(res.rows, next);
						err && console.error(err);
					});
					callBack || next();
				}
			}
	})
}