/// <reference path="Cef.js" />
/*
* @author: shuhu
* @date: 2017/01/12
* @description: 对CEF操作的一次封装，为了和之前的代码兼容，防止过多的修改
*/

function SectionEnd(args,tag, callback) {
    /// <summary>大题结束</summary>
    CEFWrapper.SectionEnd(args, tag, callback);
}

function Interrupt(callBackData, waitTime, callback) {
    /// <summary>调用客户端方法进行计时</summary>
    /// <param name="callBackData" type="String">回调标识数据</param> 
    /// <param name="waitTime" type="Number">计时时间（秒）</param>      
	CEFWrapper.Interrupt(callBackData, waitTime, callback);
}

function Play(callBackData, fileName, callback) {
    /// <summary>调用客户端进行音频播放</summary>
    /// <param name="callBackData" type="String">回调标识数据</param> 
    /// <param name="fileName" type="String">音频文件名或者是获取文件名的函数</param>
    CEFWrapper.Play(callBackData, fileName, callback);
}

function SyncPlay(fileName, callback) {
    /// <summary>调用客户端进行音频播放（同步）</summary>
    /// <param name="fileName" type="String">音频文件名</param>
	CEFWrapper.SyncPlay(fileName, callback);
}

function WaitTime(callBackData, waitTime, showBar, callback) {
    /// <summary>调用客户端方法进行等待</summary>
    /// <param name="callBackData" type="String">回调标识数据</param> 
    /// <param name="waitTime" type="Number">等待时间（秒）</param>
    /// <param name="showBar" type="Boolean">是否显示进度条</param>
	CEFWrapper.WaitTime(callBackData, waitTime, showBar, callback);
}

function SyncWaitTime(callBackData, waitTime, showBar, callback) {
    /// <summary>调用客户端方法进行等待,倒计时数字一直显示</summary>
    /// <param name="callBackData" type="String">回调标识数据</param> 
    /// <param name="waitTime" type="Number">等待时间（秒）</param>
    /// <param name="showBar" type="Boolean">是否显示进度条</param>
    CEFWrapper.SyncWaitTime(callBackData, waitTime, showBar, callback);
}

function StopPlay(userData, callback) {
    /// <summary>让客户端停止音频播放</summary>
	CEFWrapper.StopPlay(userData, callback);
}

function Record(callBackData, recTime, soundFile, datFile, pprFile, EvalParam, callback) {
    /// <summary>调用客户端方法进行录音</summary>
    /// <param name="callBackData" type="String">回调标识数据</param> 
    /// <param name="recTime" type="Number">录音时间（秒）</param> 
    /// <param name="soundFile" type="String">录音文件名</param> 
    /// <param name="datFile" type="String">评测临时文件名</param>
    /// <param name="pprFile" type="String">评测试卷文件</param> 
    /// <param name="datFile" type="String">评测临时文件名</param>
	CEFWrapper.Record(callBackData, recTime, soundFile, datFile, pprFile, EvalParam, callback);
}

function StopRecord(callBackData, callback) {
    /// <summary>调用客户端停止录音</summary>
	CEFWrapper.StopRecord(callBackData, callback);
}

function SaveQuestionAnswer(questionId, answer, callback) {
    /// <summary>保存小题答案</summary>
    /// <param name="questionId" type="String">小题ID</param>
    /// <param name="answer" type="String">答案</param>
    CEFWrapper.SaveQuestionAnswer(questionId, answer, callback);
}

function SendQuestionIndex(qIndex, callback) {
    /// <summary>发送当前小题索引</summary>
    /// <param name="qIndex" type="Number">当前小题索引</param>
    CEFWrapper.SendQuestionIndex(qIndex, callback);
}

function ShowStatus(status, callback) {
    /// <summary>显示当前状态</summary>
    CEFWrapper.ShowStatus(status, callback);
}