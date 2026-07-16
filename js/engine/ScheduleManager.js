// Direkte Portierung der Wurf-Auswahl-Logik aus Play.cs (GetNextTarget/StartGame),
// beschränkt auf den Custom-Schedule-Pfad (Game.CustomSchedIndex > 0), da eure
// Config ausschließlich CustomSchedule nutzt, keine eingebauten Schedules.
//
// Hinweis zu "any": Im Original-C#-Code (Regex.Match(ThrowTo, @"\d+")) hätte
// ThrowTo="Any" zu einem Absturz geführt (int.Parse("") wirft eine Exception).
// Das war im Original vermutlich nie in Benutzung/getestet. Hier wird "any"
// sinnvoll interpretiert als "zufälliger Spieler außer dem aktuellen Ballhalter" -
// analog zum Verhalten, das der Code nutzt, wenn der Schedule leer ist.
export class ScheduleManager {
  constructor(throws, playerNumbers) {
    // Kopie der Konfiguration, damit wir das Original nicht mutieren
    this.queue = throws.map((t) => ({ ...t }));
    this.playerNumbers = playerNumbers; // z.B. [1,2,3]
  }

  get remaining() {
    return this.queue.length;
  }

  randomOtherPlayer(excludeNum) {
    const options = this.playerNumbers.filter((n) => n !== excludeNum);
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Ermittelt den nächsten Ballempfänger.
   * @param {number} currentHolderNum aktueller Ballhalter
   * @returns {{ nextPlayer: number, delay: number }}
   */
  getNext(currentHolderNum) {
    if (this.queue.length === 0) {
      // Schedule erschöpft -> zufälligen anderen Spieler wählen
      return { nextPlayer: this.randomOtherPlayer(currentHolderNum), delay: 2 };
    }

    const nextThrow = this.queue.shift();
    const delay = nextThrow.delay;

    let nextPlayerNum;
    if (nextThrow.to === "any") {
      nextPlayerNum = this.randomOtherPlayer(currentHolderNum);
    } else {
      nextPlayerNum = nextThrow.to;
    }

    // Fallback, falls der Schedule (fehlerhaft) den aktuellen Ballhalter
    // erneut als Ziel nennt: nächsten Eintrag nehmen bzw. zufällig wählen
    // (entspricht dem "else"-Zweig in Play.cs GetNextTarget).
    if (nextPlayerNum === currentHolderNum) {
      if (this.queue.length === 0) {
        nextPlayerNum = this.randomOtherPlayer(currentHolderNum);
      } else {
        const followUp = this.queue.shift();
        nextPlayerNum = followUp.to === "any"
          ? this.randomOtherPlayer(currentHolderNum)
          : followUp.to;
      }
    }

    return { nextPlayer: nextPlayerNum, delay };
  }
}
