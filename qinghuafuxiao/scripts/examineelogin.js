/// <reference path="common/jquery-1.4.1.js" />
/// <reference path="common/Comm.js" />
/// <reference path="common/Models.js" />

/*
 * @author: szsheng
 * @date: 2010/09/09
 * @description: 考试机登录
 * @update: shuhu 2017/1/5
 */

var LoginUtil = {};
LoginUtil.flag = false;
LoginUtil.isResumeExaminee = false;
LoginUtil.step = 1;
LoginUtil.digitsRequire = 22;
LoginUtil._autoLogin = false;
LoginUtil._seatCode = "";
LoginUtil._needCamera = false;
LoginUtil._video = null;
LoginUtil._videoCanvas = null;
LoginUtil._videoContext = null;
LoginUtil._faceCanvas = null;
LoginUtil._faceContext = null;
// 摄像头人脸区域的位置
LoginUtil._faceLeft = 0;
LoginUtil._faceTop = 0;
LoginUtil._faceWidth = 0;
LoginUtil._faceHeight = 0;
LoginUtil._cameraTimer = null;
LoginUtil._cameraFlag = true;
// 当前的人脸特征
LoginUtil._FaceFeaCount = 0;
LoginUtil._curFaceFea = null;
LoginUtil._roundIdentity = "";
// 摄像头对象
LoginUtil._mediaStreamTrack = null;
LoginUtil._faceRecgTimer = null;
LoginUtil._traceFaceTimer = null;

LoginUtil.autoLogin = function () {
    CEFWrapper.GetClientData("autologinid", function (loginExamId) {
        if ("" == loginExamId)
           return callback();
        //loginExamId = LoginUtil._seatCode;
        LoginUtil._autoLogin = true;
        $("#txtExamId2").val(loginExamId);
        $('#btnLogin').click();
        setTimeout("$('#btnLogin').click();", Math.floor(Math.random() * 3000));
    });
};

LoginUtil.checkInput = function () {
    var examid = $("#txtExamId2").val();
    examid = $.trim(examid);
    if (examid == "") {
        LoginUtil.showErrMsg("* 请填写考号");
        return false;
    }

    // 校验输入的考试号
    var rgx = new RegExp("^[-a-z0-9_]{1," + LoginUtil.digitsRequire + "}$", "i");
    if (rgx.test(examid))
        return true;

    LoginUtil.showErrMsg("* 考号填写格式不正确");
    return false;
};

LoginUtil.getExamId = function () {
    var examId2 = $("#txtExamId2").val();
    return $.trim(examId2);
};

LoginUtil.showErrMsg = function (msg) {
    $("#errMsg").show();
    $("#errMsg").html(msg);
};

LoginUtil.hideErrMsg = function () {
    $("#errMsg").hide();
    $("#errMsg").html();
};

// 加载TTP特性
LoginUtil.loadTaskTypePatch = function (cfgObj, callback) {
    var imgLoginTitle1 = $("#imgLoginTitle1");
    var imgLoginTitle2 = $("#imgLoginTitle2");
    var tdZkz = $("#tdZkz");

    async.waterfall([
        function (callback) {
            // login_1_s
            CEFWrapper.GetClientData("ttpfile->login_1.jpg", function (ttpFile) {
                if (ttpFile != "")
                    imgLoginTitle1.attr("src", ttpFile);
                return callback(null);
            })
        },
        function (callback) {
            // login_4
            CEFWrapper.GetClientData("ttpfile->login_4.jpg", function (ttpFile) {
                if (ttpFile != "")
                    imgLoginTitle2.attr("src", ttpFile);
                return callback(null);
            })
        },
        function (callback) {
            // login_1_s
            CEFWrapper.GetClientData("ttpfile->zkz.jpg", function (ttpFile) {
                if (ttpFile != "")
                    tdZkz.css("background-image", "url(file:///" + ttpFile.replace(/\\/g, '/') + ")");
                return callback(null);
            })
        }
    ], function (err, results) {
        callback();
    });
};

// 用户登录结束
LoginUtil.OnLoginEnd = function (data) {
    var obj = eval("(" + data + ")");
    LoginUtil.flag = false;
    // 断点续考时，不让学生重新登录
    if (LoginUtil.isResumeExaminee) {
        $("#tdNews").css("background-image", "url(../images/news_2.png)");
        $("#btnReset").hide();
    } else {
        //$("#btnReset").disable(false);

        $("#btnReset").removeClass("btn_chongTiandisabled");
        $("#btnReset").addClass("btn_chongTian");
        $("#btnReset").attr("disabled", false);

        $("#txtExamId2").disable(false);
    }

    if (obj.result != "") {
        //$("#btnLogin").disable(false);
        $("#btnLogin").removeClass("btn_jinRudisabled");
        $("#btnLogin").addClass("btn_jinRu");
        $("#btnLogin").attr("disabled", false);
        LoginUtil.showErrMsg(obj.result);
        return;
    }

    obj.photo = "file:///" + obj.photo.replace(/\\/g, "/");
    if (LoginUtil._needCamera) LoginUtil.stopCamera();
    $("#examid").val("考号：  " + obj.examid);
    $("#userPhoto").attr("src", obj.photo);
    $("#userName").val("姓名：  "+obj.name);
    $("#loginBox").hide();
    $("#faceLoginBox").hide();
    $("#verifyBox").show();
    $("#loginBtnBox").show();
    $("#entryBtnBox").hide();
    LoginUtil.step = 2;
    //$("#btnLogin").disable(false);
    $("#btnLogin").attr("disabled", false);
    $("#btnLogin").focus();
    $("#btnLogin").removeClass("btn_jinRudisabled");
    $("#btnLogin").addClass("btn_jinRu");

    if (LoginUtil._autoLogin) //自动登录
        setTimeout("$('#btnLogin').click();", 1000);
}

// 人脸识别登录结束
LoginUtil.OnFaceLoginEnd = function (data) {
    if (data.result != "") {
        console.log(data.result);
        return;
    }

    data.photo = "file:///" + data.photo.replace(/\\/g, "/");
    if (LoginUtil._needCamera) LoginUtil.stopCamera();
    $("#examid").val("考号：  " + data.examid);
    $("#userPhoto").attr("src", data.photo);
    $("#userName").val("姓名：  "+ data.name);
    $("#loginBox").hide();
    $("#faceLoginBox").hide();
    $("#verifyBox").show();
    $("#loginBtnBox").show();
    $("#entryBtnBox").hide();
    // 清空计时器
    if (LoginUtil._faceRecgTimer) {
        clearInterval(LoginUtil._faceRecgTimer);
        LoginUtil._faceRecgTimer = null;
    }
    LoginUtil.step = 2;
    LoginUtil.hideErrMsg();
    $("#btnLogin").disable(false);
    $("#btnReset").disable(false);
    $("#txtExamId2").disable(false);
    $("#btnLogin").focus();

    if (LoginUtil._autoLogin) //自动登录
        setTimeout("$('#btnLogin').click();", 1000);
}

// 人脸识别超时
LoginUtil.timeoutRecognize = function (data) {
    if (LoginUtil.step == 1) {
        if (LoginUtil._needCamera) LoginUtil.stopCamera();
        $("#faceLoginBox").hide();
        $("#loginBox").show();
        $("#loginBtnBox").show();
        $("#entryBtnBox").hide();
        LoginUtil.showErrMsg("人脸识别失败，请使用准考证号登录");
    }
}

// 用户登录确认结束
LoginUtil.OnVerifyEnd = function (data) {
    if (data != "") {
        $("#btnLogin").disable(false);
        $("#btnReset").disable(false);
        $("#txtExamId2").disable(false);
        LoginUtil.showErrMsg(data);
        return;
    }

    // 等待试音
    CEFWrapper.WaitAudition("");
}

//绑定控件事件
LoginUtil.bindingEvent = function () {
    $("#txtExamId2").keypress(function () {
        var keyCode = event.keyCode;

        if ((keyCode == 13) && (!LoginUtil.flag)) {
            LoginUtil.flag = true;
            $("#txtExamId2").disable = true;
            $("#btnLogin").click();
            $("#btnLogin").disable = true;
            event.returnValue = false;
        }

        if (1 == LoginUtil.userIdType) { //系统准考号
            if (keyCode < 48 || keyCode > 57)
                event.returnValue = false;
        }
    });

    $("#txtExamId2").bind("keyup", function () {
        var _val = this.value;

        if (1 == LoginUtil.userIdType) //系统准考号
        {
            if (_val.match(/[^0-9]/)) {
                _val = _val.replace(/[０-９]/g, function ($1) {
                    var cCode = $1.charCodeAt(0);
                    cCode -= 65248;
                    return String.fromCharCode(cCode);
                });
                _val = _val.replace(/[^0-9]/g, "");
                $(this).val(_val);
            }
        } else {
            if (_val.match(/[^-a-z0-9_]/i)) {
                _val = _val.replace(/[^-a-z0-9_]/ig, "");
                $(this).val(_val);
            }
        }
        $("#txtExamId2").disable = false;
    });
    $("#btnLogin").unbind().bind('click', function () {
        //$("#btnLogin").disable(true);
        //$("#btnReset").disable(true);


        $("#btnLogin").removeClass("btn_jinRu");
        $("#btnLogin").addClass("btn_jinRudisabled");

        $("#btnLogin").attr("disabled", true);
        $("#btnReset").removeClass("btn_chongTian");
        $("#btnReset").addClass("btn_chongTiandisabled");
        $("#btnReset").attr("disabled", true);
        $("#txtExamId2").disable(true);
        this.blur();
        LoginUtil.hideErrMsg();
        if (LoginUtil.step == 1) {
            $("#txtExamId2").focus();
            if (!LoginUtil.checkInput()) {
                //$("#btnLogin").disable(false);
                //$("#btnReset").disable(false);

                $("#btnLogin").removeClass("btn_jinRudisabled");
                $("#btnLogin").addClass("btn_jinRu");
                $("#btnLogin").attr("disabled", false);
                $("#btnReset").removeClass("btn_chongTiandisabled");
                $("#btnReset").addClass("btn_chongTian");
                $("#btnReset").attr("disabled", false);
                $("#txtExamId2").disable(false);
                LoginUtil.flag = false;
                return;
            }
            var examId = LoginUtil.getExamId();
            CEFWrapper.Login(1, examId, LoginUtil.OnLoginEnd);
        } else if (LoginUtil.step == 2) {
            CEFWrapper.Verify("", LoginUtil.OnVerifyEnd);
        }
    });
    $("#btnReset").unbind().bind('click', function () {
        LoginUtil.step = 1;
        LoginUtil.flag = false;
        LoginUtil.hideErrMsg();
        $("#verifyBox").hide();
        $("#loginBox").show();
        $("#txtExamId2").val("");
        $("#txtExamId2").focus();
        $("#userPhoto").src='images/zp.jpg';
        $("#userName").val("");
        $("#examid").val("");
        // 重新尝试人脸登录
        if (LoginUtil._needCamera) {
            LoginUtil._curFaceFea = null;
            LoginUtil._faceContext.clearRect(0, 0, LoginUtil._faceCanvas.clientWidth, LoginUtil._faceCanvas.clientHeight);
            LoginUtil._cameraFlag = true;
        }
    });
    $("#btnEntry").unbind().bind('click', function () {
        LoginUtil.step = 1;
        LoginUtil.flag = false;
        LoginUtil.hideErrMsg();
        if (LoginUtil._mediaStreamTrack == null) {
            $("#faceLoginBox").hide();
            $("#loginBox").show();
            $("#loginBtnBox").show();
            $("#entryBtnBox").hide();
        } else {
            $("#imgFaceLogin").attr("src", "images/login_rldl.jpg");
            $("#entryBtnBox").hide();
            LoginUtil.faceRecognize();
        }  
    });

    $("#txtExamId2").blur(function () {
        if (LoginUtil.step == 1)
            this.focus();
    });
}

// 人脸登录功能
LoginUtil.faceRecognize = function () {
    var faceRecgTime = 30;
    // 30秒倒计时
    var radialObj = radialIndicator("#radialIndicatorContext", {
        barColor: '#84C1FF',
        barWidth: 5,
        initValue: faceRecgTime,
        maxValue: faceRecgTime,
        minValue: 0,
        radius: 20,
        roundCorner: true
    });
    radialObj.animate(200);
    // 开启人脸自动登录功能
    LoginUtil.identityRecognize();
    // 开启30秒计时
    LoginUtil._faceRecgTimer = setInterval(function () {
        faceRecgTime = faceRecgTime - 1;
        radialObj.value(faceRecgTime);
        if (faceRecgTime <= 0) {
            if (LoginUtil._faceRecgTimer) {
                clearInterval(LoginUtil._faceRecgTimer);
                LoginUtil._faceRecgTimer = null;
            }
            LoginUtil.timeoutRecognize();
        }
    }, 1000);
};

LoginUtil.initCamera = function (callback) {
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
            return callback('摄像头设备初始化失败，请点击开始使用准考证号登录');
        }

        if (navigator.getUserMedia) {
            navigator.getUserMedia({
                'video': {
                    'optional': [{
                        'sourceId': exArray[0] //0为前置摄像头，1为后置
                    }]
                }
            }, function (stream) {
                LoginUtil._mediaStreamTrack = stream.getTracks()[0];
                // 初始化控件对象
                LoginUtil._video = document.getElementById('camera');
                LoginUtil._videoCanvas = document.getElementById('camera1');
                LoginUtil._videoContext = LoginUtil._videoCanvas.getContext('2d');
                LoginUtil._faceCanvas = document.getElementById('camera2');
                LoginUtil._faceContext = LoginUtil._faceCanvas.getContext('2d');

                if (!LoginUtil._video)
                    return callback('摄像头设备加载失败，请点击开始使用准考证号登录');
                LoginUtil._video.src = window.URL && window.URL.createObjectURL(stream) || stream;
                callback(null);
            }, function (error) {
                callback(error);
            });    //success是获取成功的回调函数
        }
        else {
            callback('当前的机器环境不支持WebRTC技术，请点击开始使用准考证号登录');
        }
    });
}

LoginUtil.DrawFactRect = function (x, y, w, h) {
    LoginUtil._faceContext.clearRect(0, 0, LoginUtil._faceCanvas.clientWidth, LoginUtil._faceCanvas.clientHeight);
    LoginUtil._faceContext.lineWidth = 3;
    LoginUtil._faceContext.strokeStyle = "#0f0";
    LoginUtil._faceContext.strokeRect(x, y, w, h);
    LoginUtil._faceContext.stroke();
}

// 将视频帧绘制到Canvas对象上,Canvas每100ms切换帧，形成肉眼视频效果
LoginUtil.startCamera = function () {
    LoginUtil._cameraFlag = true;
    LoginUtil._cameraTimer = window.setInterval(function () {
        try {
            if (!LoginUtil._cameraFlag) return;

            // 切换分辨率到3:4的大小
            if (LoginUtil._video.videoWidth * 4 > LoginUtil._video.videoHeight * 3) {
                LoginUtil._faceWidth = LoginUtil._video.videoHeight * 0.75;
                LoginUtil._faceHeight = LoginUtil._video.videoHeight
                LoginUtil._faceLeft = (LoginUtil._video.videoWidth - LoginUtil._faceWidth) / 2;
                LoginUtil._faceTop = 0;
            } else {
                LoginUtil._faceWidth = LoginUtil._video.videoWidth;
                LoginUtil._faceHeight = LoginUtil._video.videoWidth * 1.25
                LoginUtil._faceLeft = 0;
                LoginUtil._faceTop = (LoginUtil._video.videoHeight - LoginUtil._faceHeight) / 2;
            }

            LoginUtil._videoContext.drawImage(LoginUtil._video, LoginUtil._faceLeft, LoginUtil._faceTop,
                LoginUtil._faceWidth, LoginUtil._faceHeight, 0, 0, LoginUtil._faceCanvas.clientWidth, LoginUtil._faceCanvas.clientHeight);
        } catch (err) {
        }
    }, 100);

    // 开启人脸跟踪功能
    LoginUtil.traceFace();
}

// 结束拍照
LoginUtil.stopCamera = function () {
    LoginUtil._cameraFlag = false;
    LoginUtil._mediaStreamTrack && LoginUtil._mediaStreamTrack.stop();
}

// 身份识别
LoginUtil.identityRecognize = function () {
    // 提取人脸特征
    try {
        if (LoginUtil._cameraFlag && LoginUtil._curFaceFea && LoginUtil._curFaceFea.fea_len > 0) {
            // 进行服务端身份识别
            var cmdArgs = JSON.stringify({
                "fea": LoginUtil._curFaceFea.fea,
                "fea_len": LoginUtil._curFaceFea.fea_len
            });

            // 使用人脸特征进行登录
            CEFWrapper.Login(2, cmdArgs, function (result) {
                var identity_result = EvalData(result);
                if (identity_result && identity_result.examid != "") {
                    LoginUtil.OnFaceLoginEnd(identity_result);
                }
                return setTimeout(LoginUtil.identityRecognize, 1000);
            });
        } else {
            return setTimeout(LoginUtil.identityRecognize, 1000);
        }
    }
    catch (err) {
        return setTimeout(LoginUtil.identityRecognize, 1000);
    }
};

// 实时跟踪人脸的位置
LoginUtil.traceFace = function () {
    try {
        if (LoginUtil._cameraFlag) {
            var imageData = "";
            LoginUtil._FaceFeaCount++;
            if (LoginUtil._FaceFeaCount % 3 == 0) {
                imageData = LoginUtil._videoCanvas.toDataURL("image/jpeg", 1.0) + '|' + LoginUtil._faceCanvas.clientWidth
                    + '|' + LoginUtil._faceCanvas.clientHeight + '|1';
            } else {
                imageData = LoginUtil._videoCanvas.toDataURL("image/jpeg", 1.0) + '|' + LoginUtil._faceCanvas.clientWidth
                    + '|' + LoginUtil._faceCanvas.clientHeight + '|0';
            }

            CEFWrapper.GetFaceRect(imageData, function (result) {
                var face_rect = EvalData(result);
                // 每隔10次保留人脸特征到当前的特征值里面
                if (LoginUtil._FaceFeaCount % 3 == 0) {
                    LoginUtil._curFaceFea = face_rect;
                }

                if (face_rect) {
                    LoginUtil.DrawFactRect(face_rect.x, face_rect.y, face_rect.w, face_rect.h);
                } else {
                    LoginUtil._faceContext.clearRect(0, 0, LoginUtil._faceCanvas.clientWidth, LoginUtil._faceCanvas.clientHeight);
                }

                LoginUtil._traceFaceTimer = setTimeout(LoginUtil.traceFace, 100);
            });
        }
    }
    catch (err) {
        console.log(err);
        LoginUtil._traceFaceTimer = setTimeout(LoginUtil.traceFace, 100);
    }
};

LoginUtil.loginBegin = function () {
    if ($("#connectBox").is(":visible")) {
        $("#connectBox").hide();
        //获取续考考生号，如果为断点续考直接进入确认界面
        CEFWrapper.GetClientData("resumeexamineeid", function (resumeexamineeid) {
            if (resumeexamineeid != "") {
                LoginUtil.isResumeExaminee = true;
                $("#txtExamId2").val(resumeexamineeid);
                // 点击登录
                setTimeout(function () { $('#btnLogin').click(); }, 100);
            } else {
                LoginUtil.init();
            }
        });
    }
};

//初始化
LoginUtil.init = function (callback) {
    CEFWrapper.GetClientData("examcfg", function (cfgObj) {
        var examCfg = EvalData(cfgObj);
        LoginUtil.loadTaskTypePatch(examCfg, function () {
            if (examCfg.need_camera) {
                $("#loginBox").hide();
                $("#faceLoginBox").show();
                $("#loginBtnBox").hide();
                $("#entryBtnBox").show();
                LoginUtil._needCamera = true;
                LoginUtil.initCamera(function (err) {
                    // 摄像头初始化成功后调用拍照，否则隐藏摄像头框
                    if (err) {
                        LoginUtil.showErrMsg(err);
                    } 
                    else
                        LoginUtil.startCamera();
                });
            } else {
                $("#faceLoginBox").hide();
                $("#loginBox").show();
                $("#loginBtnBox").show();
                $("#entryBtnBox").hide();
                //尝试自动登录
                LoginUtil.autoLogin();
            }
        });
    });
};

function documentReady() {
    async.waterfall([
        // 获取座位号
        function (callback) {
            CEFWrapper.GetClientData("seatcode", function (seatcode) {
                if (seatcode == "")
                    return callback("座位号为空");

                LoginUtil._seatCode = seatcode;
                if (seatcode.length < 2)
                    seatcode = "0" + seatcode;
                $("#seatNum1").attr("src", "images/seatNum/num" + seatcode.charAt(0) + "_.png");
                $("#seatNum2").attr("src", "images/seatNum/num_" + seatcode.charAt(1) + ".png");
                return callback(null);
            });
        },
        //初始化，失败直接返回
        function (callback) {
            CEFWrapper.GetClientData("initexamin", function (result) {
                var initObj = EvalData(result);
                if (initObj && initObj.errInf.length != 0) {
                    return callback("初始化考试端失败");
                }
                return callback(null);
            });
        },
        // 获取场次标识
        function (callback) {
            CEFWrapper.GetClientData("roundidentity", function (identity) {
                LoginUtil._roundIdentity = identity;
                return callback(null);
            });
        },
    ], function (err, result) {
        if (err) return $("#initMsg").html('<font color="Red">初始化考试端失败……</font>');

        LoginUtil.bindingEvent();
        multStyleButton();
        // 发送考试机启动成功状态
        CEFWrapper.StartSuccess(function () {});
        
        // 如果存在场次标识，说明已经开始场次
        if (LoginUtil._roundIdentity)
            LoginUtil.loginBegin();
        else
            $("#initMsg").html('考试机启动成功，请等待考试正式开始');
    });

}

function documentOver() {
    LoginUtil._cameraFlag = false;
    if (LoginUtil._traceFaceTimer) clearTimeout(LoginUtil._traceFaceTimer);
}
