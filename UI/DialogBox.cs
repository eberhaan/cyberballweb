using UnityEngine;
using System.Collections;

public class DialogBox : MonoBehaviour {

	public Transform dialogContent;
	private GameObject callbackGO;

	private tk2dTextMesh lblMessage;

	// Use this for initialization
	void Start () {
		lblMessage = transform.Find ("DialogBG/TextMesh0").GetComponent<tk2dTextMesh> ();
	}
	
	// Update is called once per frame
	void Update () {
	
	}

	void ShowWithCallback(GameObject callbackObject=null)
	{
		if (callbackObject != null)
						this.callbackGO = callbackObject;
		dialogContent.transform.scaleTo (.25f, Vector3.one).easeType = GoEaseType.BackOut;
	}

	void Show()
	{
		dialogContent.transform.scaleTo (.25f, Vector3.one).easeType = GoEaseType.BackOut;
	}

	void DialogOK()
	{
		dialogContent.transform.scaleTo (.2f, new Vector3(.1f,.1f,1)).easeType = GoEaseType.BackIn;
		Invoke ("CloseFading", 0.25f);
	}
	void CloseFading()
	{
		if(callbackGO!=null)
		callbackGO.SendMessage ("OnDialogOK", SendMessageOptions.DontRequireReceiver);
		this.gameObject.SetActive (false);
	}

	IEnumerator SetMessage(string message)
	{
		yield return new WaitForSeconds (.1f);
		lblMessage.maxChars = message.Length;
		lblMessage.text = message;
		lblMessage.Commit ();
	}
}
