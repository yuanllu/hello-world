/// <reference path="../common/jquery-1.4.1.js" />
/// <reference path="Lightbox.js" />

/*
* @author: szsheng
* @date: 2010/08/30
* @description: 页面流程控制
*/


function CtrlFunction(fn, args, isCallBack) {
    /// <summary>流程函数类构造</summary>
    /// <param name="fn" type="String|function">要调用的函数（名）</param> 
    /// <param name="args" type="Array">参数数组</param> 
    /// <param name="isCallBack" type="Boolean">是否在等待回调执行（如果是true，当前流程会中断，需要在回调函数中继续, 否则函数执行完成后继续调用下一流程函数）</param> 
    this.fn = fn;
    this.args = (arguments.length>1)? args : [];
    this.isCallBack = isCallBack ? true : false;

}

function FlowControl() {
    /// <summary>流程控制类构造</summary>    
    this.__functionIndex = 0;                                   //当前函数索引，私有
    this._isActive = false;                                     // 是否活动的（未执行完毕）
    this.functionList = [];                                     //array of CtrlFunction
}

FlowControl.startControl = function (flowControl) {
    /// <summary>启动流程</summary>
    /// <param name="flowControl" type="FlowControl">流程控制对象</param>
    flowControl.executeFunction();
};

FlowControl.prototype.OnExecuteEnd = function () {
    /// <summary>流程执行完毕回调事件，一般在实例中重写</summary>
};

FlowControl.prototype.executeFunction = function () {
    /// <summary>执行流程当前函数</summary>
    var _this = this;
    if (_this.__functionIndex < _this.functionList.length) {
        _this._isActive = true;
        var ctrlFn = this.functionList[_this.__functionIndex++];
        var fn = ctrlFn.fn;
        if (typeof fn === "string")
            fn = eval(fn);
        var args = [];
        //如果参数为function，则设置参数为function执行的结果
        $(ctrlFn.args).each(function (i) {
            var arg = this;
            if (typeof arg === "function")
                arg = arg();
            args.push(arg);
        });

        //apply函数的第一个参数应该是页面对象，如果为null，页面中的相关方法不要用 this 引用
        fn.apply(null, args);
        if (!ctrlFn.isCallBack) {
            //避免递归
            setTimeout(function () { _this.executeFunction(); }, 0);
        }
    }
    else {
        _this._isActive = false;
        _this.OnExecuteEnd();
    }
};

//考生过程状态对应的图片

var ExamState = {
    "AnswerQuestion": "请答题",
    "Blank": "",
    "Choose": "请选择",
    "ListenInstruction": "听指令",
    "ListenPrompt": "听语音",
    "Prepare": "答题准备",
    "ReadQuestion": "阅读题目",
    "Recording": "录音中",
    "Wait": "请等待",
    "WearHeadset": "",

};

//试卷节点元素标签名
var PaperElementTagName = { "subject": 0, "section": 1, "item": 2, "question": 3 };

//试卷资源类型标签名
var PaperResourceTagName = { "subject": 0, "Schema": 1, "concrete": 2 };

//考试页类构造
function ExamPageUtil() {
    this.itemIndex = 0;              //当前item索引
    this.groupIndex = 0;             //当前group索引
    this.questionIndex = 0;          //当前问题索引
    this.data = null;                //当前试题数据JSON
}

ExamPageUtil.prototype.init = function (callback) {
    CommObj.curPage = this;          //设置Comm中 PageUtil 引用
	//当前试题数据JSON
	CEFWrapper.GetClientData("getexamdata", function(data) {
		CommObj.curPage.data = EvalData(data);
		callback();
	})
};

ExamPageUtil.prototype.getSectionDataMember = function (propertyName) {
    /// <summary>获取当前大题的数据成员</summary>
    /// <param name="propertyName" type="String">属性名</param>
    /// <returns type="Function">要获取的成员的值</returns>
    var _this = this;
    var fn = function () {
        //        return _this.data[propertyName];
        var propertyVal = _this.data.SchemaSection[propertyName];
        return propertyVal;
    };
    return fn;
};

ExamPageUtil.prototype.showWait = function () {
    /// <summary>显示完成提示</summary>  
    Lightbox.utilShowHtml('<div style="background:url(images/wait.gif) no-repeat; width: 308px; height: 96px; padding: 45px 0 0 40px;"><img src="images/load.gif" width="48" height="48" /></div>');
};

ExamPageUtil.prototype.getElementTime = function (elementName, timeType, fixTime) {
    /// <summary>获取试卷相关时间</summary>
    /// <param name="elementName" type="Number">节点名称枚举值，请参照PaperElementTagName</param>
    /// <param name="timeType" type="String">时间类型</param>
    /// <param name="fixTime" type="Number">调整时间，可选</param>
    /// <returns type="Function">获取该时间的函数(会根据当前考题实时获取)</returns>
    var _this = this;
    var _fixTime = 0;
    if (arguments.length > 2)
        _fixTime = fixTime;
    var fn = function () {
        var result = 1; //如果有异常，则默认1秒
        var items = _this.data.ConcreteSection.item;
        var groups = _this.data.ConcreteSection.item[_this.itemIndex].group;
        var questions = _this.data.ConcreteSection.item[_this.itemIndex].group.question;
        try {
            if (elementName == PaperElementTagName.item) {
                result = items[_this.itemIndex][timeType];
            }
            else if (elementName == PaperElementTagName.group)
                result = groups[_this.groupIndex][timeType];
            else if (elementName == PaperElementTagName.question)
                result = questions[_this.questionIndex][timeType];
        } catch (ex) { }
        //        result = result + _fixTime;
        result = parseInt(result) + parseInt(_fixTime);
        if (result < 0)
            result = 0;
        return result;
    };
    return fn;
};

//ExamPageUtil.prototype.getElementTime = function (elementName, timeType, fixTime) {
//    /// <summary>获取试卷相关时间</summary>
//    /// <param name="elementName" type="Number">节点名称枚举值，请参照PaperElementTagName</param>
//    /// <param name="timeType" type="String">时间类型</param>
//    /// <param name="fixTime" type="Number">调整时间，可选</param>
//    /// <returns type="Function">获取该时间的函数(会根据当前考题实时获取)</returns>
//    var _this = this;
//    var _fixTime = 0;
//    if (arguments.length > 2)
//        _fixTime = fixTime;
//    var fn = function () {
//        var result = 1; //如果有异常，则默认1秒
//        try {
//            if (elementName == PaperElementTagName.item)
//                result = _this.data.items[_this.itemIndex][timeType];
//            else if (elementName == PaperElementTagName.question)
//                result = _this.data.items[_this.itemIndex].questions[_this.questionIndex][timeType];
//        } catch (ex) { }
//        result = result + _fixTime;
//        if (result < 0)
//            result = 0;
//        return result;
//    };
//    return fn;
//};
