/// <reference path="common/jquery-1.4.1.js" />
/// <reference path="common/Comm.js" />
/// <reference path="common/Models.js" />
/*
* @author: szsheng
* @date: 2010/09/27
* @description: 口语考试准备
*/

var ExaminationInstructions2 = new ExamPageUtil();

/// <summary>客户端音频播放完成后的回调函数</summary>
/// <param name="callBackData" type="String">回调标识数据</param>
function OnPlayEnd(callBackData) {
    CEFWrapper.SaveBreakPointInfo("", function () {
        CEFWrapper.SectionEnd("1");
    });
};

ExaminationInstructions2.loadTaskTypePatch = function (callback) {
	CEFWrapper.GetClientData("ttpfile->oral_instructions.jpg", function(ttpFile) {
		var imgInstructions = $("#imgInstructions");
		if (ttpFile != "")
		    imgInstructions.attr("src", ttpFile);

	    //播放考试结束音频
		var cfgObj = CommObj.curPage.data.SchemaSection;
		if (cfgObj && cfgObj.text) $("#instructions").html(cfgObj.text);
		callback();
	});
};

ExaminationInstructions2.getSchemaSection = function () {
    /// <summary>获取测试准备的模板</summary>
    return ExaminationInstructions2.data.SchemaSection;
}

ExaminationInstructions2.getSchemaPrompt = function () {
    /// <summary>测试准备音频</summary>
    var schemaSection = ExaminationInstructions2.data.SchemaSection;
    return schemaSection.prompt;
}

ExaminationInstructions2.getPromptPath = function () {
    /// <summary>测试准备音频路径</summary>
    var srcPath = ExaminationInstructions2.data.ExamineePath;
    var voicePath = ExaminationInstructions2.data.SchemaSection.prompt.prompt;
    return srcPath + "paper\\" + voicePath;
}


function documentReady() {
    ExaminationInstructions2.init(function () {
        ExaminationInstructions2.loadTaskTypePatch(function () {
            //CEFWrapper.ShowStatus(ExamState.Wait);
            var prmpFilePath = ExaminationInstructions2.getPromptPath();
            CEFWrapper.Play("", prmpFilePath);
        });
    });
}

function documentOver() {

}

function OnNextEnd(callBackData) {
	CEFWrapper.SectionEnd("1", "1");
}

function OnPrevEnd(callBackData) {
	CEFWrapper.SectionEnd("-1", "-1");
}