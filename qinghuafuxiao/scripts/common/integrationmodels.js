/// <reference path="IntegrationComm.js" />
/// <reference path="../common/jquery-1.4.1.js" />
/// <reference path="Lightbox.js" />

/*
* @author: szsheng
* @date: 2012/12/12
* @description: 页面流程控制
*/

function Action(functionList, viewName, viewPage, jumpStopover) {
    this.functionList = functionList; //函数列表
    this.viewName = viewName;
    this.viewPage = viewPage;
    this.jumpStopover = jumpStopover;
    this.jumpIndex = -1;
    this.actionLevel = 'none';
    this.currentFunctionIndex = 0; //当前函数索引
    this.nextFunctionIndex = 1; //下一个函数索引
    this.itemIndex = 0;
    this.groupIndex = 0;
    this.questionIndex = 0;
    this.actionIndex = 0;
    this.tag = 'begin';
    // this.sectionName = '';
}

Action.currentAction = null;
Action.currentActionIndex = 0;

Action._currentJumpAction = null;
Action._currentJumpActIndex = 0;
Action._jumpActList = []; //可跳的Action列表
Action._topAction = null;

Action._isRecording = false; //是否正在录音
Action._isCheckAnswer = false; //是否正在核对答案
Action._isPausing = false;
Action._actionPause = false;

Action._evalMark = 0; //0:初始状态；1:提交试卷；2:返回；3:上一题；4:下一题；
Action._currentExamType = "et_Exam";
Action._recordId;
Action._ExamCategory;
Action._recordPath;
Action._isCanNetOrPre = '1';
Action.runPrevOrNext = 0;
Action._curCaptionId = 'none';

Action.getFunctionList = function (actionStr) {
    //alert(actionStr);
    actionStr = actionStr.replace(/\/\/.*/g, ""); //去注释
    actionStr = actionStr.replace(/(?:^|\r\n|\r|\n)\s*(?:$|\r\n|\r|\n)/g, "\r\n"); //去空行
    var arrFunction = actionStr.split(/(?:\r\n|\r|\n)/g);
    arrFunction.removeEmpty();
    log("解析流程列表：{0}".format(arrFunction.length));
    return arrFunction;
};

Action.getNodeActionStr = function (action, callback) {
    log("获取Act文件的内容：{0}".format(action.src));
	if (action.src)
		CEFWrapper.GetClientData("actionfile->" + action.src, callback);
	else
		callback(action.action);
};

Action.loadBegin = function (schemaNode, callback) {
    var actions = schemaNode.action;
    var schemaNodeAction = null;
    //单个act情况
    if (actions && actions.length == null) {
        schemaNodeAction = actions;
    }
    else if (actions && actions.length > 0) {
        for (var i = 0; i < actions.length; i++) {
            var act = actions[i];
            if (!act.tag || (act.tag && act.tag == "begin")) {
                schemaNodeAction = act;
                break;
            }
        }
        if (!schemaNodeAction) {
            return callback(null);
        }
    }
    else {
        return callback(null);
    }
	
    Action.getNodeActionStr(schemaNodeAction, function(actionStr) {
		var fnList = Action.getFunctionList(actionStr);
		var jumpStopover = $.trim(schemaNodeAction.jumpStopover).toLowerCase() == "true";
		var action = new Action(fnList, schemaNodeAction.viewName, schemaNodeAction.viewPage, jumpStopover);
		callback(action);
	});
};

Action.loadEnd = function (schemaNode, callback) {
    var actions = schemaNode.action;
    var schemaNodeAction = null;
    if (actions && actions.length > 0) {
        for (var i = 0; i < actions.length; i++) {
            var act = actions[i];
            if (act.tag && act.tag == "end") {
                schemaNodeAction = act;
                break;
            }
        }
        if (!schemaNodeAction) {
            return callback(null);
        }
    }
    else {
        return callback(null);
    }
    log($.toJSON(schemaNodeAction));
    Action.getNodeActionStr(schemaNodeAction, function(actionStr) {
		var fnList = Action.getFunctionList(actionStr);
		var jumpStopover = $.trim(schemaNodeAction.jumpStopover).toLowerCase() == "true";
		var action = new Action(fnList, schemaNodeAction.viewName, schemaNodeAction.viewPage, jumpStopover);
		action.tag = "end";
		return callback(action);
	});
};

Action.addAction = function (action, itemIndex, groupIndex, questionIndex, actionLevel) {
    if (action) {
        action.itemIndex = itemIndex;
        action.groupIndex = groupIndex;
        action.questionIndex = questionIndex;
        action.actionLevel = actionLevel;
        Action._actionList.push(action);
        action.actionIndex = Action._actionList.length - 1;
        log("添加Act对象到数组");
        if (action.jumpStopover) {
            log("添加Act对象到JumpList");
            Action._jumpActList.push(action);
            action.jumpIndex = Action._jumpActList.length - 1;
        }
    }
};

Action.getCurrentAction = function () {
    return (Action._actionList && Action._actionList.length >= Action.currentActionIndex) ? Action._actionList[Action.currentActionIndex] : null;
};

Action.getJumpIndex = function (action) {
    var jIndex = 0;
    for (var i = 0; i < Action._jumpActList.length; i++) {
        if (Action._jumpActList[i].actionIndex == action.actionIndex)
            jIndex = i;
    };

    return jIndex;
};

Action.setCurrentAction = function(info){
    if (!info) return;

    // 只有本section才进行断点续考处理
    if ($res("mb:section>name") == info.SectionName) {
        Action.currentActionIndex = 0;
        var itemIndex = info.ItemIndex;
        var groupIndex = info.GroupIndex;
        var questionIndex = info.QuestionIndex;
        var actionLevel = info.ActionLevel;
        var sectionName = info.SectionName;

        var actionCount = Action._actionList.length;
        for (var i = 0; i < actionCount; i++) {
            var action = Action._actionList[i];
            if (action.sectionName == sectionName && action.actionLevel == actionLevel && action.itemIndex == itemIndex && action.groupIndex == groupIndex && action.questionIndex == questionIndex) {
                if (action.actionIndex + 1 >= Action._actionList.length) {
                    CEFWrapper.SectionEnd("1", "1");
                } else {
                    //从下一个action开始
                    Action.currentActionIndex = action.actionIndex + 1;
                    Action._currentJumpActIndex = Action.getJumpIndex(action) + 1;
                }
            }
        }
    }
}

Action.ContinueRun = function () {
    if (!Action._isPausing)
        Action.getCurrentAction().nextFunctionIndex++;
    else
        Action._actionPause = true;
};

Action.loadMainAction = function (pageData, callback) {
    log('读取到数据：');
    Action._actionList = [];
    Action._jumpActList = [];
    var section = pageData.SchemaSection;
    Action.runPrevOrNext = pageData.PrevNext || 0;
    log('解析section节点Act文件');
    Action.loadBegin(section, function(beginAct) {
		Action.addAction(beginAct, 0, 0, 0, 'section');
		async.eachSeries(section.item, function(item, callback_item) {
			log('解析item节点Act文件');
			Action.loadBegin(item, function(beginAct) {
				var i = section.item.indexOf(item);
				Action.addAction(beginAct, i, 0, 0, 'item');
				async.eachSeries(item.group, function(group, callback_group) {
					log('解析group节点Act文件');
					var j = item.group.indexOf(group);
					Action.loadBegin(group, function(beginAct) {
						Action.addAction(beginAct, i, j, 0, 'group');
						async.eachSeries(group.question, function(question, callback_question) {
							log('解析question节点Act文件');
							var k = group.question.indexOf(question);
							Action.loadBegin(question, function (beginAct) {
								Action.addAction(beginAct, i, j, k, 'question');
								return callback_question(null);
							});
						}, function(err) {
						    if (err) return callback_group(err);
							
							log('解析question节点Act文件完成');
							Action.loadEnd(group, function(endAct) {
								Action.addAction(endAct, i, j, 0, 'group');	
								return callback_group(null);
							});
						});	
					});
				}, function(err) {
				    if (err) return callback_item(err);
					
				    log('解析group节点Act文件完成');
					Action.loadEnd(item, function(endAct) {
						Action.addAction(endAct, i, 0, 0, 'item');	
						return callback_item(null);
					});
				});
			});	
		}, function (err) {
		    if (err) return callback(err);

		    console.log("解析Act完成：" + err);
			Action.loadEnd(section, function(endAct) {
				Action.addAction(endAct, 0, 0, 0, 'section');
				log("解析Act完成,当前Act列表:{0}".format(Action._actionList.length));
                //为了唯一确定act给每一个act加上sectionName属性	
                $.each(Action._actionList,function(index,action){
                    action.sectionName = pageData.SchemaSection.name;
                });
				return callback(null);
			});
		});
	}); 
};

// 开始执行Action，只在DocumentReady中调用
Action.Run = function () {
    if (Action.runPrevOrNext == 0) {
        log("正常流程执行:{0}".format(Action._jumpActList.length));
        //Action.currentActionIndex = 0;
        log("当前流程：{0}".format(Action.getCurrentAction().actionIndex));
    }
    else if (Action.runPrevOrNext == 1) {
        log("向后跳执行:{0}".format(Action._jumpActList.length));
        if (Action._jumpActList.length > 0) {
            var action = Action._jumpActList[0];
            Action.currentActionIndex = action.actionIndex;
            Action._currentJumpActIndex = Action.getJumpIndex(action);
        } else {
            Action.getCurrentAction().reset();
        }
    }
    else {
        log("向前跳执行:{0}".format(Action._jumpActList.length));
        if (Action._jumpActList.length > 0) {
            var action = Action._jumpActList[Action._jumpActList.length - 1];
            Action.currentActionIndex = action.actionIndex;
            Action._currentJumpActIndex = Action.getJumpIndex(action);
        }
        else {
            Action.getCurrentAction().reset();
        }
    }

    Action.getCurrentAction().run();
}

Action.prototype.reset = function () {
    ///<summary>重置为未执行状态</summary>
    this.currentFunctionIndex = 0;
    this.nextFunctionIndex = this.currentFunctionIndex + 1;
};

Action.prototype.end = function () {
    ///<summary>设置为已执行状态</summary>
    this.currentFunctionIndex = this.functionList.length + 1;
    this.nextFunctionIndex = this.currentFunctionIndex;
}

Action.isComment = function () {
    ///<summary>是否是讲评模式</summary>
    if (Action._ExamCategory == ExamCategory.ec_Comment) {
        return true;
    }
    else {
        return false;
    }
}

Action.InitNextOrPre = function () {
    switch (Action._isCanNetOrPre) {
        case '0':
            if (Action._currentJumpActIndex == 0)
                disablePreButton(true);
            else
                disablePreButton(false);
            disableNextButton(false);
            break;
        case '1':
            disablePreButton(false);
            disableNextButton(false);
            break;
        case '2':
            disablePreButton(false);
            if (Action._currentJumpAction == Action._jumpActList[Action._jumpActList.length - 1])
                disableNextButton(true);
            else
                disableNextButton(false);
            break;
        case '3':
            if (Action._currentJumpActIndex == 0)
                disablePreButton(true);
            else
                disablePreButton(false);
            if (Action._currentJumpAction == Action._jumpActList[Action._jumpActList.length - 1])
                disableNextButton(true);
            else
                disableNextButton(false);
            break;
        case '4':
            disablePreButton(true);
            disableNextButton(true);
            break;
    }
}

Action.viewPage = function (viewName, viewPage,sectionIndex, callback) {
    ///<summary>题型展示</summary>
    if (!viewName) return callback();
    log("解析View文件,ViewName:{0},ViewPage:{1}".format(viewName, viewPage));
    var viewNameStr = viewName.split('|');
    CEFWrapper.GetClientData("actionfile->" + viewNameStr[0], function(viewStr) {
		if (viewStr) {
			eval(viewStr);
			eval(viewNameStr[1] + '(' + viewPage +','+sectionIndex+ ')');
		}
		log("显示View");	
		if (callback) callback();
	});  
}

Action.runActFunc = function(ctx) {
    // 如果执行函数的指针没有发生改变，进入空转循环
    if (ctx.nextFunctionIndex != ctx.currentFunctionIndex) {
        if (ctx.currentFunctionIndex < ctx.functionList.length) {
            var fn = ctx.functionList[ctx.currentFunctionIndex];
            // 当前的函数指针跳转到下一个
            ctx.currentFunctionIndex = ctx.nextFunctionIndex;
            var reAsynTrue = /^\s*asynchtrue\s*\:/i;
            var reAsynFalse = /^\s*asynchfalse\s*\:/i;
            var isAsyn = false;
            if (reAsynTrue.test(fn)) {
                if (Action._currentExamType != ExamType.et_Exam)
                    IsShowJump(true);
                fn = fn.replace(reAsynTrue, "");
                isAsyn = true;
            }
            else if (reAsynFalse.test(fn)) {
                IsShowJump(false);
                fn = fn.replace(reAsynFalse, "");
                isAsyn = true;
            }
            eval(fn);

            if (!isAsyn) { //同步执行
                ctx.nextFunctionIndex++;
            }
        }
        else {
            Action.actionCallback();
            ctx.currentFunctionIndex = ctx.nextFunctionIndex;
        }
    }

    var _this = ctx;
    setTimeout(function () { _this.run(); }, 0); //通过 settimeout 避免递归
};

Action.prototype.run = function () {
    ///<summary>开始跑流程</summary>    
    //Action.currentAction = this;
    //Action.currentActionIndex = this.actionIndex;
	var that = Action.getCurrentAction();
    //if (this.jumpStopover) {
    //    Action._currentJumpAction = this;
    //    Action._currentJumpActIndex = this.jumpIndex;
    //}
    if (that.currentFunctionIndex == 0) {
        Action.viewPage(that.viewName, that.viewPage,null, function() {
			Action.runActFunc(that);
		});
    } else {
		Action.runActFunc(that);
	}
    
};

Action.actionCallback = function () {
    log("Act文件执行完成");
    if (Action.currentActionIndex < Action._actionList.length - 1) {
        var action = Action._actionList[++Action.currentActionIndex];
        if (action.jumpStopover)
            Action._currentJumpActIndex++;
        action.reset();
        Action.InitNextOrPre();
        log("执行下一个Act文件,ViewName:{0}".format(action.viewName));
    }
    else {
        // 结束当前的action
        Action.getCurrentAction().end();
        CEFWrapper.SectionEnd("1");
    }
}

Action.jumpAct = function (index, sectionName, obj) {
    ///<summary>核对答案跳题</summary>
    $('.subboxnow').removeClass('subboxnow');
    if (obj)
        $(obj).addClass('subboxnow');
    CEFWrapper.GetCheckAnswerDate(sectionName);
    Action.currentActionIndex = index;
    var action = Action._actionList[Action.currentActionIndex];
    action.reset();
    action.run();
};

Action.runPrevious = function () {
    ///<summary>跳到上一题</summary>
    log("向前跳：{0}，当前：{1}".format(Action._jumpActList.length, Action._currentJumpActIndex));
    StopVideo();
    //StopWaitTime();
    if (Action._isRecording) {
        Action._evalMark = 3;
        //StopRecord();
    }
    if (Action._currentJumpActIndex > 0) {
        var action = Action._jumpActList[--Action._currentJumpActIndex];
        action.reset();
        Action.currentActionIndex = action.actionIndex;
        Action.InitNextOrPre();
    }
    else {
        // 结束当前的action
        Action.getCurrentAction().end();
        CEFWrapper.SectionEnd("-1", "-1");
    }
};

Action.runNext = function () {
    ///<summary>跳到下一题</summary>
    log("向后跳：{0}，当前：{1}".format(Action._jumpActList.length, Action._currentJumpActIndex));
    StopVideo();
    //StopWaitTime();
    if (Action._isRecording) {
        Action._evalMark = 4;
        //StopRecord();
    }
    if (Action._currentJumpActIndex < Action._jumpActList.length - 1) {
        var action = Action._jumpActList[++Action._currentJumpActIndex];
        action.reset();
        Action.currentActionIndex = action.actionIndex;
        Action.InitNextOrPre();
    }
    else {
        // 结束当前的action
        Action.getCurrentAction().end();
        CEFWrapper.SectionEnd("1", "1");
    }
};

Action.runNextStep = function () {
    ///<summary>跳到下一步</summary>
    //StopWaitTime();
    //if (Action._isRecording) {
    //    StopRecord();
    //}
    StopVideo();
    Action._actionList[Action.currentActionIndex].run();
};

Action.runPause = function () {
    ///<summary>暂停</summary>
    Action._isPausing = true;
    Pause();
    pauseWaitTime();
};

Action.runResume = function () {
    ///<summary>继续</summary>
    PlayResume();
    continueWaitTime();
    Action._isPausing = false;
    if (Action._actionPause) {
        Action._actionPause = false;
        Action.ContinueRun();
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
    "PlayVideo": "",
    "Second":"第二遍",
    "Third":"第三遍"
};

//试卷节点元素标签名
var PaperElementTagName = { "subject": 0, "section": 1, "item": 2, "group": 3, "question": 4 };

//试卷资源类型标签名
var PaperResourceTagName = { "subject": 0, "Schema": 1, "concrete": 2 };

//手指指向
var PointSection = { "item": "item", "group": "group", "question": "question" };

//考试页类构造
function ExamPageUtil() {
    this.__lastChoice = { "questionId": "", "answer": "" };
    this.data = null;                //当前试题数据JSON
}

ExamPageUtil.prototype.init = function (callback) {
	var that = this;
    //当前试题数据JSON
	CEFWrapper.GetClientData("getexamdata", function(data) {
		that.data = EvalData(data);
		//设置Comm中 PageUtil 引用
		CommObj.curPage = that;
		if (callback) callback();
	});        
};
