/// <reference path="../common/jquery-1.4.1.js" />
/// <reference path="Models.js" />
/// <reference path="BridgingUtil.js" />
/*
* @author: szsheng
* @date: 2010/08/30
* @description: 页面共用JS文件
*/

var CommObj = {
    "curPage":null             //当前页对象
};

CommObj.invokePageFunction = function (functionName, args) {
    /// <summary>调用当前页对象的方法</summary>
    /// <param name="functionName" type="String">函数名</param>
    /// <param name="args" type="Array">参数数组</param>
    if (this.curPage) {
        var fn = this.curPage[functionName];
        if (typeof fn == "function")
            fn.apply(this.curPage, args);
    }
};

function CheckAnswer(questionId, radioBox) {
    /// <summary>点击选择答案</summary>
    /// <param name="questionId" type="String">小题ID</param> 
    /// <param name="radioBox" type="Element">选择项父容器</param>  
    var radio = $(radioBox).children(":radio")
    radio.attr("checked", true); //选中
    var answer = radio.val();
    var lastChoice = CommObj.curPage.__lastChoice;
    if (lastChoice && (lastChoice.questionId != questionId || lastChoice.answer != answer)) { //避免发送相同选择项
        lastChoice.questionId = questionId;
        lastChoice.answer = answer;
        SaveQuestionAnswer(questionId, answer);
    }
}

function multStyleButton() {
    /// <summary>按钮样式设置</summary>
    var arrClass = ["btn_blue", "btn_orange", "btn_green"];
    var arrClassHover = ["btn_blueHover", "btn_orangeHover", "btn_greenHover"];
    var arrClassDown = ["btn_blueDown", "btn_orangeDown", "btn_greenDown"];
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


/* --------------------------------------------------以下是通用函数------------------------------------------------------------- */

//JQuery 方法扩展
jQuery.fn.extend({
    disable: function (bDisable) {
        /// <summary>设置当前按钮是否可用</summary>
        /// <param name="bDisable" type="Boolean">true不可用，false可用</param>
        if(bDisable)
            this.addClass("disabled");
        else
            this.removeClass("disabled");
        this.attr("disabled", bDisable);
    }
});

jQuery.extend({
    toJSON: function (object) {
        var type = typeof object;
        if ('object' == type) {
            if (Array == object.constructor)
                type = 'array';
            else if (RegExp == object.constructor)
                type = 'regexp';
            else
                type = 'object';
        }
        switch (type) {
            case 'undefined':
            case 'unknown':
                return;
                break;
            case 'function':
            case 'boolean':
            case 'regexp':
                return object.toString();
                break;
            case 'number':
                return isFinite(object) ? object.toString() : 'null';
                break;
            case 'string':
                return '"' + object.replace(/(\\|\")/g, "\\$1").replace(/\n|\r|\t/g,
                    function () {
                        var a = arguments[0];
                        return (a == '\n') ? '\\n' :
                                   (a == '\r') ? '\\r' :
                                   (a == '\t') ? '\\t' : ""
                    }) + '"';
                break;
            case 'object':
                if (object === null) return 'null';
                var results = [];
                for (var property in object) {
                    var value = jQuery.toJSON(object[property]);
                    if (value !== undefined)
                        results.push(jQuery.toJSON(property) + ':' + value);
                }
                return '{' + results.join(',') + '}';
                break;
            case 'array':
                var results = [];
                for (var i = 0; i < object.length; i++) {
                    var value = jQuery.toJSON(object[i]);
                    if (value !== undefined) results.push(value);
                }
                return '[' + results.join(',') + ']';
                break;
        }
    }
});

//数据随机乱序
Array.prototype.random = function () {
    return this.sort(function () {
        return Math.random() > 0.5 ? -1 : 1;
    })
}

String.format = function () {
    if (arguments.length == 0)
        return null;
    var str = arguments[0];
    for (var i = 1; i < arguments.length; i++) {
        var re = new RegExp('\\{' + (i - 1) + '\\}', 'gm');
        str = str.replace(re, arguments[i]);
    }
    return str;
};

//按最大长度截断字符串，isDifCh表示是否区分汉字字符
String.prototype.cutOff = function (maxLen, isDifCh) {
    var tmpStr = "";
    var charLen = 0;
    var isOver = false;
    for (var i = 0, len = this.length; i < len; i++) {
        var ch = this.charAt(i);
        if (/[\u4e00-\u9fa5]/.test(ch)) //是汉字
            charLen += 1;
        else
            charLen += (isDifCh ? 0.5 : 1);
        if (charLen > maxLen) {
            isOver = true;
            break;
        }
        else
            tmpStr += ch;
    }
    if (isOver)
        tmpStr += "…";
    return tmpStr;
};

var Request = {
    QueryString: function (item) {
        var svalue = location.search.match(new RegExp("[\?\&]" + item + "=([^\&]*)(\&?)", "i"));
        return svalue ? svalue[1] : svalue;
    }
}

Date.prototype.format = function (pattern, isUTC) {
    function fs(num) {
        return num < 10 ? "0" + num : num.toString();
    }

    var year, month, date, hour, minute, second, milliSecond;
    if (isUTC) {
        year = this.getUTCFullYear();
        month = this.getUTCMonth();
        date = this.getUTCDate();
        hour = this.getUTCHours();
        minute = this.getUTCMinutes();
        second = this.getUTCSeconds();
        milliSecond = this.getUTCMilliseconds();
    }
    else {
        year = this.getFullYear();
        month = this.getMonth();
        date = this.getDate();
        hour = this.getHours();
        minute = this.getMinutes();
        second = this.getSeconds();
        milliSecond = this.getMilliseconds();
    }

    var s = pattern.replace(/yyyy/g, year);
    s = s.replace(/MM/g, fs(month + 1));
    s = s.replace(/dd/g, fs(date));
    s = s.replace(/hh/ig, fs(hour));
    s = s.replace(/mm/g, fs(minute));
    s = s.replace(/ss/g, fs(second));
    s = s.replace(/iii/g, milliSecond.toString())
    return s;
};

function checkRadio(element) {
    $(element).children(":radio").attr("checked", true);
}

function CreateActivex(arrActivexName) { //创建COM对象
    for (var i = 0, len = arrActivexName.length; i < len; i++) {
        try {
            var obj = new ActiveXObject(arrActivexName[i]);
            return obj; //如果没有异常,则返回创建后的对象
        } catch (e) {
        }
    }
    return null;
}


function GetFileExt(fileName) {
    if (fileName.lastIndexOf('.') > -1) {
        return fileName.substring(fileName.lastIndexOf('.'), fileName.length);
    }
    else {
        return '';
    }
}

function GetFileNameWithoutExt(fileName) {
    if (fileName.lastIndexOf('.') > -1) {
        return fileName.substring(0, fileName.lastIndexOf('.'));
    }
    else {
        return fileName;
    }
}

function ChangeFileExt(fileName, ext) {
    if (ext.indexOf('.') != 0)
        ext = "." + ext;
    return GetFileNameWithoutExt(fileName) + ext;
}

function AutoCenter(element) {
    var pwidth = $(element).parent().width();
    var pheight = $(element).parent().height();
    var iwidth = $(element).width();
    var iheight = $(element).height();
    if (pwidth <= iwidth || pheight <= iheight) {
        if (iwidth / pwidth > iheight / pheight) {
            $(element).css("width", pwidth).css("height", pwidth / iwidth * iheight);
            $(element).css("margin-top", (pheight - pwidth / iwidth * iheight) / 2 + "px");
        }
        else {
            $(element).css("width", pheight / iheight * iwidth).css("height", pheight);
            $(element).css("margin-left", (pwidth - pheight / iheight * iwidth) / 2 + "px");
        }
    }
    else {
        $(element).css("margin-left", (pwidth - iwidth) / 2 + "px");
        $(element).css("margin-top", (pheight - iheight) / 2 + "px");
    }
};

function ShowHeadphoneTips() {
	if ($('#headphone_tips').length == 0) {
		$('body').append('<div id="headphone_tips"><div class="pop_mask" style=""></div><div class="pop_body" style=""><div class="pop_box"><div class="pop_top"><div class="top_cen"><div class="top_title">提示</div><div class="clear"></div></div></div><div class="pop_cen"><p style="padding: 28px 28px 0 28px;;height: 95px;overflow-y: auto;display: table-cell;vertical-align: middle;">耳机设备已脱落，请检查耳机设备连接状态或举手报告监考老师</p></div></div></div></div>');
	} else {
		$('#headphone_tips').show();
	};
}

function HideHeadphoneTips() {
	$('#headphone_tips').hide();
}

function EvalData(data) {
    if (data)
        return eval("(" + data + ")");
    else
        return null;
}