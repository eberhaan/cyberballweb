import { ScheduleManager } from "./ScheduleManager.js";

// Ereignis-Log im selben CSV-Format wie das Original (Play.log / ThankYou.SaveLog)
class GameLog {
  constructor(participantId) {
    this.participantId = participantId;
    this.rows = [];
  }
  add(...fields) {
    const quoted = fields.map((f) => `"${String(f).replace(/"/g, '""')}"`);
    this.rows.push(quoted.join(","));
  }
  logGameStart(conditionName) {
    this.add(this.participantId, new Date().toString(), "game-start", "Condition " + conditionName);
  }
  logOwnThrow(toPlayerNum) {
    this.add(this.participantId, new Date().toString(), "throw", "player-" + toPlayerNum);
  }
  logCatch(caughtFromNum) {
    this.add(this.participantId, new Date().toString(), "catch", "player-" + caughtFromNum);
  }
  logNpcThrow(fromNum, toNum) {
    this.add(this.participantId, new Date().toString(), "npc-throw", `player${fromNum}-player${toNum}`);
  }
  toCsv() {
    return this.rows.join("\n");
  }
}

/**
 * Game orchestriert den Spielablauf. Die eigentliche Animation (Ballwurf)
 * delegiert sie über Callbacks an den Renderer, damit Logik und Darstellung
 * sauber getrennt bleiben (wie in Unity: Play.cs = Logik, tk2d = Darstellung).
 */
export class Game {
  /**
   * @param {object} condition  Bedingung aus der Config (throws, welcomeText, ...)
   * @param {object[]} players  [{num, name, isHuman}, ...]
   * @param {number} throwCount Gesamtzahl der Würfe bis Spielende
   * @param {string} participantId
   * @param {object} callbacks  { onThrowAnimation(fromNum, toNum) -> Promise, onStateChange(state), onGameEnd(log) }
   */
  constructor(condition, players, throwCount, participantId, callbacks) {
    this.players = players;
    this.playerNumbers = players.map((p) => p.num);
    this.throwCount = throwCount;
    this.callbacks = callbacks;
    this.log = new GameLog(participantId);
    this.schedule = new ScheduleManager(condition.throws, this.playerNumbers);

    this.ballHolder = this.playerNumbers[0]; // Ball startet bei Spieler 1, wie im Original
    this.throwsMadeCount = 0; // Würfe, die die Testperson selbst gemacht hat
    this.throwsTakenCount = 0; // Würfe, die die Testperson empfangen hat
    this.totalThrows = 0;
    this.isThrowing = false;
    this.ended = false;

    this.log.logGameStart(condition.name);
  }

  humanPlayerNum() {
    return this.players.find((p) => p.isHuman).num;
  }

  /** Startet die (ggf. automatische) Wurfsequenz. Pausiert, sobald die
   *  Testperson selbst den Ball hält (dann wartet das Spiel auf einen Klick). */
  async runUntilHumanTurnOrEnd() {
    while (!this.ended) {
      if (this.ballHolder === this.humanPlayerNum()) {
        this.callbacks.onStateChange(this._state());
        return; // wartet auf playerThrow() durch Klick
      }
      const { nextPlayer, delay } = this.schedule.getNext(this.ballHolder);
      await this._wait(delay * 1000);
      await this._executeThrow(this.ballHolder, nextPlayer);
      if (this.ended) return;
    }
  }

  /** Wird vom UI aufgerufen, wenn die Testperson einen Mitspieler anklickt. */
  async playerThrow(targetNum) {
    if (this.isThrowing || this.ballHolder !== this.humanPlayerNum()) return;
    if (targetNum === this.ballHolder) return;
    const fromNum = this.ballHolder;
    await this._executeThrow(fromNum, targetNum);
    this.log.logOwnThrow(targetNum);
    if (!this.ended) {
      await this.runUntilHumanTurnOrEnd();
    }
  }

  async _executeThrow(fromNum, toNum) {
    this.isThrowing = true;
    await this.callbacks.onThrowAnimation(fromNum, toNum); // ~1s Wurfanimation, wie im Original
    this.isThrowing = false;

    this.ballHolder = toNum;
    this.totalThrows++;

    const human = this.humanPlayerNum();
    if (toNum === human) {
      this.throwsTakenCount++;
      this.log.logCatch(fromNum);
    }
    if (fromNum !== human && toNum !== human) {
      this.log.logNpcThrow(fromNum, toNum);
    }
    if (fromNum === human) {
      this.throwsMadeCount++;
    }

    this.callbacks.onStateChange(this._state());

    if (this.totalThrows >= this.throwCount) {
      this.ended = true;
      this.callbacks.onGameEnd(this.log);
    }
  }

  _state() {
    return {
      ballHolder: this.ballHolder,
      throwsMade: this.throwsMadeCount,
      throwsTaken: this.throwsTakenCount,
      totalThrows: this.totalThrows,
    };
  }

  _wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
