import { Config } from "./engine/Config.js";
import { Game } from "./engine/Game.js";
import { Renderer } from "./ui/Renderer.js";
import { Screens } from "./ui/Screens.js";

function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    pid: params.get("pid"), // null, falls nicht übergeben -> wird abgefragt
    condition: params.get("condition"), // null, falls nicht übergeben -> zufällig
  };
}

/** Zufällige 1:1-Zuweisung, falls keine Condition per URL vorgegeben ist. */
function pickRandomCondition() {
  return Math.random() < 0.5 ? "1" : "2";
}

async function main() {
  const screens = new Screens();
  const urlParams = getUrlParams();

  let config;
  try {
    config = await Config.load();
  } catch (err) {
    screens.showError("Konfiguration konnte nicht geladen werden: " + err.message);
    return;
  }

  // Condition: aus URL übernehmen, sonst 1:1 zufällig zuweisen (entspricht
  // ShouldHandleRandomAssignment im Original, falls kein fester Link pro
  // Bedingung verteilt wird).
  const conditionKey = urlParams.condition || pickRandomCondition();
  let cond;
  try {
    cond = config.getCondition(conditionKey);
  } catch (err) {
    screens.showError(err.message + " (URL-Parameter ?condition=1 oder ?condition=2 verwenden)");
    return;
  }
  if (!urlParams.condition) {
    console.log("Keine ?condition= übergeben - zufällig zugewiesen:", conditionKey);
  }

  // Teilnahme-ID: aus URL übernehmen (LimeSurvey kann sie z.B. per
  // Platzhalter in der Embed-URL mitgeben). Falls keine da ist, wird eine
  // anonyme Fallback-ID erzeugt - es gibt keinen Eingabe-Screen mehr, das
  // Spiel startet immer sofort.
  const pid = urlParams.pid || "anon-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  startExperiment(pid, cond, config, screens);
}

function startExperiment(pid, cond, config, screens) {
  // Kein Welcome-Screen mehr - das Spiel startet sofort.
  screens.showPlay(config.shouldShowStats);

  const canvas = document.getElementById("game-canvas");
  const renderer = new Renderer(canvas, config.players, (clickedNum) => {
    game.playerThrow(clickedNum);
  });

  const game = new Game(cond, config.players, config.throwCount, pid, {
    onThrowAnimation: (fromNum, toNum) => renderer.animateThrow(fromNum, toNum, 500),
    onStateChange: (state) => {
      renderer.setBallHolder(state.ballHolder);
      screens.updateStats(state);
    },
    onGameEnd: (log) => {
      // WICHTIG: Es wird bewusst NICHTS heruntergeladen - Testpersonen
      // könnten mit einer CSV-Datei nichts anfangen. Falls ihr die Daten
      // dennoch braucht, sendet diese postMessage an die umgebende Seite
      // (z.B. LimeSurvey), die sie z.B. in ein verstecktes Frage-Feld
      // schreiben könnte - passiert unsichtbar, ohne Download-Dialog.
      try {
        window.parent.postMessage(
          {
            type: "cyberball-finished",
            pid,
            condition: cond.name,
            throwsMade: log.rows.filter((r) => r.includes('"throw"')).length,
          },
          "*"
        );
      } catch (e) {
        /* nicht eingebettet - einfach ignorieren */
      }
      screens.showThankYou({ askForId: false, onSubmitId: () => {} });
    },
  });

  game.runUntilHumanTurnOrEnd();
}

main();
