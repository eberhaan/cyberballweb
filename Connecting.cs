using UnityEngine;

public class Connecting : MonoBehaviour
{

    public Transform connectingBall;
    public tk2dTextMesh lblVersionNum;

    public tk2dTextMesh lblConnecting;

    // Use this for initialization
    void Start()
    {
        if (Game.currConf != null
            &&
            Game.currConf.CurrentCondition != null
            &&
            !string.IsNullOrEmpty(Game.currConf.CurrentCondition.CustomConnectingMessage))
        {
            lblConnecting.text = Game.currConf.CurrentCondition.CustomConnectingMessage;
            lblConnecting.Commit();
        }

        lblVersionNum.text = "v" + Game.VERSION;
        lblVersionNum.Commit();
        Invoke("Connected", Random.Range(3.5f, 7.5f));
        //connectingBall.positionTo (2, new Vector3 (.725f, 0, 0));
        var twConfig = new GoTweenConfig
        {
            loopType = GoLoopType.PingPong,
            iterations = -1
        };
        twConfig.position(new Vector3(.725f, 0, 0));
        Go.to(connectingBall, 2, twConfig);
    }


    void Connected()
    {
        Application.LoadLevel("Play");
    }
}
