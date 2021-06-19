g_util_handle_idlejs = null;

function PlayAudio() {
	g_handle_audio_alarm.loop = true;
	g_handle_audio_alarm.play();
}

function PauseAudio() {
	g_handle_audio_alarm.pause();
}

function UtilInit() {
	/*sample - https://github.com/rchasman/Idle.js/blob/master/example/index.htm*/
	// eslint-disable-next-line no-undef
	g_util_handle_idlejs = new Idle({
		//onHidden: onHiddenCallback,
		//onVisible: onVisibleCallback,
		onAway: OnUserIdle,
		onAwayBack: OnIdleEnd,
		awayTimeout: 5000 //away with 5 seconds of inactivity
	}).start();
}

function OnUserIdle()
{

}

function OnIdleEnd()
{
	PauseAudio();//say user has left the code to auto refresh/book, and we start sounding alarm. Stop sound when user is back.
}