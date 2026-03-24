const CARD_WIDTH = 108;
const CARD_HEIGHT = 96;
const CARD_RADIUS = 10;
const GRAVITY_PER_SECOND = 120;
const MAX_FALL_SPEED = 320;

export class PlantItemEntity {
    constructor(x, y, data) {
        this.id = typeof crypto?.randomUUID === 'function'
            ? crypto.randomUUID()
            : `item-${Math.random().toString(36).slice(2, 10)}`;
        this.x = x;
        this.y = y;
        this.data = data;
        this.width = CARD_WIDTH;
        this.height = CARD_HEIGHT;
        this.vx = (Math.random() - 0.5) * 60;
        this.vy = 60 + Math.random() * 40;
        this.rotation = (Math.random() - 0.5) * 0.06;
        this.rotationVelocity = (Math.random() - 0.5) * 0.3;
        this.scale = 1;
        this.targetScale = 1;
        this.isGrabbed = false;
        this.grabbedById = null;
        this.spawnedAt = performance.now();
        this.mass = 1;
    }

    get hitRadius() {
        return Math.max(this.width, this.height) * 0.34;
    }

    get isProtectedFromGrab() {
        return performance.now() - this.spawnedAt < 350;
    }

    get left() { return this.x - this.width * 0.5; }
    get right() { return this.x + this.width * 0.5; }
    get top() { return this.y - this.height * 0.5; }
    get bottom() { return this.y + this.height * 0.5; }

    update(bounds, deltaSeconds) {
        if (this.isGrabbed) {
            this.targetScale = 1.06;
            return;
        }

        this.targetScale = 1;
        this.vy = Math.min(this.vy + GRAVITY_PER_SECOND * deltaSeconds, MAX_FALL_SPEED);
        this.x += this.vx * deltaSeconds;
        this.y += this.vy * deltaSeconds;
        this.rotation += this.rotationVelocity * deltaSeconds;

        this.vx *= 0.997;
        this.rotationVelocity *= 0.995;

        const halfWidth = this.width * 0.5;

        if (this.x < halfWidth) {
            this.x = halfWidth;
            this.vx = Math.abs(this.vx) * 0.6;
        } else if (this.x > bounds.width - halfWidth) {
            this.x = bounds.width - halfWidth;
            this.vx = -Math.abs(this.vx) * 0.6;
        }

        const floorY = bounds.floorY - this.height * 0.5;
        if (this.y > floorY) {
            this.y = floorY;
            this.vy = Math.max(-MAX_FALL_SPEED * 0.25, this.vy * -0.35);
            this.vx *= 0.85;
            if (Math.abs(this.vy) < 8) {
                this.vy = 0;
            }
        }
    }

    release(launchX, launchY) {
        this.isGrabbed = false;
        this.grabbedById = null;
        this.vx = launchX;
        this.vy = launchY;
        this.rotationVelocity = (Math.random() - 0.5) * 0.4;
    }

    draw(ctx) {
        this.scale += (this.targetScale - this.scale) * 0.2;

        const cardLeft = -this.width / 2;
        const cardTop = -this.height / 2;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);

        // Shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 3;

        // Card body
        const grad = ctx.createLinearGradient(0, cardTop, 0, cardTop + this.height);
        grad.addColorStop(0, '#14312500');
        grad.addColorStop(0.15, '#143125');
        grad.addColorStop(0.85, '#0c1f16');
        grad.addColorStop(1, '#0c1f1600');
        ctx.fillStyle = '#0e2419';

        ctx.strokeStyle = this.isGrabbed ? 'rgba(237, 195, 90, 0.7)' : 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = this.isGrabbed ? 1.5 : 1;

        roundRect(ctx, cardLeft, cardTop, this.width, this.height, CARD_RADIUS);
        ctx.fill();
        ctx.stroke();

        ctx.shadowBlur = 0;

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Icon (large)
        ctx.font = '40px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
        ctx.fillText(this.data.icon, 0, -10);

        // Name
        ctx.fillStyle = '#ffffff';
        ctx.font = '600 13px system-ui, -apple-system, sans-serif';
        ctx.fillText(this.data.name, 0, 30);

        ctx.restore();
    }
}

export function resolveCollisions(items, restitution) {
    for (let i = 0; i < items.length; i++) {
        const a = items[i];
        if (a.isGrabbed) {
            continue;
        }

        for (let j = i + 1; j < items.length; j++) {
            const b = items[j];
            if (b.isGrabbed) {
                continue;
            }

            const overlapX = (a.width * 0.5 + b.width * 0.5) - Math.abs(a.x - b.x);
            const overlapY = (a.height * 0.5 + b.height * 0.5) - Math.abs(a.y - b.y);

            if (overlapX <= 0 || overlapY <= 0) {
                continue;
            }

            if (overlapX < overlapY) {
                const sign = a.x < b.x ? -1 : 1;
                a.x += sign * overlapX * 0.5;
                b.x -= sign * overlapX * 0.5;

                const avgVx = (a.vx + b.vx) * 0.5;
                a.vx = avgVx + (a.vx - avgVx) * -restitution;
                b.vx = avgVx + (b.vx - avgVx) * -restitution;
            } else {
                const sign = a.y < b.y ? -1 : 1;
                a.y += sign * overlapY * 0.5;
                b.y -= sign * overlapY * 0.5;

                const avgVy = (a.vy + b.vy) * 0.5;
                a.vy = avgVy + (a.vy - avgVy) * -restitution;
                b.vy = avgVy + (b.vy - avgVy) * -restitution;
            }

            a.rotationVelocity += (Math.random() - 0.5) * 0.15;
            b.rotationVelocity += (Math.random() - 0.5) * 0.15;
        }
    }
}

function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}
