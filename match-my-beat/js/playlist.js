var g_access_token = '';
var g_username = '';
var g_tracks = [];

// returns user's top five artists
function getTopArtists(callback)
{
	var limit = 5;
	var url = 'https://api.spotify.com/v1/me/top/artists/?limit=' + String(limit);
	$.ajax(url, {
		headers: {
			'Authorization': 'Bearer ' + g_access_token, 
			'Content-Type': 'application/json'
		},
		success: function(r) {
			callback(r);
		},
		error: function(r) {
			console.log("Fail", JSON.stringify(r));
			callback(null);
		}
	});
}

// returns user's top five tracks
function getTopTracks(callback)
{
	var limit = 5;
	var url = 'https://api.spotify.com/v1/me/top/tracks/?limit=' + String(limit);
	$.ajax(url, {
		headers: {
			'Authorization': 'Bearer ' + g_access_token,
			'Content-Type': 'application/json'
		},
		success: function(r) {
			console.log('tracks', JSON.stringify(r));
			callback(r);	
		},
		error: function(r) {
			console.log("getTopTracks failed");
			callback(null);
		}
	});
}

// returns an array of tracks (uri only)
function getTracksBPM(bpm, callback)
{
	var percent_range = 75;
	var min_bpm = bpm * (percent_range / 100);
	var max_bpm = bpm / (percent_range / 100);
	var market = "ES";
	var seed_artists = "4NHQUGzhtTLFvgF5SZesLK";
	var url = 'https://api.spotify.com/v1/recommendations?' + 
			  '&market=' + market + '&seed_artists=' + seed_artists +
			  '&min_tempo=' + min_bpm + '&max_tempo=' + max_bpm + '&target_tempo=' + bpm;

	url = "https://api.spotify.com/v1/recommendations?limit=10&market=ES&seed_artists=4NHQUGzhtTLFvgF5SZesLK&seed_genres=classical%2Ccountry&seed_tracks=0c6xIDDpzE81m2q797ordA"
	$.ajax(url, {
		headers: {
			'Authorization': 'Bearer ' + g_access_token,
			'Content-Type': 'application/json'
		},
		success: function(r) {
			console.log('got tracks');
			
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
            console.log('got username response', JSON.stringify(r)); 
            callback(r.id);
        },  
        error: function(r) {
            callback(null);
        }   
    }); 
}

function createPlaylist(username, name, callback) {
    console.log('createPlaylist', username, name);
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
            console.log('create playlist response', JSON.stringify(r)); 
			
			// for each track, only extract the uri
            callback(r.id);
        },  
        error: function(r) {
            callback(null);
        }   
    }); 
}

function addTracksToPlaylist(username, playlist, tracks, callback) {
    console.log('addTracksToPlaylist!', username, playlist, tracks);
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
			console.log('FAIL');
            callback(null);
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
		//getTopArtists(function(artists) { });
		getTopTracks(function(tracks) { });
        console.log('got username', username);
        createPlaylist(username, g_name, function(playlist) {
		getTracksBPM(120, function(g_tracks) {	
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
}

