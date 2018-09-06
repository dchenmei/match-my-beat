var g_access_token = '';
var g_username = '';
var g_tracks = [];
var seed_tracks_str = '';
var seed_artists_str = '';

// returns user's top two artists
function getTopArtists(callback)
{
	var limit = 2;
	var url = 'https://api.spotify.com/v1/me/top/artists/?limit=' + String(limit);
	$.ajax(url, {
		headers: {
			'Authorization': 'Bearer ' + g_access_token, 
			'Content-Type': 'application/json'
		},
		success: function(r) {
			var artists = r.items;
			var artists_str = "";
			for (var i = 0; i < artists.length; ++i)
			{
				if (i != 0)
					artists_str += ',';
			
				artists_str += artists[i].id;
			}
			callback(artists_str);
		},
		error: function(r) {
			console.log("Fail top artists");
			callback(null);
		}
	});
}

// returns string of user's top two tracks ids, separated by commas
function getTopTracks(callback)
{
	var limit = 2;
	var url = 'https://api.spotify.com/v1/me/top/tracks/?limit=' + String(limit);
	$.ajax(url, {
		headers: {
			'Authorization': 'Bearer ' + g_access_token,
			'Content-Type': 'application/json'
		},
		success: function(r) {
			var tracks = r.items;
			var tracks_str = "" 
			for (var i = 0; i < tracks.length; ++i)
			{
				if (i != 0)
					tracks_str += ',';
	
				tracks_str += tracks[i].id;
			}
			callback(tracks_str);	
		},
		error: function(r) {
			console.log("getTopTracks failed");
			callback(null);
		}
	});
}

// returns an array of tracks (uri only)
function getTracksBPM(seed_artists_str, seed_tracks_str, bpm, callback)
{
	var percent_range = 75;
	var min_bpm = bpm * (percent_range / 100);
	var max_bpm = bpm / (percent_range / 100);
	var url = 'https://api.spotify.com/v1/recommendations?limit=10&market=ES&seed_artists=' + seed_artists_str  + 
			  '&seed_tracks=' + seed_tracks_str + '&min_tempo=' + min_bpm + '&max_tempo=' + max_bpm + '&target_tempo=' + bpm;
	$.ajax(url, {
		headers: {
			'Authorization': 'Bearer ' + g_access_token,
			'Content-Type': 'application/json'
		},
		success: function(r) {
			var songs = r.tracks;
			var songs_arr = { "uris": [] };
			for (var i = 0; i < songs.length; ++i)
			{
				songs_arr.uris.push(songs[i].uri);
			}
			
			callback(songs_arr);
		},
		error: function(r) {
			callback(null);
		}
	});
}

function getUsername(callback) {
    var url = 'https://api.spotify.com/v1/me';
    $.ajax(url, {
        headers: {
            'Authorization': 'Bearer ' + g_access_token
        },  
        success: function(r) {
            callback(r.id);
        },  
        error: function(r) {
            callback(null);
        }   
    }); 
}

function createPlaylist(username, name, callback) {
    var url = 'https://api.spotify.com/v1/users/' + username +
        '/playlists';
    $.ajax(url, {
        method: 'POST',
        data: JSON.stringify({
            'name': name,
            'public': false
        }), 
        dataType: 'json',
        headers: {
            'Authorization': 'Bearer ' + g_access_token,
            'Content-Type': 'application/json'
        },  
        success: function(r) {
			// for each track, only extract the uri
            callback(r.id);
        },  
        error: function(r) {
            callback(null);
        }   
    }); 
}

function addTracksToPlaylist(username, playlist, tracks, callback) {
	/* uri's (track ids) are passed through body parameters to avoid url limit overflow */
	var url = "https://api.spotify.com/v1/playlists/" + playlist + "/tracks?position=0";
    $.ajax(url, {
        method: 'POST',
		data: JSON.stringify(tracks),
		dataType: 'text',
        headers: {
            'Authorization': 'Bearer ' + g_access_token,
			'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        success: function(r) {
            console.log('add track response', JSON.stringify(r));
			callback(r);
        },
        error: function(r) {
			console.log('FAIL', JSON.stringify(r));
        }
    });
}

function generate() {
    // parse hash
    var hash = location.hash.replace(/#/g, '');
    var all = hash.split('&');
    var args = {};
    console.log('all-json', JSON.stringify(all));
    all.forEach(function(keyvalue) {
        var idx = keyvalue.indexOf('=');
        var key = keyvalue.substring(0, idx);
        var val = keyvalue.substring(idx + 1);
        args[key] = val;
    });

	g_name = "BPM Playlist";

    console.log('got args', JSON.stringify(args));

    if (typeof(args['access_token']) != 'undefined') {
        // got access token
        console.log('got access token', args['access_token']);
        g_access_token = args['access_token'];
    }


    getUsername(function(username) {
	getTopArtists(function(seed_artists_str) {
	getTopTracks(function(seed_tracks_str) {
		var bpm = localStorage.getItem("bpm");
        createPlaylist(username, g_name, function(playlist) {
		getTracksBPM(seed_artists_str, seed_tracks_str, bpm, function(g_tracks) {	
            console.log('created playlist', playlist);
            addTracksToPlaylist(username, playlist, g_tracks, function() {
                console.log('tracks added.');
                $('#playlistlink').attr('href', 'spotify:user:'+username+':playlist:'+playlist);
                $('#creating').hide();
                $('#done').show();
            });
        });
		});
	});
	});
    });
}

