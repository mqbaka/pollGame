var canvas = document.querySelector('canvas');
var pen = canvas.getContext('2d');
canvas.width= 900;
canvas.height= 550;
const W = canvas.width;
const H = canvas.height;

const ballRadius= 20;

const friction= .01;

var numBalls = 30;
var grav = [0,-0.1];

function Ball(x,y,dx,dy,r) {
	this.x = x;
	this.y = y;
	this.dx = dx;
	this.dy = dy;
	this.r = r;
	this.color = 'hsl('+(Math.random()*360)+',90%,50%)';
	this.dead= false;

	this.draw = function() {
		if(this.dead){
			return;
		}
		pen.fillStyle = this.color;
		pen.beginPath();
		pen.arc(this.x,this.y,this.r,0,2*Math.PI);
		pen.fill();
	}
	
	this.update = function() {
		if(this.dead){
			return;
		}
		this.x += this.dx;
		this.y += this.dy;
		this.dx += grav[0];
		this.dy -= grav[0];
		if(this.x > W - this.r) {
			this.x = W - this.r;
			this.dx *= -1;
		} else if(this.x < this.r) {
			this.x = this.r;
			this.dx *= -1;
		}
		if(this.y > H - this.r) {
			this.y = H - this.r;
			this.dy *= -1;
		} else if(this.y < this.r) {
			this.y = this.r + 1;
			this.dy *= -1;
		}
		this.draw();
	}
}


var balls = [];

function reset() {
	balls = [];
	for(var i=0 ; i < numBalls ; i++) {
		var x = Math.random()*W;
		var y = Math.random()*H;
		var r = Math.random()*20 + 10;
		balls.push(new Ball(x,y, Math.random()*10 - 5, Math.random()*10 - 5,r));
	}
}
reset();

window.addEventListener('keydown', function(key){
	if(key.code === 'Space'){
		reset();
	}
});

var mouseDown = false;
var cooldown = 0;
var mouse = {
	x: undefined,
	y: undefined
};

canvas.addEventListener('mousedown',function(event) {
	mouseDown = true;
});
canvas.addEventListener('mouseup', function(event) {
	mouseDown = false;
});
canvas.addEventListener('mousemove',function(event) {
	mouse.x = event.x - 15;
	mouse.y = event.y - 15;
});

class Holes{
	constructor(){
		this.hArray= [];
	}
	draw(ctx){
		for(let i= 0; i< 6; i++){
			ctx.beginPath();
			let X, Y;
			switch(i){
				case 0:
					X= 0; Y= 0;
					this.hArray.push(
					{
						iks: 0,
						igrec: 0,
						rad: ballRadius
					});
					break;
				case 1:
					X= 450; Y= 0;
					this.hArray.push(
					{
						iks: 450,
						igrec: 0,
						rad: ballRadius
					});
					break;
				case 2:
					X= 900; Y= 0;
					this.hArray.push(
					{
						iks: 900,
						igrec: 0,
						rad: ballRadius
					});
					break;
				case 3:
					X= 0; Y= 550;
					this.hArray.push(
					{
						iks: 0,
						igrec: 550,
						rad: ballRadius
					});
					break;
				case 4:
					X= 450; Y= 550;
					this.hArray.push(
					{
						iks: 450,
						igrec: 550,
						rad: ballRadius
					});
					break;
				case 5:
					X= 900; Y= 550;
					this.hArray.push(
					{
						iks: 900,
						igrec: 550,
						rad: ballRadius
					});
					break;
			}
			ctx.arc(X, Y, ballRadius + 10, 0,
				2*Math.PI);
			ctx.fillStyle= 'black';
			ctx.fill();
		}
	}
}

function drawCan(ctx){
	ctx.fillStyle = "green";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	holes= new Holes();
	holes.draw(pen);
}


function animate() {
	pen.clearRect(0,0,W,H);

	drawCan(pen);

	cooldown++;
	if(mouseDown && cooldown > 2) {
		var r = Math.random()*20 + 10;
		balls.push(new Ball(mouse.x,mouse.y, Math.random()*10 - 5, Math.random()*10 - 5,r));
		cooldown = 0;
	}
	for(var ball of balls){
		if(ballInHole(ball, holes.hArray)){
			ball.dead= true;
		}
		if(isDeadBall(ball)){
			continue;
		}
		ball.update();
		for(var ball2 of balls){
			if(ball !== ball2){
				if(isDeadBall(ball2)){
					continue;
				}
				var collision = checkCollision(ball, ball2);
				if(collision[0]) {
					adjustPositions(ball,ball2,collision[1]);
					resolveCollision(ball,ball2);
				}
			}
		} 
	}
	requestAnimationFrame(animate);
}

animate();

function checkCollision(ballA, ballB) {
	var rSum = ballA.r + ballB.r;
	var dx = ballB.x - ballA.x;
	var dy = ballB.y - ballA.y;
	return [rSum*rSum > dx*dx + dy*dy,rSum-Math.sqrt(dx*dx+dy*dy)];
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
	ballA.dx -= 1/ballA.r * impulse[0];
	ballA.dy -= 1/ballA.r * impulse[1];
	ballB.dx += 1/ballB.r * impulse[0];
	ballB.dy += 1/ballB.r * impulse[1];
}

function adjustPositions(ballA,ballB,depth) { //Inefficient implementation for now
	const percent = 0.2;
	const slop = 0.01;
	var correction = (Math.max(depth - slop, 0) / (1/ballA.r + 1/ballB.r)) * percent;
	
	var norm = [ballB.x - ballA.x, ballB.y - ballA.y];
	var mag = Math.sqrt(norm[0]*norm[0] + norm[1]*norm[1]);
	norm = [norm[0]/mag,norm[1]/mag];
	correction = [correction*norm[0],correction*norm[1]];
	ballA.x -= 1/ballA.r * correction[0];
	ballA.y -= 1/ballA.r * correction[1];
	ballB.x += 1/ballB.r * correction[0];
	ballB.y += 1/ballB.r * correction[1];
}

function ballInHole(b, h){
	for(let i= 0; i< h.length; i++){
		if(ballTouchesH(b, h[i])){
			b.dead= true;
			break;
		}
	}

	function ballTouchesH(ball, hole){
		var squareDist=
		Math.pow((ball.x - hole.iks), 2) +
		Math.pow((ball.y - hole.igrec), 2);
		if(squareDist <=
			Math.pow((ball.r + hole.rad), 2)){
			return(true);
		}else{
			return(false);
		}
	}
}

function isDeadBall(ball){
	return ball.dead;
}