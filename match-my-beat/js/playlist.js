/*
 * playlist.js
 * Methods for calling Spotify API to actually generate the playlist
 */


var g_access_token = '';

/* Based on user's listening activity, return top artists as a string:
 * artist_id, artist_id2, ..., artist_idn
 */
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

/* Based on user's listening activity, return top tracks as a string:
 * track_id, track_id2, ..., track_idn
 */
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

/* Given seed <artists, tracks, bpm> return JSON array of track uri:
 *
 * { 
 *     "uris": [ track_uri, track_uri2, ..., track_urin ]
 * }
 *
 */
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

/* Returns username of g_access_token in JSON */
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

/* Given a username and playlist name, send request to create an empty playlist */
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
            callback(r.id);
        },  
        error: function(r) {
            callback(null);
        }   
    }); 
}

/* Given a playlist and tracks, send request to add them to the playlist */
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

/* Run */
function generate() {
    // parse hash
    var hash = location.hash.replace(/#/g, '');
    var all = hash.split('&');
    var args = {};
    all.forEach(function(keyvalue) {
        var idx = keyvalue.indexOf('=');
        var key = keyvalue.substring(0, idx);
        var val = keyvalue.substring(idx + 1);
        args[key] = val;
    });

    if (typeof(args['access_token']) != 'undefined') {
        g_access_token = args['access_token'];
    }

    getUsername(function(username) {
	getTopArtists(function(seed_artists_str) {
	getTopTracks(function(seed_tracks_str) {
		var bpm = localStorage.getItem("bpm");
        createPlaylist(username, "BPM Playlist", function(playlist) {
		getTracksBPM(seed_artists_str, seed_tracks_str, bpm, function(g_tracks) {	
            console.log('created playlist', playlist);
            addTracksToPlaylist(username, playlist, g_tracks, function() {
                console.log('tracks added.');
                $('#playlistlink').attr('href', 'https://open.spotify.com/playlist/'+playlist);
                $('#creating').hide();
                $('#done').show();
            });
        });
		});
	});
	});
    });
}

