/// <reference path="common/jquery-1.4.1.js" />
/// <reference path="common/Comm.js" />
/// <reference path="common/Models.js" />
/*
* @author: szsheng
* @date: 2010/09/27
* @description: 口语考试准备
*/

var ExaminationInstructions4 = new ExamPageUtil();

/// <summary>客户端音频播放完成后的回调函数</summary>
/// <param name="callBackData" type="String">回调标识数据</param>
function OnPlayEnd(callBackData) {
    CEFWrapper.WaitTime("void", 2, true);
};

/// <summary>客户端 WaitTime 结束后的回调函数</summary>
/// <param name="callBackData" type="String">回调标识数据</param>
function OnWaitTimeEnd(callBackData) {
    if (callBackData == "void") {
        CEFWrapper.SaveBreakPointInfo(JSON.stringify({ SectionName: ExaminationInstructions4.data.SchemaSection.name }), function () {
            CEFWrapper.SectionEnd("1");
        });
    } 
};

ExaminationInstructions4.loadTaskTypePatch = function () {
//    var imgInstructions = $("#imgInstructions");
//    var ttpFile = GetTTPFile("oral1.jpg");
//    if (ttpFile != "")
//        imgInstructions.attr("src", ttpFile);
//    $("#imgInstructions").show();
};

ExaminationInstructions4.getSchemaSection = function () {
    /// <summary>获取测试准备的模板</summary>
    return ExaminationInstructions4.data.SchemaSection;
}

ExaminationInstructions4.getSchemaPrompt = function () {
    /// <summary>测试准备音频</summary>
    var schemaSection = ExaminationInstructions4.data.SchemaSection;
    return schemaSection.prompt;
}

ExaminationInstructions4.getPromptPath = function () {
    /// <summary>测试准备音频路径</summary>
    var srcPath = ExaminationInstructions4.data.ExamineePath;
    var voicePath = ExaminationInstructions4.data.SchemaSection.prompt.prompt;
    return srcPath + "paper\\" + voicePath;
}

function documentReady() {
    ExaminationInstructions4.init(function () {
        CEFWrapper.GetBreakPointData(function (result) {
            // 如果进度为本section，说明该流程已执行结束
            if (result && (ExaminationInstructions4.data.SchemaSection.name == result.SectionName)) {
                CEFWrapper.SectionEnd("1");
            } else {
                var ss = ExaminationInstructions4.getSchemaSection();
                if (ss.text)
                    $(".test_text").html(ss.text);
                else
                    $(".test_text").html("同学们，欢迎参加北京市高级中等学校招生考试英语听说考试。试题共包括四道大题。下面请看第一大题。");
                CEFWrapper.ShowStatus(ExamState.Wait);
                var prmpFilePath = ExaminationInstructions4.getPromptPath();
                CEFWrapper.Play("", prmpFilePath);
            }
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