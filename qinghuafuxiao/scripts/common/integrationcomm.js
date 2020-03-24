/// <reference path="../common/jquery-1.4.1.js" />
/// <reference path="BuildLibrary.js" />
/// <reference path="Models.js" />
/// <reference path="BridgingUtil.js" />
/// <reference path="Cef.js" />
/*
 * @author: szsheng
 * @date: 2010/08/30
 * @description: 页面共用JS文件
 */
//脚本调用方式： 0模拟客户端调用，1客户端调用
var gCallType = 1;
var gFileName = '';

var CommObj = {
    "curPage": null //当前页对象
};

function SetBreakPointInfo(callback) {
    var currentAction = Action.getCurrentAction();
    var infoObj = {};
    if (currentAction) {
        infoObj.ItemIndex = currentAction.itemIndex;
        infoObj.GroupIndex = currentAction.groupIndex;
        infoObj.QuestionIndex = currentAction.questionIndex;
        infoObj.ActionLevel = currentAction.actionLevel;
        infoObj.SectionName = currentAction.sectionName;
    }

    var strInfo = JSON.stringify(infoObj);
    CEFWrapper.SaveBreakPointInfo(strInfo, function () {
        callback ? callback() : Action.ContinueRun();
    });
}

function SaveBlanksAnswer(callback) {
    var inputs = $(".caption input[type='text']");
    var j = 0;
    var len = inputs.length;
    async.whilst(
        function () {
            return j < len;
        }, //验证成功继续，失败进回调
        function (next) {
            var $input = $(inputs[j]);
            var questionId = $input.attr("id");
            var answer = $input.val();
            if (questionId) {
                CEFWrapper.SaveQuestionAnswer(questionId, answer, function () {
                    j++;
                    next();
                });
            }
        },
        function (err) {
            if (err) {
                log("保存填空题答案失败！");
            } else {
                callback ? callback() : Action.ContinueRun();
            }
        }
    );
}

function CheckAnswer(questionId, radioBox) {
    /// <summary>点击选择答案</summary>
    /// <param name="questionId" type="String">小题ID</param> 
    /// <param name="radioBox" type="Element">选择项父容器</param>
    var radio = $(radioBox).children(":radio");
    var radioName = radio.attr("name");
    var radios = $('input[name=' + radioName + ']');
    radios.prop("checked", false);
    radio.prop("checked", true); //选中
    var answer = radio.val();
    var lastChoice = CommObj.curPage.__lastChoice;
    if (lastChoice && (lastChoice.questionId != questionId || lastChoice.answer != answer)) { //避免发送相同选择项
        lastChoice.questionId = questionId;
        lastChoice.answer = answer;
        CEFWrapper.SaveQuestionAnswer(questionId, answer);
    }
}

function FixSingleBoxClass(radio, group) {
    var $radio = $(radio).children(":radio");
    var radioName = $radio.attr("name");
    var $radios = $('input[name=' + radioName + ']');
    $radios.prop("checked", false);
    $radio.prop("checked", true); //选中
    $radios.each(function () {
        var $parent = $(this).parent();
        if ($(this).prop("checked")) {
            $parent.removeClass("radio_normal_survey");
            $parent.addClass("radio_checked_survey");
        } else {
            $parent.removeClass("radio_checked_survey");
            $parent.addClass("radio_normal_survey");
        }
    });
}

function FixMultiBoxClass(checkbox) {
    var $checkbox = $(checkbox).find('input[type=checkbox]');
    var checked = $checkbox.prop('checked');
    $checkbox.prop('checked', !checked);
    $checkbox.each(function () {
        var $parent = $(this).parent();
        if ($(this).prop("checked")) {
            $parent.removeClass("check_normal");
            $parent.addClass("check_checked");
        } else {
            $parent.removeClass("check_checked");
            $parent.addClass("check_normal");
        }
    });
}

function FixRadioClass(radioName) {
    var radio = 'input[name=' + radioName + ']';
    var $radio = $(radio);
    $radio.each(function () {
        var $parent = $(this).parent();
        if ($(this).prop("checked")) {
            $parent.removeClass("radio_normal");
            $parent.addClass("radio_checked");
        } else {
            $parent.removeClass("radio_checked");
            $parent.addClass("radio_normal");
        }
    });
}

function SaveSurveyAnswer(callback) {
    /// <summary>提交问卷调查答案</summary>
    var answer = [];
    var count = $('.survey-question').length;
    $('.survey-question').each(function (index, el) {
        $(el).find('input[type=checkbox]').each(function (index, checkbox) {
            if ($(checkbox).prop('checked')) {
                answer.push($(checkbox).val());
            }
        });
        if (index != count - 1)
            answer.push(',');
    });
    var questionId = $res('mb:question.id');
    CEFWrapper.SaveQuestionAnswer(questionId, answer.join(''), function (result) {
        // Action.ContinueRun();
        callback();
    });
}

function GetRandomIndex(items) {
    var randomIndexArr = [];
    var maxSize = items.length - 1;
    for (var i = 0; i <= maxSize; i++)
        randomIndexArr.push(i);

    // 按照小题乱序的组号来进行划分组
    for (var i = maxSize; i >= 0; i--) {
        // 只要随机标记大于等于0的小题才参与乱序
        if (items[i].randomindex && items[i].randomindex >= 0) {
            // 打乱小题顺序
            var randomIndex = Math.floor(Math.random()*(i+1));
            var randomIndexAsc = randomIndex;
            var index = -1;
            while ((randomIndex >= 0) && (randomIndexAsc <= i)) {
                if (items[randomIndex].randomindex == items[i].randomindex) { index = randomIndex; break; }
                if (items[randomIndexAsc].randomindex == items[i].randomindex) { index = randomIndexAsc; break; }
                randomIndex--;
                randomIndexAsc++;
            }

            // 交换两者的顺序
            if (index != -1) {
                var temp = randomIndexArr[i];
                randomIndexArr[i] = randomIndexArr[index];
                randomIndexArr[index] = temp;
            }
        }
    }

    return randomIndexArr;
}

//add by hushu 2017-02-28
// 对Choice一级进行乱序处理
function ChoiceRandom(concreteChoiceObj, randomInfo, tag) {
    // 保存乱序后的选项顺序列表，如果存在乱序信息，直接使用
    var riKey = String.format("choice_{0}", tag);
    if (!(randomInfo && randomInfo[riKey])) {
        randomInfo[riKey] = GetRandomIndex(concreteChoiceObj);
    }
}

// 对Question一级进行乱序处理
function QuestionRandom(schemaQuestionObj, concreteQuestionObj, randomInfo, tag) {
    var questionPropArr = [];
    // 保存乱序后的小题顺序列表，如果存在乱序信息，直接使用
    var randomQuestionArr = [];
    var riKey = String.format("{0}_question", tag);
    if (randomInfo && randomInfo[riKey])
        randomQuestionArr = randomInfo[riKey];
    else {
        randomQuestionArr = GetRandomIndex(schemaQuestionObj);
        randomInfo[riKey] = randomQuestionArr;
    }

    for (var k = 0; k < schemaQuestionObj.length; k++) {
        var question = schemaQuestionObj[k];
        var questionPorp = {};
        questionPorp.id = question.id;
        if (question.answer) questionPorp.answer = question.answer;
        if (concreteQuestionObj.question && concreteQuestionObj.question[k]) {
            questionPorp.xt_question = concreteQuestionObj.question[k];
            // 对选项进行乱序处理
            if (concreteQuestionObj.question[k].choice && concreteQuestionObj.question[k].choice.choice) ChoiceRandom(concreteQuestionObj.question[k].choice.choice, randomInfo, questionPorp.id);
        }
        questionPropArr.push(questionPorp);
    }

    // 对乱序之后的Questin节点进行赋值
    for (var k = 0; k < schemaQuestionObj.length; k++) {
        if (randomQuestionArr[k] == k) continue;

        var newQuestionProp = questionPropArr[randomQuestionArr[k]];
        schemaQuestionObj[k].id = newQuestionProp.id;
        if (newQuestionProp.answer) schemaQuestionObj[k].answer = newQuestionProp.answer;
        if (newQuestionProp.xt_question) concreteQuestionObj.question[k] = newQuestionProp.xt_question;
    }
}

// 对Group一级进行乱序处理
function GroupRandom(schemaItemObj, concreteItemObj, randomInfo, tag) {
    var groupPropArr = [];

    // 保存乱序后的小题顺序列表，如果存在乱序信息，直接使用
    var randomGroupArr = [];
    var riKey = String.format("{0}_group", tag);
    if (randomInfo && randomInfo[riKey])
        randomGroupArr = randomInfo[riKey];
    else {
        randomGroupArr = GetRandomIndex(schemaItemObj);
        randomInfo[riKey] = randomGroupArr;
    }
    // 保存原始的Group属性列表
    for (var j = 0; j < schemaItemObj.length; j++) {
        // 对group下级的question进行乱序处理
        QuestionRandom(schemaItemObj[j].question, concreteItemObj.group[j], randomInfo, String.format("{0}{1}", riKey, j));

        groupProp = {};
        groupProp.xt_group = concreteItemObj.group[j];
        var questions = schemaItemObj[j].question;
        var questionPropArr = [];
        for (var k = 0; k < questions.length; k++) {
            var questionPorp = {};
            var question = questions[k];
            questionPorp.id = question.id;
            if (question.answer) questionPorp.answer = question.answer;
            questionPropArr.push(questionPorp);
        }
        groupProp.qt_array = questionPropArr;
        groupPropArr.push(groupProp);
    }

    // 对乱序后的Group属性进行赋值
    for (var j = 0; j < schemaItemObj.length; j++) {
        if (randomGroupArr[j] == j) continue;

        var questions = schemaItemObj[j].question;
        var groupProp = groupPropArr[randomGroupArr[j]];
        for (var k = 0; k < questions.length; k++) {
            var question = questions[k];
            question.id = groupProp.qt_array[k].id;
            if (groupProp.qt_array[k].answer) question.answer = groupProp.qt_array[k].answer;
        }
        concreteItemObj.group[j] = groupProp.xt_group;
    }
}

// 对Item一级进行乱序处理
function ItemRandom(sectionObj) {
    var schemaObj = sectionObj.SchemaSection;
    var concreteObj = sectionObj.ConcreteSection;
    var items = schemaObj.item;
    var maxSize = items.length - 1;
    // 保存乱序后的小题顺序列表，如果存在乱序信息，直接使用
    var randomItemArr = [];
    var riKey = "item";
    if (!schemaObj.randomItem) schemaObj.randomItem = {};
    if (schemaObj.randomItem[riKey])
        randomItemArr = schemaObj.randomItem[riKey];
    else {
        randomItemArr = GetRandomIndex(items);
        schemaObj.randomItem[riKey] = randomItemArr;
    }

    // 保存原始小题Item的私有属性列表
    var itemProps = [];
    for (var i = 0; i <= maxSize; i++) {
        var item = items[i];
        var itemProp = {};
        itemProp.id = item.id;
        // 对item下级的group进行乱序处理
        GroupRandom(item.group, concreteObj.item[i], schemaObj.randomItem, String.format("item{0}", i));

        itemProp.xt_item = concreteObj.item[i];
        // 对每个group里面的question进行乱序处理
        var groups = item.group;
        var groupPropArr = [];
        for (var j = 0; j < groups.length; j++) {
            var questionPropArr = [];
            var questions = groups[j].question;
            for (var k = 0; k < questions.length; k++) {
                var question = questions[k];
                var questionPorp = {};
                questionPorp.id = question.id;
                if (question.answer) questionPorp.answer = question.answer;
                questionPropArr.push(questionPorp);
            }
            groupPropArr.push(questionPropArr);
        }
        itemProp.gp_item = groupPropArr;
        itemProps.push(itemProp);
    }

    // 对小题进行乱序处理，交换各自的小题属性
    for (var i = 0; i <= maxSize; i++) {
        // 如果需要交换顺序
        if (randomItemArr[i] == i) continue;

        var item = items[i];
        var indexNew = randomItemArr[i];
        var groups = item.group;
        for (var j = 0; j < groups.length; j++) {
            var questions = groups[j].question;
            for (var k = 0; k < questions.length; k++) {
                var question = questions[k];
                question.id = itemProps[indexNew].gp_item[j][k].id;
                if (itemProps[indexNew].gp_item[j][k].answer) question.answer = itemProps[indexNew].gp_item[j][k].answer;
            }
        }
        item.id = itemProps[indexNew].id;
        concreteObj.item[i] = itemProps[indexNew].xt_item;
    }

    return sectionObj;
}


function RandomItem(sectionObj) {
    var questionNumIndex = 0;
    var schemaObj = sectionObj.SchemaSection;
    var concreteObj = sectionObj.ConcreteSection;
    var items = schemaObj.item;
    //保存需要进行乱序的一些属性
    var randomPorpArr = [];
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var canRandom = item.canRandom == "true" || false;
        if (canRandom) {
            //propObj保存需要进行乱序的属性
            //id:item的id属性
            //questionPropArr:保存question中的id,answer属性
            var propObj = {};
            propObj.id = item.id;
            //保存group中question的题号
            var groups = item.group;
            var questionPropArr = [];
            for (var j = 0; j < groups.length; j++) {
                var questions = groups[j].question;
                for (var k = 0; k < questions.length; k++) {
                    var question = questions[k];
                    var questionPorp = {};
                    questionPorp.id = question.id;
                    if (question.answer) {
                        questionPorp.answer = question.answer;
                    }
                    questionPropArr.push(questionPorp);
                }
            }
            propObj.questionPropArr = questionPropArr;
            propObj.xt_item = concreteObj.item[i];
            randomPorpArr.push(propObj);
        }
    }
    //item乱序
    randomPorpArr.random();
    //讲这些属性重新赋值
    var index = 0;
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var groups = items[i].group;
        var canRandom = item.canRandom == "true" || false;
        if (canRandom) {
            //重新赋值id
            item.id = randomPorpArr[index].id;
            for (var j = 0; j < groups.length; j++) {
                var questions = groups[j].question;
                for (var k = 0; k < questions.length; k++) {
                    var question = questions[k];
                    //重新赋值id,num
                    question.id = randomPorpArr[index].questionPropArr[k].id;
                    if (question.answer) {
                        question.answer = randomPorpArr[index].questionPropArr[k].answer;
                    }
                }
            }
            //重新赋值concreteObj中的item值
            concreteObj.item[i] = randomPorpArr[index].xt_item;
            index++;
        }
    }
    return sectionObj;
}

//modified by congnie 2017-02-28
//question节点的canRandom属性配置是否可以进行乱序
//仅对id和answer属性进行乱序
function RandomQuestion(sectionObj) {
    var questionNumIndex = 0;
    var schemaObj = sectionObj.SchemaSection;
    var concreteObj = sectionObj.ConcreteSection;
    //保存需要乱序的属性
    var items = schemaObj.item;
    for (var i = 0; i < items.length; i++) {
        var propArr = [];
        var groups = items[i].group;
        for (var j = 0; j < groups.length; j++) {
            var questions = groups[j].question;
            for (var k = 0; k < questions.length; k++) {
                var question = questions[k];
                //canRandom属性决定是否有小题乱序
                var canRandom = question.canRandom == "true" || false;
                if (canRandom) {
                    var propObj = {};
                    propObj.id = question.id;
                    if (question.answer) {
                        propObj.answer = question.answer;
                    }
                    propObj.xt_question = concreteObj.item[i].group[j].question[k];
                    propArr.push(propObj);
                }
            }
            //将id、answer、concreteObj.item[i].group[j].question进行随机
            propArr.random();
            var index = 0;
            //将随机属性赋值给question
            for (var k = 0; k < questions.length; k++) {
                var question = questions[k];
                if (question.canRandom) {
                    question.id = propArr[index].id;
                    if (question.answer) {
                        question.answer = propArr[index].answer;
                    }
                    concreteObj.item[i].group[j].question[k] = propArr[index].xt_question;
                    index++;
                }
            }
        }
    }
    return sectionObj;
}

//修正视频播放流程
function UpdateVideo() {
    var player = document.getElementById("Player");
    if (player && player.ended) {
        Action.ContinueRun();
    }
}

//播放视频
function PlayVideo(volume) {
    if (volume != 0) {
        volume = volume || 1.0;
    }
    // 延迟等待播放器加载完成
    var delay = function () {
        var player = document.getElementById("Player");
        if (player) {
            cef.PlayVideo(function () {
                player.play();
                player.volume = volume;
            })
        } else {
            console.log('播放器还没有加载完成');
            setTimeout(function () {
                delay();
            }, 100);
        }
    }();
}

//停止视频
function StopVideo() {
    var player = document.getElementById("Player");
    if (player) {
        player.pause();
    }
}

function multStyleButton() {
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


function $page(pageIndex, pageBy) {
    /// <summary>获取当前页面的数据</summary>
    /// <param name="pageBy">定位页面资源类型</param> 
    /// <returns type="Array">页面资源数据</returns>
    pageBy = pageBy || "item";
    var mb_section = CommObj.curPage.data.SchemaSection;
    var xt_section = CommObj.curPage.data.ConcreteSection;
    var result = [];
    var currentAction = Action.getCurrentAction();
    var itemIndex = currentAction.itemIndex;
    var groupIndex = currentAction.groupIndex;
    var questionIndex = currentAction.questionIndex;
    switch (pageBy) {
        case "item":
            var cur = mb_section.item;
            $.each(cur, function (iIndex, item) {
                if (item.action && item.action.viewPage == pageIndex) {
                    var pagedata = {};
                    var data = xt_section.item[iIndex];
                    pagedata.schema = item;
                    pagedata.concrete = data;
                    pagedata.itemIndex = iIndex;
                    pagedata.groupIndex = 0;
                    pagedata.questionIndex = 0;
                    result.push(pagedata);
                }
            });
            break;
        case "group":
            var cur = mb_section.item;
            $.each(cur, function (iIndex, item) {
                $.each(item.group, function (gIndex, group) {
                    if (group.action && group.action.viewPage == pageIndex) {
                        var pagedata = {};
                        var data = xt_section.item[iIndex].group[gIndex];
                        pagedata.schema = group;
                        pagedata.concrete = data;
                        pagedata.itemIndex = iIndex;
                        pagedata.groupIndex = gIndex;
                        pagedata.questionIndex = 0;
                        result.push(pagedata);
                    }
                });
            });
            break;
        case "question":
            var cur = mb_section.item;
            $.each(cur, function (iIndex, item) {
                $.each(item.group, function (gIndex, group) {
                    $.each(group.question, function (qIndex, question) {
                        if (question.action && question.action.viewPage == pageIndex) {
                            var pagedata = {};
                            var data = xt_section.item[iIndex].group[gIndex].question[qIndex];
                            pagedata.schema = question;
                            pagedata.concrete = data;
                            pagedata.itemIndex = iIndex;
                            pagedata.groupIndex = gIndex;
                            pagedata.questionIndex = qIndex;
                            result.push(pagedata);
                        }
                    });
                });
            });
            break;
    }
    return result;
}

function $find(selectStr, itemIndex, groupIndex, questionIndex) {
    /// <summary>按选择器读取试题资源</summary>
    /// <param name="selectStr" type="String">选择器字符串</param> 
    /// <param name="itemIndex">定位资源的item</param> 
    /// <param name="groupIndex">定位资源的group</param> 
    /// <param name="questionIndex">定位资源的question</param> 
    /// <returns type="Object">资源对象</returns>
    var obj = CommObj.curPage.data;
    var reFlag = /^\s*(\w+)\s*\:/;
    var mt = selectStr.match(reFlag);
    var selectBody = selectStr.replace(reFlag, "");
    var arrMember = selectBody.split(/\.|>/g);
    itemIndex = itemIndex || 0;
    groupIndex = groupIndex || 0;
    questionIndex = questionIndex || 0;
    if (mt) {
        var flag = mt[1].toLowerCase();
        if (flag == "mb" || flag == "xt") {
            var section = (flag == "mb") ? CommObj.curPage.data.SchemaSection : CommObj.curPage.data.ConcreteSection;

            var arrMember0 = arrMember.shift();
            switch (arrMember0) {
                case "section":
                    obj = section;
                    break;
                case "item":
                    obj = section.item[itemIndex];
                    break;
                case "group":
                    obj = section.item[itemIndex].group[groupIndex];
                    break;
                case "question":
                    obj = section.item[itemIndex].group[groupIndex].question[questionIndex];
                    break;
            }
        }
    }
    var result = obj;
    for (var i = 0; i < arrMember.length; i++) {
        var property = arrMember[i];
        var mtProperty = property.match(/\[\s*(\w+)\s*\=\s*(\w+)\s*\]/); //[name=content]
        property = property.replace(/\[.+?\]/g, "");
        result = result[property];
        if (mtProperty) {
            if (result.constructor === Array)
                result = result.getItemByProperty(mtProperty[1], mtProperty[2]);
            else if (result[mtProperty[1]] != mtProperty[2])
                result = null;
        }
    }
    return result;
}

function $res(selectStr) {
    /// <summary>按选择器读取试题资源</summary>
    /// <param name="selectStr" type="String">选择器字符串</param>  
    /// <returns type="Object">资源对象</returns>
    var obj = CommObj.curPage.data;
    var reFlag = /^\s*(\w+)\s*\:/;
    var mt = selectStr.match(reFlag);
    var selectBody = selectStr.replace(reFlag, "");
    var arrMember = selectBody.split(/\.|>/g);
    var currentAction = Action.getCurrentAction();
    if (mt) {
        var flag = mt[1].toLowerCase();
        if (flag == "mb" || flag == "xt") {
            var itemIndex = currentAction.itemIndex;
            var groupIndex = currentAction.groupIndex;
            var questionIndex = currentAction.questionIndex;
            var section = (flag == "mb") ? obj.SchemaSection : obj.ConcreteSection;
            var arrMember0 = arrMember.shift();
            switch (arrMember0) {
                case "section":
                    obj = section;
                    break;
                case "item":
                    obj = section.item[itemIndex];
                    break;
                case "group":
                    obj = section.item[itemIndex].group[groupIndex];
                    break;
                case "question":
                    obj = section.item[itemIndex].group[groupIndex].question[questionIndex];
                    break;
            }
        }
    }
    var result = obj;
    for (var i = 0; i < arrMember.length; i++) {
        var property = arrMember[i];
        var mtProperty = property.match(/\[\s*(\w+)\s*\=\s*(\w+)\s*\]/); //[name=content]
        property = property.replace(/\[.+?\]/g, "");
        result = result[property];
        if (mtProperty) {
            if (result.constructor === Array)
                result = result.getItemByProperty(mtProperty[1], mtProperty[2]);
            else if (result[mtProperty[1]] != mtProperty[2])
                result = null;
        }
    }
    return result;
}

function $show(selectStr, itemIndex, groupIndex, questionIndex) {
    var obj = $find(selectStr, itemIndex, groupIndex, questionIndex);
    if (!obj) return false;
    return $.trim(obj.disable).toLowerCase() != 'true';
}

function $able(selectStr) {
    var obj = $res(selectStr);
    if (!obj) return false;
    return $.trim(obj.disable).toLowerCase() != 'true';
}

function $check(selectStr, value) {
    value = value || "true";
    var obj = $res(selectStr);
    if (!obj) return false;
    return $.trim(obj).toLowerCase() === value;
}

/* ---------------------------------------------客户端回调函数------------------------------------------------ */
function OnPlayEnd(callBackData) {
    if (callBackData) {
        var params = callBackData.split('#');
        if (params.length == 5) {
            var playFlag = params[0];
            var spanTime = params[1];
            var fileName = params[2];
            var repeat = params[3];
            var isDi = params[4];

            if (playFlag == 'multiplyplay' && repeat > 0) {
                CEFWrapper.ShowStatus(ExamState.Wait);
                CEFWrapper.WaitTime("multiplyplay#" + spanTime + "#" + fileName + "#" + repeat + "#" + isDi, spanTime, true);
            } else {
                Action.ContinueRun();
            }
        } else {
            eval(callBackData + '()');
        }
    }
}

function OnPlayVideoEnd(callBackData) {
    StopVideo();
    Action.ContinueRun();
}

function OnWaitTimeEnd(callBackData) {
    if (callBackData) {
        var params = callBackData.split('#');
        if (params.length == 5) {
            var playFlag = params[0];
            var spanTime = params[1];
            var fileName = params[2];
            var repeat = params[3];
            var isDi = params[4];

            if (playFlag == 'multiplyplay' && repeat > 0) {
                if (isDi == "true") {
                    CEFWrapper.ShowStatus(ExamState.ListenPrompt);
                    CEFWrapper.SyncPlay(GetPaperPath() + $res("mb:section>jump_prompt"));
                }
                CEFWrapper.ShowStatus(ExamState.ListenPrompt);
                CEFWrapper.Play("multiplyplay#" + spanTime + "#" + fileName + "#" + (repeat - 1) + "#" + isDi, gFileName);
            } else {
                Action.ContinueRun();
            }
        } else {
            eval(callBackData + '()');
        }
    }
}

function OnStopAllEnd(callBackData) {
    if (callBackData)
        eval(callBackData);
};

function OnInterruptEnd(callBackData) {
    if (callBackData == "enableFinishButton") {
        CEFWrapper.ShowFinishButton("1");
    } else if (callBackData == "disableFinishButton") {
        CEFWrapper.ShowFinishButton("0");
    }
}

function OnBtnFinishClick(){
	StopRecord();
}

function OnRecordEnd(callBackData) {
    Lightbox.setLoading(false);
    $("#btnFinish").hide();
    $("#btnFinish").mouseout();
    Action.ContinueRun();
}

// 上一题、下一题、跳过的回调事件
function OnNextEnd(callBackData) {
    SaveBlanksAnswer(function(){
        OnSkipEnd();
        Action.runNext();
    });
}

function OnPrevEnd(callBackData) {
    OnSkipEnd();
    Action.runPrevious();
}

// 清理事件
function OnSkipEnd(callBackData) {
    $("#btnFinish").hide();
    $("#btnFinish").mouseout();
}

// 视频暂停
function OnPlayVideoPause(callBackData) {
    var player = document.getElementById("Player");
    if (player) {
        player.pause();
    }
}

// 视频继续
function OnPlayVideoResume(callBackData) {
    var player = document.getElementById("Player");
    if (player) {
        player.play();
    }
}

/* ------------------------------------------------以下是通用函数------------------------------------------------ */

//JQuery 方法扩展
jQuery.fn.extend({
    disable: function (bDisable) {
        /// <summary>设置当前按钮是否可用</summary>
        /// <param name="bDisable" type="Boolean">true不可用，false可用</param>
        if (bDisable)
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

Array.prototype.getItemByProperty = function (property, value) { //根据属性查找数据元素
    for (var i = 0, len = this.length; i < len; i++) {
        if (this[i][property] == value)
            return this[i];
    }
    return null;
}

Array.prototype.removeEmpty = function () {
    var indexs = [];
    for (var i = 0; i < this.length; i++) {
        var obj = this[i];
        if (obj == "") {
            indexs.push(i);
        }
    }
    for (var i = 0; i < indexs.length; i++) {
        var index = indexs[i];
        this.splice(index, 1);
    }
    return this;
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

String.prototype.format = function () {
    var str = this;
    for (var i = 0; i < arguments.length; i++) {
        var re = new RegExp('\\{' + (i) + '\\}', 'gm');
        str = str.replace(re, arguments[i]);
    }
    return str;
}

function checkRadio(element) {
    $(element).children(":radio").attr("checked", true);
}

function GetFileExt(fileName) {
    if (fileName.lastIndexOf('.') > -1) {
        return fileName.substring(fileName.lastIndexOf('.'), fileName.length);
    } else {
        return '';
    }
}

function GetFileNameWithoutExt(fileName) {
    if (fileName.lastIndexOf('.') > -1) {
        return fileName.substring(0, fileName.lastIndexOf('.'));
    } else {
        return fileName;
    }
}

function ChangeFileExt(fileName, ext) {
    if (ext.indexOf('.') != 0)
        ext = "." + ext;
    return GetFileNameWithoutExt(fileName) + ext;
}

function GetDomProperty(dom, property, value) {
    /// <summary>根据属性查找资源数据元素</summary>
    /// <param name="dom" type="obj">dom对象</param>
    /// <param name="property" type="String">属性</param>
    /// <param name="value" type="value">属性值</param>
    if (dom instanceof Array)
        return dom.getItemByProperty(property, value);
    else
        return dom;
};

function numToLetter(num) {
    ///<summary>数字转换成字母</summary>
    switch (num) {
        case '0':
            return 'A';
        case '1':
            return 'B';
        case '2':
            return 'C';
        case '3':
            return 'D';
        default:
            return null;
    }
}

function loadCustomizableCss(callback) {
    ///<summary>为Section加载定制样式</summary>
    var globalCss = $res("mb:section.globalCss");
    var customCss = $res("mb:section.customCss");
    var cssList = [globalCss, customCss];
    async.eachSeries(cssList, function (css, next) {
        if (css) {
            CEFWrapper.GetClientData("cssfile->" + css, function (gUrl) {
                BuildLibrary.loadCSS("" + gUrl);
                next(null);
            });
        } else {
            next(null);
        }
    }, function (err) {
        callback();
    });
}

function EvalData(data) {
    if (data)
        return eval("(" + data + ")");
    else
        return data;
}

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