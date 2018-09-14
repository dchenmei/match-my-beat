/*
 * Modal Popup Box script
 */

$(document).ready(function()
{

var info = document.getElementById('info');
var btn = document.getElementById("about");
var span = document.getElementsByClassName("close")[0];

/* Open box */
btn.onclick = function() {
    info.style.display = "block";
}

/* Close box */
span.onclick = function() {
    info.style.display = "none";
}

/* Also close box */
window.onclick = function(event) {
    if (event.target == info) {
        info.style.display = "none";
    }
}

});
