/*
* @author: bintang
* @date: 2013/05/23
* @description: 系统动态加载资源
*               -----2013-7-10载入JS依赖
*/

/**
* 资源加载
*/
function BuildLibrary() {
}

// 记录加载对象
BuildLibrary.cache = new Array;

// 动态加载JS文件
BuildLibrary.loadJS = function (url, charset) {
    if (!url) {
        return;
    }
    if (!charset) {
        charset = "UTF-8";
    }
    var charsetProperty = " charset=\"" + charset + "\" ";
    //url = pageContext + url;
    //如果存在那么返回 不载入JS;
    if (BuildLibrary.cache._isExists(url)) {
        return;
    }
    //将URL存进缓存 载入JS
    BuildLibrary.cache.push(url);
    document.write("<script type=\"text/javascript\" src=\"" + url
 			    + "\" onerror=\"alert('Error loading ' + this.src);\""
 			    + charsetProperty + "></script>");
};

// 动态加载CSS文件
BuildLibrary.loadCSS = function (url, charset) {
    if (!url) {
        return;
    }
    if (!charset) {
        charset = "UTF-8";
    }
    var charsetProperty = " charset=\"" + charset + "\" ";
    //url = pageContext + url;
    //如果存在那么返回 不载入CSS;
    if (BuildLibrary.cache._isExists(url)) {
        return;
    }
    //将URL存进缓存 载入CSS
    BuildLibrary.cache.push(url);
    var head = document.head;
    var node = document.createElement("link");
    node.rel = "stylesheet";
    node.href = url;
    head.appendChild(node);
    /*
    document
 			.write("<link href=\""
 					+ url
 					+ "\" type=\"text/css\" rel=\"stylesheet\" onerror=\"alert('Error loading ' + this.src);\""
 					+ charsetProperty + "/>");
                    */
};

/**
 * 判断缓存是否存在url
 * @param url 文件绝对路径
 * @return 如果文件存在返回true 否则返回false
 *
 */
BuildLibrary.cache._isExists = function(url){
	for(var i=0;i<BuildLibrary.cache.length;i++){
		if(BuildLibrary.cache[i] == url){
			return true;
		}
	}
	return false;
}