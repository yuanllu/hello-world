/// <reference path="../common/jquery-1.4.1.js" />
/*
 * @author: shuhu
 * @date: 2017/01/35
 * @description: 页面共用JS文件
 */
var CEFWrapper = {
    __callClient: function (cmdName, cmdArgs, callback) {
        cmdArgs = ("" + cmdArgs) || "";
        callback = callback || null;
        var funcName = 'ExamClient.' + cmdName;

        try {
            if (callback) {
                var wrapper = function (name, args) {
                    callback(args[0]);
                };
                cef.message.sendMessage(funcName, [cmdArgs, '0']);
                cef.message.setMessageCallback(funcName, wrapper);
            } else {
                //无回调
                cef.message.sendMessage(funcName, [cmdArgs, '0']);
            }
        } catch (ex) {}
    }
};

var __evalData = function (data) {
    if (data)
        return eval("(" + data + ")");
    else
        return data;
};

CEFWrapper.GetClientData = function (key, callback) { //从客户端获取数据 
    this.__callClient("getdata", key, function (result) {
        callback(result);
    });
};

//CEFWrapper.GetClientSectionAnswers = function (sectionId, callback) {
//    this.__callClient("getsectionanswers", sectionId, callback);
//};

CEFWrapper.GetBreakPointData = function (callback) {
    this.GetClientData("getanswerposition", function (result) {
        callback(__evalData(result));
    });
};

CEFWrapper.SaveBreakPointInfo = function (info, callback) {
    /// <summary>保存小题答案</summary>
    /// <param name="questionId" type="String">小题ID</param>
    /// <param name="answer" type="String">答案</param>
    this.__callClient("saveanswerposition", info, callback);
};

CEFWrapper.GetClientVariable = function (key, callback) { //从客户端获取内存变量
    this.__callClient("gethashvalue", key, callback);
};

CEFWrapper.SaveClientVariable = function (key, value, callback) { //保存数据至客户端内存变量
    this.__callClient("savehashvalue", tmpStr, callback);
};

CEFWrapper.SectionEnd = function (args, tag, callback) {
    /// <summary>大题结束</summary>
    tag = tag || 0;
    this.__callClient("SectionEnd", args + "|" + tag, callback);
};

CEFWrapper.Interrupt = function (callBackData, waitTime, callback) {
    /// <summary>调用客户端方法进行计时</summary>
    /// <param name="callBackData" type="String">回调标识数据</param> 
    /// <param name="waitTime" type="Number">计时时间（秒）</param>      
    this.__callClient("Interrupt", callBackData + "|" + waitTime, callback);
};

CEFWrapper.Play = function (callBackData, fileName, callback) {
    /// <summary>调用客户端进行音频播放</summary>
    /// <param name="callBackData" type="String">回调标识数据</param> 
    /// <param name="fileName" type="String">音频文件名或者是获取文件名的函数</param>

    this.__callClient("Play", callBackData + "|" + fileName, callback);
};

CEFWrapper.WaitTime = function (callBackData, waitTime, showBar, callback) {
    /// <summary>调用客户端方法进行等待</summary>
    /// <param name="callBackData" type="String">回调标识数据</param> 
    /// <param name="waitTime" type="Number">等待时间（秒）</param>
    /// <param name="showBar" type="Boolean">是否显示进度条</param>
    this.__callClient("WaitTime", callBackData + "|" + waitTime + (showBar ? "|1" : "|0"), callback);
};

CEFWrapper.SyncWaitTime = function (callBackData, waitTime, showBar, callback) {
    /// <summary>调用客户端方法进行等待,倒计时数字一直显示</summary>
    /// <param name="callBackData" type="String">回调标识数据</param> 
    /// <param name="waitTime" type="Number">等待时间（秒）</param>
    /// <param name="showBar" type="Boolean">是否显示进度条</param>
    this.__callClient("CountDown", callBackData + "|" + waitTime + (showBar ? "|1" : "|0"), callback);
};

CEFWrapper.SyncPlay = function (fileName, callback) {
    /// <summary>同步播放音频功能，适用于少于10秒的短音频</summary>
    this.__callClient("SyncPlay", fileName, callback);
};

CEFWrapper.StopPlay = function (callBackData, callback) {
    /// <summary>让客户端停止音频播放</summary>
    this.__callClient("StopPlay", callBackData, callback);
};

CEFWrapper.Record = function (callBackData, recTime, soundFile, datFile, pprFile, EvalParam, callback) {
    /// <summary>调用客户端方法进行录音</summary>
    /// <param name="callBackData" type="String">回调标识数据</param> 
    /// <param name="recTime" type="Number">录音时间（秒）</param> 
    /// <param name="soundFile" type="String">录音文件名</param> 
    /// <param name="datFile" type="String">评测临时文件名</param>
    /// <param name="pprFile" type="String">评测试卷文件</param> 
    /// <param name="datFile" type="String">评测临时文件名</param>
    this.__callClient("Record", callBackData + "|" + recTime + "|" + soundFile + "|" + datFile + "|" + pprFile + "|" + EvalParam, callback);
};

CEFWrapper.StopRecord = function (callBackData, callback) {
    /// <summary>调用客户端停止录音</summary>
    this.__callClient("StopRecord", callBackData, callback);
};


CEFWrapper.SaveQuestionAnswer = function (questionId, answer, callback) {
    /// <summary>保存小题答案</summary>
    /// <param name="questionId" type="String">小题ID</param>
    /// <param name="answer" type="String">答案</param>
    this.__callClient("SaveQuestionAnswer", questionId + "|" + answer, callback);
};

CEFWrapper.SendQuestionIndex = function (qIndex, callback) {
    /// <summary>发送当前小题索引</summary>
    /// <param name="qIndex" type="Number">当前小题索引</param>
    this.__callClient("SendQuestionIndex", qIndex, callback);
};

CEFWrapper.ShowStatus = function (status, callback) {
    /// <summary>显示当前状态</summary>
    this.__callClient("ShowStatus", status, callback);
};

CEFWrapper.PlayVideo = function (callback) {
    /// <summary>播放视频</summary>
    this.__callClient("playvideo", "", callback);
};

CEFWrapper.StartSuccess = function (callback) {
    /// <summary>发送考试机启动成功状态</summary>
    this.__callClient("StartSuc", "", callback);
};

CEFWrapper.Login = function (type, data, callback) {
    /// <summary>登录请求</summary>
    /// <param name="type" type="String">登录请求类型1：准考证号登录，2：人脸特征登录</param>
    /// <param name="data" type="String">登录请求数据/param>
    this.__callClient("Login", type + '|' + data, callback);
};

CEFWrapper.Verify = function (examParam, callback) {
    /// <summary>登录确认的参数</summary>
    /// <summary>登录确认请求</summary>
    this.__callClient("Verify", examParam, callback);
};

CEFWrapper.WaitAudition = function (params, callback) {
    /// <summary>发送考试机启动成功状态</summary>
    this.__callClient("WaitAudition", params, callback);
};

CEFWrapper.DownloadPaper = function (params, callback) {
    /// <summary>下载考试试卷</summary>
    this.__callClient("DownloadPaper", params, callback);
};

CEFWrapper.DownloadAnswer = function (params, callback) {
    /// <summary>下载续考答卷包</summary>
    this.__callClient("DownloadAnswer", params, callback);
};

CEFWrapper.CheckAudio = function (params, callback) {
    /// <summary>下载考试试卷</summary>
    this.__callClient("CheckAudio", params, callback);
};

CEFWrapper.ShowVolumeAdjuster = function (params, callback) {
    /// <summary>设置音量调节控件是否显示</summary>
    this.__callClient("ShowVolumeAdjuster", params, callback);
};

CEFWrapper.AuditionResult = function (params, callback) {
    /// <summary>试音成功事件</summary>
    this.__callClient("AuditionResult", params, callback);
};

CEFWrapper.ClientEvaluate = function (params, callback) {
    /// <summary>客户端音质检测</summary>
    this.__callClient("ClientEvaluate", params, callback);
};

CEFWrapper.CompressOEF = function (params, callback) {
    /// <summary>生成考生答卷包</summary>
    this.__callClient("CompressOEF", params, callback);
};

CEFWrapper.UploadAnswer = function (params, callback) {
    /// <summary>上传考生答卷包</summary>
    this.__callClient("UploadAnswer", params, callback);
};

CEFWrapper.ServerEvaluate = function (params, callback) {
    /// <summary>服务端音质检测</summary>
    this.__callClient("ServerEvaluate", params, callback);
};

CEFWrapper.ExamEnd = function (params, callback) {
    /// <summary>服务端音质检测</summary>
    this.__callClient("ExamEnd", params, callback);
};

CEFWrapper.GetFaceRect = function (params, callback) {
    /// <summary>获取人脸位置</summary>
    this.__callClient("FaceRect", params, callback);
};

CEFWrapper.IdentityRecognize = function (params, callback) {
    /// <summary>考生人脸身份识别</summary>
    this.__callClient("IdentityRecognize", params, callback);
};

CEFWrapper.CaptureCamera = function (params, callback) {
    /// <summary>考生人脸身份识别</summary>
    this.__callClient("CaptureCamera", params, callback);
};

CEFWrapper.OpenEnglishIme = function (callback) {
    /// <summary>登录确认的参数</summary>
    /// <summary>登录确认请求</summary>
    this.__callClient("openenglishime", "", callback);
};

CEFWrapper.RecoveryEnd = function (params, callback) {
    /// <summary>恢复流程结束</summary>
    this.__callClient("RecoveryEnd", params, callback);
};

/*----------------------------北京答案检查功能接口---------------------------*/
CEFWrapper.GetListenSectionsExamData = function (callback) {
    this.GetClientData("getlistensections", function (result) {
        callback(__evalData(result));
    });
}

CEFWrapper.GetObjectAnswersExamData = function (callback) {
    this.GetClientData("getobjectanswers", function (result) {
        callback(__evalData(result));
    });
}
/*--------------------------End 北京答案检查接口--------------------------*/

/*----------------------------Begin 选项乱序功能相关接口---------------------------*/

CEFWrapper.GetRandomInfoData = function (secName, callback) {
    this.GetClientData("getrandominfo->" + secName, function (result) {
        callback(__evalData(result));
    });
}

CEFWrapper.SaveRandomInfo = function (key, jsonStr, callback) {
    this.__callClient("SaveRandomInfo", key + "|" + jsonStr, callback);
}
/*----------------------------End 选项乱序功能相关接口---------------------------*/

CEFWrapper.ShowFinishButton = function(param, callback){
	this.__callClient("FinishButton", param, callback);
}