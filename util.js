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

function GetHtmlVaccineInfo()//vaccine info in table cell
{
	let htmlStr = "<div class=\"tableVaccineInfoRoot ##VAC_root_class##\" style=\"##VAC_root_style##\">\n  \n  <div class=\"tableVaccineInfoParent\" style=\"##VAC_45_p_display##\">\n  \t<div class=\"vaccineInfoAgeText\"><p>45+</p></div>\n    \t<div class=\"doseBox\" style=\"##VAC_45_p_d1_display##\">##VAC_45_p_d1##</div>\n        <div class=\"vaccineInfoDivider\" style=\"##VAC_45_p_divider_v_display##\"></div>\n        <div class=\"doseBox\" style=\"##VAC_45_p_d2_display##\">##VAC_45_p_d2##</div>\n  </div>\n  \n  <div class=\"vaccineInfoDividerH_parent\" style=\"##VAC_divider_h_p_display##\">\n  \t<div class=\"vaccineInfoDivider_gapfiller\"></div>\n  \t<div class=\"vaccineInfoDividerH\" style=\"##VAC_divider_h_d1_display##\"></div>\n  \t<div class=\"vaccineInfoDividerH\" style=\"##VAC_divider_h_d2_display##\"></div>\n  </div>\n  \n  <div class=\"tableVaccineInfoParent\" style=\"##VAC_18_45_p_display##\">\n  \t<div class=\"vaccineInfoAgeText\"><p>18-45</p></div>\n    <div class=\"doseBox\" style=\"##VAC_18_45_d1_display##\">##VAC_18_45_d1##</div>\n    \t<div class=\"vaccineInfoDivider\" style=\"##VAC_18_45_divider_v_display##\"></div>\n       <div class=\"doseBox\" style=\"##VAC_18_45_d2_display##\">##VAC_18_45_d2##</div>\n  </div>\n  \n  \n  <div class=\"vaccineInfoTitle ##VAC_TITLE_CLASS##\">##VAC_TITLE_TEXT##</div>\n\n</div>";
	return htmlStr;
}

function GetHtmlVaccineInfoNoVaccine() {//for cells with empty slots
	let htmlStr = "<div data-type=\"noVaccineCell\" class=\"tableVaccineInfoRoot\" style=\"border-color: hsl(336deg 90% 70%);border-style: dashed;background: hsl(336deg 90% 85%);font-size: xx-large;display: flex; padding:5px align-content: center;justify-content: center;align-items: center;font-weight: bold;/* -webkit-text-stroke: 0.5px hsl(336deg 90% 70%); */color: white;/* text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black; */\">NA</div>";
	return htmlStr;
}