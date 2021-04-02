var canvas = document.querySelector("canvas");
var ctx = canvas.getContext("2d");

canvas.width= 900; //window.innerWidth;
canvas.height= 550; //window.innerHeight + 100;

let borderLeft, borderRight, borderTop, borderBottom;
borderLeft= 0;
borderRight= canvas.width;
borderTop= 0;
borderBottom= canvas.height;

let allBalls= [];

const ballRadius= 20;
const absorption= 1, friction= 0.001;

class Ball{
	constructor(type, x, y){
		this.type= type;
		this.x= x;
		this.y= y;
		this.dirX= true; //goes right
		this.dirY= true; //goes down
		this.dx= 0;
		this.dy= 0;
		this.radius= ballRadius;
		allBalls.push(this);
	}
	draw(){
		ctx.beginPath();
		ctx.arc(this.x, this.y, ballRadius, 0,
			2*Math.PI);
		ctx.fillStyle= this.type ? "white" : "red";
		ctx.fill();
	}
	move(){
		this.x += this.dirX ? this.dx : -this.dx;
		this.y += this.dirY ? this.dy : -this.dy;
		if(this.x >= borderRight - ballRadius){
			this.x= borderRight - ballRadius;
			this.dx= (this.dx - absorption);
			if(this.dx <= 0){
				this.dx= 0;
			}
			this.dirX= false;
		}

		if(this.x <= borderLeft + ballRadius){
			this.x= borderLeft + ballRadius;
			this.dx= (this.dx - absorption);
			if(this.dx <= 0){
				this.dx= 0;
			}
			this.dirX= true;
		}

		if(this.y >= borderBottom - ballRadius){
			this.y= borderBottom - ballRadius;
			this.dy= (this.dy - absorption);
			if(this.dy <= 0){
				this.dy= 0;
			}
			this.dirY= false;
		}

		if(this.y <= borderTop + ballRadius){
			this.y= borderTop + ballRadius;
			this.dy= (this.dy - absorption);
			if(this.dy <= 0){
				this.dy= 0;
			}
			this.dirY= true;
		}

		this.dx -= this.dx * 5 * friction;
		this.dy -= this.dy * 5 * friction;
		if(this.dx <= 0.1){
			this.dx= 0;
		}
		if(this.dy <= 0.1){
			this.dy= 0;
		}
	}
}

class Holes{
	constructor(){}
	draw(){
		for(let i= 0; i< 6; i++){
			ctx.beginPath();
			let X, Y;
			switch(i){
				case 0:
					X= 0; Y= 0; break;
				case 1:
					X= 450; Y= 0; break;
				case 2:
					X= 900; Y= 0; break;
				case 3:
					X= 0; Y= 550; break;
				case 4:
					X= 450; Y= 550; break;
				case 5:
					X= 900; Y= 550; break;
			}
			ctx.arc(X, Y, ballRadius + 10, 0,
				2*Math.PI);
			ctx.fillStyle= 'black';
			ctx.fill();
		}
	}
}

function drawCan(){
	ctx.fillStyle = "green";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	holes= new Holes();
	holes.draw();
}

b1= new Ball(true, 100, 100);
b1.draw();
b1.dx= 20;
b1.dy= 20;
b2= new Ball(false, 550, 450);
function animateAll(){
	requestAnimationFrame(animateAll);
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawCan();

	for(var ball of allBalls) {
		ball.move();
		for(var ball2 of allBalls) {
			if(ball !== ball2) {
				var collision = checkCollision(ball, ball2);
				if(collision[0]) {
					adjustPositions(ball,ball2,collision[1]);
					resolveCollision(ball,ball2);
				}
			}
		}
		ball.draw();
	}
}

function checkCollision(ballA, ballB) {
	var rSum = ballA.radius + ballB.radius;
	var dx = ballB.x - ballA.x;
	var dy = ballB.y - ballA.y;
	return [rSum*rSum > dx*dx + dy*dy,
	rSum-Math.sqrt(dx*dx+dy*dy)];
}

function resolveCollision(ballA, ballB) {
	var relVel = [ballB.dx - ballA.dx,ballB.dy - ballA.dy];
	var norm = [ballB.x - ballA.x, ballB.y - ballA.y];
	var mag = Math.sqrt(norm[0]*norm[0] + norm[1]*norm[1]);
	norm = [norm[0]/mag,norm[1]/mag];
	
	var velAlongNorm = relVel[0]*norm[0] + relVel[1]*norm[1];
	if(velAlongNorm > 0)
		return;
	
	var bounce = 1;
	var j = -(1 + bounce) * velAlongNorm;
	j /= 1/ballA.r + 1/ballB.r;
	
	var impulse = [j*norm[0],j*norm[1]];
	ballA.dx -= 1/ballA.radius * impulse[0];
	ballA.dy -= 1/ballA.radius * impulse[1];
	ballB.dx += 1/ballB.radius * impulse[0];
	ballB.dy += 1/ballB.radius * impulse[1];
}

function adjustPositions(ballA,ballB,depth){
	const percent = 0.2;
	const slop = 0.01;
	var correction = (Math.max(depth - slop, 0) / (1/ballA.radius + 1/ballB.radius)) * percent;
	
	var norm = [ballB.x - ballA.x, ballB.y - ballA.y];
	var mag = Math.sqrt(norm[0]*norm[0] + norm[1]*norm[1]);
	norm = [norm[0]/mag,norm[1]/mag];
	correction = [correction*norm[0],correction*norm[1]];
	ballA.x -= 1/ballA.radius * correction[0];
	ballA.y -= 1/ballA.radius * correction[1];
	ballB.x += 1/ballB.radius * correction[0];
	ballB.y += 1/ballB.radius * correction[1];
}

animateAll();
