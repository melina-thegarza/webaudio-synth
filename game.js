// Get the canvas element
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

//different modes
gameSpeeds = {'easy':2, 'medium':4, 'hard':6}

// Define an object representing the moving element
const movingElement = {
    x: 50, // initial x position
    y: 0,  // initial y position
    width: 30,
    height: 30,
    speed: gameSpeeds['easy'], // pixels per frame
    column: 0 // Initial column
};

// Constants
const numColumns = 5;  // Number of columns
const columnWidthPercentage = 0.2; // Adjust the width percentage of each column 
const columnHeight = canvas.height;

// Function to draw evenly spaced columns
function drawBackgroundColumns() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#fff';

  for (let i = 0; i < numColumns; i++) {
    const columnWidth = canvas.width * columnWidthPercentage * 0.65;
    const x = (canvas.width - columnWidth * numColumns) / 2 + i * columnWidth;

    // Draw column
     if (i === (movingElement.column) % numColumns) {
        // //make a rainbow
        switch (i) {
            case 0:
                ctx.fillStyle = '#e8434b';
                break;
            case 1:
                ctx.fillStyle = '#e88843';
                break;
            case 2:
                ctx.fillStyle = '#f0e051';
                break;
            case 3:
                ctx.fillStyle = '#39db6a';
                break;
            case 4:
                ctx.fillStyle = '#3982db';
                break;      

        }
      } else {
        ctx.fillStyle = '#000'; // Default color for other columns
      }
    ctx.fillRect(x, 0, columnWidth, columnHeight);

    // Draw column border
    ctx.strokeRect(x, 0, columnWidth, columnHeight);
  }
   
}

// Draw background columns
drawBackgroundColumns();


let animationId;
let isAnimating = false;

//ADD MORE SONGS, 2 more, increasing in difficulty
//Mary had a Little Lamb + Happy Birthday
let song = [['C', 'X', 'Z', 'X', 'C', 'C', 'C',
     'X', 'X', 'X', 'C', 'C', 'C',
    'C', 'X', 'Z', 'X', 'C', 'C', 'C',
    'C', 'X', 'X', 'C', 'X', 'Z'], 

    ['B', 'B', 'N', 'B', 'Q', 'M',
    'B', 'B', 'N', 'B', 'W', 'Q',
    'B', 'B', 'T', 'E', 'Q', 'M', 'N', 
    'R', 'R', 'E', 'Q', 'W', 'Q']];
let songOption = 0;
let songIndex = 0;
let widthMax = 720;

function draw() {
     // Check if the animation is still running
     if (!isAnimating) {
        return;
    }

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background columns
    drawBackgroundColumns();

    // Draw the moving element, center it in current column
    const columnWidth = canvas.width * columnWidthPercentage * 0.65;
    const columnX = (canvas.width - columnWidth * numColumns) / 2 + movingElement.column * columnWidth;
    const movingElementX = columnX + (columnWidth - movingElement.width) / 2;
    
    
    ctx.fillStyle = '#000';

    // Draw the front face of the cube
    ctx.fillRect(movingElementX, movingElement.y, movingElement.width, movingElement.height);
    // Draw the top face of the cube with a fixed height
    const topFaceHeight = 5; // Adjust this value for the desired detachment
    ctx.fillRect(movingElementX, movingElement.y - topFaceHeight, movingElement.width, topFaceHeight);
    // Draw the side face of the cube
    ctx.fillRect(movingElementX + movingElement.width, movingElement.y, 5, movingElement.height);

    
    // Add text inside the rectangle
    ctx.fillStyle = '#FFF'; // White color
    ctx.font = '24px Arial';
    ctx.fillText(song[songOption][songIndex],  movingElementX + 5, movingElement.y + 20);

    // Update the position for the next frame
    movingElement.y += movingElement.speed;

    // Check if the element has reached the bottom of the canvas
    if (movingElement.y > canvas.height) {
  
        //subtract 2 points for each missed note
        let gameScore = document.getElementById('gameScore');
        gameScore.innerText = Number(gameScore.innerText) + -2;

        let reaction = document.getElementById('reaction');
        reaction.innerText = "-2";
        reaction.style.color = 'orange';

        setTimeout(function() {
            reaction.innerText = ""; // Reset the text content
            reaction.style.color = ''; // Reset the text color (to default or empty)
          }, 500);
       
          // Stop the animation temporarily
          isAnimating = false;
          cancelAnimationFrame(animationId);
 
          setTimeout(() => {
             isAnimating = true;
             // Reset its position to the top
             movingElement.y = 0;
              //move to next column
             movingElement.column = (movingElement.column + 1) % numColumns;
        
             songIndex = (songIndex + 1) % song[songOption].length;
 
             // Request the next animation frame
             animationId = requestAnimationFrame(draw);
             document.getElementById('startStopButton').textContent = 'Stop Game';
          }, 100);
    }

    // Request the next animation frame
    if (isAnimating) {
        animationId = requestAnimationFrame(draw);
    }
}

// Function to toggle animation
function toggleAnimation() {
    if (isAnimating) {
        // Stop the animation
        isAnimating = false;
        cancelAnimationFrame(animationId);
        document.getElementById('startStopButton').textContent = 'Start Game';
    } else {
        // Start the animation
        isAnimating = true;
        draw();
        document.getElementById('startStopButton').textContent = 'Stop Game';
    }
}

// Add click event listener to the button
document.getElementById('restartButton').addEventListener('click', restartGame);

//function restart game
function restartGame(){
     // Stop the animation
     isAnimating = false;
     cancelAnimationFrame(animationId);
     document.getElementById('startStopButton').textContent = 'Start Game';

     // reset the score
     let gameScore = document.getElementById('gameScore');
     gameScore.innerText = '0';

     //reset the song
     songIndex = 0;

     //reset the blocks
     movingElement.x = 50;
     movingElement.y = 0;
     movingElement.column = 0;


}

//add event listener to the game mode
document.getElementById('mode').addEventListener('change',changeGameMode);
function changeGameMode(){
    let gameModeValue = document.getElementById('mode').value
    //update the mode
    movingElement.speed = gameSpeeds[gameModeValue];
}

//add event listener to the song selection
document.getElementById('song').addEventListener('change',changeSong);
function changeSong(){
    //update the song
    songOption = document.getElementById('song').value;
    //restart from beginning
    songIndex = 0;
}

// Add click event listener to the button
document.getElementById('startStopButton').addEventListener('click', toggleAnimation);

// Add keydown event listener, detect if we played the correct note
document.addEventListener('keydown', function(event) {
    //correct note played
    console.log(songOption)
    if (event.key === song[songOption][songIndex].toLowerCase() && isAnimating) {

         //add to game score
         let gameScore = document.getElementById('gameScore');
         gameScore.innerText = Number(gameScore.innerText) + 1;

         let reaction = document.getElementById('reaction');
         reaction.innerText = "+1";
         reaction.style.color = 'green';
         setTimeout(function() {
            reaction.innerText = ""; // Reset the text content
            reaction.style.color = ''; // Reset the text color (to default or empty)
          }, 500);

         // Stop the animation temporarily
         isAnimating = false;
         cancelAnimationFrame(animationId);

         setTimeout(() => {
            isAnimating = true;
            movingElement.y = 0;
             //move to next column
            movingElement.column = (movingElement.column + 1) % numColumns;
       
            songIndex = (songIndex + 1) % song[songOption].length;

            // Request the next animation frame
            animationId = requestAnimationFrame(draw);
            document.getElementById('startStopButton').textContent = 'Stop Game';
         }, 100);
    }
    else if(isAnimating){
          //add to game score
          let gameScore = document.getElementById('gameScore');
          gameScore.innerText = Number(gameScore.innerText) - 3;

          let reaction = document.getElementById('reaction');
          reaction.innerText = "-3";
          reaction.style.color = 'red';

          setTimeout(function() {
            reaction.innerText = ""; // Reset the text content
            reaction.style.color = ''; // Reset the text color (to default or empty)
          }, 500);

    }
});