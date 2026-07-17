// Kümmert sich nur ums Ein-/Ausblenden der drei Screens und ums Befüllen
// ihrer Inhalte - kennt weder Config noch Game-Logik direkt.
export class Screens {
  constructor() {
    this.idEntry = document.getElementById("screen-id-entry");
    this.welcome = document.getElementById("screen-welcome");
    this.play = document.getElementById("screen-play");
    this.thankyou = document.getElementById("screen-thankyou");
    this.error = document.getElementById("screen-error");

    this.pidInput = document.getElementById("pid-input");
    this.pidSubmitBtn = document.getElementById("btn-pid-submit");

    this.welcomeText = document.getElementById("welcome-text");
    this.playBtn = document.getElementById("btn-play");

    this.statsBox = document.getElementById("stats-box");
    this.lblThrowsMade = document.getElementById("lbl-throws-made");
    this.lblThrowsTaken = document.getElementById("lbl-throws-taken");
    this.lblTotalThrows = document.getElementById("lbl-total-throws");

    this.idBox = document.getElementById("id-box");
    this.idInput = document.getElementById("id-input");
    this.idSubmitBtn = document.getElementById("btn-id-submit");
    this.thankyouMsg = document.getElementById("thankyou-msg");

    this.errorMsg = document.getElementById("error-msg");

    this._all = [this.idEntry, this.welcome, this.play, this.thankyou, this.error];
  }

  _showOnly(el) {
    for (const s of this._all) s.classList.toggle("hidden", s !== el);
  }

  /** Zeigt die Teilnahme-ID-Abfrage, falls keine ID per URL (?pid=...) übergeben wurde. */
  showIdEntry(onSubmit) {
    const submit = () => {
      const val = this.pidInput.value.trim();
      if (val.length === 0) {
        this.pidInput.focus();
        return;
      }
      onSubmit(val);
    };
    this.pidSubmitBtn.onclick = submit;
    this.pidInput.onkeydown = (e) => {
      if (e.key === "Enter") submit();
    };
    this._showOnly(this.idEntry);
    this.pidInput.focus();
  }

  showWelcome(text, onPlay) {
    this.welcomeText.textContent = text;
    this.playBtn.onclick = onPlay;
    this._showOnly(this.welcome);
  }

  showPlay(showStats) {
    this.statsBox.classList.toggle("hidden", !showStats);
    this._showOnly(this.play);
  }

  updateStats({ throwsMade, throwsTaken, totalThrows }) {
    this.lblThrowsMade.textContent = `Throws made: ${String(throwsMade).padStart(2, "0")}`;
    this.lblThrowsTaken.textContent = `Throws taken: ${String(throwsTaken).padStart(2, "0")}`;
    this.lblTotalThrows.textContent = `Total Throws: ${String(totalThrows).padStart(2, "0")}`;
  }

  showThankYou({ askForId, onSubmitId }) {
    this.idBox.classList.toggle("hidden", !askForId);
    this.thankyouMsg.classList.toggle("hidden", askForId);
    this.idSubmitBtn.onclick = () => onSubmitId(this.idInput.value);
    this._showOnly(this.thankyou);
  }

  showError(message) {
    this.errorMsg.textContent = message;
    this._showOnly(this.error);
  }
}
