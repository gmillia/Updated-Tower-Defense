var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");

var gameMap = new map();
gameMap.level1();

var towers = [];
var enemies = [];
var eCoolDown = 50;

var enemyCoolDown = 150;
var maxEnemies = 25;
var enemyCount = 0;

//enemies[0] = new enemy();

ct = new tower();
towers[0] = ct;
towers[0].x = 247;
towers[0].y = 37;

nt = new tower();
towers[1] = nt;
towers[1].x = 127;
towers[1].y = 37;

draw();

function draw()
{
    //draw map
    gameMap.draw(ctx, gameMap);

    addEnemies();

    for(var i = 0; i < enemies.length; i++)
    {
        enemies[i].draw(ctx);
        enemies[i].move();
    }
    drawTowers();

    requestAnimationFrame(draw);
}

function drawTowers()
{
    for(var i = 0; i < towers.length; i++)
    {
        towers[i].draw(ctx, enemies);
        towers[i].coolDown--;
    }
}


function addEnemies()
{
    if(enemyCoolDown <= 0 && enemyCount < maxEnemies)
    {
        //console.log(555);
        enemies[enemyCount] = new enemy();
        enemyCount++;
        enemyCoolDown = 150;
    }
    else
        enemyCoolDown--;
}
