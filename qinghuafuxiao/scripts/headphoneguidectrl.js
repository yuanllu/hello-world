/// <reference path="../common/Comm.js" />
/// <reference path="../common/Models.js" />


/*
* @author: chensong
* @date: 2010/09/01
* @description: 试音的耳机佩戴页面
*/

 /// <summary>等待时间</summary>
var HEAD_PHONE_GUIDE_WAIT_TIME = 2000;
var isListen = false;
var HeadphoneGuide = {};
CommObj.curPage = HeadphoneGuide;
HeadphoneGuide.waitTimer = null;

function OnDownloadPaperEnd(callBackData) {
    if (callBackData) {
        $("#Downloading").hide();
        $("#Downloaded").hide();
        $("#DownloadError").show();
    } else {
        $("#Downloading").hide();
        $("#Downloaded").show();
        $("#DownloadError").hide();
    }
}

//播放结束的回调事件
function OnPlayEnd(callBackData) {
    //如果播放音乐完后，继续播放，如果是停止播放音乐则跳转相应页面
    if (callBackData == "_original") {
        CEFWrapper.ShowStatus(ExamState.Blank);
        $("#originalStopbtn").hide();
        $("#originalbtn").show();
        $("#listenbtn").prop("disabled", false);
        $("#recordbtn").prop("disabled", false);
        $("#islistenbtn").prop("disabled", false);
        $("#isnotlistenbtn").prop("disabled", false);
        HeadphoneGuide.setbtn_style();
    } else if (callBackData == "_record_guide") {
        CEFWrapper.ShowStatus(ExamState.Recording);
        CEFWrapper.Record("void", HeadphoneGuide.data.AuditionTime);
    } else if (callBackData == "_listenaudition") {
        CEFWrapper.ShowStatus(ExamState.Blank);
        $("#listenbtn").prop("disabled", false);
        $("#originalStopbtn").prop("disabled", false);
        $("#originalbtn").prop("disabled", false);
        HeadphoneGuide.setbtn_style();
    } else if (callBackData == "void") {
        CEFWrapper.ShowStatus(ExamState.Blank);
        $("#recordbtn").prop("disabled", false);
        $("#originalbtn").prop("disabled", false);
        HeadphoneGuide.setbtn_style();

        //尝试自动登录
        HeadphoneGuide.autoLogin();
    }
};

//录音结束的回调事件
function OnRecordEnd(callBackData) {
    if (callBackData == "void") {
        CEFWrapper.ShowStatus(ExamState.Blank);
        $("#recordbtn").prop("disabled", false);
        $("#listenbtn").prop("disabled", false);
        $("#originalbtn").prop("disabled", false);
        $("#islistenbtn").prop("disabled", false);
        $("#isnotlistenbtn").prop("disabled", false);
        HeadphoneGuide.setbtn_style();

        //尝试自动登录
        if (HeadphoneGuide.data.IsAudioCheck == '1') {
            // 音质检测
            CEFWrapper.CheckAudio("", function (result) {
                if (result == "" || HeadphoneGuide._autoLogin) {
                    $("#listenbtn").click();

                    if (HeadphoneGuide._autoLogin) {
                        setTimeout(function () { $('#islistenbtn').click(); }, 1000);
                    }
                    // 音质检测异常
                } else {
                    $("#tips_audition_msg").html(result);
                    $("#mask").show();
                    $("#tips_audition").show();
                    $("#cancel_listen").focus();
                }
            });
        } else {
            $("#listenbtn").click();
        }
    }
};

//播放失败的回调事件
function OnPlayErr(callBackData) {
    CEFWrapper.ShowStatus(ExamState.Blank);
    $("#recordbtn").prop("disabled", false);
    $("#listenbtn").prop("disabled", false);
    $("#originalbtn").prop("disabled", false);
    $("#islistenbtn").prop("disabled", false);
    $("#isnotlistenbtn").prop("disabled", false);
    HeadphoneGuide.setbtn_style();
};

//录音失败的回调事件
function OnRecordErr(callBackData) {
    CEFWrapper.ShowStatus(ExamState.Blank);
    $("#recordbtn").prop("disabled", false);
    $("#listenbtn").prop("disabled", false);
    $("#originalbtn").prop("disabled", false);
    $("#islistenbtn").prop("disabled", false);
    $("#isnotlistenbtn").prop("disabled", false);
    HeadphoneGuide.setbtn_style();
};

HeadphoneGuide._autoLogin = false;
// 尝试自动试音流程
HeadphoneGuide.autoLogin = function () {
	CEFWrapper.GetClientData("autologinid", function (loginExamId) {
		if ("" == loginExamId)
			return;
		HeadphoneGuide._autoLogin = true;
		setTimeout("$('#recordbtn').click();", 1000);
	});
};

// 设置按钮样式
HeadphoneGuide.setbtn_style = function() {
	if ($("#recordbtn").prop("disabled")) {
		$("#recordbtn").removeClass("btn_StartRecord");
		$("#recordbtn").addClass("btnDisable_StartRecord");
	} else {
		$("#recordbtn").addClass("btn_StartRecord");
		$("#recordbtn").removeClass("btnDisable_StartRecord");
	}

	if ($("#originalbtn").prop("disabled")) {
		$("#originalbtn").removeClass("ts_play");
		$("#originalbtn").addClass("ts_play_dis");
	} else {
		$("#originalbtn").removeClass("ts_play_dis");
		$("#originalbtn").addClass("ts_play");
	}

	if ($("#originalStopbtn").prop("disabled")) {
		$("#originalStopbtn").removeClass("ts_stop");
		$("#originalStopbtn").addClass("ts_stop_dis");
	} else {
		$("#originalStopbtn").removeClass("ts_stop_dis");
		$("#originalStopbtn").addClass("ts_stop");
	}

	if ($("#listenbtn").prop("disabled")) {
		$("#listenbtn").removeClass("btn_Listen");
		$("#listenbtn").addClass("btn_Disable_Listen");
	} else {
		$("#listenbtn").addClass("btn_Listen");
		$("#listenbtn").removeClass("btn_Disable_Listen");
	}

	if ($("#islistenbtn").prop("disabled")) {
		$("#islistenbtn").removeClass("btn_IsListen");
		$("#islistenbtn").addClass("btn_Disable_IsListen");
	} else {
		$("#islistenbtn").addClass("btn_IsListen");
		$("#islistenbtn").removeClass("btn_Disable_IsListen");
	}

	if ($("#isnotlistenbtn").prop("disabled")) {
		$("#isnotlistenbtn").removeClass("btn_IsNoListen");
		$("#isnotlistenbtn").addClass("btn_Disable_IsNoListen");
	} else {
		$("#isnotlistenbtn").addClass("btn_IsNoListen");
		$("#isnotlistenbtn").removeClass("btn_Disable_IsNoListen");
	}

	multStyleButton();
	HeadphoneGuide.multStyleButton_Audition();
};

// 设置按钮样式
HeadphoneGuide.multStyleButton_Audition = function() {
    var arrClass = ["ts_play", "ts_stop"];
    var arrClassHover = ["ts_playhov", "ts_stophov"];
    var arrClassDown = ["ts_playpre", "ts_stoppre"];
    $(arrClass).each(function (n) {
        var className = arrClass[n];
        $("input." + className).each(function (i) {
            $(this).mouseover(function () {
                $(this).removeClass(className);
                $(this).removeClass(arrClassDown[n]);
                $(this).addClass(arrClassHover[n]);
            });
            $(this).mouseout(function () {
                $(this).removeClass(arrClassHover[n]);
                $(this).removeClass(arrClassDown[n]);
                $(this).addClass(className);
            });
            $(this).mousedown(function () {
                $(this).removeClass(arrClassHover[n]);
                $(this).removeClass(className);
                $(this).addClass(arrClassDown[n]);
            });
            $(this).mouseup(function () {
                $(this).removeClass(arrClassDown[n]);
                $(this).removeClass(className);
                $(this).addClass(arrClassHover[n]);
            });
        });
    });
}

// 播放示范音频按钮的点击事件
HeadphoneGuide.originalbtn_click = function() {
	CEFWrapper.ShowStatus(ExamState.ListenInstruction);
	$("#originalStopbtn").show();
	$("#originalStopbtn").prop("disabled", true);
	$("#originalbtn").hide();
	$("#recordbtn").prop("disabled", true);
	$("#listenbtn").prop("disabled", true);
	$("#islistenbtn").prop("disabled", true);
	$("#isnotlistenbtn").prop("disabled", true);
	HeadphoneGuide.setbtn_style();
	// 1s后可以停止播放
	setTimeout(function() {
		$('#originalStopbtn').prop("disabled", false);
		HeadphoneGuide.setbtn_style();
	}, 1000);
	// 加载页面后，播放音乐
	CEFWrapper.Play("_original", HeadphoneGuide.data.OriginalFile);
};

// 停止播放示范音频按钮的点击事件
HeadphoneGuide.originalStopbtn_click = function() {
	CEFWrapper.ShowStatus(ExamState.Blank);
	$("#originalStopbtn").prop("disabled", true);
	HeadphoneGuide.setbtn_style();
	// 1s后可以停止播放
	setTimeout(function() {
		$("#originalStopbtn").hide();
		$("#originalbtn").show();
		$("#recordbtn").prop("disabled", false);
		$("#listenbtn").prop("disabled", false);
		$("#islistenbtn").prop("disabled", false);
		$("#isnotlistenbtn").prop("disabled", false);
		HeadphoneGuide.setbtn_style();
	}, 1000);
	CEFWrapper.StopPlay("_original");
};

// 开始录音按钮点击事件
HeadphoneGuide.recordbtn_click = function() {
	CEFWrapper.ShowStatus(ExamState.ListenInstruction);
	$("#recordbtn").prop("disabled", true);
	$("#originalbtn").prop("disabled", true);
	$("#listenbtn").prop("disabled", true);
	HeadphoneGuide.setbtn_style();
	// 加载页面后，播放音乐
	CEFWrapper.Play("_record_guide", HeadphoneGuide.data.RecordGuideFile);
};


// 录音回放按钮点击事件
HeadphoneGuide.listenbtn_click = function() {
	CEFWrapper.ShowStatus(ExamState.ListenPrompt);
	$("#audio2").css('background', 'url(images/shiyin2.png) no-repeat');
	$("#listenbtn").prop("disabled", true);
	$("#originalStopbtn").prop("disabled", true);
	$("#originalbtn").prop("disabled", true);
	$("#btnsBox").hide();
	$("#btnsBox1").show();
	HeadphoneGuide.setbtn_style();

	// 加载页面后，播放音乐
	CEFWrapper.Play("_listenaudition", HeadphoneGuide.data.AuditionFile);
};

// 取消按钮的点击事件
HeadphoneGuide.cancelbtn_click = function() {
	$("#islistenbtn").prop("disabled", false);
	$("#listenbtn").prop("disabled", false);
	$("#isnotlistenbtn").prop("disabled", false);
	$("#originalbtn").prop("disabled", false);
	HeadphoneGuide.setbtn_style();
	$("#mask").hide();
	$("#tips").hide();
	$("#tips_audition").hide();
}

// 清晰按钮的点击事件
HeadphoneGuide.islistenbtn_click = function() {
	$("#islistenbtn").prop("disabled", true);
	$("#isnotlistenbtn").prop("disabled", true);
	$("#listenbtn").prop("disabled", true);
	$("#originalbtn").prop("disabled", true);
	$("#tips_audition").hide();
	$("#mask").show();
	$("#tips").show();
	$("#cancel_listen").focus();
		
	CEFWrapper.StopPlay("_listenaudition", function() {
		if (HeadphoneGuide._autoLogin) {
			setTimeout(function() {$('#agree_listen').click();}, 1000);	
		};
	});	
};

// 不清晰按钮的点击事件
HeadphoneGuide.isnotlistenbtn_click = function() {
	CEFWrapper.ShowStatus(ExamState.Blank);
	$("#islistenbtn").prop("disabled", true);
	$("#isnotlistenbtn").prop("disabled", true);
	$("#listenbtn").prop("disabled", true);
	HeadphoneGuide.setbtn_style();	
	
	CEFWrapper.StopPlay("_listenaudition", function() {
		$("#audio2").css('background', 'url(images/shiyin2.png) no-repeat');
		$("#btnsBox").show();
		$("#btnsBox1").hide();
		$("#recordbtn").prop("disabled", false);
		$("#originalbtn").prop("disabled", false);
		$("#listenbtn").prop("disabled", true);
		HeadphoneGuide.setbtn_style();	
	});
};

// 同意按钮的点击事件
HeadphoneGuide.agree_listen_click = function() {
	CEFWrapper.ShowVolumeAdjuster("0");
	$("#headphoneTest").hide();
	$("#mask").hide();
	$("#tips").hide();
	$("#tips_audition").hide();
	$("#audition_success").show();
	CEFWrapper.AuditionResult("1");
}

// “音质异常确定按钮”点击事件
HeadphoneGuide.agree_tips_audition_click = function() {
	$("#mask").hide();
	$("#tips_audition").hide();
	HeadphoneGuide.isnotlistenbtn_click();
}

// 测试功能，直接跳过试音阶段
HeadphoneGuide.ChangeAuditionSuccess = function () {
    if (HeadphoneGuide.waitTimer) clearTimeout(HeadphoneGuide.waitTimer);
	HeadphoneGuide.agree_listen_click();
}

//绑定控件事件
HeadphoneGuide.bindingEvent = function () {
    //加载页面后，绑定“原声播放”点击事件
    $("#originalbtn").bind('click', HeadphoneGuide.originalbtn_click);
    //加载页面后，绑定“停止原声播放”点击事件
    $("#originalStopbtn").bind('click', HeadphoneGuide.originalStopbtn_click);
    //加载页面后，绑定“开始录音”点击事件，跳转到录音页面
    $("#recordbtn").bind('click', HeadphoneGuide.recordbtn_click);
    //加载页面后，绑定“播放”点击事件，跳转到录音页面
    $("#listenbtn").bind('click', HeadphoneGuide.listenbtn_click);
    //加载页面后，绑定“清晰”点击事件，跳转到录音页面
    $("#islistenbtn").bind('click', HeadphoneGuide.islistenbtn_click);
    //加载页面后，绑定“不清晰”点击事件，跳转到录音页面
    $("#isnotlistenbtn").bind('click', HeadphoneGuide.isnotlistenbtn_click);
    //加载页面后，绑定“确定”点击事件，跳转到录音页面
    $("#agree_listen").bind('click', HeadphoneGuide.agree_listen_click);
    //加载页面后，绑定“取消”点击事件，跳转到录音页面
    $("#cancel_listen").bind('click', HeadphoneGuide.cancelbtn_click);
    //加载页面后，绑定“关闭”点击事件，跳转到录音页面
    $("#close_tips").bind('click', HeadphoneGuide.cancelbtn_click);
    //加载页面后，绑定“关闭”点击事件，跳转到录音页面
    $("#close_tips_audition").bind('click', HeadphoneGuide.cancelbtn_click);
    //加载页面后，绑定“音质异常确定按钮”点击事件，跳转到录音页面
    $("#agree_tips_audition").bind('click', HeadphoneGuide.agree_tips_audition_click);
    // 默认的按钮焦点
    $("#agree_listen").attr("tabindex", "1");
    $("#cancel_listen").attr("tabindex", "0");

};

//重新下载试卷
HeadphoneGuide.onReDownload = function () {
    $("#Downloading").show();
    $("#Downloaded").hide();
    $("#DownloadError").hide();
    CEFWrapper.DownloadPaper();
};

function documentReady() {
    //加载页面后，等待30s,callback不需要，所以用VOID
	CEFWrapper.GetClientData("getexamdata", function (data) {
		HeadphoneGuide.data = EvalData(data);
		HeadphoneGuide.bindingEvent();
		CEFWrapper.ShowVolumeAdjuster("1");
		CEFWrapper.ShowStatus(ExamState.Wait);
		$("#recordbtn").prop("disabled", true);
		$("#originalbtn").prop("disabled", true);
		HeadphoneGuide.setbtn_style();

		HeadphoneGuide.waitTimer = setTimeout(function () {
		    HeadphoneGuide.setbtn_style();
		    CEFWrapper.ShowStatus(ExamState.ListenPrompt);
		    CEFWrapper.Play("void", HeadphoneGuide.data.PlayMusicFile);
		}, HEAD_PHONE_GUIDE_WAIT_TIME);
		
		setTimeout(function(){CEFWrapper.DownloadPaper();}, 5000);
	});
}

function documentOver() {

}