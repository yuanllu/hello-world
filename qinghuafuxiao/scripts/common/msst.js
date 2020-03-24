var sanTin_lines=[];   // 可用于流程最后保存答案

//线条移动
function movingLine(ctrlName){
	this.lines=[];  //线条
	this.selectLine=null;  //选中的线条
	this.moveFlag=false;  //是否正在移动线条标识
	this.canvas=document.getElementById(ctrlName);  //画布
	this.canvasClientRect=this.canvas.getBoundingClientRect();  //canvas在窗体视图中的位置信息top、left、bottom、right等
	this.canvasContext=this.canvas.getContext("2d"); 
	var that=this;

	//事件
    this.canvas.onmousedown = function(e){
		that.mouseDown(e,that)
	};
    this.canvas.onmouseup =function(e){
		that.mouseUp(e,that);
	} 
    this.canvas.onmouseout = function(e){
		that.mouseOut(e,that);
	}
    this.canvas.onmousemove = function(e){
		that.mouseMove(e,that);
	}
}
//初始化线条
movingLine.prototype.initLines=function(row,col){
	this.lines=[];
	var startX=0, startY=0;
	//竖直线
	for(var j=0;j<col;j++){
		//var line=new rect_line(startX,0,false,'vertical','#EE3B3B','');
		var line=new point_line(startX,0,false,'vertical','#EE3B3B','');
		this.lines.push(line);
		startX+=8;
	}
	//水平线
	for(var i=0;i<row;i++){
		//var line=new rect_line(0,startY,false,'horizontal','#0000CD','');
		var line=new point_line(0,startY,false,'horizontal','#0000CD','');
		this.lines.push(line);
		startY+=48;
	}
	//this.drawRectLines(); 
	this.drawPointLines();
	sanTin_lines=this.lines;
}
//在画布中绘制矩形线条
movingLine.prototype.drawRectLines=function(){
	this.canvasContext.clearRect(0,0,this.canvas.width,this.canvas.height);
	for(var i=0;i<this.lines.length;i++){
		var line=this.lines[i];
		this.canvasContext.beginPath();
		this.canvasContext.fillStyle=line.color; //颜色
		if(line.type == 'horizontal'){
			this.canvasContext.fillRect(line.x, line.y, this.canvas.width,2);
		}else{
			this.canvasContext.fillRect(line.x, line.y, 2,this.canvas.height);
		}
		this.canvasContext.stroke();
	}
}
//在画布中绘制点线条
movingLine.prototype.drawPointLines=function(){
	this.canvasContext.clearRect(0,0,this.canvas.width,this.canvas.height);
	for(var i=0;i<this.lines.length;i++){
		var line=this.lines[i];
		this.canvasContext.beginPath();
		this.canvasContext.strokeStyle=line.color; //颜色
		this.canvasContext.lineWidth=2;
		this.canvasContext.moveTo(line.x, line.y);
		if(line.type == 'horizontal'){
			this.canvasContext.lineTo(this.canvas.width,line.y);
		}else{
			this.canvasContext.lineTo(line.x,this.canvas.height);
		}
		this.canvasContext.stroke();
	}
}
//鼠标按下事件
movingLine.prototype.mouseDown=function(e,thatObj){
	var client_x=thatObj.getMouse_X(e);
	var client_y=thatObj.getMouse_Y(e);
	console.log(client_x + ' **** '+ client_y);
	var width=thatObj.canvas.width;
	var height=thatObj.canvas.height;
	thatObj.moveFlag=false;
	for(var i=0;i<thatObj.lines.length;i++){
		var line=thatObj.lines[i];
		if(line.type == 'horizontal'){
			//水平线   (容错误差 2)
			if(client_y>=line.y-2 && client_y<=line.y+2){
				thatObj.selectLine=line;
				thatObj.selectLine.isSelected=true;
				thatObj.moveFlag=true;
				break;
			}
		}else{
			//竖直线  (容错误差 2)
			if(client_x>=line.x-2 && client_x<=line.x+2){
				thatObj.selectLine=line;
				thatObj.selectLine.isSelected=true;
				thatObj.moveFlag=true;
				break;
			}
		}
	}

	return false;
}
//鼠标松开
movingLine.prototype.mouseUp=function(e,thatObj){
	thatObj.moveFlag=false;
	//thatObj.drawRectLines(); 
	this.drawPointLines();
	if(thatObj.selectLine !=null){
		thatObj.selectLine.isSelected=false;
		thatObj.selectLine=null;
	}
	return false;
}
//移出绘制区域
movingLine.prototype.mouseOut=function(e,thatObj){
	thatObj.moveFlag=false;
	//thatObj.drawRectLines();
	this.drawPointLines(); 
	if(thatObj.selectLine !=null){
		thatObj.selectLine.isSelected=false;
		thatObj.selectLine=null;
	}
	return false;
}
//鼠标移动
movingLine.prototype.mouseMove=function(e, thatObj){
	if(thatObj.moveFlag && thatObj.selectLine !=null){
		var client_x=thatObj.getMouse_X(e);
		var client_y=thatObj.getMouse_Y(e);
		if(thatObj.selectLine.type == 'horizontal'){
			if(client_y +2< thatObj.canvas.height){
				thatObj.selectLine.y= client_y;
			}
		}else{
			if(client_x +2< thatObj.canvas.width){
				thatObj.selectLine.x= client_x;
			}
		}
		//thatObj.drawRectLines(); 
		this.drawPointLines();
	}
	return false;
}
//获取鼠标在canvas内坐标x
movingLine.prototype.getMouse_X=function(ev){
	return ev.clientX-this.canvas.getBoundingClientRect().left;
}
//获取鼠标在canvas内坐标y
movingLine.prototype.getMouse_Y=function(ev){
	return ev.clientY-this.canvas.getBoundingClientRect().top;  
}

//矩形线条
function rect_line(x,y,isSelect,type,color,text){
	this.x = x;
	this.y = y;
	this.isSelected=isSelect;
	this.type = type;
	this.color=color;
	this.text = text;
}

//点线条
function point_line(x,y,isSelect,type,color,text){
	this.x = x;
	this.y = y;
	this.isSelected=isSelect;
	this.type = type;
	this.color=color;
	this.text = text;
}