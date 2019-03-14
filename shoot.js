//grab canvas
var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");

//Button events
document.getElementById("start").addEventListener("click", startGame, false);
document.getElementById("pause").addEventListener("click", pauseGame, false);
document.getElementById("towerOne").addEventListener("click", chooseTower, false);
document.getElementById("towerTwo").addEventListener("click", chooseTower, false);
document.getElementById("sell").addEventListener("click", sellTower, false);

//Canvas Events
canvas.addEventListener("mousemove", handleMouseMove);
canvas.addEventListener("mouseout", handleMouseOut);
canvas.addEventListener("click", handleMouseClick);

//holds mouse x/y position
var mouse = 
{
    x: -1,  //position y
    y: -1,  //position y
}

//create map and load Map1 (level1)
var gameMap = new map();
gameMap.level1();

var towers = [];  //holds all towers placed on map
var enemies = [];  //holds all enemies in the current wave
var killed = [];  //holds all indexes of killed enemies
var reachedEnd = [];  //holds all indexes of enemies that reached 

var maxCool = 35;  //max time wait between enemy spawns
var enemyCoolDown = 0;  //ticks between each enemy appearance
var maxEnemies = 25;  //enemy count for wave 1 (will be increased with each wave)
var enemyCount = 0;  //current enemy count
var pauseBetweenWaves = 500;  //pause between waves
var minWait = maxCool;

//Display values
var maxWaves = 10;
var currWave = 1;
var currMoney = 1000;
var lives = 10;

var towerSelected = false;  //button is selected
var towerRange = 1;  //radius of selected tower
var towerColor = null;  //color of currently selected tower
var objectType = null;  //used to identify which tower to create on click
var towerPrice = null;
var towerName = null;
var towerDamage = null;


//Temporary objects
var tempT1 = new TowerOne(-1,-1);
var tempT2 = new TowerTwo(-1,-1);
var tile = new Tile();
var towerIndex = {index: null, tower: null };  //used when we want to sell the tower

//Game currently running/paused
var playing = false;

//START THE GAME
draw();

/*
Handles tower selection and updates global vars (tower color, tower object type etc)
*/
function chooseTower()
{
    towerSelected = true;  //for displaying tower and range when mouse over the canvas
    if(this.id == "towerOne") 
    { 
        towerColor = tempT1.color; 
        objectType = 1; 
        towerRange = tempT1.range;
        towerPrice = tempT1.price;
        towerName = "Tower One";
        towerDamage = tempT1.damage;
    }
    if(this.id == "towerTwo") 
    { 
        towerColor = tempT2.color; 
        objectType = 2;
        towerRange = tempT2.range;
        towerPrice = tempT2.price;
        towerName = "Tower Two";
        towerDamage = tempT2.damage;
    }

    displayTowerInfo();
}

/*
Helper "overloaded" function that updates the display-box info
*/
function ChooseTower(tower)
{
    //towerSelected = true;  //for displaying tower and range when mouse over the canvas
    if(tower.name == "Tower One") 
    { 
        //towerColor = tempT1.color; 
        //objectType = 1; 
        towerRange = tempT1.range;
        towerPrice = tempT1.price;
        towerName = "Tower One";
        towerDamage = tempT1.damage;
    }
    if(tower.name == "Tower Two") 
    { 
        //towerColor = tempT2.color; 
        //objectType = 2;
        towerRange = tempT2.range;
        towerPrice = tempT2.price;
        towerName = "Tower Two";
        towerDamage = tempT2.damage;
    }

    displayTowerInfo();   
}

/*
Function that handles mouse clicks (places objects on the canvas)
TODO: when clicked on the tower give option to sell/upgrade

!!!Current issue, mouse move records position only when tower is selected -> therefore coords of the mouse stay old!!!
->Issue seems to be fixed ATM
*/
function handleMouseClick(evt)
{
    //Case 1: Clicking on the canvas without "dragging" tower on it
    if(mouse.x != -1 && mouse.y != -1 && !towerSelected)
    {
        //Grab the tile on canvas where mouse was clicked
        var selectedTile = gameMap.getTile(mouse.x, mouse.y);

        //Is the tower on the tile?
        var selectedIsTower = tileIsTower(selectedTile.x, selectedTile.y);

        //Update the display info
        ChooseTower(selectedIsTower.tower);

        //If tile isn't placable (might remove) and tile holds tower
        if(!selectedTile.placable && selectedIsTower.tower != null)
        {
            //Case: Displays the sell option in the info box
            displaySellInfo();
        }
    }
    //Case 2: tower is selcted (is dragging with the mouse)
    else if(mouse.x != -1 && mouse.y != -1 && towerSelected)
    {
        //Grab the tile on canvas where mouse was clicked
        var selectedTile = gameMap.getTile(mouse.x, mouse.y);

        //If tile is free (can place stuff on it) AND selected is tower
        if(selectedTile.placable)
        {
            //Buy tower only if we have money for it
            if(currMoney >= towerPrice)
            {
                var newTower = createObject();  //calls helper function to create a new tower
                towers.push(newTower);          //adds tower to the tower list
                selectedTile.placable = false;  //make tile non-placable
                currMoney -= towerPrice;  //decrease amount of cash we have

                displayMoney();  //display money we have
                towerSelected = false;
            }
        }
    }
}

/*
Helper function that returns tower (if selected tile includes tower) OR null
*/
function tileIsTower(x, y)
{
    for(var i = 0; i < towers.length; i++)
    {
        if(towers[i].x == x && towers[i].y == y)
        {
            towerIndex = {index: i, tower: towers[i]};
            return towerIndex;
        }
    }
    return null;
}

/*
Helper function that creates a new tower, by selecting tower that was clicked on last
*/
function createObject()
{
    if(objectType == 1) return new TowerOne(mouse.x * 30, mouse.y * 30);
    else return new TowerTwo(mouse.x * 30, mouse.y * 30);
}

/*
Handles mouse out of canvas movement -> sets x/y values to -1 to indicate
that mouse is currently out of canvas. This results in tower/radius etc not
being drawn
*/
function handleMouseOut(evt)
{
    mouse.x = -1;
    mouse.y = -1;
}

/*
Handles mouse movement on canvas -> Calculates mouse position, then find out which tile (x,y) is
assiciated with it (on which tile mouse is at currently).
Finally, calls draw method.
*/
function handleMouseMove(evt)
{
    //Display tower and its range over the canvas only when tower is selected
    /*
    if(towerSelected) 
    {
        var mousePos = getMousePos(canvas, evt);  //Returns tuple of mouse pos on canvas (x,y)
        mouse.x = Math.floor(mousePos.x/30);  //find associated X-tile
        mouse.y = Math.floor(mousePos.y/30);  //find associated Y-tile
    }
    */

    var mousePos = getMousePos(canvas, evt);  //Returns tuple of mouse pos on canvas (x,y)
    mouse.x = Math.floor(mousePos.x/30);  //find associated X-tile
    mouse.y = Math.floor(mousePos.y/30);  //find associated Y-tile
}

/*
Helper function to calculate current mouse position on the canvas. Returns tuple (x,y) position
*/
function getMousePos(canvas, evt) 
{
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}


/*
Sets playing to true -> game starts running (enemies start moving)
*/
function startGame()
{
    //If we haven't died yet
    if(lives > 0)
        playing = true;
    //else restart
    else
        window.location.reload();
}

/*
Function that gets called when pause button is pressed -> enemies stop moving, but 
can still place towers
*/
function pauseGame()
{
    playing = false;
}

/*
Function draws everything on the canvas (including the canvas) AND calculates everything else (either by calling objects funcs on by itself)
*/
function draw()
{
    //draw map
    gameMap.draw(ctx, gameMap);

    //add enemies:
    if(playing && pauseBetweenWaves >= 500)
        addEnemies();

    //Draw each enemy
    drawEnemies();

    //Draw each enemy
    drawTowers();

    //draw mouse
    drawMouse();

    //check if it's time for the next wave
    if(playing)
        nextWave();

    //Display money -> updates every turn
    displayMoney();

    //redraw again
    requestAnimationFrame(draw);
}

/*
Helper function that draws all the otwers
*/
function drawTowers()
{
    for(var i = 0; i < towers.length; i++)
    {
        towers[i].draw(ctx, enemies);
        towers[i].coolDown--;
    }
}

/*
Helper function to draw all the enemies
*/
function drawEnemies()
{
    displayRemainingEnemies();
    for(var i = 0; i < enemies.length; i++)
    {
        //If enemy is alive -> draw it
        if(enemies[i].alive) enemies[i].draw(ctx);
        //Else if enemy is not on the killed list AND it's not alive AND hasn't reached the end
        else if(!killed.includes(i) && !reachedEnd.includes(i)) 
        {
            killed.push(i);  //add to the killed list

            //add money
            currMoney += enemies[i].reward;
            //displayMoney();
        }

        //Check if enemy reached final destination
        if(enemies[i].x == 870 && enemies[i].y == 870 && enemies[i].alive && !reachedEnd.includes(i))
        {
            lives--;  //decrease lives left
            displayLives();  //Display lives left

            reachedEnd.push(i);  //add enemies to the list of those that reached the end

            //End of the game check
            if(lives <= 0) 
            {
                document.getElementById("start").innerHTML = "Restart";  //Rename the start button to Restart
                playing = false;  //pause the game
            }
        }
        //move only if game is not paused
        else if(playing) enemies[i].move();

        //If we killed all enemies, clear killed and enemies list -> wave is over
        if((killed.length + reachedEnd.length) >= maxEnemies) 
        { 
            //clear lists
            killed.length = 0; 
            enemies.length = 0;
            reachedEnd.length = 0;
            //enemyCount = 0;
        }
    }
}

/*
Helper function that draws the tower and its range over the canvas (when tower is chosen)
*/
function drawMouse()
{
    if(mouse.x != -1 && mouse.y != -1) 
    {
        if(towerSelected)
        {
            drawRange();
            ctx.fillStyle = towerColor;  //Gets a color of the chosen tower
            ctx.fillRect(mouse.x*tile.size, mouse.y*tile.size, tile.size, tile.size);
        }
    }
}

/*
Helper function that adds enemies to the enemy list every N-ms: TODO -> add random enemy selection
*/
function addEnemies()
{
    if(enemyCoolDown <= 0 && enemyCount < maxEnemies)
    {
        enemies[enemyCount] = new FastWeakEnemy();
        enemyCount++;
        enemyCoolDown = maxCool;
        enemyCoolDown--;
    }
    else
        enemyCoolDown--;
}

/*
Helper function that draws range of the tower.
Arc (range circle) is being centered at the center of the tile mouse is currently at.
*/
function drawRange()
{
    if(towerSelected)
    {
        ctx.fillStyle = "rgba(27,27,238, 0.5)";

        for(var i = -towerRange; i < towerRange + 1; i++)
        {
            for(var j = -towerRange; j < towerRange + 1; j++)
            {
                ctx.fillRect((mouse.x + i) * tile.size, (mouse.y + j) * tile.size, tile.size, tile.size);
            }
        }
    }
}

/*
Helper function to reset values for the new wave
*/
function nextWave()
{
    if(enemies.length == 0 && currWave < 10 && enemyCoolDown == 0)
    {
        if(pauseBetweenWaves <= 0)
        {
            enemyCount = 0;  //reset current enemy count
            maxCool -= 1;  //reduce wait time between enemy spawns
            maxEnemies += 10;  //increase amount of enemies in each wave
            currWave++;  //increase wave count
            pauseBetweenWaves = 500;  //reset pause between waves

            //Display current wave
            displayCurrWave();
            displayNextWave(0);
        }
        else
        {
            pauseBetweenWaves--;  //reduce pause time till the next wave
            var timeLeft = Math.round(pauseBetweenWaves / 50);  //calculate approximate time until the next wave
            displayNextWave(timeLeft);
        }
    }
}

/*
Helper function that gets called when we need to display money
*/
function displayMoney()
{
    document.getElementById('money').innerHTML = "Money: " + currMoney;
}

/*
Helper function that gets called when we need to display time left for the next wave
*/
function displayNextWave(timeLeft)
{
    document.getElementById('nextWave').innerHTML = "Next Wave In: " + timeLeft;  //display time left until next wave
}

/*
Helper function that get called when we need to display current wave
*/
function displayCurrWave()
{
    document.getElementById('wave').innerHTML = 'Wave: ' + currWave;
}

/*
Helper function that gets called when we need to display current lives
*/
function displayLives()
{
    document.getElementById('lives').innerHTML = "Lives: " + lives;  //display lives left
}

/*
Helper function to display tower info on the page
*/
function displayTowerInfo()
{
    document.getElementById("tower").innerHTML = "Tower: " + towerName;
    document.getElementById("price").innerHTML = "Price: " + towerPrice;
    document.getElementById("range").innerHTML = "Range: " + towerRange + " tiles";
    document.getElementById("damage").innerHTML = "Damage: " + towerDamage;
    document.getElementById('sell').style.display = "none";
    document.getElementById("towerInfo").style.display = "block";
}

function displaySellInfo()
{
    document.getElementById("tower").innerHTML = "Tower: " + towerName;
    document.getElementById("price").innerHTML = "Price: " + towerPrice;
    document.getElementById("range").innerHTML = "Range: " + towerRange + " tiles";
    document.getElementById("damage").innerHTML = "Damage: " + towerDamage;
    document.getElementById('sell').style.display = "block";
    document.getElementById("towerInfo").style.display = "block";
}

/*
Helper function that shows enemies remaining in the wave
*/
function displayRemainingEnemies()
{
    document.getElementById("remaining").innerHTML = "Remaining Enemies: " + (maxEnemies - enemyCount) + "/" + maxEnemies;
}

/*
Function that gets called when Sell button is clicked:
Removes tower from the towers list
TODO: Recolor the tile and return the money (half the money)
*/
function sellTower()
{
    //Remove tower from the list
    towers.splice(towerIndex.index, 1);

    //Make tile available again
    gameMap.getTile(towerIndex.tower.x/30, towerIndex.tower.y/30).placable = true;

    //return half the money
    currMoney += Math.floor(towerPrice/2);

    document.getElementById("towerInfo").style.display = "none";
}

