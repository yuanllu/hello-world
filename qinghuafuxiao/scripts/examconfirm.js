/// <reference path="common/jquery-1.4.1.js" />
/// <reference path="common/Comm.js" />
/// <reference path="common/Models.js" />
/*
* @author: shuhu
* @date: 2013/11/22
* @description: 听力考试准备
*/

var ExamConfirm = new ExamPageUtil();

function setbtn_style() {
	if ($("#btn_abnormal").attr("disabled") == true) {
		$("#btn_abnormal").removeClass("btn_orange");
		$("#btn_abnormal").addClass("btn_orangeDisable");
	} else {
		$("#btn_abnormal").addClass("btn_orange");
		$("#btn_abnormal").removeClass("btn_orangeDisable");	
	}

	if ($("#btn_confirm").attr("disabled") == true) {
		$("#btn_confirm").removeClass("btn_bluege");
		$("#btn_confirm").addClass("btn_blueDisable");	
	} else {
		$("#btn_confirm").removeClass("btn_blueDisable");
		$("#btn_confirm").addClass("btn_blue");
	}	
	multStyleButton();	
};

ExamConfirm.getPromptPath = function () {
    /// <summary>测试准备音频路径</summary>
    var srcPath = ExamConfirm.data.ExamineePath;
    var voicePath = ExamConfirm.data.SchemaSection.prompt.prompt;
    return srcPath + "paper\\" + voicePath;
};

ExamConfirm.getAnswerPromptPath = function () {
    /// <summary>测试准备音频路径</summary>
    var srcPath = ExamConfirm.data.ExamineePath;
    var voicePath = ExamConfirm.data.SchemaSection.answer_prompt;
    return srcPath + "paper\\" + voicePath;
};

ExamConfirm.loadTaskTypePatch = function () {
    var imgInstructions = $("#imgInstructions");
    var ttpFile = GetTTPFile("oral1.jpg");
	if (ttpFile != "")
        imgInstructions.attr("src",ttpFile);
    $("#imgInstructions").show();
};

function documentReady() {
	ExamConfirm.init();
	ExamConfirm.loadTaskTypePatch();
	
    ShowStatus(ExamState.Blank);
    var orallist = GetClientData("orallist");
    ExamConfirm.view(eval('('+ orallist+')'));
	$('.btn_play').disable(true);
	$('.btn_play').removeClass('blueButton').addClass('greyButton');	
    $("#btn_confirm").bind('click', btn_confirm_click);
    $("#btn_abnormal").bind('click', btn_abnormal_click);
	ExamConfirm.isClicked = false;
	
	// 加载页面后，播放提示音乐
    ShowStatus(ExamState.ListenInstruction);
    Play("void", ExamConfirm.getPromptPath());
	$('#btn_confirm').disable(true);
	$('#btn_abnormal').disable(true);
	setbtn_style();
};

function documentOver() {

}

ExamConfirm.view = function (orallist) {
    var htmls = [];
    htmls.push('<table  cellpadding="0" cellspacing="0" class="table_27"><tr style="height:20px;">');
    htmls.push('<th width="40%"><p style="text-align:center;"><span style="font-family:Arial;font-size:14px;font-weight:bold;font-style:normal;text-decoration:none;color:#333333;">大题</span></p></td>');
    htmls.push('<th width="35%"><p style="text-align:center;"><span style="font-family:Arial;font-size:14px;font-weight:bold;font-style:normal;text-decoration:none;color:#333333;">小题</span></p></td>');
    htmls.push('<th width="25%"><p style="text-align:center;"><span style="font-family:Arial;font-size:14px;font-weight:bold;font-style:normal;text-decoration:none;color:#333333;">操作</span></p></td>');
    htmls.push('</tr>');
    $.each(orallist, function (i, section) {
        var questions = section.items;

        for (var index = 0; index < questions.length; index++) {
            var question = questions[index];
            htmls.push('<tr style="height:20px">');
            if (index == 0) {
				var reg = /(\(|\（)[^(\)|\）)]+()(\)|\）)/;
				var title = section.title.replace(reg, '');
                htmls.push(String.format('<td rowspan="{0}">{1}</td>', questions.length, title))
            }
			
			if (questions.length == 1)
			{
				htmls.push('<td>----</td>');
			}
			else
			{
				htmls.push(String.format('<td>问题{0}</td>', index + 1));
			}
			var audio = question.audio.replace(/\\/g, "\\\\");
            htmls.push(String.format('<td><button id="{0}" class="btn_play blueButton" onclick="ExamConfirm.AudioListen(this,\'{1}\')">播放</button></td>',question.id, audio));
            htmls.push('</tr>');
        }
    });
	htmls.push('</table>');
	$('.exam_table').html(htmls.join(''));
};

ExamConfirm.AudioListen = function (element, audiopath) {
	if (element.innerHTML == "播放") {
		if(ExamConfirm.isPlaying) {
			StopPlay(ExamConfirm.isPlayAudio);
			ExamConfirm.isPlaying = false;
		}
		
		var sel = '#' + element.id;
		$(sel).removeClass('blueButton').addClass('redButton');
		ExamConfirm.isPlaying = true;
		ExamConfirm.isPlayAudio = element.id;
		element.innerHTML = "停止";
		sel = ".btn_play[id!=" + element.id + "]";
		$(sel).html("播放");
		Play(element.id, audiopath);
		setTimeout(function(){
			if (!ExamConfirm.isTimeout)
			{
				var sel = '#' + element.id;
				$(sel).disable(false);
				//$(sel).removeClass('greyButton').addClass('blueButton');
			}
		},500);
	} else if (element.innerHTML == "停止") {
		StopPlay(element.id);
		ExamConfirm.isPlaying = false;
	}
};

function OnPlayEnd(callBackData) {
	if (callBackData == "void") {
		$('.btn_play').disable(false);
		$('#btn_confirm').disable(false);
		$('#btn_abnormal').disable(false);
		$('.btn_play').removeClass('greyButton').addClass('blueButton');
		SyncPlay(ExamConfirm.getAnswerPromptPath());
		SyncWaitTime("timing", 60, true);
		setbtn_style();
		return;
	}
	else {
		if (!ExamConfirm.isTimeout)
		{
			// 如果当前播放的音频就是这个，则设置播放停止
			// 这种情况是被动相应音频结束事件，而不是用户主动停止播放的
			if (ExamConfirm.isPlayAudio == callBackData)
			{
				ExamConfirm.isPlaying = false;
			}
			var sel = '#' + callBackData;
			$(sel).html("播放");
			$(sel).disable(false);
			$(sel).removeClass('redButton').addClass('blueButton');
		}
	}
};

function OnWaitTimeEnd(callBackData) {
	if (callBackData == "timing") {
		ExamConfirm.isTimeout = true;
		$('#btn_confirm').disable(true);
		$('#btn_abnormal').disable(true);
		$(".btn_play").disable(true);
		StopPlay();
		$(".btn_play").html("播放");
		$('.btn_play').removeClass('blueButton').addClass('greyButton');
		ShowStatus(ExamState.Blank);
		callClient("audioabnormal", "-1");
		// 超时自动跳转
		SectionEnd("1");
	}
}

function btn_confirm_click() {
	if (!ExamConfirm.isClicked) {
		ExamConfirm.isClicked = true;
		$('#btn_confirm').disable(true);
		callClient("audioabnormal", "1");
		SectionEnd("1");
	}
};

function btn_abnormal_click() {
	if (!ExamConfirm.isClicked) {
		ExamConfirm.isClicked = true;
		$('#btn_abnormal').disable(true);
		callClient("audioabnormal", "0");
		SectionEnd("1");	
	}
};

