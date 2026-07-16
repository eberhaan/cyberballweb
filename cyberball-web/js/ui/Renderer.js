// Zeichnet die Spieler (als Kreise, im Dreieck angeordnet) und den Ball auf
// einem <canvas>. Bewusst simpel gehalten (keine Sprite-Animationen wie im
// tk2d-Original) - für ein Ostracism-Paradigma reicht diese Darstellung,
// lässt sich aber leicht durch echte Bilder (assets/players/*.png) ersetzen.
export class Renderer {
  constructor(canvas, players, onPlayerClick) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.players = players;
    this.positions = this._computePositions(players.length);
    this.ballHolder = players[0].num;
    this.ballAnimPos = null; // {x,y} während einer Wurfanimation

    canvas.addEventListener("click", (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const clicked = this._hitTest(x, y);
      if (clicked) onPlayerClick(clicked.num);
    });

    this.draw();
  }

  _computePositions(n) {
    // Anordnung im Kreis, unabhängig von Spieleranzahl
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    const r = Math.min(cx, cy) * 0.65;
    const positions = {};
    for (let i = 0; i < n; i++) {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      positions[this.players[i].num] = {
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
      };
    }
    return positions;
  }

  _hitTest(x, y) {
    for (const p of this.players) {
      const pos = this.positions[p.num];
      const d = Math.hypot(x - pos.x, y - pos.y);
      if (d <= 40) return p;
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
    return new Promise((resolve) => {
      const from = this.positions[fromNum];
      const to = this.positions[toNum];
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

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (const p of this.players) {
      const pos = this.positions[p.num];
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 36, 0, Math.PI * 2);
      ctx.fillStyle = p.isHuman ? "#4a7dfc" : "#888";
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#222";
      ctx.stroke();

      ctx.fillStyle = "#fff";
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(p.name, pos.x, pos.y);
    }

    // Ball
    const ballPos = this.ballAnimPos || this.positions[this.ballHolder];
    ctx.beginPath();
    ctx.arc(ballPos.x, ballPos.y, 12, 0, Math.PI * 2);
    ctx.fillStyle = "#ffcc00";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#664400";
    ctx.stroke();
  }
}
