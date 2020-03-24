/// <reference path="common/jquery-1.4.1.js" />
/// <reference path="common/Comm.js" />
/// <reference path="common/Models.js" />
/*
* @author: shuhu
* @date: 2013/11/22
* @description: 听力考试准备
*/

var ExamOverFail = new ExamPageUtil();

ExamOverFail.getPromptPath = function () {
    /// <summary>测试准备音频路径</summary>
    var srcPath = ExamOverFail.data.ExamineePath;
    var voicePath = ExamOverFail.data.SchemaSection.prompt.prompt;
    return srcPath + "paper\\" + voicePath;
}

ExamOverFail.loadTaskTypePatch = function () {
    var imgInstructions = $("#imgInstructions");
    var ttpFile = GetTTPFile("oral1.jpg");
	if (ttpFile != "")
        imgInstructions.attr("src",ttpFile);
    $("#imgInstructions").show();
};

function documentReady() {
	ExamOverFail.init();
	ExamOverFail.loadTaskTypePatch();
	
    ShowStatus(ExamState.Blank);
    var orallist = GetClientData("orallist");
    ExamOverFail.view(eval('('+ orallist+')'));
	// 上传答卷包
	//callClient("uploadanswerback", "");
	callClient("cevaluateback", "");
};

function OnExamEnd(result) {
	if (result == "1") {
		callClient("sevaluateback", "");	
	}
}

function OnClientEvalEnd(result) {
	if (result == "1") {
		callClient("uploadanswerback", "");
	}
}

function OnServerEvalEnd(result) {

}

ExamOverFail.view = function (orallist) {
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
            htmls.push(String.format('<td><button id="{0}" class="btn_play blueButton" onclick="ExamOverFail.AudioListen(this,\'{1}\')">播放</button></td>',question.id, audio));
            htmls.push('</tr>');
        }
    });
	htmls.push('</table>');
	$('.exam_table').html(htmls.join(''));
};

ExamOverFail.AudioListen = function (element, audiopath) {
	if (element.innerHTML == "播放") {
		if(ExamOverFail.isPlaying) {
			StopPlay(ExamOverFail.isPlayAudio);
			ExamOverFail.isPlaying = false;
		}
		
		var sel = '#' + element.id;
		$(sel).removeClass('blueButton').addClass('redButton');
		ExamOverFail.isPlaying = true;
		ExamOverFail.isPlayAudio = element.id;
		element.innerHTML = "停止";
		sel = ".btn_play[id!=" + element.id + "]";
		$(sel).html("播放");
		Play(element.id, audiopath);
		setTimeout(function(){
			var sel = '#' + element.id;
			$(sel).disable(false);
			//$(sel).removeClass('greyButton').addClass('blueButton');
		},500);
	} else if (element.innerHTML == "停止") {
		StopPlay(element.id);
		ExamOverFail.isPlaying = false;
	}
};

function OnPlayEnd(callBackData) {
	// 如果当前播放的音频就是这个，则设置播放停止
	// 这种情况是被动相应音频结束事件，而不是用户主动停止播放的
	if (ExamOverFail.isPlayAudio == callBackData)
	{
		ExamOverFail.isPlaying = false;
	}
	var sel = '#' + callBackData;
	$(sel).html("播放");
	$(sel).disable(false);
	$(sel).removeClass('redButton').addClass('blueButton');
};

