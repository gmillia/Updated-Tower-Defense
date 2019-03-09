class tower
{
    constructor()
    {
        this.x = 0;
        this.y = 0;
        this.fireRate = 75;
        this.coolDown = 0;
        this.color = "blue";
        this.size = 15;
        this.bullets = [];
        this.range = 2;
        this.currEnemey = null;
    }

    draw(ctx, enemies)
    {
        //draws tower
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);

        //checkForEnemies(enemies) and shoot (if possible)
        for(var i = 0; i < enemies.length; i++)
        {
            let enemy = enemies[i];
            //var dist = this.findDistance(enemy);

            if(this.inRange(enemy) && enemy.alive)
            {
                //console.log(dist);
                if(this.coolDown <= 0)
                {
                    //draw line aka bullet
                    ctx.beginPath();
                    ctx.moveTo(this.x + 7, this.y + 7);
                    ctx.lineTo(enemy.x + 15, enemy.y + 15);
                    ctx.strokeStyle = "red";
                    ctx.lineWidth = 5;
                    ctx.stroke();
                    ctx.lineWidth = 1;
                    this.coolDown = this.fireRate;

                    enemy.damage(200);
                }
            }
        }
    }

    findDistance(enemy)
    {
        return Math.sqrt((Math.pow((enemy.x - this.x), 2)) + (Math.pow(enemy.y - this.y), 2));
    }

    inRange(enemy)
    {
        if(enemy.x >= (this.x - (this.range + 1) * 30) && enemy.x <= (this.x + (this.range + 1) * 30) && enemy.y >= (this.y - (this.range + 1) * 30) && enemy.y <= (this.y + (this.range) * 30)) return true;
        else return false;
    }
}