using UnityEngine;
using System.Collections;
using System.IO;

public class ParticipantIdScreen : MonoBehaviour {

	public DialogBox dialog;
	public tk2dUITextInput txtParticipantId;
	public tk2dUITextInput txtCondition;

	public tk2dTextMesh lblVersionNum;
	// Use this for initialization
	void Start () {
		lblVersionNum.text = "v" + Game.VERSION;
		lblVersionNum.Commit ();
	}
	

	void OnNextClicked () {
		Game.ParticipantID = txtParticipantId.Text;
		Game.currConf.CurrentConditionName = "Condition " + txtCondition.Text;
		if (Game.currConf.CurrentCondition == null) {
			Debug.LogError(Game.currConf.CurrentConditionName + " is not defined in the config");
			
			dialog.gameObject.SetActive(true);
			dialog.SendMessage("ShowWithCallback",this.gameObject);
			dialog.SendMessage("SetMessage",Game.currConf.CurrentConditionName + " is not defined in the config");
			return;
		}

		//Game.FileToPrefs ();

		Application.LoadLevel ("Welcome Screen");
	}

    void OnGUI()
    {
        //GUILayout.Label(Game.currConf.RunMode.ToString());
    }
}
