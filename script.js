
//Loads buttons for each page from the external HTML file
    fetch("buttons.html")
      .then(response => response.text())
      .then(data => {
        document.getElementById("button-container").innerHTML = data;
      });


/*
//Play/Loading Button
function handleButtonClick() {
    //Get the button, loading text, and sound elements
    var button = document.getElementById("playButton");
    var loadingText = document.getElementById("loadingText");
    var clickSound = document.getElementById("clickSound");
    //Hide the button and show "Loading..."
    button.style.display = "none";
    loadingText.style.display = "inline";
    //Play the sound
    clickSound.play();
    //Simulate delay then redirect
    setTimeout(function() {
        window.location.href = "game.html"; //Redirect after delay
    }, 2000); //2 seconds
}
*/

/*
// Start the timer on page load
startTimer();
//Inactvity Background Change
let inactivityTime = 000; //5000 milliseconds (5 seconds) before changing background
let timeout;
// Activity to 
document.addEventListener('mousemove', resetTimer);
document.addEventListener('keypress', resetTimer);

function startTimer() {
  timeout = setTimeout(changeToGifBackground, inactivityTime);
}

function resetTimer() {
  clearTimeout(timeout);
  document.body.style.backgroundImage = "url('images/BG.png')"; // Switch back to static background
  startTimer(); // Restart the inactivity timer
}

function changeToGifBackground() {
  document.body.style.backgroundImage = "url('images/BG.png')"; // Change to GIF background
}
*/

function togglePopup(id) {
  const popup = document.getElementById(id);
  popup.style.display = (popup.style.display == "block") ? "none" : "block";
}