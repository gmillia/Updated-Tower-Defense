class tempTile
{
    constructor(x, y)
    {
        this.x = x;
        this.y = y;
    }

    changeCoords(x,y)
    {
        this.x = x;
        this.y = y;
    }
}

Array.prototype.contains = function(x,y)
{
    var i = this.length;
    while (i--) 
    {
        if (this[i][0] == x && this[i][1] == y) 
        {
            return true;
        }
    }
    return false;
}

class enemy
{
    constructor()
    {
        this.x = 0;
        this.y = 0;
        this.size = 30;
        this.speed = 1.5;
        this.color = "yellow";
        this.alive = true;
        this.health = 1000;
    }

    draw(ctx)
    {
        if(this.alive)
        {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.size, this.size);
        }
    }

    move()
    {
      //tuple of new coords
       if(this.alive)
       {
           var move = this.findDirection(this.x, this.y)
           if(move)
           {
                this.x = move[0];
                this.y = move[1];
           }
       }
    }

    findDirection(x,y)
    {
        //Move to the right
        if(x < 870 && (y == 0 || y == 120 || y == 240 || y == 360 || y == 480 || y == 600 || y == 720 || y == 840)) return [x + this.speed, y];
        //Move down on the left side
        if(x == 0 && ((y >=60 && y < 120) || (y >= 180 && y < 240) || (y >= 300 && y < 360) || (y >= 420 && y < 480) || (y >= 540 && y < 600) || (y >= 660 && y < 720) || (y >= 780 && y < 840))) return [x, y + this.speed];
        //Move down on the right side
        if(x == 870 && ((y >= 0 && y < 60) || (y >= 120 && y < 180) || (y >= 240 && y < 300) || (y >= 360 && y < 420) || (y >= 480 && y < 540) || (y >= 600 && y < 660) || (y >= 720 && y < 780) || (y >= 840 && y < 870))) return [x, y + this.speed];
        //Move to the left
        if(x > 0 && (y == 60 || y == 120 || y == 180 || y == 300 || y == 420 || y == 540 || y == 660 || y == 780 || y == 800)) return [x - this.speed, y];
    }

    damage(dmg)
    {
        this.health -= dmg;

        if(this.health <= 0) this.alive = false;
    }
}