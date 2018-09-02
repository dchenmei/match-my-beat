(function(exports) {
	var client_id = '9acc436bf575440aba8f1451d1266c48';
	var redirect_uri = 'http://localhost:8000/callback.html';
		
	var doLogin = function(callback) {
		var url = 'https://accounts.spotify.com/authorize?client_id=' + client_id +
			'&response_type=token' +
			'&scope=playlist-read-private%20playlist-modify%20playlist-modify-private' +
			'&redirect_uri=' + encodeURIComponent(redirect_uri);
		localStorage.setItem('createplaylist-tracks', JSON.stringify(g_tracks));
		localStorage.setItem('createplaylist-name', g_name);
		var w = window.open(url, 'asdf', 'WIDTH=400,HEIGHT=500');
	}

	var g_name = 'HUE';
	var g_tracks = '';
	exports.startApp = function() {
		console.log('start app.');
		$('#start').click(function() {
			doLogin(function() {});
		})
}

})(window);
