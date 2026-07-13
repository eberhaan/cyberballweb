using UnityEngine;
using System.Collections;
using System;
using Cyberball.Common;

public class Intro : MonoBehaviour {

	public Transform btnPlay;
	public Transform btnConfig;
	public Transform btnQuit;



	// Use this for initialization
	void Start () {

		Invoke ("TweenConfigButton", .15f);
		Invoke ("TweenPlayButton", .3f);
		Invoke ("TweenQuitButton", .45f);

		if (Game.GetScheduleForCondition (1) == null || Game.GetScheduleForCondition (2) == null) {
						Game.SetScheduleForCondition (1, ScheduleTypes.IncludeAll.ToString());
			Game.SetScheduleForCondition (2, ScheduleTypes.OstracizeSubject1.ToString());
				}
	}

	void TweenPlayButton()
	{
		TweenButton (btnPlay);
	}

	void TweenConfigButton()
	{
		TweenButton (btnConfig);
	}

	void TweenQuitButton()
	{
		TweenButton (btnQuit);
	}

	void TweenButton(Transform btn)
	{
		btn.localPositionTo (.75f, new Vector3 (0, btn.transform.position.y, btn.transform.position.z), false).easeType = GoEaseType.BackOut;
	}
	// Update is called once per frame
	void Update () {
	
	}

	void OnQuitClicked()
	{
		Application.Quit ();
	}

	void OnConfigureClicked()
	{
		Application.LoadLevel ("ControlPanel");
	}

	void OnPlayClicked()
	{
		Application.LoadLevel ("Begin Experiment");
	}
}
