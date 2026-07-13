using UnityEngine;
using System.Collections;
using System.IO;

public class WelcomeScreen : MonoBehaviour {

	public DialogBox dialog;
	public tk2dTextMesh lblWelcomeMessage;

	public tk2dTextMesh lblVersionNum;
	// Use this for initialization
	void Start () {
		lblVersionNum.text = "v" + Game.VERSION;

		lblVersionNum.Commit ();

		//if(!string.IsNullOrEmpty(
		//QualtricsResponseID = System.Environment.CommandLine.Substring (System.Environment.CommandLine.IndexOf("ResponseID=") ).Trim().Replace("ResponseID=",string.Empty);

		//lblWelcomeMessage.text = Game.WelcomeMessage;
		//lblWelcomeMessage.Commit ();
		if (Game.currConf.CurrentCondition == null) {
			Debug.LogError(Game.currConf.CurrentConditionName + " is not defined in the config");
			dialog.gameObject.SetActive(true);
			dialog.SendMessage("ShowWithCallback",this.gameObject);
			dialog.SendMessage("SetMessage",Game.currConf.CurrentConditionName + " is not defined in the config");
			return;
		}

		if (!string.IsNullOrEmpty (Game.currConf.CurrentCondition.WelcomeFilePath)) {
			
			StartCoroutine("LoadWelcomeText");
		}
		Game.ParseCustomSchedulesXML ();

	}
	IEnumerator LoadWelcomeText()
	{
		WWW f = new WWW ("file://" + Game.currConf.CurrentCondition.WelcomeFilePath);
				yield return f;
			
				if (string.IsNullOrEmpty (f.error) && f.text != null) {
						lblWelcomeMessage.text = f.text;
						lblWelcomeMessage.Commit ();
				}
		}

	// Update is called once per frame
	void OnPlayClicked () {
		Application.LoadLevel ("Connecting");
	}

	void OnGUI()
	{
		//GUILayout.Label ("Participant ID: " + Game.ParticipantID);
		//GUILayout.Label ("Current Condition: " + Game.gameConf.currentConditionName);
	}

	void OnDialogOK()
	{
		Application.Quit ();
	}
}
