$(document).ready(function()
{

// Get the box
var info = document.getElementById('info');

// Get the button that opens the info
var btn = document.getElementById("about");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal 
btn.onclick = function() {
	console.log("Fudge?");
    info.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    info.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == info) {
        info.style.display = "none";
    }
}

});
