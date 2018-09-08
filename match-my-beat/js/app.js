(function(exports) {
	var client_id = '9acc436bf575440aba8f1451d1266c48';
	var redirect_uri = 'http://localhost:8000/callback.html';

	var doLogin = function(callback) {
		var url = 'https://accounts.spotify.com/authorize?client_id=' + client_id +
			'&response_type=token' +
			'&scope=user-top-read%20playlist-read-private%20playlist-modify-public%20playlist-modify-private' +
			'&redirect_uri=' + encodeURIComponent(redirect_uri);

		var width = 400;
		var height = 500;
		var horizontal = (screen.width / 2) - (width / 2);
		var vertical = (screen.height / 2) - (height / 2);
		var w = window.open(url, 'Generating BPM Playlist...', 'WIDTH=' + width + ', HEIGHT=' + height + ', TOP=' + vertical + ' ,LEFT=' + horizontal);
	}

	exports.startApp = function() {
		console.log('start app.');
		$('#start').click(function() {
			localStorage.setItem("bpm", document.getElementById("bpm").value);
			doLogin(function() {});
		})
}

})(window);
