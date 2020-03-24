/*
* @author: shuhu
* @date: 2017/6/1
* @description: 断点续考界面
*/

var DataRecovery = {};
CommObj.curPage = DataRecovery;
CommObj.paperStatus = false;
CommObj.answerStatus = false;

function OnRecoveryPaperEnd(callback) {
    if (callback == 0) {
        CommObj.paperStatus = true;
        CEFWrapper.DownloadAnswer();
    } 
	else
        DataRecovery.OnRecoveryEnd(false);
};

function OnRecoveryAnswerEnd(callback) {
    if (callback == 0) {
        CommObj.answerStatus = true;
        DataRecovery.OnRecoveryEnd(true);
    } else
        DataRecovery.OnRecoveryEnd(false);
};

DataRecovery.OnRecoveryEnd = function (result) {
	if (result)
        CEFWrapper.RecoveryEnd('');
	else {
		$("#waitBox").hide();
		$("#recoveryFail").show();
	}
};

function documentReady() {
    $("#tryRecovery").bind('click', DataRecovery.RetryRecovery);
    // 先恢复试卷操作
    CEFWrapper.DownloadPaper();
};

function documentOver() {

};

DataRecovery.RetryRecovery = function (event) {
    $("#waitBox").show();
    $("#recoveryFail").hide();
    if (!CommObj.paperStatus) CEFWrapper.DownloadPaper();
    if (!CommObj.answerStatus) CEFWrapper.DownloadAnswer();
};