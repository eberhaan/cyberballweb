// Lädt die experiment.json und stellt die aktuell gültige Bedingung
// (basierend auf dem URL-Parameter ?condition=1|2) bereit.
export class Config {
  static async load(path = "config/experiment.json") {
    const res = await fetch(path);
    if (!res.ok) {
      throw new Error("Konnte Konfiguration nicht laden: " + res.status);
    }
    const data = await res.json();
    return new Config(data);
  }

  constructor(data) {
    this.raw = data;
    this.gameMode = data.gameMode;
    this.throwCount = data.throwCount;
    this.askIdOnGameEnd = data.askIdOnGameEnd;
    this.shouldShowStats = data.shouldShowStats;
    this.players = data.players;
  }

  /** Liefert die Bedingung für einen gegebenen Condition-Key ("1" oder "2"). */
  getCondition(conditionKey) {
    const cond = this.raw.conditions[String(conditionKey)];
    if (!cond) {
      throw new Error("Unbekannte Condition: " + conditionKey);
    }
    return cond;
  }

  getPlayer(num) {
    return this.players.find((p) => p.num === num);
  }

  getHumanPlayer() {
    return this.players.find((p) => p.isHuman);
  }
}
