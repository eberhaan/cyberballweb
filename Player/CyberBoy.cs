using UnityEngine;
using System.Collections;
using Cyberball.Common;
using System.Linq;

public class CyberBoy : MonoBehaviour
{

	public Transform prefabPic;
	private Play gamePlay;
	private tk2dSpriteAnimator anim;
	public bool dontTurn;
	private Transform chatBubble;
	private tk2dTextMesh lblChatMessage;
	private Transform chatWindow;
	public tk2dButton sendChatButton;
	public tk2dUITextInput txtChatMsg;
	public tk2dTextMesh lblName;
	private Transform picBox;
	public bool isAtTopEdge;
	private bool isChatShowing;
	// Use this for initialization

	private float boyScale = 1;
	private float leftScale;
	private float rightScale;

    private Transform ball;

    public void ThrowTrigger(tk2dSpriteAnimationClip clip, int currentFrame)
    {
        if (clip.frames[currentFrame].eventInfo == "throw")
        {
            Debug.Log("EvtInt: " + clip.frames[currentFrame].eventInt);
            if (clip.frames[currentFrame].eventInt < 4)
            {
                ball.gameObject.SetActive(true);
                ball.localPosition = ball_posi_throw[clip.frames[currentFrame].eventInt - 1];
            }
            else
            {
                ball.gameObject.SetActive(!true);
            }
        }
    }

    void Start ()
	{
	    ball = transform.Find("Ball");
		boyScale =Mathf.Abs( transform.localScale.x);

		leftScale = -boyScale;
		rightScale = boyScale;

		picBox = transform.Find ("pic");
		picBox.transform.localPosition = new Vector3 (0,-.5f,picBox.transform.localPosition.z);
		chatBubble = transform.Find ("chatContainer");
		lblChatMessage = chatBubble.Find ("chatBalloon/lblChatMessage").GetComponent<tk2dTextMesh> ();
	    lblChatMessage.wordWrapWidth = 260;
        lblChatMessage.Commit();
		UpdateChatTextRotation ();

		gamePlay = GameObject.FindObjectOfType<Play> ();
		anim = GetComponent<tk2dSpriteAnimator> ();
        
	    

		GetComponent<tk2dSprite> ().color = Game.GetPlayerColor (int.Parse (name.Substring (name.Length - 1)));

		chatWindow = GameObject.Find ("ChatWindow").transform;

		if (name.Contains ("p2")) {
			sendChatButton.targetObject = gameObject;







		} else if (name.Contains ("p1")) {
			//Invoke("SayHey",Random.Range(1f,5f));		
		}
		if (Game.currConf.IsChatEnabled) { //Show chat window if (chat is enabled OR schedule has custom messages)
			ShowChatWindow ();
			isChatShowing = true;
		} else {
			if (
				!Game.currConf.CurrentCondition.ScheduleType.HasValue 
				&& 
				Game.currConf.CurrentCondition.CustomSchedule.throws.Where (t => t.isChatMessage).Count () != 0
				) {
				ShowChatWindow ();
				isChatShowing = true;
				Game.currConf.IsChatEnabled = true;
			}
		}
		AdjustPlayerPositions ();

		lblName.text = Game.GetName (int.Parse (name.Substring (name.Length - 1)));
		lblName.Commit ();

		GetComponent<tk2dButton> ().enabled = !Game.currConf.CurrentCondition.ShouldSpectate;
		if (Game.currConf.ShouldShowPictures)
			StartCoroutine ("LoadProfilePic", Game.GetPlayerPicPath (int.Parse (name.Substring (name.Length - 1))) + string.Empty);
		else {
			Destroy(picBox.gameObject);
		}
		chatBubble.parent = null; // So that the chat bubbles do not turn when the player does

        if (name.Contains("p1"))
        {
            CatchIt();
        }
	}

	void AdjustPlayerPositions ()
	{
		Debug.Log (name + " - " + name.Contains ("p3")+ " - " + name.Contains ("6pl"));
		//Move players if both chat and pics are enabled
		if(isChatShowing && Game.currConf.ShouldShowPictures)
		{
			if(name.Contains ("p2") && name.Contains ("3pl"))
			{
				transform.localPosition = new Vector3(transform.localPosition.x,.923f,transform.localPosition.z);
			}
			if(name.Contains ("p2") && name.Contains ("4pl"))
			{
				transform.localPosition = new Vector3(transform.localPosition.x,.86f,transform.localPosition.z);
			}
			if(name.Contains ("p2") && name.Contains ("5pl"))
			{
				transform.localPosition = new Vector3(transform.localPosition.x,.923f,transform.localPosition.z);
			}
			if(name.Contains ("p2") && name.Contains ("6pl"))
			{
				transform.localPosition = new Vector3(transform.localPosition.x,.86f,transform.localPosition.z);
			}
			if(name.Contains ("p3") && name.Contains ("6pl"))
			{

				transform.localPosition = new Vector3(transform.localPosition.x,.86f,transform.localPosition.z);

			}
			if((name.Contains ("p1")||name.Contains ("p2")||name.Contains ("p3")) && name.Contains ("7pl"))
			{
				transform.localPosition = new Vector3(transform.localPosition.x,.86f,transform.localPosition.z);
			}
			if((name.Contains ("p2")||name.Contains ("p3")) && name.Contains ("8pl"))
			{
				transform.localPosition = new Vector3(transform.localPosition.x,.79f,transform.localPosition.z);
			}
			if((name.Contains ("p2")) && name.Contains ("9pl"))
			{
				transform.localPosition = new Vector3(transform.localPosition.x,.79f,transform.localPosition.z);
			}
			if((name.Contains ("p1")||name.Contains ("p3")) && name.Contains ("9pl"))
			{
				transform.localPosition = new Vector3(transform.localPosition.x,.835f,transform.localPosition.z);
			}
		}
	}

	IEnumerator LoadProfilePic (string picPath)
	{
		picBox.transform.parent = null;
		var picHolder = picBox.Find ("picHolder/pic");
		if (!string.IsNullOrEmpty (picPath)) {
			WWW f = new WWW ("file://" + picPath);
			yield return f;
			if (string.IsNullOrEmpty (f.error) && f.texture != null) {
				//f.texture.Compress(false);
				picHolder.GetComponent<Renderer>().material.mainTexture = f.texture;
				//picBox.gameObject.SetActive (true);
			} else {
				//picBox.gameObject.SetActive (!true);
				yield return false;
			}
		} else {
			//picBox.gameObject.SetActive (!true);
			yield return false;
		}
	}

	// Update is called once per frame
	void Update ()
	{
		if (name.Contains ("p2"))
		if (Input.GetKeyUp (KeyCode.Return))
			SendChat ();
	}

	void SendChat ()
	{
		gamePlay.SendMessage ("LogChat", txtChatMsg.Text);
		Say (new CBMessage{ message = txtChatMsg.Text, duration = 2});
		//HideChatWindow ();
	}

	void SayHey ()
	{
		if (Game.currConf.IsChatEnabled)
			Say (new CBMessage{ message="Hey!", duration=2});
	}

	void OnMeClicked ()
	{
		if (!name.Contains ("p2"))
			gamePlay.SendMessage ("PlayerClicked", this);
		else {
			if (Game.currConf.IsChatEnabled)
				ShowChatWindow ();
		}
	}

	void ShowChatWindow ()
	{
		chatWindow.transform.localPositionTo (.5f, new Vector3 (chatWindow.transform.localPosition.x, .25f, -5));
	}

	void HideChatWindow ()
	{
		chatWindow.transform.localPositionTo (.25f, new Vector3 (chatWindow.transform.localPosition.x, -.25f, -5));
		txtChatMsg.Text = string.Empty;
	}

	IEnumerator BackToIdle ()
	{
		yield return new WaitForSeconds (.75f);
		ball.gameObject.SetActive(false);
	    ball.localPosition = ball_posi_catch;
        anim.Play ("idle");
	}

	void LookRight ()
	{
		if (dontTurn)
			return;
		transform.localScale = new Vector3 (rightScale, rightScale, 1);
		UpdateChatTextRotation ();
	}

	void LookLeft ()
	{
		if (dontTurn)
			return;
		transform.localScale = new Vector3 (leftScale, rightScale, 1);
		UpdateChatTextRotation ();
	}

	void LookToBallHolder (CyberBoy ballHolder)
	{
		if (ballHolder.name != this.name) {
			if (ballHolder.transform.position.x > this.transform.position.x)
				LookRight ();
			else
				LookLeft ();
		}
	}

	void CatchIt ()
	{
		anim.Play ("catch");
	    ball.transform.localPosition = ball_posi_catch;
        ball.gameObject.SetActive(true);
	}

	void Say (CBMessage msg)
	{
		if (string.IsNullOrEmpty (msg.message) || !Game.currConf.IsChatEnabled)
			return;

		CancelInvoke ("HideSpeech");
		lblChatMessage.text = msg.message;
		lblChatMessage.Commit ();

		var scaleFactor = 1f;
		if (lblChatMessage.text.Length > 15)
			scaleFactor = ((144f - lblChatMessage.text.Length) / (144f - 16f)) * .5f + .35f;

		lblChatMessage.scale = new Vector3 (scaleFactor, scaleFactor, 1);



		chatBubble.scaleTo (0.25f, chatBubble.GetComponent<ChatContainer>().finalScale * (isChatShowing?0.845f:1)).easeType = GoEaseType.CircOut;

		if (msg.duration <= 0)
			Invoke ("HideSpeech", 2);
		else
			Invoke ("HideSpeech", (float)msg.duration);
	}

	void UpdateChatTextRotation ()
	{
		//return;
		if (transform.localScale.x <0) {
			//lblChatMessage.transform.rotation = Quaternion.Euler (0, 180, 0);
			lblName.scale = new Vector3 (-1, 1, 1);
		} else {
			//lblChatMessage.transform.rotation = Quaternion.Euler (0, 0, 0);
			lblName.scale = new Vector3 (1, 1, 1);
		}
	}
    private Vector3 ball_posi_catch = new Vector3(0.1643599f, 0.08499002f,-1);

    private Vector3[] ball_posi_throw ={ new Vector3  (-0.147f, 0.147f,-1), new Vector3  (-0.138f, 0.105f, -1),
        new Vector3  (0.0454f, 0.1597f, -1) };

    
    void HideSpeech()
	{
		chatBubble.scaleTo (0.25f, Vector3.zero).easeType = GoEaseType.CircIn;
	}

     void HideBall()
    {
       ball.gameObject.SetActive(false); 
    }

    void ThrowPosiBall()
    {
        ball.gameObject.SetActive(true);
        ball.localPosition = ball_posi_throw[0];
    }
}
