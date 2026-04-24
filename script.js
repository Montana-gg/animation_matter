const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
const particleCount = 1200; // Количество частиц
const mouse = { x: -100, y: -100, active: false };

// Настройки физики
const config = {
    gravity: 0.8,      // Сила притяжения к мыши
    friction: 0.96,   // Трение (замедление)
    radius: 200,      // Радиус влияния мыши
    particleSize: 1.5
};

window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
});

window.addEventListener('resize', setup);

function setup() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

class Particle {
    constructor() {
        this.init();
    }

    init() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 2; // Скорость по X
        this.vy = (Math.random() - 0.5) * 2; // Скорость по Y
        this.accX = 0;
        this.accY = 0;
        this.color = Math.random() > 0.5 ? '#ff0055' : '#00fbff';
    }

    update() {
        if (mouse.active) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < config.radius) {
                const force = (config.radius - distance) / config.radius;
                this.accX = (dx / distance) * force * config.gravity;
                this.accY = (dy / distance) * force * config.gravity;
            } else {
                this.accX = 0;
                this.accY = 0;
            }
        }

        this.vx += this.accX;
        this.vy += this.accY;
        
        // Применяем трение
        this.vx *= config.friction;
        this.vy *= config.friction;

        this.x += this.vx;
        this.y += this.vy;

        // Возвращаем в экран, если улетели (портал)
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
    }

    draw() {
        // Цвет меняется в зависимости от скорости (вау-эффект)
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        const opacity = Math.min(0.2 + speed / 10, 1);
        
        ctx.fillStyle = this.color;
        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.arc(this.x, this.y, config.particleSize + speed / 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

function loop() {
    // Вместо полной очистки рисуем полупрозрачный прямоугольник 
    // Это создает эффект "хвостов" (Motion Blur)
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(5, 5, 5, 0.15)';
    ctx.fillRect(0, 0, width, height);

    particles.forEach(p => {
        p.update();
        p.draw();
    });

    requestAnimationFrame(loop);
}

setup();
loop();