/*
* @author: szsheng
* @date: 2013/4/2
* @description: 与外壳通信
*/

function documentReady() { }

/* ---------------------------------------------------------------------------------------- */
var BridgingUtil = {}; //与客户端通信桥接
BridgingUtil.exchangeElementId = "_pscp_exchangedata_hide_";
BridgingUtil.initialized = false;
BridgingUtil.init = function () {
    if (this.initialized) return;
    var ele = document.createElement("input");
    ele.id = this.exchangeElementId;
    ele.type = "hidden";
    document.body.appendChild(ele);
    this.initialized = true;
};
BridgingUtil.getDataFromDOM = function () {
    this.init();
    var ele = document.getElementById(this.exchangeElementId);
    return ele.value;
};
BridgingUtil.setDataToDOM = function (txt) {
    this.init();
    var ele = document.getElementById(this.exchangeElementId);
    ele.value = txt;
};
BridgingUtil.Clear = function () {
    if (this.initialized) {
        this.setDataToDOM("");
    }
    else {
        this.init();
    }
};
