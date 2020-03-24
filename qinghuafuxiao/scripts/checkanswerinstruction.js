var CheckAnswerInstructions = new ExamPageUtil();

CheckAnswerInstructions.__choiceIndexList = [];

function documentReady() {
    CheckAnswerInstructions.init(function () {
        //显示题目
        CEFWrapper.GetListenSectionsExamData(function (result) {
            var sectionDataArr = result;
            CheckAnswerInstructions.AppendActionsAndShowView(sectionDataArr);
        });
    });
};

CheckAnswerInstructions.getPromptPath = function () {
    /// <summary>测试准备音频路径</summary>
    var srcPath = CheckAnswerInstructions.data.ExamineePath;
    var voicePath = "CheckAnswerPormpt.wov";
    return srcPath + "paper\\" + voicePath;
};

CheckAnswerInstructions.AppendActionsAndShowView = function (sectionDataArr) {
    var that = this;
    if (!sectionDataArr) {
        return;
    }
    $(".section_content").html("");
    var i = 0;
    async.whilst(
        function () {
            return i < sectionDataArr.length;
        },
        function (callback) {
            var sectionData = eval("(" + sectionDataArr[i].section + ")");
            // 获取本大题的乱序信息
            CEFWrapper.GetRandomInfoData(sectionData.SchemaSection.name, function (randomInfo) {
                if (randomInfo) sectionData.SchemaSection.randomItem = randomInfo;
                // 对本大题进行乱序处理
                CommObj.curPage.data = ItemRandom(sectionData);
                Action.loadMainAction(CommObj.curPage.data,
                    function (result) {
                        if (result) {
                            log("加载Action出错：" + result);
                        } else {
                            var actionLen = Action._actionList.length;
                            var curViewPage = -1;
                            $(".section_content").append(that.getSectionHtml(i));
                            var j = 0;
                            async.whilst(
                                function () {
                                    return j < actionLen;
                                }, //验证成功继续，失败进回调
                                function (next) {
                                    var action = Action._actionList[j];
                                    if (action.viewName.indexOf("Section\\") < 0) {
                                        if (curViewPage != action.viewPage) {
                                            curViewPage = action.viewPage;
                                            $(".section_" + i).append('<div class="words question_' + i + '_' + curViewPage + '"></div>');
                                            Action.currentActionIndex = j;

                                            Action.viewPage(action.viewName, action.viewPage, i, function () {
                                                j++;
                                                next();
                                            });
                                        }
                                    } else {
                                        j++;
                                        next();
                                    }
                                },
                                function (err) {
                                    if (err) {
                                        console.log("加载页面出错：" + err.message);
                                    } else {
                                        CEFWrapper.GetObjectAnswersExamData(function (result) {
                                            that.showObjectAnswers(result);
                                            i++;
                                            callback();
                                        });
                                    }

                                }
                            );
                        }
                    }
                ); //end Action.loadMainAction
            });
        },
        function (err) {
            if (err) {
                console.log("加载页面出错：" + err.message);
            } else {
                //倒计时60秒以后保存答案
                console.log("WaitTime:");
                WaitTime("", 60, true);
            }
        }
    );
}

//显示主观题答案
CheckAnswerInstructions.showObjectAnswers = function (answerDataArr) {
    if (!answerDataArr) return;

    var answerLen = answerDataArr.length;
    for (var i = 0; i < answerLen; i++) {
        var objAnswer = answerDataArr[i];
        var questionId = objAnswer.questionid;
        var valAnswer = objAnswer.answer;
        if (objAnswer.type == "listen") {
            var $targetInput = $("#question_" + questionId + " span>input[type='radio'][value='" + valAnswer + "']");
            var inputs = $targetInput.attr("checked", true);
            $targetInput.parent().removeClass('radio_normal');
            $targetInput.parent().addClass('radio_checked');
        } else if (objAnswer.type == "write") {
            $("input[type='text']#" + questionId).val(valAnswer);
        }
    }
};

CheckAnswerInstructions.getSectionHtml = function (index) {
    return String.format('<div class="section_{0}"><div class="title_box"><div class="title title_{0}"></div><div class="guide guide_{0}"></div><div class="prompt prompt_{0}"></div></div></div>', index);
}

function SaveWriteTypeAnswers(callback) {
    var j = 0;
    var inputs = $(".caption input[type='text']");
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
                callback();
            }
        }
    );
}

function OnWaitTimeEnd(callBackData) {
    async.waterfall([
        function (callback) {
            //保存所有填空题的答案
            SaveWriteTypeAnswers(function () {
                callback();
            });
        },
        function (callback) {
            //设置断点续考点并将答案保存到xml
            //SetBreakPointInfo(function () {
                callback();
            //});
        }
    ], function (err, result) {
        //下一题
        SectionEnd("1");
    });
}

function OnNextEnd(callBackData) {
    SectionEnd("1", "1");
}

function OnPrevEnd(callBackData) {
    SectionEnd("-1", "-1");
}

function OnSkipEnd(callBackData) {
    SectionEnd("1");
}