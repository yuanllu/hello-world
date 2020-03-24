/// <reference path="../common/jquery-1.4.1.js" />
/// <reference path="../common/IntegrationModels.js" />
/// <reference path="../common/IntegrationComm.js" />
/// <reference path="../Integration.js" />
/*
 * @author: szsheng
 * @date: 2012/12/19
 * @description: View 公共类
 */

//View生成类
function ViewBuilder(jQueryObj) {
    this.QuestionObj = jQueryObj;
    this.QuestionObj.empty();
}

//等比拉伸图片
ViewBuilder.prototype.stretchImage = function (imgJqueryObj, maxWidth, maxHeight) {
    try {
        if (!imgJqueryObj) return;
        var imgWidth = imgJqueryObj.width();
        var imgHeight = imgJqueryObj.height();
        var scale = maxWidth / maxHeight;
        var imgScale = imgWidth / imgHeight;
        if (imgScale >= scale)
            imgJqueryObj.width(maxWidth);
        else
            imgJqueryObj.height(maxHeight);
    } catch (err) {
    }
};

//等比拉伸图片
ViewBuilder.prototype.stretchImage2 = function (imgJqueryObj, maxWidth, maxHeight) {
    try {
        if (!imgJqueryObj) return;

        console.log(imgJqueryObj);
        var imgWidth = imgJqueryObj.width();

        // var imgHeight = imgJqueryObj.height();
        if (imgWidth > maxWidth) {
            imgJqueryObj.width(maxWidth);
        }
        //var scale = maxWidth / maxHeight;
        // var imgScale = imgWidth / imgHeight;
        // if (imgScale >= scale)
        //     imgJqueryObj.width(maxWidth);
        // else
        //     imgJqueryObj.height(maxHeight);
    } catch (err) {
    }
};

//获取图片完整路径
ViewBuilder.prototype.getImageFullName = function (fileName) {
    return $res("root:ExamineePath") + "paper\\" + $res("mb:item.id") + "\\" + fileName;
};

//获取视频完整路径
ViewBuilder.prototype.getVideoFullName = function (fileName) {
    return $res("root:ExamineePath") + "paper\\" + $res("mb:item.id") + "\\" + fileName;
};

//添加含虚线的题号
ViewBuilder.prototype.Append_DashedNumber = function (number) {
    this.QuestionObj.append('<p class="dashedBottom">' + number + '.</p>');
};

//添加图片
ViewBuilder.prototype.Append_Image = function (imgFile, imgId, isHidden) {
    if (imgId) {
        if (isHidden) {
            this.QuestionObj.append('<div id="container_' + imgId + '"  style="text-align:center;visibility:hidden"><img  id="' + imgId + '" draggable="false" src="' + imgFile + '"/></div>');
        } else {
            this.QuestionObj.append('<div  style="text-align:center"><img  id="' + imgId + '" draggable="false" src="' + imgFile + '"/></div>');
        }
    } else {
        this.QuestionObj.append('<div  style="text-align:center"><img draggable="false" src="' + imgFile + '"/></div>');
    }
};

//添加视频
ViewBuilder.prototype.Append_Video = function (videoFile, maxWidth, maxHeight) {
    var arrHtml = [];
    maxWidth = maxWidth || 700;
    maxHeight = maxHeight || 400;
    arrHtml.push('<div style="text-align:center;">');
    arrHtml.push(String.format('<video id="Player" volumn="100" width="{0}px" height="{1}px" onended="UpdateVideo();" src="{2}">不能播放的视频文件</video>', maxWidth, maxHeight, videoFile));
    arrHtml.push('</div>');
    this.QuestionObj.append(arrHtml.join(''));
};

//添加文本（含html文本）
ViewBuilder.prototype.Append_Text = function (txt) {
    this.QuestionObj.append(txt);
};

//添加单词（数组形式）
ViewBuilder.prototype.Append_Words = function (arrWord) {
    var arrHtml = [];
    arrHtml.push('<div>');
    for (var i = 0; i < arrWord.length; i++) {
        arrHtml.push('<div class="singleword">');
        arrHtml.push(arrWord[i]);
        arrHtml.push('</div>');
    }
    arrHtml.push('<br style="clear:both;" />');
    arrHtml.push('</div>');
    this.QuestionObj.append(arrHtml.join(''));
};

ViewBuilder.prototype.Append_Caption = function (id) {
    return this.QuestionObj.append('<div id="' + id + '" class="caption"></div>');
};

ViewBuilder.prototype.Append_Caption_Lpc = function(id){
    return this.QuestionObj.append('<div id="' + id + '" style="padding-left: 110px;" class="caption"></div>');
};
ViewBuilder.prototype.Append_Caption_Rsp = function(id){
    return this.QuestionObj.append('<div id="' + id + '" style="font-size: 16px;color: rgba(102,102,102,1);font-weight: 400;line-height: 20px;margin-bottom: 15px;font-family: Microsoft YaHei" class="caption"></div>');
};
ViewBuilder.prototype.Append_Caption_Rsp2 = function(id){
    return this.QuestionObj.append('<div id="' + id + '" style="padding-bottom: 0px;" class="caption"></div>');
};
ViewBuilder.prototype.Append_DisableCaption = function (id) {
    return this.QuestionObj.append('<div id="' + id + '" class="caption" style="color:#545454;"></div>');
};

ViewBuilder.prototype.Append_InnerHtml = function (arrHtml) {
    this.QuestionObj.append(arrHtml.join(''));
};

ViewBuilder.prototype.Append_Caption_QuestionText = function (caption, questionNumber, questionText, className,outContainer) {
    className = className || "Caption_QuestionText";
    var arrHtml = [];
    arrHtml.push('<div class=' + className + '><h1 style="display:inline">' + questionNumber + '. ');
    arrHtml.push(questionText + '</h1>');
    arrHtml.push('<span style="float: right;width: 590px;" id='+outContainer+'></span>')
    caption.append(arrHtml.join(''));
    //    var arrHtml = [];
    //    arrHtml.push('<h1 style="vertical-align: top;">' + questionNumber + '.');
    //    arrHtml.push(questionText + '</h1>');
    //    caption.append(arrHtml.join(''));
};
ViewBuilder.prototype.Append_Caption_QuestionText1 = function (caption, questionNumber, questionText, className) {
    className = className || "Caption_QuestionText";
    var arrHtml = [];
    arrHtml.push('<div class=' + className + ' style="font-weight:bold;color:rgba(51,51,51,1);"><h1 style="display:inline-block;width: 5%;vertical-align: top;font-size:18px;">' + questionNumber + '. </h1>');
    arrHtml.push('<h1 style="display:inline-block;width: 95%;font-size:18px;">' + questionText + '</h1>');
    caption.append(arrHtml.join(''));
    //    var arrHtml = [];
    //    arrHtml.push('<h1 style="vertical-align: top;">' + questionNumber + '.');
    //    arrHtml.push(questionText + '</h1>');
    //    caption.append(arrHtml.join(''));
};
//阅读题添加题号
ViewBuilder.prototype.Append_Caption_QuestionTextReading = function (caption, questionNumber, questionText, className) {
    className = className || "TextReading_Content";
    // var arrHtml = [];
    // arrHtml.push('<div class=' + className + '><h1 style="display:inline;">' + questionNumber+'. ');
    // arrHtml.push(questionText + '</h1>');
    // caption.append(arrHtml.join(''));
    var arrHtml = [];
    arrHtml.push('<div class=' + className + '><h1 style="display:inline;">' + questionNumber + '.');
    arrHtml.push(questionText + '</h1>');
    arrHtml.push('</div>');
    vbld.Append_Text(htmlContent.join(''));
};

//选项支持图片
ViewBuilder.prototype.Append_Caption_QuestionTextWithPic = function (caption, questionNumber, questionText, questionPic, className) {
    className = className || "Caption_QuestionText";
    console.log(questionPic);
    var arrHtml = [];
    arrHtml.push('<div class=' + className + '><h1><font>' + questionNumber + '.</font></h1><h1>');
    arrHtml.push(questionText + '</h1>');
    if (typeof (questionPic) != "undefined") {

        arrHtml.push('<div style="text-align:left"><img style="height:150px;max-width:90%" src="' + this.getImageFullName(questionPic) + '"/></div>')
    }
    arrHtml.push('</div>');
    caption.append(arrHtml.join(''));
};

//选项T or F 和图片保持一致（选项一致）
ViewBuilder.prototype.Append_Caption_QuestionTextWithPic1 = function (caption, questionNumber, questionText, questionPic, className, outContainer) {
    className = className || "Caption_QuestionText";
    console.log(questionPic);
    var arrHtml = [];
    arrHtml.push('<div class=' + className + '><h1><font>' + questionNumber + '.</font></h1><h1>');
    arrHtml.push(questionText + '</h1>');
    if (typeof (questionPic) != "undefined") {
        arrHtml.push('<div id=' + outContainer + ' style="text-align:left">');
        arrHtml.push('<img style="max-height:120px;max-width:180px" src="' + this.getImageFullName(questionPic) + '"/>');
        arrHtml.push('</div>');
    }
    arrHtml.push('</div>');
    caption.append(arrHtml.join(''));
};
ViewBuilder.prototype.Append_QuestionTextPic = function (caption, image) {
    var arrHtml = '<div style="text-align:left"><img style="height:64px;max-width:90%;padding-left:120px" src="' + this.getImageFullName(image) + '"/></div>';
    caption.append(arrHtml);
};

ViewBuilder.prototype.Append_Caption_QuestionTextWithPlay = function (caption, questionNumber, questionText, className, musicName) {
    className = className || "Caption_QuestionText";
    var arrHtml = [];
    arrHtml.push('<div class=' + className + '><h1 style="display:inline;">' + questionNumber + '. ');
    arrHtml.push(questionText + '</h1>');
    //arrHtml.push(String.format('<span style="display:inline-block;vertical-align:middle;cursor:pointer" onclick="PlayMusic(\'{0}\',this)"><img alt="点击播放音乐" src="images/play.png" state="stop" style="height:30px;padding:0px 5px 8px"></span>',musicName));
    arrHtml.push(String.format('<input type="image" style="cursor:pointer;vertical-align:middle;margin-bottom:5px;" src="images/play.png" onclick="PlayMusic(\'{0}\',this)" state="stop"></input>', musicName));
    arrHtml.push('</div>');
    caption.append(arrHtml.join(''));
}


ViewBuilder.prototype.Append_Caption_QuestionTextWithoutNum = function (caption, questionText, className) {
    className = className || "Caption_QuestionText";
    var arrHtml = [];
    arrHtml.push('<div class=' + className + '><h1 style="display:inline-block;position:absolute;"></h1><h1>');
    arrHtml.push(questionText + '</h1></div>');
    caption.append(arrHtml.join(''));
};

ViewBuilder.prototype.Append_Caption_QuestionText_RSP = function (caption, questionNumber, questionText, className) {
    className = className || "Caption_QuestionText_RSP";
    var arrHtml = [];
    arrHtml.push('<div class=' + className + '><h1 style="display:inline-block;position:absolute;"><font>' + questionNumber + '.</font></h1><h1 style="padding-left:30px;">');
    arrHtml.push(questionText + '</h1></div>');
    caption.append(arrHtml.join(''));
    //    var arrHtml = [];
    //    arrHtml.push('<h1 style="vertical-align: top;">' + questionNumber + '.');
    //    arrHtml.push(questionText + '</h1>');
    //    caption.append(arrHtml.join(''));
};
ViewBuilder.prototype.Append_Caption_QuestionText_RSP1 = function (caption, questionNumber, questionText, questionPic, className) {
    className = className || "Caption_QuestionText_RSP";
    var arrHtml = [];
    arrHtml.push('<div class=' + className + '><h1 style="display:inline-block;"><font>' + questionNumber + '.</font><span>');
    arrHtml.push(questionText + '</span></h1><div style="text-align: center;margin-top: 20px"><h1>');
    arrHtml.push('<img style="max-height:400px;max-width:600px" src="' + this.getImageFullName(questionPic) + '"/></h1><h1>');
    caption.append(arrHtml.join(''));
};

ViewBuilder.prototype.Append_Caption_Text = function (caption, questionNumber, questionText) {
    var arrHtml = [];
    arrHtml.push('<font>' + questionNumber + '.</font><class="Caption_QuestionText">');
    arrHtml.push(questionText);
    caption.append(arrHtml.join(''));
    //    var arrHtml = [];
    //    arrHtml.push('<h1 style="vertical-align: top;">' + questionNumber + '.');
    //    arrHtml.push(questionText + '</h1>');
    //    caption.append(arrHtml.join(''));
};

ViewBuilder.prototype.Append_Caption_OnlyQuestionText = function (caption, questionText) {
    var arrHtml = [];
    arrHtml.push('<h1 class="Caption_QuestionText">');
    arrHtml.push(questionText + '</h1>');
    caption.append(arrHtml.join(''));
};

//添加文字
ViewBuilder.prototype.Append_Caption_OnlyText = function (caption, questionText) {
    caption.append(questionText);
};

//添加图片
ViewBuilder.prototype.Append_Caption_Image = function (caption, imgFile, imgId, isHidden) {
    if (imgId) {
        if (isHidden) {
            caption.append('<div id="container_' + imgId + '" style="text-align:center;visibility:hidden;"><img style="max-width: 600px;max-height: 300px;margin-bottom: 15px;" id="' + imgId + '" draggable="false" src="' + imgFile + '"/></div>');
        } else {
            caption.append('<div style="text-align:center;"><img id="' + imgId + '" draggable="false" src="' + imgFile + '"/></div>');
        }
    } else {
        caption.append('<div style="text-align:center;"><img draggable="false" src="' + imgFile + '"/></div>');
    }
};

//添加视频
ViewBuilder.prototype.Append_Caption_Video = function (caption, videoFile, maxWidth, maxHeight) {
    var arrHtml = [];
    maxWidth = maxWidth || 700;
    maxHeight = maxHeight || 400;
    arrHtml.push('<div style="text-align:center;">');
    arrHtml.push(String.format('<video id="Player" volumn="100" width="{0}px" height="{1}px" onended="UpdateVideo();" src="{2}">不能播放的视频文件</video>', maxWidth, maxHeight, videoFile));
    arrHtml.push('</div>');
    caption.append(arrHtml.join(''));
};

//添加选项
ViewBuilder.prototype.Append_Caption_QuestionChoice = function (caption, questionId, choiceName, arrChoice, needRand, showABC, isCheckAnswer, picWidth, picHeight, arrType, columns) {
    if (typeof (columns) == "undefined") {
        arrType = arrType || '0';
        var columns;
        if (arrType == '0') {
            columns = 1;
        } else {
            if (arrChoice.length == 3) {
                columns = 3;
            } else {
                columns = 2;
            }
        }
    }
    var wid = 100 / columns - 3;
    picWidth = picWidth || '82px';
    picHeight = picHeight || '60px';
    var rndArr = [];
    var arrHtml = [];
    var _this = this;
    $.each(arrChoice, function (i, choice) {
        var choiceValue = choice.choice;
        var choiceHtml = (choice.type == "pic") ? '<img src="' + _this.getImageFullName(choiceValue) + '" align="absmiddle" style="width:' + picWidth + ';height:' + picHeight + ';"/>' : choiceValue;
        var clickFun = "CheckAnswer";
        var strChoice = String.format('<span class="radio_btn radio_normal" style="display:inline-block;vertical-align: middle;width:{6}%" onclick="{5}(\'{0}\',this);FixRadioClass(\'{1}\');" onmouseover="$(this).addClass(\'cur\')" onmouseout="$(this).removeClass(\'cur\')"><input name="{1}" type="radio" value="{2}" style="margin-right: 8px"/>{3}. {4}</span> ', questionId, choiceName, i, "#num#", choiceHtml, clickFun, wid);
        rndArr.push(strChoice);
    });

    // 选项乱序
    var indexList = [];
    if ($res('mb:section').randomItem && $res('mb:section').randomItem['choice_' + questionId])
        indexList = $res('mb:section').randomItem['choice_' + questionId];

    var tempArr = [];
    // 必须两个列表数量一样才进行乱序处理
    if (indexList.length == rndArr.length) {
        for (var k = 0; k < rndArr.length; k++) {
            tempArr.push(rndArr[indexList[k]]);
        }
        rndArr = tempArr;
    }

    if (typeof (showABC) == "undefined") {
        showABC = true;
    }
    var randomIndexArr = [];
    $.each(rndArr, function (n, item) {
        var input = $(item).find("input[type='radio']")[0];
        randomIndexArr.push($(input).val());
        if (showABC) {
            item = item.replace(/#num#/g, String.fromCharCode(65 + n));
        } else {
            item = item.replace(/#num#./g, "");
        }
        arrHtml.push(item);
    });
    var p = $('<p/>');
    caption.append(p);

    var htmlEle = [];
    for (var i = 0; i < rndArr.length;) {
        htmlEle.push('<div>');
        for (var j = 0; j < columns; j++) {
            htmlEle.push(arrHtml[i + j]);
        }
        htmlEle.push('</div>');
        i = i + parseInt(columns);
    }
    p.append(htmlEle.join(''));
};
ViewBuilder.prototype.Append_Caption_QuestionText_RSR = function (caption, questionNumber, questionText, className) {
    className = className || "Caption_QuestionText_RSR";
    var arrHtml = [];
    arrHtml.push('<div style="margin-top: 200px;" class=' + className + '><h1 style="display:inline-block;position:absolute;font-size: 20px"><font>' + questionNumber + '.</font></h1><h1 style="padding-left:30px;font-size: 20px">');
    arrHtml.push(questionText + '</h1></div>');
    caption.append(arrHtml.join(''));
};

ViewBuilder.prototype.Append_Caption_QuestionText_RWR = function (caption, questionPic, className) {
    className = className || "Caption_QuestionText_RWR";
    var arrHtml = [];
    arrHtml.push('<div class=' + className + '><h1 style="display:inline-block;position:absolute;"></h1><div style="text-align: center;margin-top: 80px;"><h1>');
    arrHtml.push('<img style="max-height:300px;max-width:450px" src="' + this.getImageFullName(questionPic) + '"/></h1>');

    caption.append(arrHtml.join(''));
};


//添加选项
ViewBuilder.prototype.Append_Caption_QuestionChoiceMk = function (caption, questionId, choiceName, arrChoice, needRand, showABC) {
    var rndArr = [];
    var arrHtml = [];
    var _this = this;
    $.each(arrChoice, function (i, choice) {
        var choiceValue = choice.choice;
        var choiceHtml = (choice.type == "pic") ? '<img src="' + _this.getImageFullName(choiceValue) + '" align="absmiddle" style="max-width:160px;max-height:110px;"/>' : choiceValue;
        var strChoice = String.format('<span class="radio_btn radio_normal" style="vertical-align: middle;" onclick="CheckAnswer(\'{0}\',this);FixRadioClass(\'{1}\');" onmouseover="$(this).addClass(\'cur\')" onmouseout="$(this).removeClass(\'cur\')"><input name="{1}" type="radio" value="{2}" />{3}. {4}</span> ', questionId, choiceName, i, "#num#", choiceHtml);
        rndArr.push(strChoice);
    });
    if (needRand) {
        rndArr.random();
    }
    showABC = showABC || true;
    $.each(rndArr, function (n, item) {
        if (showABC) {
            item = item.replace(/#num#/g, String.fromCharCode(65 + n));
        }
        arrHtml.push(item);
    });
    var p = $('<p/>');
    caption.append(p);
    p.append(arrHtml.join(''));
};

//添加选项T or F
ViewBuilder.prototype.Append_Caption_QuestionChoice1 = function (caption, questionId, choiceName, arrChoice, needRand, showABC, isCheckAnswer, picWidth, picHeight, arrType, columns) {
    if (typeof (columns) == "undefined") {
        arrType = arrType || '0';
        var columns;
        if (arrType == '0') {
            columns = 1;
        } else {
            if (arrChoice.length == 3) {
                columns = 3;
            } else {
                columns = 2;
            }
        }
    }
    var wid = 100 / columns - 5;
    picWidth = picWidth || '82px';
    picHeight = picHeight || '60px';
    var rndArr = [];
    var arrHtml = [];
    var _this = this;
    $.each(arrChoice, function (i, choice) {
        var choiceValue = choice.choice;
        var choiceHtml = (choice.type == "pic") ? '<img src="' + _this.getImageFullName(choiceValue) + '" align="absmiddle" style="width:' + picWidth + ';height:' + picHeight + ';"/>' : choiceValue;
        var clickFun = "CheckAnswer";
        if (i == 0) {
            var strChoice = String.format('<span class="radio_btn radio_normal" style=" margin-left:140px;vertical-align: middle;width:{6}%" onclick="{5}(\'{0}\',this);FixRadioClass(\'{1}\');" onmouseover="$(this).addClass(\'cur\')" onmouseout="$(this).removeClass(\'cur\')"><input name="{1}" type="radio" value="{2}" style="margin-right: 8px"/>{3}. {4}</span> ', questionId, choiceName, i, "#num#", choiceHtml, clickFun, wid);
        } else {
            var strChoice = String.format('<span class="radio_btn radio_normal" style=" margin-left:140px;vertical-align: middle;width:{6}%" onclick="{5}(\'{0}\',this);FixRadioClass(\'{1}\');" onmouseover="$(this).addClass(\'cur\')" onmouseout="$(this).removeClass(\'cur\')"><input name="{1}" type="radio" value="{2}" style="margin-right: 8px"/>{3}. {4}</span> ', questionId, choiceName, i, "#num#", choiceHtml, clickFun, wid);
        }
        rndArr.push(strChoice);
    });

    // 选项乱序
    var indexList = [];
    if ($res('mb:section').randomItem && $res('mb:section').randomItem['choice_' + questionId])
        indexList = $res('mb:section').randomItem['choice_' + questionId];

    var tempArr = [];
    // 必须两个列表数量一样才进行乱序处理
    if (indexList.length == rndArr.length) {
        for (var k = 0; k < rndArr.length; k++) {
            tempArr.push(rndArr[indexList[k]]);
        }
        rndArr = tempArr;
    }

    if (typeof (showABC) == "undefined") {
        showABC = true;
    }

    // showABC = showABC || true;

    var randomIndexArr = [];
    var arr = new Array("84", "70");
    // var choiceType = ['T','F'];
    $.each(rndArr, function (n, item) {
        var input = $(item).find("input[type='radio']")[0];
        randomIndexArr.push($(input).val());
        if (showABC) {
            item = item.replace(/#num#./g, String.fromCharCode(arr[n]));
        } else {
            item = item.replace(/#num#./g, "");
        }
        arrHtml.push(item);
    });
    var p = $('<span style="display: inline;float: right;margin-right: 108px;margin-top: 30px;" />');
    caption.append(p);

    var htmlEle = [];
    for (var i = 0; i < rndArr.length;) {
        for (var j = 0; j < columns; j++) {
            htmlEle.push(arrHtml[i + j]);
        }
        i = i + parseInt(columns);
    }
    p.append(htmlEle.join(''));
};


ViewBuilder.prototype.Append_DisableCaption_QuestionChoice = function (caption, questionId, choiceName, arrChoice, needRand, showABC, picWidth, picHeight) {
    picWidth = picWidth || '82px';
    picHeight = picHeight || '60px';
    var rndArr = [];
    var arrHtml = [];
    var _this = this;
    $.each(arrChoice, function (i, choice) {
        var choiceValue = choice.choice;
        var choiceHtml = (choice.type == "pic") ? '<img src="' + _this.getImageFullName(choiceValue) + '" align="absmiddle" style="width:' + picWidth + ';height:' + picHeight + ';"/>' : choiceValue;
        var strChoice = String.format('<span class="radio_btn radio_normal" style="vertical-align: middle;"><input name="{1}" type="radio" disabled="true" value="{2}" />{3}. {4}</span> ', questionId, choiceName, i, "#num#", choiceHtml);
        rndArr.push(strChoice);
    });

    // 选项乱序
    var indexList = [];
    if ($res('mb:section').randomItem && $res('mb:section').randomItem['choice_' + questionId])
        indexList = $res('mb:section').randomItem['choice_' + questionId];

    var tempArr = [];
    // 必须两个列表数量一样才进行乱序处理
    if (indexList.length == rndArr.length) {
        for (var k = 0; k < rndArr.length; k++) {
            tempArr.push(rndArr[indexList[k]]);
        }
        rndArr = tempArr;
    }

    showABC = showABC || true;
    $.each(rndArr, function (n, item) {
        if (showABC) {
            item = item.replace(/#num#/g, String.fromCharCode(65 + n));
        }
        arrHtml.push(item);
    });
    var p = $('<p/>');
    caption.append(p);
    p.append(arrHtml.join(''));
};


ViewBuilder.prototype.Append_Caption_PicQuestionChoice = function (caption, questionId, choiceName, arrChoice, needRand, showABC) {
    var rndArr = [];
    var arrHtml = [];
    var _this = this;
    $.each(arrChoice, function (i, choice) {
        var choiceValue = choice.choice;
        var choiceHtml = (choice.type == "pic") ? '<img src="' + _this.getImageFullName(choiceValue) + '" align="absmiddle" style="width:80px;height:68px;"/>' : choiceValue;
        var strChoice = String.format('<span class="radio_btn radio_normal" style="vertical-align: middle;" onclick="CheckAnswer(\'{0}\',this);FixRadioClass(\'{1}\');" onmouseover="$(this).addClass(\'cur\')" onmouseout="$(this).removeClass(\'cur\')"><input name="{1}" type="radio" value="{2}" />{3}. {4}</span> ', questionId, choiceName, i, "#num#", choiceHtml);
        rndArr.push(strChoice);
    });

    // 选项乱序
    var indexList = [];
    if ($res('mb:section').randomItem && $res('mb:section').randomItem['choice_' + questionId])
        indexList = $res('mb:section').randomItem['choice_' + questionId];

    var tempArr = [];
    // 必须两个列表数量一样才进行乱序处理
    if (indexList.length == rndArr.length) {
        for (var k = 0; k < rndArr.length; k++) {
            tempArr.push(rndArr[indexList[k]]);
        }
        rndArr = tempArr;
    }

    showABC = showABC || true;
    $.each(rndArr, function (n, item) {
        if (showABC) {
            item = item.replace(/#num#/g, String.fromCharCode(65 + n));
        }
        arrHtml.push(item);
    });
    var p = $('<p/>');
    caption.append(p);
    p.append(arrHtml.join(''));
};

ViewBuilder.prototype.Append_Caption_OnlyNumber = function (caption, questionNumber, className) {
    if (className) {
        caption.append(String.format('<div class="{0}"><h1>{1}.</h1></div>', className, questionNumber));
    } else {
        caption.append('<div class="Caption_Number"><h1>' + questionNumber + '.</h1></div>');
    }
};

//只有选项和题号
ViewBuilder.prototype.Append_Caption_QuestionChoice_IncludeNum = function (caption, questionNumber, questionId, choiceName, arrChoice, needRand, showABC) {
    var rndArr = [];
    var arrHtml = [];
    var _this = this;
    //var p = $('<p/>');
    //caption.append(p);
    arrHtml.push('<h1><font>' + questionNumber + '.</font></h1>');
    $.each(arrChoice, function (i, choice) {
        var choiceValue = choice.choice;
        var choiceHtml = (choice.type == "pic") ? '<img src="' + _this.getImageFullName(choiceValue) + '" align="absmiddle" style="width:60px;height:60px;"/>' : choiceValue;
        var strChoice = String.format('<span class="radio_btn radio_normal" style="vertical-align: middle;" onclick="CheckAnswer(\'{0}\',this);FixRadioClass(\'{1}\');" onmouseover="$(this).addClass(\'cur\')" onmouseout="$(this).removeClass(\'cur\')"><input name="{1}" type="radio" value="{2}" />{3}. {4}</span> ', questionId, choiceName, i, "#num#", choiceHtml);
        rndArr.push(strChoice);
    });

    // 选项乱序
    var indexList = [];
    if ($res('mb:section').randomItem && $res('mb:section').randomItem['choice_' + questionId])
        indexList = $res('mb:section').randomItem['choice_' + questionId];

    var tempArr = [];
    // 必须两个列表数量一样才进行乱序处理
    if (indexList.length == rndArr.length) {
        for (var k = 0; k < rndArr.length; k++) {
            tempArr.push(rndArr[indexList[k]]);
        }
        rndArr = tempArr;
    }

    showABC = showABC || true;
    $.each(rndArr, function (n, item) {
        if (showABC) {
            item = item.replace(/#num#/g, String.fromCharCode(65 + n));
        }
        arrHtml.push(item);
    });
    caption.append(arrHtml.join(''));
};

//添加描述信息
ViewBuilder.prototype.Append_Caption_DiscriptionText = function (caption, descriptiontext, descriptionId) {
    var arrHtml = [];
    if (descriptionId) {
        arrHtml.push('<div id="' + descriptionId + '" class="Caption_DiscriptionText">');
        arrHtml.push('<span>' + descriptiontext + '</span>');
        arrHtml.push('</div>');
        caption.append(arrHtml.join(''));
    } else {
        var div = $('<div class="Caption_DiscriptionText"/>');
        arrHtml.push('<span>' + descriptiontext + '</span>');
        caption.append(div)
        div.append(arrHtml.join(''));
    }
};

//无ABC的选项
ViewBuilder.prototype.Append_Caption_QuestionChoice_NoIndex = function (caption, questionId, choiceName, arrChoice, needRand, showABC) {
    var rndArr = [];
    var arrHtml = [];
    var _this = this;
    $.each(arrChoice, function (i, choice) {
        var choiceValue = choice.choice;
        var choiceHtml = (choice.type == "pic") ? '<img src="' + _this.getImageFullName(choiceValue) + '" align="absmiddle" style="width:60px;height:60px;"/>' : choiceValue;
        var strChoice = String.format('<span class="radio_btn radio_normal" onclick="CheckAnswer(\'{0}\',this);FixRadioClass(\'{1}\');" onmouseover="$(this).addClass(\'cur\')" onmouseout="$(this).removeClass(\'cur\')"><input name="{1}" type="radio" value="{2}" /> {3}</span>', questionId, choiceName, i, choiceHtml);
        rndArr.push(strChoice);
    });

    // 选项乱序
    var indexList = [];
    if ($res('mb:section').randomItem && $res('mb:section').randomItem['choice_' + questionId])
        indexList = $res('mb:section').randomItem['choice_' + questionId];

    var tempArr = [];
    // 必须两个列表数量一样才进行乱序处理
    if (indexList.length == rndArr.length) {
        for (var k = 0; k < rndArr.length; k++) {
            tempArr.push(rndArr[indexList[k]]);
        }
        rndArr = tempArr;
    }

    showABC = showABC || true;
    $.each(rndArr, function (n, item) {
        if (showABC) {
            item = item.replace(/#num#/g, String.fromCharCode(65 + n));
        }
        arrHtml.push(item);
    });

    var p = $('<p/>');
    caption.append(p);
    p.append(arrHtml.join(''));
};

//无ABC的选项,选项宽度固定
ViewBuilder.prototype.Append_Caption_QuestionChoice_NoIndex_PinWidth = function (caption, questionId, choiceName, arrChoice, needRand, pinWidth, showABC) {
    var rndArr = [];
    var arrHtml = [];
    var _this = this;
    $.each(arrChoice, function (i, choice) {
        var choiceValue = choice.choice;
        var choiceHtml = (choice.type == "pic") ? '<img src="' + _this.getImageFullName(choiceValue) + '" align="absmiddle" style="width:60px;height:60px;"/>' : choiceValue;
        if (pinWidth) {
            var strChoice = String.format('<span class="radio_btn radio_normal" onclick="CheckAnswer(\'{0}\',this);FixRadioClass(\'{1}\');" onmouseover="$(this).addClass(\'cur\')" onmouseout="$(this).removeClass(\'cur\')" style="display:inline-block;width:{2}px;"><input name="{1}" type="radio" value="{3}" /> {4}</span>', questionId, choiceName, pinWidth, i, choiceHtml);
            rndArr.push(strChoice);
        } else {
            var strChoice = String.format('<span class="radio_btn radio_normal" onclick="CheckAnswer(\'{0}\',this);FixRadioClass(\'{1}\');" onmouseover="$(this).addClass(\'cur\')" onmouseout="$(this).removeClass(\'cur\')"><input name="{1}" type="radio" value="{2}" /> {3}</span>', questionId, choiceName, i, choiceHtml);
            rndArr.push(strChoice);
        }
    });

    // 选项乱序
    var indexList = [];
    if ($res('mb:section').randomItem && $res('mb:section').randomItem['choice_' + questionId])
        indexList = $res('mb:section').randomItem['choice_' + questionId];

    var tempArr = [];
    // 必须两个列表数量一样才进行乱序处理
    if (indexList.length == rndArr.length) {
        for (var k = 0; k < rndArr.length; k++) {
            tempArr.push(rndArr[indexList[k]]);
        }
        rndArr = tempArr;
    }

    showABC = showABC || true;
    $.each(rndArr, function (n, item) {
        if (showABC) {
            item = item.replace(/#num#/g, String.fromCharCode(65 + n));
        }
        arrHtml.push(item);
    });

    var p = $('<p/>');
    caption.append(p);
    p.append(arrHtml.join(''));
};


//添加导航栏
//zcsun2
//10点50分
ViewBuilder.prototype.Append_Navigation = function (caption, group) {
    var arrHtml = [];
    arrHtml.push('<ul class="answer-sheet-num">');
    arrHtml.push('<li><a class="describe">答题卡:</a></li>');
    $.each(group.question, function (questionIndex, question) {
        var temp = String.format('<li><a questionId={0} onclick="Navigate(\'{1}\')" class="answer-none">{2}</a></li>', question.id, questionIndex, questionIndex + 1);
        arrHtml.push(temp);
    });
    arrHtml.push('</ul>');

    caption.append(arrHtml.join(''));

};


ViewBuilder.prototype.Append_Caption_ItemText = function (caption, itemText) {
    var arrHtml = [];
    var div = $('<div/>');
    arrHtml.push(String.format('<span>{0}</span>', itemText));
    caption.append(div);
    div.append(arrHtml.join(''));
};

ViewBuilder.prototype.Append_Caption_TopicContent = function (caption, topicContent, maxWidth, maxHeight) {
    if (!topicContent) {
        return;
    }
    maxWidth = maxWidth || 700;
    maxHeight = maxHeight || 400;
    var _this = this;
    if (topicContent.type === "pic") {
        _this.Append_Caption_Image(caption, _this.getImageFullName(topicContent.data), "picviewer", true);
        document.getElementById("picviewer").onload = function () {
            _this.stretchImage2($("#container_picviewer>img"), maxWidth, maxHeight);
            $("#container_picviewer").css("visibility", "visible");
        };
    } else if (topicContent.type === "video") {
        _this.Append_Caption_Video(caption, _this.getVideoFullName(topicContent.data), maxWidth, maxHeight);
        var player = document.getElementById("Player");
        player.play();
    } else {
        _this.Append_Caption_OnlyText(caption, topicContent.data);
    }
};

ViewBuilder.prototype.Append_Caption_TopicContentForLpc = function (caption, contentArr) {
    if (contentArr.length <= 0) {
        return;
    }
    var _this = this;
    var html = [];
    html.push('<table width="100%"><tr>');
    $.each(contentArr, function (index, item) {
        html.push('<td align="center"><img style="max-width: 135px;max-height: 150px" draggable="false" src="' + _this.getImageFullName(item.data) + '"/></td>');
    });
    html.push('<tr>');
    $.each(contentArr, function (index, item) {
        html.push('<td align="center">'+item.undernum+'</td>');
    });
    html.push(' </tr></table>');
    caption.append(html.join(''));
};

//添加情景内容
ViewBuilder.prototype.Append_TopicContent = function (topicContent, maxWidth, maxHeight, contentClass) {
    if (!topicContent) {
        return;
    }
    var _this = this;
    maxWidth = maxWidth || 700;
    maxHeight = maxHeight || 400;
    if (topicContent.type === "pic") {
        _this.Append_Image(_this.getImageFullName(topicContent.data), "picviewer", true);
        document.getElementById("picviewer").onload = function () {
            _this.stretchImage($("#question>div>img"), maxWidth, maxHeight);
            $("#container_picviewer").css("visibility", "visible");
        };
    } else if (topicContent.type === "video") {
        _this.Append_Video(_this.getVideoFullName(topicContent.data), maxWidth, maxHeight);
        var player = document.getElementById("Player");
        player.play();
    } else {
        var topicData = [];
        var contentArr = topicContent.data.split('<br>');
        var htmlArr = [];
        $.each(contentArr, function (index, item) {
            htmlArr.push('<div style="text-indent:30px;">' + item + '</div>');
        });
        topicData.push('<div class="' + contentClass + '">');
        topicData.push('<div>要点提示：</div>' + htmlArr.join(''));
        topicData.push('</div>');
        _this.Append_Text(topicData.join(''));
    }
};

//添加页面标识
ViewBuilder.prototype.Append_ViewPageFlag = function (flagId) {
    this.QuestionObj.append('<input id="' + flagId + '" type="hidden" />');
};

//获取view页面的HTML
ViewBuilder.prototype.toHtml = function () {
    return this.QuestionObj.html();
};

//选择项单独一行
ViewBuilder.prototype.VerticalChoice = function (matchStr) {
    if (matchStr) {
        $(matchStr).each(function (i) {
            var inHtml = this.parentNode.innerHTML;
            inHtml = inHtml.replace(/(<span[^>]*>)/ig, '<p>$1');
            inHtml = inHtml.replace(/<\/span>/ig, '</span></p>');
            this.parentNode.innerHTML = inHtml;
        });
    } else {
        $("div.caption>p").each(function (i) {
            var inHtml = this.parentNode.innerHTML;
            inHtml = inHtml.replace(/(<span[^>]*>)/ig, '<p>$1');
            inHtml = inHtml.replace(/<\/span>/ig, '</span></p>');
            this.parentNode.innerHTML = inHtml;
        });
    }
};

//一行显示不下才换行
ViewBuilder.prototype.AutoChoice = function (matchStr) {
    if (matchStr) {
        $(matchStr).each(function (i) {
            var inHtml = this.parentNode.innerHTML;
            var maxSingleLineHeight = /\<img/i.test(inHtml) ? 90 : 40;
            if (this.offsetHeight > maxSingleLineHeight) {
                inHtml = inHtml.replace(/(<span[^>]*>)/ig, '<p>$1');
                inHtml = inHtml.replace(/<\/span>/ig, '</span></p>');
                this.parentNode.innerHTML = inHtml;
            }
        });
    } else {
        $("div.caption>p").each(function (i) {
            var inHtml = this.parentNode.innerHTML;
            var maxSingleLineHeight = /\<img/i.test(inHtml) ? 150 : 40;
            if (this.offsetHeight > maxSingleLineHeight) {
                inHtml = inHtml.replace(/(<span[^>]*>)/ig, '<p>$1');
                inHtml = inHtml.replace(/<\/span>/ig, '</span></p>');
                this.parentNode.innerHTML = inHtml;
            }
        });
    }
};

//格式化选项
ViewBuilder.prototype.FormatChoice = function (category, defaultValue, matchStr) {
    category = category || defaultValue;
    switch (category) {
        case "vertical":
            this.VerticalChoice(matchStr);
            break;
        case "auto":
            this.AutoChoice(matchStr);
            break;
    }
    ;
};


//zcsun2 美术题型
ViewBuilder.prototype.Append_MslxContentDiv = function () {
    var html = '<div id="contentDiv" class="container pt10">' +
        '<div class="showBox">' +
        '<div class="leftBox"></div>' +
        '<div class="rightBox"></div>' +
        '<canvas class="sureCva"></canvas>' +
        '<canvas class="backCva"></canvas>' +
        '</div>' +
        '</div>';
    this.QuestionObj.append(html);
};
ViewBuilder.prototype.Append_MslxContentDiv_Pic = function (container, pic, questionId, num) {
    var _this = this;
    var dataId = 'L' + (++num);
    var picName = pic.data;
    var picPath = _this.getImageFullName(picName);
    var html = '<span class="boxItem" data-id="' + dataId + '" id="' + questionId + '">' +
        '<img style="width:90%;height:100%;padding:0px;border-radius:10px;" onmouseover="this.style.border=\'1px solid blue\'" onmouseout="this.style.border=\'none\'" src="' + picPath + '"/>' +
        '<div class="defaultL"></div>' +
        '</span>';
    container.append(html);
};
ViewBuilder.prototype.Append_MslxContentDiv_Choice = function (container, choice, num) {
    var dataId = 'R' + (++num);
    var html = '<span class="boxItem" data-id="' + dataId + '" num="' + num + '">' +
        '<div class="defaultR"></div>' +
        '<label style="position:relative;top:31px">' + choice + '</label>' +
        '</sapn>';
    container.append(html);
};
//美术拖拽题
ViewBuilder.prototype.Append_Container = function (name) {

    var html = '<div id="' + name + '" style="width:800px;height:400px;">' +
        '<div id="titleAnswer" style="height:150px"></div>' +
        '<div id="titleNum"></div>' +
        '<div id="titlePic"></div>' +
        '</div>';
    this.QuestionObj.append(html);
};
ViewBuilder.prototype.Append_Container_TitleAnswer = function (container, questionId) {
    var html = '<div id="' + questionId + '" class="fillimg"></div>';
    container.append(html);
};
ViewBuilder.prototype.Append_Container_TitleNum = function (container, num) {
    var html = '<div class="num">' +
        '<label>' + num + '</label>' +
        '</div>';
    container.append(html);
};
ViewBuilder.prototype.Append_Container_TitlePic = function (container, pic) {
    var _this = this;
    var html = '<div class="imgDiv">' +
        '<img class="img0" style="width:150px; height:150px;" num="' + pic.num + '" src="' + _this.getImageFullName(pic.choice) + '"/>' +
        '</div>';
    container.append(html);
};
ViewBuilder.prototype.Append_MstsContentDiv = function (questionId, pic) {

    var _this = this;
    var picPath = _this.getImageFullName(pic);
    var html = '<div id="createPoint"  style="margin-bottom:5px;margin-top:5px"><span class="btn_CreatePoint">创建消失点</span></div>' +
        '<div id="' + questionId + '" style = "position:relative;visibility:hidden">' +
        '<img id="msts" style="position:absolute;top:0;left:50%;padding:0px" src="' + picPath + '"></img>' +
        '<canvas id="canvas2" width="600" style="position:absolute;top:0;left:50%"></canvas>' +
        '</div>';
    this.QuestionObj.append(html);

    document.getElementById("msts").onload = function () {
        _this.stretchImage2($("#msts"), 600, 400);
        var width = $('#msts').width();
        $('#msts').css('margin-left', -width / 2);
        $('#canvas2').css('margin-left', -width / 2);
        $("#" + questionId).css("visibility", "visible");
    };
};

ViewBuilder.prototype.Append_MsmlContentDiv = function (questionId, pic) {
    var _this = this;
    var picPath = _this.getImageFullName(pic);
    var html = '<div id="' + questionId + '" style = "position:relative;margin-top:50px;margin-left:150px;">' +
        '<canvas id="canvas1" width="300" height="400" style="position:absolute;top:0;left:0" picPath="' + picPath + '"></canvas>' +
        '<canvas id="canvas2" width="300" height="400" style="position:absolute;top:0;left:0"></canvas>' +
        '</div>';
    this.QuestionObj.append(html);

}

ViewBuilder.prototype.AppendPicToCanvas = function (canvas) {
    var picPath = canvas.attr("picPath");
    var ctx = canvas[0].getContext("2d");
    var img = new Image();
    img.src = picPath;
    img.onload = function () {
        ctx.drawImage(img, 0, 0, canvas[0].width, canvas[0].height);
    };
}