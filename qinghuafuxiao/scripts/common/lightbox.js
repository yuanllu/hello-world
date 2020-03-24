///<reference path="~/js/Comm/jquery-1.4.1.js"/>
///<reference path="~/js/Comm/xml2Json.js"/>
///<reference path="~/js/Comm/jquery.json-2.2.js"/>
function getEle(id) {
    return document.getElementById(id); 
}

function Lightbox() {
}

Lightbox.pageLoading = false;
Lightbox.loadingImg = "images/loading.gif";
Lightbox.imagePath = "images/";

Lightbox.initDom = function () {
    var objBody = document.getElementsByTagName("body").item(0);

    var objOverlay = document.createElement("div");
    objOverlay.setAttribute('id', 'overlay');
    objOverlay.style.cssText = "position: absolute;top: 0;left: 0;z-index: 100;width: 100%;background-color: #000;filter:alpha(opacity=60);-moz-opacity: 0.6;opacity: 0.6;";
    objOverlay.style.display = 'none';
    //objOverlay.onclick = function() { Lightbox.end(); return false; }		
    objBody.appendChild(objOverlay);
};

Lightbox.hideOverlay = function () {
    Lightbox.showSelectBoxes();
    getEle('overlay').style.display = "none";
};

Lightbox.hideSelectBoxes = function () {
    var selects = document.getElementsByTagName("select");
    for (i = 0; i != selects.length; i++) {
        selects[i].style.visibility = "hidden";
    }
};

Lightbox.showSelectBoxes = function () {
    var selects = document.getElementsByTagName("select");
    for (i = 0; i != selects.length; i++) {
        selects[i].style.visibility = "visible";
    }
};

Lightbox.showOverlay = function () {
    Lightbox.hideSelectBoxes();
    var arrayPageSize = Lightbox.getPageSize();
    getEle('overlay').style.height = arrayPageSize[1] + 'px';
    getEle('overlay').style.display = "";
};

Lightbox.getPageSize = function () {
    var xScroll, yScroll;

    if (window.innerHeight && window.scrollMaxY) {
        xScroll = document.body.scrollWidth;
        yScroll = window.innerHeight + window.scrollMaxY;
    } else if (document.body.scrollHeight > document.body.offsetHeight) { // all but Explorer Mac
        xScroll = document.body.scrollWidth;
        yScroll = document.body.scrollHeight;
    } else { // Explorer Mac...would also work in Explorer 6 Strict, Mozilla and Safari
        xScroll = document.body.offsetWidth;
        yScroll = document.body.offsetHeight;
    }

    var windowWidth, windowHeight;
    if (self.innerHeight) {	// all except Explorer
        windowWidth = self.innerWidth;
        windowHeight = self.innerHeight;
    } else if (document.documentElement && document.documentElement.clientHeight) { // Explorer 6 Strict Mode
        windowWidth = document.documentElement.clientWidth;
        windowHeight = document.documentElement.clientHeight;
    } else if (document.body) { // other Explorers
        windowWidth = document.body.clientWidth;
        windowHeight = document.body.clientHeight;
    }

    // for small pages with total height less then height of the viewport
    if (yScroll < windowHeight) {
        pageHeight = windowHeight;
    } else {
        pageHeight = yScroll;
    }

    // for small pages with total width less then width of the viewport
    if (xScroll < windowWidth) {
        pageWidth = windowWidth;
    } else {
        pageWidth = xScroll;
    }

    arrayPageSize = new Array(pageWidth, pageHeight, windowWidth, windowHeight)
    return arrayPageSize;
};

Lightbox.getPageScroll = function () {
    var yScroll;
    if (self.pageYOffset) {
        yScroll = self.pageYOffset;
    } else if (document.documentElement && document.documentElement.scrollTop) {	 // Explorer 6 Strict
        yScroll = document.documentElement.scrollTop;
    } else if (document.body) {// all other Explorers
        yScroll = document.body.scrollTop;
    }
    arrayPageScroll = new Array('', yScroll)
    return arrayPageScroll;
}

Lightbox.getAbsolutePos = function (el) {
    var sl = 0, st = 0;
    if (el.scrollLeft)
        sl = el.scrollLeft;
    if (el.scrollTop)
        st = el.scrollTop;
    var r = { x: el.offsetLeft - sl, y: el.offsetTop - st };
    if (el.offsetParent) {
        var tmp = Lightbox.getAbsolutePos(el.offsetParent);
        r.x += tmp.x;
        r.y += tmp.y;
    }
    return r;
};

Lightbox.setLoading = function (isloading, str) {
    if (isloading) {
        if (!getEle('overlay'))
            Lightbox.initDom();

        if (!getEle('pageloading')) {
            var pl = document.createElement('div');
            pl.setAttribute('id', 'pageloading');
            pl.style.cssText = "position:absolute;top:45%;left:20%;z-index:110;color:#fff;font-weight:bold;";
            pl.style.display = 'none';
            document.body.appendChild(pl);
            getEle('pageloading').innerHTML = '<img src="' + Lightbox.loadingImg + '"/><span id="spanprocess"></span>';
        }
        getEle('spanprocess').innerHTML = str;
        Lightbox.showOverlay();
        getEle('pageloading').style.display = "";
        var pageSize = Lightbox.getPageSize();
        getEle('pageloading').style.left = parseInt((pageSize[0] - getEle('pageloading').offsetWidth) / 2) + 'px';
        Lightbox.pageLoading = true;
    }
    else {
        if (Lightbox.pageLoading) {
            getEle('pageloading').style.display = "none";
            if (arguments.length < 2) {
                Lightbox.hideOverlay();
                Lightbox.pageLoading = false;
                Lightbox.showSelectBoxes();
            }
        }
    }
};

Lightbox.utilShowHtml = function (html, closeId, closeCallBack) {
    if (!getEle('overlay'))
        Lightbox.initDom();
    var boxObj = html;
    if (typeof (html) == "string") {
        boxObj = getEle('htmlBox');
        if (!boxObj) {
            var pl = document.createElement('div');
            pl.setAttribute('id', 'htmlBox');
            pl.style.display = 'none';
            document.body.appendChild(pl);
            boxObj = pl;
        }
    }
    boxObj.innerHTML = html;

    var pageSize = Lightbox.getPageSize();
    var pageScroll = Lightbox.getPageScroll();
    boxObj.style.cssText = "position:absolute;z-index:120;"; //background-color:#fff;border:#ccc 0px outset
    boxObj.style.display = "";
    boxObj.style.left = parseInt((pageSize[0] - boxObj.offsetWidth) / 2) + 'px';
    boxObj.style.top = parseInt((pageSize[1] - boxObj.offsetHeight) / 2 + pageScroll[1]) + 'px';
    Lightbox.showOverlay();
    var closeFun = function () {
        boxObj.style.display = "none";
        Lightbox.hideOverlay();
        if (typeof (closeCallBack) == "function")
            closeCallBack();
    };
    if (closeId && getEle(closeId))
        getEle(closeId).onclick = closeFun;
    //getEle('overlay').attachEvent("onclick", closeFun);
};

Lightbox.showDialog = function (title, sWidth, sHeight, contentHtml, closeCallBack) {
    var str = '<div class="tc_box" style="width:' + sWidth + '; height:'+ sHeight +'">'    //(height + 24) + 'px">'
	    + '<h1><a id="ltbox_closeId" href="#"></a>' + title + '</h1>'
        + '<div class="tc_content">'
        + contentHtml 
        + '</div></div>';
    Lightbox.utilShowHtml(str, "ltbox_closeId", closeCallBack);
};

Lightbox.showZDialog = function (title, content, closeId, closeCallBack) {
    var arrHtml = [];
    arrHtml.push('<table style="line-height: 1.4; font-size: 12px; -moz-user-select: none" id="_dialogtable_0" border="0" cellspacing="0" cellpadding="0" width="326">');
    arrHtml.push('<tbody>');
    arrHtml.push('<tr id=_draghandle_0>');
    arrHtml.push('<td style="background: url(' + Lightbox.imagePath + 'diag/dialog_lt.gif) no-repeat 0px 0px" height="33" width="13">');
    arrHtml.push('<div style="width: 13px"></div></td>');
    arrHtml.push('<td style="background: url(' + Lightbox.imagePath + 'diag/dialog_ct.gif) repeat-x 50% top" height="33">');
    arrHtml.push('<div style="padding-bottom: 0px; padding-left: 4px; padding-right: 0px; float: left; color: #fff; font-weight: bold; padding-top: 9px"><img align="absmiddle" src="' + Lightbox.imagePath + 'diag/icon_dialog.gif"><span id="_title_0">' + title + '</span></div>');
    arrHtml.push('<div id="_closeDlg" style="background-image: url(' + Lightbox.imagePath + 'diag/dialog_closebtn.gif); position: relative; margin: 3px 0px 0px; width: 28px; float: right; height: 17px; cursor: pointer" onmouseover="this.style.backgroundimage=\'url(' + Lightbox.imagePath + 'diag/dialog_closebtn_over.gif)\'" onmouseout="this.style.backgroundimage=\'url(' + Lightbox.imagePath + 'diag/dialog_closebtn.gif)\'"></div></td>');
    arrHtml.push('<td style="background: url(' + Lightbox.imagePath + 'diag/dialog_rt.gif) no-repeat right 0px" height=33 width=13>');
    arrHtml.push('<div style="width: 13px"></div></td></tr>');
    arrHtml.push('<tr valign=top>');
    arrHtml.push('<td style="background: url(' + Lightbox.imagePath + 'diag/dialog_mlm.gif) repeat-y left 50%" width=13></td>');
    arrHtml.push('<td align=middle>');
    arrHtml.push('<table border=0 cellspacing=0 cellpadding=0 width="100%" bgcolor=#ffffff>');
    arrHtml.push('<tbody>');
    arrHtml.push('<tr style="display: none" id=_messagerow_0>');
    arrHtml.push('<td height=50 valign=top>');
    arrHtml.push('<table style="background: url(' + Lightbox.imagePath + 'diag/dialog_bg.jpg) #eaece9 no-repeat right top" id=_messagetable_0 border=0 cellspacing=0 cellpadding=0 width="100%">');
    arrHtml.push('<tbody>');
    arrHtml.push('<tr>');
    arrHtml.push('<td height=50 width=50 align=middle><img id=_messageicon_0 src="' + Lightbox.imagePath + 'diag/window.gif" width=32 height=32></td>');
    arrHtml.push('<td style="line-height: 16px" align=left>');
    arrHtml.push('<div style="font-weight: bold" id=_messagetitle_0></div>');
    arrHtml.push('<div id=_message_0></div></td></tr></tbody></table></td></tr>');
    arrHtml.push('<tr>');
    arrHtml.push('<td valign=top align=middle>');
    arrHtml.push('<div style="position: relative; width: 300px; height: 100px" id=_container_0>');
    arrHtml.push('<div style="position: absolute; background-color: #fff; width: 100%; display: none; height: 100%; opacity: 0.5" id=_covering_0>&nbsp;</div>');
    arrHtml.push('<div>' + content + '</div></div></td></tr>');
    arrHtml.push('</tbody></table></td>');
    arrHtml.push('<td style="background: url(' + Lightbox.imagePath + 'diag/dialog_mrm.gif) repeat-y right 50%" width=13></td></tr>');
    arrHtml.push('<tr>');
    arrHtml.push('<td style="background: url(' + Lightbox.imagePath + 'diag/dialog_lb.gif) no-repeat 0px bottom" height=13 width=13></td>');
    arrHtml.push('<td style="background: url(' + Lightbox.imagePath + 'diag/dialog_cb.gif) repeat-x 50% bottom"></td>');
    arrHtml.push('<td style="background: url(' + Lightbox.imagePath + 'diag/dialog_rb.gif) no-repeat right bottom" height=13 width=13></td></tr></tbody></table>');
    arrHtml.push('<div></div>');
    Lightbox.utilShowHtml(arrHtml.join(''), closeId, closeCallBack);
};