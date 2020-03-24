/// <reference path="common/jquery-1.4.1.js" />
/// <reference path="common/IntegrationComm.js" />
/// <reference path="common/IntegrationModels.js" />
/*
 * @author: szsheng
 * @date: 2012/12/13
 * @description: 综合题型
 */
var gFileName = '';
var IntegrationUtil = new ExamPageUtil();
//IntegrationUtil.__lastChoice = { "questionId": "", "answer": "" };
IntegrationUtil._ExamineeID = null;
IntegrationUtil.userAnswer = [];
IntegrationUtil._video = null;
IntegrationUtil._videoCanvas = null;
IntegrationUtil._videoContext = null;//音频内容
IntegrationUtil._captureNum = 10;
IntegrationUtil._mediaStreamTrack = null;

function documentReady() {
    log("页面加载成功");
    Lightbox.setLoading(false);
    InitExamPage(config);
    IntegrationUtil.init(function () {
        CEFWrapper.GetClientData("examineeid", function (data) {
            IntegrationUtil._ExamineeID = data;
            CEFWrapper.GetClientData("prevnext", function (data) {
                IntegrationUtil.data.PrevNext = data;
                // 获取外壳保存的乱序信息
                CEFWrapper.GetRandomInfoData(IntegrationUtil.data.SchemaSection.name, function (randomInfo) {
                    if (randomInfo) IntegrationUtil.data.SchemaSection.randomItem = randomInfo;
                    // 对小题进行乱序处理
                    IntegrationUtil.data = ItemRandom(IntegrationUtil.data);
                    CEFWrapper.SaveRandomInfo(IntegrationUtil.data.SchemaSection.name, JSON.stringify(IntegrationUtil.data.SchemaSection.randomItem), function (data) {
                        Action.loadMainAction(IntegrationUtil.data, function () {
                            Action.InitNextOrPre();
                            loadCustomizableCss(function () {
                                // 填空题设置键盘输入法为英文
                                var name = $res("mb:section>name");
                                var type = $res("mb:section>type");
                                if (type == "write") { CEFWrapper.OpenEnglishIme(null); }

                                // 根据配置，打开摄像头进行拍照
                                CEFWrapper.GetClientData("localcfg", function (cfgobj) {
                                    var localCfg = EvalData(cfgobj);
                                    if (localCfg.need_camera && (name != "Survey")) {
                                        IntegrationUtil.initCamera(function (err) {
                                            if (err) console.log('摄像头初始化失败：' + err);
                                            setTimeout(IntegrationUtil.capture, 10000);
                                        });
                                    }

                                    //获取断点续考信息
                                    CEFWrapper.GetBreakPointData(function (result) {
                                        // 开始答题流程
                                        Action.setCurrentAction(result);
                                        Action.Run();
                                        multStyleButton();
                                    });
                                });
                            });
                        });
                    });
                });
            });
        })
    });
}

function documentOver() {
    IntegrationUtil._captureNum = 0;
    ShowWait();
}

function log(message, loglevel) {
    console.log(message);
}

IntegrationUtil.initCamera = function (callback) {
    var exArray = []; //存储设备源ID
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

    MediaStreamTrack.getSources(function (sourceInfos) {
        for (var i = 0; i != sourceInfos.length; ++i) {
            var sourceInfo = sourceInfos[i];
            //这里会遍历audio,video，所以要加以区分
            if (sourceInfo.kind === 'video') {
                exArray.push(sourceInfo.id);
            }
        }

        if (exArray.length <= 0) {
            IntegrationUtil._video = document.getElementById('camera');
            IntegrationUtil._videoCanvas = document.getElementById('cameraCtx');
            IntegrationUtil._videoContext = IntegrationUtil._videoCanvas.getContext('2d');
            return callback('no video device');
        }

        if (navigator.getUserMedia) {
            navigator.getUserMedia({
                'video': {
                    'optional': [{
                        'sourceId': exArray[0] //0为前置摄像头，1为后置
                    }]
                }
            }, function (stream) {
                IntegrationUtil._mediaStreamTrack = stream.getTracks()[0];
                // 初始化控件对象
                IntegrationUtil._video = document.getElementById('camera');
                IntegrationUtil._videoCanvas = document.getElementById('cameraCtx');
                IntegrationUtil._videoContext = IntegrationUtil._videoCanvas.getContext('2d');
                if (!IntegrationUtil._video)
                    return callback('no video tags');
                IntegrationUtil._video.src = window.URL && window.URL.createObjectURL(stream) || stream;
                callback(null);
            }, function (error) {
                callback(error);
            }); //success是获取成功的回调函数
        } else {
            callback('Native device media streaming (getUserMedia) not supported in this browser.');
        }
    });
}

IntegrationUtil.capture = function (callback) {
    // 拍摄图片，传到外壳并保存
    if (IntegrationUtil._video.videoWidth > 0 && IntegrationUtil._video.videoHeight > 0)
    {
        IntegrationUtil._videoCanvas.width = IntegrationUtil._video.videoWidth;
        IntegrationUtil._videoCanvas.height = IntegrationUtil._video.videoHeight;
        IntegrationUtil._videoContext.drawImage(IntegrationUtil._video, 0, 0);
    }
    
    // 提取人脸特征
    try {
        var imageData = IntegrationUtil._videoCanvas.width + '|' + IntegrationUtil._videoCanvas.height + '|' +
            IntegrationUtil._videoCanvas.toDataURL("image/jpeg", 1.0);
        //var imageData = "data:,|0|0";
        CEFWrapper.CaptureCamera(imageData, function (result) {
            if (--IntegrationUtil._captureNum > 0)
                setTimeout(IntegrationUtil.capture, 5000 + Math.ceil(Math.random() * 5000));
            else {
                CEFWrapper.IdentityRecognize("");
                IntegrationUtil._mediaStreamTrack && IntegrationUtil._mediaStreamTrack.stop();
            }
        });
    } catch (err) {}
}

/*--------------------------------------------------------------------------------------------------------------------*/

function InitExamPage(configObj) {
    Action._currentExamType = configObj.ExamType;
    Action._ExamCategory = configObj.ExamCategory;
    Action._isCanNetOrPre = configObj.CanNextOrPrev;
}

function HideDescriptionAndPrompt() {
    $("#guide").html("");
    $("#prompt").html("");
}

// function ShowTitle(titleHtml) {
//     $("#title").html(titleHtml);
// }

// function ShowDescription(guidTxt) {
//     var guideHtml = '<div class="guidTxt">' + guidTxt + '</div>';
//     $("#guide").html(guideHtml);
// }

function ShowTitle(titleHtml, sectionIndex) {
    var titleNode = $("#title").length > 0 ? $("#title") : $(".title_" + sectionIndex);
    titleNode.html(titleHtml);
}

function ShowDescription(guidTxt, sectionIndex) {
    var guideHtml = '<div class="guidTxt">' + guidTxt + '</div>';
    var guidNode = $("#guide").length > 0 ? $("#guide") : $(".guide_" + sectionIndex)
    guidNode.html(guideHtml);
}

function ShowPromptText(promptText, sectionIndex) {
    var promptHtml = '<div class="promptTxt">' + promptText + '</div>';
    var promptNode = $("#prompt").length > 0 ? $("#prompt") : $(".prompt_" + sectionIndex)
    promptNode.html(promptHtml);
}

function AppendCaptionPromptText(caption, promptText) {
    var promptHtml = '<div class="captionPromptTxt">' + promptText + '</div>';
    caption.html(promptHtml);
}

function HidePromptText() {
    $("#prompt").html("");
}
//脱离文档流
function FixedTitleBox(flag){
    if(flag){
        $('.title_box').css({'position':'fixed','background':'#fff','z-index':'999','width':'815px'});
    }
}

function ShowWait() {
    Lightbox.utilShowHtml('<div style="background:url(images/wait.gif) no-repeat; width: 308px; height: 96px; padding: 45px 0 0 40px;"><img src="images/load.gif" width="48" height="48" /></div>');
}

function GetQuestionIndex() {
    var currentAction = Action.getCurrentAction();
    var schemaSection = CommObj.curPage.data.SchemaSection;
    var itemIndex = currentAction.itemIndex;
    var groupIndex = currentAction.groupIndex;
    var questionIndex = currentAction.questionIndex;
    var itemId = schemaSection.item[itemIndex].id;
    var questionId = schemaSection.item[itemIndex].group[groupIndex].question[questionIndex].id;
    var questIndexStr = "{0}|{1}|{2}|{3}";
    return String.format(questIndexStr, itemIndex, questionIndex, itemId, questionId);
}

function CheckIsFirstQuestion() {
    var currentAction = Action.getCurrentAction();
    return currentAction.questionIndex == 0;
}

function CheckIsNotFirstQuestion() {
    var currentAction = Action.getCurrentAction();
    return currentAction.questionIndex != 0;
}

function ViewNextPage(callback) { //查看下一页
    var currentAction = Action.getCurrentAction();
    Action.viewPage(currentAction.viewName, currentAction.viewPage + 1, null, callback);
}

function ViewSpecifiedPage(pageNumber, callback) { //查看指定页
    var currentAction = Action.getCurrentAction();
    Action.viewPage(currentAction.viewName, pageNumber, null, callback);
}

function GetPaperPath() { //获取试卷路径
    return $res("root:ExamineePath") + "paper\\";
}

function GetAnswerPath() { //获取答题路径
    return $res("root:ExamineePath") + "answer\\endata\\";
}

function GetComResPath() { //获取公共音频资源路径
    return GetPaperPath();
}

function GetRecordFileName() { //获取口语题录音文件
    return GetAnswerPath() + IntegrationUtil._ExamineeID + '@' +
        GetFileNameWithoutExt($res("xt:question>answer.answer")) + '@' +
        $res("mb:question>answer.sound");
}

function GetRecordDatFile() {
    return GetAnswerPath() + IntegrationUtil._ExamineeID + '@' +
        GetFileNameWithoutExt($res("xt:question>answer.answer")) + '@' +
        $res("mb:question>answer.distdat");
}

function GetPaperFile() {
    return GetPaperPath() + $res("mb:item.id") + "\\" + $res("xt:question>answer.answer");
}

//开始录音
function StartRecord(timeNode) {
    CEFWrapper.ShowStatus(ExamState.ListenInstruction);
    CEFWrapper.SyncPlay(GetPaperPath() + $res("mb:section>answer_prompt"), function () {
        CEFWrapper.ShowStatus(ExamState.Recording);
        CEFWrapper.Interrupt("enableFinishButton", timeNode.submittime);
        CEFWrapper.Interrupt("disableFinishButton", parseInt(timeNode.answertime) - 1);
        Action._isRecording = true;
        disablePauseButton(true);
        CEFWrapper.Record("Action.ContinueRun", timeNode.answertime, GetRecordFileName(), GetRecordDatFile(), GetPaperFile(), $res("xt:question>answer.type"));
    });
}

//多次播放音频
//callBackData：回调函数
//fileName:音频文件
//repeat:音频播放次数
//spanTime:音频播放间隙等待时间
//isPlayDi:是否播放“滴”声提示
function MultiplyPlay(fileName, repeat, spanTime, isPlayDi) {
    repeat = repeat || 1;
    spanTime = spanTime || 0;
    gFileName = fileName;
    if (isPlayDi) {
        CEFWrapper.ShowStatus(ExamState.ListenPrompt);
        CEFWrapper.SyncPlay(GetPaperPath() + $res("mb:section>jump_prompt"), function () {
            CEFWrapper.ShowStatus(ExamState.ListenPrompt);
            CEFWrapper.Play("multiplyplay" + "#" + spanTime + "#" + "" + "#" + (repeat - 1) + "#" + isPlayDi, fileName);
        });
    } else {
        CEFWrapper.ShowStatus(ExamState.ListenPrompt);
        CEFWrapper.Play("multiplyplay" + "#" + spanTime + "#" + "" + "#" + (repeat - 1) + "#" + isPlayDi, fileName);
    }
}

//显示手型图标
function PointToCurrentCaption(actionLevel,isMaginleft) {
    $("div.curCaption").removeClass("curCaption");
    $("div.curCaptionwithMargin").removeClass("curCaptionwithMargin");
    var curAction = Action.getCurrentAction();
    var fixStr;
    if (actionLevel == 'item') {
        fixStr = String.format("item{0}_{1}_{2}", curAction.itemIndex, curAction.groupIndex, curAction.questionIndex);
        Action._curCaptionId = "none";
    } else if (actionLevel == 'group') {
        fixStr = String.format("group{0}_{1}_{2}", curAction.itemIndex, curAction.groupIndex, curAction.questionIndex);
        Action._curCaptionId = "none";
    } else if (actionLevel == 'question') {
        fixStr = String.format("question{0}_{1}_{2}", curAction.itemIndex, curAction.groupIndex, curAction.questionIndex);
        Action._curCaptionId = "none";
    } else {
        fixStr = String.format("caption{0}_{1}_{2}", curAction.itemIndex, curAction.groupIndex, curAction.questionIndex);
        Action._curCaptionId = "none";
    }
    var caption = $("#" + fixStr);
    if (caption.length <= 0)
        return;
    if (isMaginleft){
        caption.addClass("curCaptionwithMargin");
    }else {
        caption.addClass("curCaption");
    }
    caption[0].scrollIntoView(true);
}


//听力显示答案
function ShowChoiceAnswer(fixStr, isShow) {
    if (isShow) {
        Action._curCaptionId = fixStr;
        $('.' + fixStr).filter('.jp_choiceAnswer').parent().parent().find('input[type=radio]:checked').trigger("click");
        $("." + fixStr).addClass("showAnswer");
    } else {
        $("span.showAnswer").removeClass("showAnswer");
        Action._curCaptionId = 'none';
        $("span.jp_isRight").removeClass("jp_isRight");
        $("span.jp_isWrong").removeClass("jp_isWrong");
    }
}

/**
 * 禁用上一题按钮
 */
function disablePreButton(disabled) {
    disableButton('#btnPre', disabled);
}
/**
 * 禁用下一题按钮
 */
function disableNextButton(disabled) {
    disableButton('#btnNext', disabled);
}

/**
 * 禁用暂停按钮
 */
function disablePauseButton(disabled) {
    disableButton('#btnStop', disabled);
}

/**
 * 禁用显示答案按钮
 */
function disableShowAnswerButton(disabled) {
    //disableButton('.btn_fgreen', disabled);
}
/**
 * 禁用提交答案按钮
 */
function disableSubmitButton(disabled) {
    //disableButton('.btn_fbblue', disabled);
}

/**
 * 禁用按钮
 */
function disableButton(el, disabled) {
    $(el).css('display', disabled ? 'none' : 'inline');
    $(el + '_dis').css('display', disabled ? 'inline' : 'none');
}

//是否显示跳过按钮
function IsShowJump(isShow) {
    if (isShow) {
        //TODO显示跳过按钮
    } else {
        //TODO隐藏跳过按钮
    }
}

function alertJSON(obj) {
    alert($.toJSON(obj));
}