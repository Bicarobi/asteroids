const canvas = document.querySelector("canvas");
const scoreEl = document.querySelector("#score");

const c = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

class Player {
	constructor(x, y, radius, color) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.color = color;
		this.velocity = { x: 0, y: 0 };
		this.direction = { x: 0, y: 0 };
		this.moveSpeed = 3;
	}

	draw() {
		c.beginPath();
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		c.fillStyle = this.color;
		c.fill();
	}

	update() {
		this.movement();
		this.draw();
	}

	movement() {
		const friction = 0.1;

		if (this.direction.x != 0 || this.direction.y != 0) {
			var dir = Math.sqrt(this.direction.x * this.direction.x + this.direction.y * this.direction.y);
			this.velocity.x = (this.direction.x / dir) * this.moveSpeed;
			this.velocity.y = (this.direction.y / dir) * this.moveSpeed;
		}

		if (this.velocity.x > 0) {
			this.velocity.x -= friction;
		} else if (this.velocity.x < 0) {
			this.velocity.x += friction;
		} else {
			this.velocity.x = 0;
		}

		if (this.velocity.y > 0) {
			this.velocity.y -= friction;
		} else if (this.velocity.y < 0) {
			this.velocity.y += friction;
		} else {
			this.velocity.y = 0;
		}

		this.x = this.x + this.velocity.x;
		this.y = this.y + this.velocity.y;
	}
}

class Projectile {
	constructor(x, y, radius, color, velocity) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.color = color;
		this.velocity = velocity;
	}

	draw() {
		c.beginPath();
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		c.fillStyle = this.color;
		c.fill();
	}

	update() {
		this.draw();
		this.x = this.x + this.velocity.x * 5;
		this.y = this.y + this.velocity.y * 5;
	}
}

class Enemy {
	constructor(x, y, radius, color, velocity, speed) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.color = color;
		this.velocity = velocity;
		this.speed = speed;
	}

	draw() {
		c.beginPath();
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		c.fillStyle = this.color;
		c.fill();
	}

	update() {
		this.draw();
		this.x = this.x + this.velocity.x * this.speed;
		this.y = this.y + this.velocity.y * this.speed;
	}
}

class Particle {
	constructor(x, y, radius, color, velocity) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.color = color;
		this.velocity = velocity;
		this.speed = 5;
		this.friction = 0.95;
		this.alpha = 1;
		this.fade = Math.min(Math.max(Math.random(), 0.75), 1);
	}

	draw() {
		c.save();
		c.globalAlpha = this.alpha;
		c.beginPath();
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		c.fillStyle = this.color;
		c.fill();
		c.restore();
	}

	update() {
		this.draw();
		this.velocity.x *= 0.99;
		this.velocity.y *= 0.99;
		this.x = this.x + this.velocity.x * this.speed;
		this.y = this.y + this.velocity.y * this.speed;
		this.alpha -= 0.02 * this.fade;
	}
}

const player = new Player(canvas.width / 2, canvas.height / 2, 10, "white");

const projectiles = [];
const enemies = [];
const particles = [];

console.log(player, canvas.width, canvas.height);

function spawnEnemies() {
	setInterval(() => {
		const radius = Math.random() * (30 - 4) + 4;

		let x;
		let y;

		if (Math.random() < 0.5) {
			x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
			y = Math.random() * canvas.height;
		} else {
			x = Math.random() * canvas.width;
			y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
		}

		const color = `hsl(${Math.random() * 360}, 50%, 50%)`;

		const angle = Math.atan2(player.y - y, player.x - x);
		const velocity = { x: Math.cos(angle), y: Math.sin(angle) };

		enemies.push(new Enemy(x, y, radius, color, velocity, Math.random() * 3));
	}, 1000);
}

let animationId;
let score = 0;

function animate() {
	animationId = requestAnimationFrame(animate);

	c.fillStyle = "rgba(0, 0, 0, 0.1)";
	c.fillRect(0, 0, canvas.width, canvas.height);

	player.direction = movement;
	player.update();
	movement = { x: 0, y: 0 };

	particles.forEach((particle, index) => {
		if (particle.alpha <= 0) {
			particles.slice(index, 1);
		} else {
			particle.update();
		}
	});

	projectiles.forEach((projectile, index) => {
		projectile.update();

		if (
			projectile.x + projectile.radius < 0 ||
			projectile.x - projectile.radius > canvas.width ||
			projectile.y + projectile.radius < 0 ||
			projectile.y - projectile.radius > canvas.height
		) {
			setTimeout(() => {
				projectiles.splice(index, 1);
			}, 0);
		}
	});

	enemies.forEach((enemy, index) => {
		enemy.update();

		const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);

		if (dist - enemy.radius - player.radius < 1) {
			cancelAnimationFrame(animationId);
		}

		projectiles.forEach((projectile, projectileIndex) => {
			const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);

			if (dist - enemy.radius - projectile.radius < 1) {
				for (let i = 0; i < Math.floor(enemy.radius / 5); i++) {
					particles.push(
						new Particle(projectile.x, projectile.y, Math.min(Math.max(Math.random() * 5, 3), enemy.radius), enemy.color, {
							x: (Math.random() - 0.5) * Math.random(),
							y: Math.random() - 0.5,
						})
					);
				}

				if (enemy.radius > 10) {
					gsap.to(enemy, { radius: enemy.radius - 5 });
				} else {
					score += 10;
					scoreEl.innerHTML = score;
					setTimeout(() => {
						enemies.splice(index, 1);
					}, 0);
				}
				setTimeout(() => {
					projectiles.splice(projectileIndex, 1);
				}, 0);
			}
		});
	});
}

window.addEventListener("click", (event) => {
	const angle = Math.atan2(event.clientY - player.y, event.clientX - player.x);
	const velocity = { x: Math.cos(angle), y: Math.sin(angle) };

	const radius = 5;

	projectiles.push(
		new Projectile(
			player.x + (player.radius + radius) * Math.cos(angle),
			player.y + (player.radius + radius) * Math.sin(angle),
			5,
			"white",
			velocity
		)
	);
});

let movement = { x: 0, y: 0 };

kd.W.down(() => {
	movement.y = -1;
});

kd.S.down(() => {
	movement.y = 1;
});

kd.A.down(() => {
	movement.x = -1;
});

kd.D.down(() => {
	movement.x = 1;
});

/*window.addEventListener("keydown", (event) => {
	console.log(event.code);

	if (event.code == "KeyW") {
		movement.y = -moveSpeed;
	} else if (event.code == "KeyS") {
		movement.y = moveSpeed;
	}

	if (event.code == "KeyA") {
		movement.x = -moveSpeed;
	} else if (event.code == "KeyD") {
		movement.x = moveSpeed;
	}

	player.velocity = { x: movement.x, y: movement.y };
});*/

animate();
spawnEnemies();

kd.run(function () {
	kd.tick();
});
