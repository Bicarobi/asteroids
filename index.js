const canvas = document.querySelector("canvas");

const c = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

class Player {
	constructor(x, y, radius, color, velocity) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.color = color;
		this.velocity = { x: 0, y: 0 };
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
		this.color = this.get_random_color();
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
		this.x = this.x + this.velocity.x;
		this.y = this.y + this.velocity.y;
	}

	rand(min, max) {
		return min + Math.random() * (max - min);
	}

	get_random_color() {
		var h = this.rand(1, 360);
		var s = 100;
		var l = 50;
		return "hsl(" + h + "," + s + "%," + l + "%)";
	}
}

class Enemy {
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
		this.x = this.x + this.velocity.x;
		this.y = this.y + this.velocity.y;
	}
}

const player = new Player(canvas.width / 2, canvas.height / 2, 30, "white");

const projectiles = [];
const enemies = [];

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

		const angle = Math.atan2(player.y - y, player.x - x);
		const velocity = { x: Math.cos(angle), y: Math.sin(angle) };

		enemies.push(new Enemy(x, y, radius, "green", velocity));
	}, 1000);
}

let animationId;

function animate() {
	animationId = requestAnimationFrame(animate);

	c.fillStyle = "rgba(0, 0, 0, 0.1)";
	c.fillRect(0, 0, canvas.width, canvas.height);

	player.update();

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
				setTimeout(() => {
					enemies.splice(index, 1);
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
			null,
			velocity
		)
	);
});

window.addEventListener("keydown", (event) => {
	const moveSpeed = 3;
	let x;
	let y;

	if (event.code == "KeyW") {
		y = -moveSpeed;
	} else if (event.code == "KeyS") {
		y = moveSpeed;
	}

	if (event.code == "KeyA") {
		x = -moveSpeed;
	} else if (event.code == "KeyD") {
		x = moveSpeed;
	}

	velocity = { x: x, y: y };
	player.velocity = velocity;
});

animate();
spawnEnemies();
