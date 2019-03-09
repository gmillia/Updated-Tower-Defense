class bullet
{
    constructor(x, y)
    {
        this.x = x;
        this.y = y;
        this.size = 5;
        this.speed = 0.5;
        this.color = "yellow";
    }

    draw()
    {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }

    move()
    {
        this.x -= this.speed;
        this.y -= this.speed;
    }
}