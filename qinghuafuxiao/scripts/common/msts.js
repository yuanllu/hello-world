var canvas;
var context;
var isDraging =false;
var previousSelectedObject;
var objs = [];
var x;
var y;


var init = function(){
    objs = [];
    canvas = document.getElementById("canvas2");
    context = canvas.getContext("2d");
    var circle = new Circle(300,50,5,"circle");
    var dislpayLine1 = new dislpayLine(50,150,"lines","透视线1");
    var dislpayLine2 = new dislpayLine(50,200,"lines","透视线2");
    var dislpayLine3 = new dislpayLine(50,250,"lines","透视线3")
    var dislpayLine4 = new dislpayLine(50,300,"lines","透视线4");
    objs.push(circle);
    objs.push(dislpayLine1);
    objs.push(dislpayLine2);
    objs.push(dislpayLine3);
    objs.push(dislpayLine4);
    drawEach();
    canvas.onmousedown = canvasClick;
    canvas.onmouseup = stopDragging;
    canvas.onmouseout = stopDragging;
    canvas.onmousemove = dragPic;
}

var canvasClick = function(e){
    
    var rect = canvas.getBoundingClientRect();
    var clickX = e.clientX - rect.left*(canvas.width/rect.width);
    var clickY = e.clientY - rect.top*(canvas.height/rect.height);

    for(var i=0;i<objs.length;i++){
        var obj =objs[i];
        if(obj.type=="circle"){
            var distance = Math.sqrt(Math.pow(obj.x-clickX,2)+Math.pow(obj.y-clickY,2));
            if(distance<=obj.r){
                if(previousSelectedObject!=null){
                    previousSelectedObject.isSelected=false;
                }
                previousSelectedObject=obj;
                obj.isSelected=true;
                isDraging=true;
                drawEach();
                return;
            }

        }else if(obj.type=="lines"){
            var xL = obj.x-30;
            var xR = obj.x+30;
            var yTop = obj.y-15;
            var yBottom = obj.y+15;
            if((clickX >= xL&&clickX <= xR)&&(clickY >= yTop&&clickY <= yBottom)){
                if(previousSelectedObject!=null){
                    previousSelectedObject.isSelected=false;
                }
                previousSelectedObject=obj;
                obj.isSelected=true;
                isDraging=true;
                drawEach();
                return;
            }
        }
    }

}
var stopDragging = function(){
    isDraging=false;
}
var dragPic = function(e){
    if(isDraging == true){

        if(previousSelectedObject!=null){
            var rect = canvas.getBoundingClientRect();
            var x = e.clientX - rect.left*(canvas.width/rect.width);
            var y = e.clientY - rect.top*(canvas.height/rect.height);
            if(x<590&&y<290){
                previousSelectedObject.x=x;
                previousSelectedObject.y=y;
                drawEach();
            }
        }
    }
}
var drawEach = function(){
    context.clearRect(0,0,canvas.width,canvas.height);
    for(var i=0;i<objs.length;i++){
        if(objs[i].type=="circle"){
            drawCircle(objs[i]);
        }else if(objs[i].type=="lines"){
            drawDisplayLine(objs[i]);
        }
    }
}

var drawCircle = function(circle){

    context.globalAlpha=1;
    context.beginPath();
    context.lineWidth=3;
    context.strokeStyle="white";
    context.moveTo(0,circle.y);
    context.lineTo(600,circle.y);
    context.stroke();
    context.beginPath();
    context.font="15pt Arial";
    context.fillStyle="blue";
    context.fillText("水平线",0,circle.y-5);


    context.beginPath();
 
    context.arc(circle.x,circle.y,circle.r,0,Math.PI*2);
    context.fillStyle = "red";
    context.strokeStyle = "black";
    context.fill();
    context.stroke();      

}

var drawDisplayLine = function(obj){
    context.globalAlpha=1;
    var endX = objs[0].x;
    var endY = objs[0].y;
    context.beginPath();
    context.moveTo(obj.x,obj.y);
    context.lineTo(endX,endY);
    context.strokeStyle="white";
    context.lineWidth=2;
    context.stroke();
    context.beginPath();
    context.fillStyle="white";
    context.fillRect(obj.x-30,obj.y-15,60,30);

    context.beginPath();
    context.font="10pt Arial";
    context.fillStyle="blue";
    context.fillText(obj.text,obj.x-23,obj.y+8);

    context.beginPath();
    context.globalAlpha=1;
    context.arc(endX,endY,objs[0].r,0,Math.PI*2);
    context.fillStyle = "red";
    context.strokeStyle = "black";
    context.fill();
    context.stroke();      


}

var drawPic = function(obj){
    var picPath = obj.attr("picPath");
    var ctx = obj[0].getContext("2d");
    var img = new Image();
    img.src = picPath;
    img.onload = function(){
        ctx.drawImage(img,0,0,600,300);
    };
}


function Circle(x,y,r,type){
    this.x = x;
    this.y = y;
    this.r = r;
    this.isSelected = false;
    this.type = type;
}
function dislpayLine(x,y,type,text){
    this.x = x;
    this.y = y;
    this.isSelected=false;
    this.type = type;
    this.text = text;
}

var mstsaStart = function(){
    var canvas1 = $('#canvas1');
    drawPic(canvas1);
    $('#btn1').click(function(){
       init();
    })
}