var g_access_token = '';
var g_username = '';
var g_tracks = [];

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
			callback(r);
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
            callback(r.id);
        },  
        error: function(r) {
            callback(null);
        }   
    }); 
}

function addTracksToPlaylist(username, playlist, tracks, callback) {
    console.log('addTracksToPlaylist', username, playlist, tracks);
    var url = 'https://api.spotify.com/v1/users/' + username +
        '/playlists/' + playlist +
        '/tracks'; // ?uris='+encodeURIComponent(tracks.join(','));
    $.ajax(url, {
        method: 'POST',
        data: JSON.stringify(tracks),
        dataType: 'text',
        headers: {
            'Authorization': 'Bearer ' + g_access_token,
            'Content-Type': 'application/json'
        },
        success: function(r) {
            console.log('add track response', JSON.stringify(r));
            callback(r.id);
        },
        error: function(r) {
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

	getTracksBPM(120, function(tracks) {
		g_tracks = tracks;
		console.log('seeded tracks', JSON.stringify(tracks));
	}); 

    getUsername(function(username) {
        console.log('got username', username);
        createPlaylist(username, g_name, function(playlist) {
			
            console.log('created playlist', playlist);
            addTracksToPlaylist(username, playlist, g_tracks, function() {
                console.log('tracks added.');
                $('#playlistlink').attr('href', 'spotify:user:'+username+':playlist:'+playlist);
                $('#creating').hide();
                $('#done').show();
            });
        });
    });
}

