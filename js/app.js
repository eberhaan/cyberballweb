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

function downloadCsv(filename, csvContent) {
  const header = '"ParticipantID","Timestamp","Event","Detail"\n';
  const blob = new Blob([header + csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
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

  // Teilnahme-ID: aus URL übernehmen, sonst abfragen (entspricht der
  // "Participant Id"-Scene im Original bei RunMode=Standalone).
  if (urlParams.pid) {
    startExperiment(urlParams.pid, cond, config, screens);
  } else {
    screens.showIdEntry((pid) => startExperiment(pid, cond, config, screens));
  }
}

function startExperiment(pid, cond, config, screens) {
  let finalLog = null;

  function triggerDownload() {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    downloadCsv(`cyberball_${pid}_${stamp}.csv`, finalLog.toCsv());
  }

  // Kein Welcome-Screen mehr - das Spiel startet sofort.
  screens.showPlay(config.shouldShowStats);

  const canvas = document.getElementById("game-canvas");
  const renderer = new Renderer(canvas, config.players, (clickedNum) => {
    game.playerThrow(clickedNum);
  });

  const game = new Game(cond, config.players, config.throwCount, pid, {
    onThrowAnimation: (fromNum, toNum) => renderer.animateThrow(fromNum, toNum, 1000),
    onStateChange: (state) => {
      renderer.setBallHolder(state.ballHolder);
      screens.updateStats(state);
    },
    onGameEnd: (log) => {
      finalLog = log;
      // Entspricht dem Original: ohne ID-Abfrage am Ende wird der Log
      // automatisch "gespeichert" (hier: automatischer CSV-Download im
      // Hintergrund, ohne dass die Testperson etwas klicken muss).
      if (!config.askIdOnGameEnd) {
        triggerDownload();
      }
      screens.showThankYou({
        askForId: config.askIdOnGameEnd,
        onSubmitId: (idValue) => {
          finalLog.add(pid, new Date().toString(), "ID", idValue);
          triggerDownload();
        },
      });
    },
  });

  game.runUntilHumanTurnOrEnd();
}

main();
