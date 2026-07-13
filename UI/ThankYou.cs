using UnityEngine;
using System.Collections;
using System.IO;
using System;

public class ThankYou : MonoBehaviour {

	public Transform askForId;

	public tk2dUITextInput txtID;

	public Transform dialogBox;

	public Transform conditionDialog;

	public tk2dTextMesh lblThanksMsg;
	public tk2dTextMesh lblVersionNum;

    Uri url;
    public Transform btnURL;
    // Use this for initialization
    void Start () {
		lblVersionNum.text = "v" + Game.VERSION;
		lblVersionNum.Commit ();
		if (!string.IsNullOrEmpty (Game.currConf.CurrentCondition.ThankYouFilePath)) {
			
			StartCoroutine("LoadThankYouText");
		}
		askForId.gameObject.SetActive (Game.currConf.AskIDOnGameEnd);
		if (!Game.currConf.AskIDOnGameEnd) {
			SaveLog();
		}

        if(!string.IsNullOrEmpty(Game.currConf.CurrentCondition.PostExptURL))
        {
           
            if (Uri.TryCreate(Game.currConf.CurrentCondition.PostExptURL, UriKind.Absolute,out url))//only show button if URL is valid
                {
                btnURL.gameObject.SetActive(true);
            }
        }
	}
	
	// Update is called once per frame
	void Update () {
	
	}

	void Retry()
	{
		conditionDialog.gameObject.SetActive (true);
		conditionDialog.SendMessage ("SetMessage",string.Format("This participant was assigned to\nCondition {0}",Game.currConf.CurrentConditionName));
		conditionDialog.SendMessage ("ShowWithCallback",this.gameObject);
	}
	void SaveLog()
	{
		File.AppendAllText(Game.currConf.LogFilePath,Play.log.ToString());
		dialogBox.gameObject.SetActive (true);
		dialogBox.SendMessage ("Show");
	}
     
	void OnSubmitClicked()
	{
		Play.log.AppendFormat ("\"{0}\",\"{1}\",\"{2}\",\"{3}\"\n", Game.ParticipantID, DateTime.Now.ToString (), "ID", txtID.Text + string.Empty);
		SaveLog ();
	}

	void OnDialogOK()
	{
		Application.LoadLevel ("Welcome Screen");
	}

	IEnumerator LoadThankYouText()
	{
		WWW f = new WWW ("file://" + Game.currConf.CurrentCondition.ThankYouFilePath);
		yield return f;
		
		if (string.IsNullOrEmpty (f.error) && f.text != null) {
			lblThanksMsg.text = f.text;
			lblThanksMsg.Commit ();
		}
	}

    void OnURLClicked()
    {
        Application.OpenURL(url.ToString());
    }
}
