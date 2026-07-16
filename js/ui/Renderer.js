// Zeichnet Spieler und Ball auf einem <canvas>. Nutzt echte Sprites aus
// assets/players/idle-right.png und assets/ball.png, falls vorhanden - fällt
// andernfalls automatisch auf schlichte Kreise zurück (z.B. während du die
// Bilder noch nicht hochgeladen hast), damit das Spiel nie wegen fehlender
// Assets kaputtgeht.
const PLAYER_SPRITE_SIZE = 140; // Zielgröße auf dem Canvas (px)
const BALL_SPRITE_SIZE = 50;

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null); // kein Absturz, einfach kein Bild
    img.src = src;
  });
}

export class Renderer {
  constructor(canvas, players, onPlayerClick, assetsBasePath = "assets") {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.players = players;
    this.positions = this._computePositions(players);
    this.ballHolder = players[0].num;
    this.ballAnimPos = null; // {x,y} während einer Wurfanimation
    this.facing = {}; // playerNum -> "left" | "right", default "right"

    this.playerImg = null;
    this.ballImg = null;
    loadImage(`${assetsBasePath}/players/idle-right.png`).then((img) => {
      this.playerImg = img;
      this.draw();
    });
    loadImage(`${assetsBasePath}/ball.png`).then((img) => {
      this.ballImg = img;
      this.draw();
    });

    canvas.addEventListener("click", (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const clicked = this._hitTest(x, y);
      if (clicked) onPlayerClick(clicked.num);
    });

    this.draw();
  }

  _computePositions(players) {
    // Klassisches Cyberball-Layout: die Testperson steht unten in der Mitte,
    // die übrigen Spieler sind gleichmäßig darum herum verteilt (oben) -
    // entspricht der Perspektive, aus der man im Original spielt.
    const n = players.length;
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2 + 10;
    const r = Math.min(this.canvas.width, this.canvas.height) * 0.32;
    const humanIndex = Math.max(0, players.findIndex((p) => p.isHuman));
    const angleStep = (2 * Math.PI) / n;
    const positions = {};
    players.forEach((p, i) => {
      const rel = i - humanIndex;
      const angle = Math.PI / 2 + rel * angleStep; // π/2 = unten (Canvas: y wächst nach unten)
      positions[p.num] = {
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
      };
    });
    return positions;
  }

  _hitTest(x, y) {
    for (const p of this.players) {
      const pos = this.positions[p.num];
      const d = Math.hypot(x - pos.x, y - pos.y);
      if (d <= PLAYER_SPRITE_SIZE / 2) return p;
    }
    return null;
  }

  setBallHolder(num) {
    this.ballHolder = num;
    this.ballAnimPos = null;
    this.draw();
  }

  /** Animiert den Ball linear von fromNum zu toNum über durationMs. */
  animateThrow(fromNum, toNum, durationMs = 1000) {
    // idle-right.png zeigt nach rechts -> spiegeln, wenn der Werfer nach
    // links wirft (entspricht LookLeft/LookRight im Original Play.cs)
    const from = this.positions[fromNum];
    const to = this.positions[toNum];
    this.facing[fromNum] = to.x < from.x ? "left" : "right";

    return new Promise((resolve) => {
      const start = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - start) / durationMs);
        this.ballAnimPos = {
          x: from.x + (to.x - from.x) * t,
          y: from.y + (to.y - from.y) * t,
        };
        this.draw();
        if (t < 1) {
          requestAnimationFrame(step);
        } else {
          this.ballAnimPos = null;
          resolve();
        }
      };
      requestAnimationFrame(step);
    });
  }

  _drawPlayer(p, pos) {
    const ctx = this.ctx;
    if (this.playerImg) {
      const s = PLAYER_SPRITE_SIZE;
      ctx.save();
      if (this.facing[p.num] === "left") {
        ctx.translate(pos.x, pos.y);
        ctx.scale(-1, 1);
        ctx.drawImage(this.playerImg, -s / 2, -s / 2, s, s);
      } else {
        ctx.drawImage(this.playerImg, pos.x - s / 2, pos.y - s / 2, s, s);
      }
      ctx.restore();
    } else {
      // Fallback: Kreis, falls idle-right.png (noch) nicht in assets/players/ liegt
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 36, 0, Math.PI * 2);
      ctx.fillStyle = p.isHuman ? "#4a7dfc" : "#888";
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#222";
      ctx.stroke();
    }

    ctx.fillStyle = this.playerImg ? "#222" : "#fff";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const labelY = this.playerImg ? pos.y + PLAYER_SPRITE_SIZE / 2 + 16 : pos.y;
    ctx.fillText(p.name, pos.x, labelY);
  }

  _drawBall(pos) {
    const ctx = this.ctx;
    if (this.ballImg) {
      const s = BALL_SPRITE_SIZE;
      ctx.drawImage(this.ballImg, pos.x - s / 2, pos.y - s / 2, s, s);
    } else {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 12, 0, Math.PI * 2);
      ctx.fillStyle = "#ffcc00";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#664400";
      ctx.stroke();
    }
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (const p of this.players) {
      this._drawPlayer(p, this.positions[p.num]);
    }

    const ballPos = this.ballAnimPos || this.positions[this.ballHolder];
    this._drawBall(ballPos);
  }
}
