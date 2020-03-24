//定义画线类
//初始化时，必须传人box对象，否则报错无法正确连线。线条宽度。颜色参数可选，若不传则默认初始配置的宽度、颜色
function drawLine_relate(){
	this.box=null; //外层容
	this.part1=null; //左边容器
	this.part2=null; //右边容器
	this.canvas=null; //画布
	this.backcanvas=null; //虚拟画布
	this.lineArr=[];//连接线条的对象数组
	this.css={
		linewidth:2, //线条宽度
		linestyle:"#0C6" //线条颜色
	};
	var startObj;//存贮线条开始的对象
	var endObj;//存贮线条结束的对象
	var mid_startx,mid_starty,mid_endx,mid_endy;//存储虚拟连线起始坐标
	//初始化
	this.initLine=function(options){
		var that=this;
		if(options){
			if(options.obj){
				this.box=options.obj;
			}
			if(options.linewidth){
				this.css.linewidth=options.linewidth;
			}
			if(options.linestyle){
				this.css.linestyle=options.linestyle;
			}
			part1=this.box.find('.leftBox');
			part2=this.box.find('.rightBox');
			 //初始化赋值 列表内容
			 this.box.find(".leftBox").children("span").each(function(index, element) {
				$(element).attr({group:"gpl",
								 left:$(element).position().left+$(element).outerWidth(),
								 top:$(element).position().top+$(element).outerHeight(true)/2,
								 sel:"0",
								 check:"0"});	
			 });
			 this.box.find(".rightBox").children("span").each(function(index, element) {
				$(element).attr({group:"gpr",
								 left:$(element).position().left,
								 top:$(element).position().top+$(element).outerHeight(true)/2,
								 sel:"0",
								 check:"0"});	
			 });
			//canvas 赋值
			this.canvas =this.box.find(".sureCva")[0];  //获取canvas  实际连线标签
			this.canvas.width=this.box.find(".showBox").width();//canvas宽度等于div容器宽度
			this.canvas.height=this.box.find(".showBox").height();//canvas宽度等于div容器宽度
			this.backcanvas =this.box.find(".backCva")[0];  //获取canvas 模拟连线标签  
			this.backcanvas.width=this.box.find(".showBox").width();
			this.backcanvas.height=this.box.find(".showBox").height();
			this.canvas=this.canvas.getContext('2d');  
			this.backcanvas = this.backcanvas.getContext('2d'); 

			var subSize = this.box.find(".boxItem").size();  

			//鼠标单击事件
			this.box.children(".showBox").children().children("span").on("click", function(event){
				if(startObj){//是否已有开始目标
					if(startObj.parent()[0].className==$(this).parent()[0].className){//是否同一组中的元素
						if(startObj.attr('data-id')==$(this).attr('data-id')){//是否同一元素
							startObj.removeClass('addstyle').attr('sel','0');
							mid_startx=0;
							mid_starty=0;
							startObj=null;
						}

					}else{
						endObj=$(this);
						if(startObj.attr('group')=='gpl'){
							var questionId = startObj.attr('id');
							var answer = endObj.find('label').html().trim();
							CEFWrapper.SaveQuestionAnswer(questionId, answer);
							
						}else{
							var questionId = endObj.id;
							var answer = startObj.find('label').html().trim();
							CEFWrapper.SaveQuestionAnswer(questionId, answer);
						}

						if(endObj.attr('check')==1){//是否已有连接线条
							//清除已有连线
							that.removeExistLine($(this));
						}
						//连接线条
						startObj.attr('sel','0').attr('check','1');
						endObj.attr('sel','0').attr('check','1').addClass('addstyle');
						that.lineArr.push({
							start:startObj,
							end:endObj
						});
						that.clearData();
						that.storkeLine();
					}
				}else{
					if($(this).attr('check')==1){//点击的对象是否已经已有连接线条
						//清除已有线条
						that.removeExistLine($(this));

						that.clearData();
						that.storkeLine();
					}else{
						startObj=$(this);
						startObj.addClass('addstyle').attr('sel','1');
						mid_startx=$(this).attr("left");
						mid_starty=$(this).attr("top");
						
					}
				}

				//最后更新checkBox的选中状态
				//if(event.target==$(this)){
					for(var i=0; i<subSize; i++ ){
						if(that.box.find(".boxItem").eq(i).hasClass("addstyle") == true ){
							//that.box.find(".boxItem").eq(i).children('input').eq(0).prop('checked',true);
							that.box.find(".boxItem").eq(i).children('div').eq(0).addClass('inputChecked');
						}
						else {
							//that.box.find(".boxItem").eq(i).children('input').eq(0).prop('checked',false);
							that.box.find(".boxItem").eq(i).children('div').eq(0).removeClass('inputChecked');
						}
					}
				//}
				event.preventDefault();	//阻止冒泡
			});
			//鼠标移动事件
			this.box.children('.showBox').mousemove(function(event){
				//鼠标移动事件
				//console.log(event.pageX+'***'+event.pageY);
				var $target = $(event.target);	
				mid_endx=event.pageX-that.box.find(".showBox").offset().left;
				mid_endy=event.pageY-that.box.find(".showBox").offset().top;
				if(startObj){
					that.backstrockline();
				}

				event.preventDefault();
			});

		}
	};
	//绘制临时模拟线条
	this.backstrockline=function(){
		 this.backcanvas.clearRect(0,0,this.box.find(".showBox").width(),this.box.find(".showBox").height());
		 this.backcanvas.save();  
		 this.backcanvas.beginPath();  
		 this.backcanvas.lineWidth = this.css.linewidth; 
		 this.backcanvas.moveTo(mid_startx,mid_starty);  
		 this.backcanvas.lineTo(mid_endx,mid_endy); 		 		 
		 this.backcanvas.strokeStyle = this.css.linestyle;  	
		 this.backcanvas.stroke();  
		 this.backcanvas.restore(); 
	};
	//连接线条
	this.storkeLine=function(){
		//首先清除模拟线条
		 this.backcanvas.clearRect(0,0,this.box.find(".showBox").width(),this.box.find(".showBox").height());
		 this.backcanvas.save();  
		 //绘制线条
		 this.canvas.clearRect(0,0,this.box.find(".showBox").width(),this.box.find(".showBox").height());
		 this.canvas.save(); 
		 if(this.lineArr.length>0){
		 	this.canvas.beginPath();  
		 	this.canvas.lineWidth = this.css.linewidth; 
		 	for(var i=0;i<this.lineArr.length;i++){
		 		var arrObj=this.lineArr[i];
		 		this.canvas.moveTo(arrObj.start.attr('left'),arrObj.start.attr('top'));  
		 		this.canvas.lineTo(arrObj.end.attr('left'),arrObj.end.attr('top')); 
		 	}	 
		 	this.canvas.strokeStyle = this.css.linestyle;  	
		 	this.canvas.stroke();  //绘制已经定义的线条
		 } 

	};
	//移除已有线条
	this.removeExistLine=function(obj){
		for(var i=0;i<this.lineArr.length;i++){
			if(this.lineArr[i].start.attr('data-id')==obj.attr('data-id') || this.lineArr[i].end.attr('data-id')==obj.attr('data-id')){
				this.lineArr[i].start.attr('sel','0').attr('check','0').removeClass('addstyle');
				this.lineArr[i].end.attr('sel','0').attr('check','0').removeClass('addstyle');
				this.lineArr.splice(i,1);
				break;
			}
		}
	};
	//清除数据
	this.clearData=function(){
		startObj=null;
		endObj=null;
		mid_startx=0;
		mid_starty=0;
		mid_endx=0;
		mid_endy=0;
	}
}

