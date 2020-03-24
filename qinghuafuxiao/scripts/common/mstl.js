var moving_relate={
		isdrag:false, //是否有图片在进行拖拽
		x:0,  //鼠标按下时的位置
		y:0, //鼠标按下时的位置
		source_x:0,  //当前选中图片的位置
		source_y:0,  //当前选中图片的位置
		dobj:null,   //当前选中的图片
		objTarget:null,  //目标对象
		sourceImgs:[],  //源图片位置
		answerObj:[],   //答案对象
		curNum:'',   //当前选中的答案
		//初始化
		init:function(){
			moving_relate.clear();
			//绑定事件
			$('#titlePic img').each(function(index,ele){
				$(ele).off('mousedown').on('mousedown',function(e){
					moving_relate.selectmouse($(this),e);
				});
				$(ele).off('mouseup').on('mouseup',moving_relate.imgMouseUp);
			});
			$('#container').off('mouseout').on('mouseout',function(e){
				var index=moving_relate.curNum;
				moving_relate.clear();
				if(index !=''){
					moving_relate.saveImgAnsweers('',index);
					moving_relate.goBackToOrginPosition(index);
				}
				return false;
			});
			//获取源图片资源
			$('#titlePic img').each(function(index,ele){
				var sourceImag={
					source:$(ele),
					source_x:parseInt($(ele).offset().left),
					source_y:parseInt($(ele).offset().top)
				};
				moving_relate.sourceImgs[$(ele).attr('num')]=sourceImag;
			});
			//获取答案区数据
			$('#titleAnswer .fillimg').each(function(index,ele){
				var targets={
					source:$(ele),
					ID:$(ele).attr('id'),
					number:''
				};
				moving_relate.answerObj.push(targets);
			});
		},
		//鼠标移动
		 movemouse:function(e){
			if (moving_relate.isdrag){
				moving_relate.setPicPosition(moving_relate.source_x+e.clientX - moving_relate.x,moving_relate.source_y+e.clientY - moving_relate.y);
				return false;
			}
			return false;
		},
		//鼠标按下，选中图片
		selectmouse:function($source,e){
			if ($source.hasClass("img0")){
				moving_relate.isdrag = true;
				moving_relate.dobj = $source;
				moving_relate.curNum=$source.attr('num');
				moving_relate.dobj .css('z-index',100);
				moving_relate.source_x = parseInt(moving_relate.dobj[0].offsetLeft);
				moving_relate.source_y = parseInt(moving_relate.dobj[0].offsetTop);
				moving_relate.x = e.clientX;
				moving_relate.y = e.clientY ;
				document.onmousemove=moving_relate.movemouse;
				return false;
			}
			return false;
		},
		//清理数据
		clear:function(){
			moving_relate.isdrag=false;
			moving_relate.x=0;
			moving_relate.y=0;
			moving_relate.source_x=0;
			moving_relate.source_y=0;
			moving_relate.curNum='';
			moving_relate.dobj=null;
			moving_relate.objTarget=null;
		},
		//鼠标松开，同时保存答案
		imgMouseUp:function(e){
			if(moving_relate.dobj!=null)
			{
				moving_relate.dobj .css('z-index',1);
				moving_relate.isdrag=false;
				moving_relate.getTarget(e);
				if(moving_relate.objTarget!=null){
					var questionId = moving_relate.objTarget.id;
					var answer=$(moving_relate.dobj).attr('num');
					moving_relate.saveImgAnsweers(questionId,answer);
					moving_relate.setPicPosition(-10000,-10000);
					moving_relate.drawHtml(answer);
					//CEFWrapperCEFWrapper.SaveQuestionAnswer(questionId, answer);
				}else{
					moving_relate.saveImgAnsweers('',moving_relate.curNum);
					moving_relate.goBackToOrginPosition(moving_relate.curNum);
				}
				moving_relate.clear();
			}
			return false;
		},
		//获取目标
		getTarget:function(obj){
			$('#titleAnswer .fillimg').each(function(dex,o){
				var d_x=obj.clientX-o.offsetLeft;
				var d_y=obj.clientY-o.offsetTop;
				if(d_x>0 && d_x<150 && d_y>0 && d_y<150){
					moving_relate.objTarget=o;
				}
			});
		},
		//绘制答案区图片
		drawHtml:function(num){
			$(moving_relate.objTarget).html('');
			$(moving_relate.objTarget).append(moving_relate.createImg(num));
			$(moving_relate.objTarget).children('img').off('mousedown').on('mousedown',function(e){
				moving_relate.selectmouse($(this),e);
			});
			$(moving_relate.objTarget).children('img').off('mouseup').on('mouseup',moving_relate.imgMouseUp);
		},
		//创建图片Html
		createImg:function(num){
			var htm='';
			var imgSrc=$(moving_relate.dobj).attr('src')
			htm='<img class="img0" width="50" num="'+ num +'" src="'+imgSrc+'" />';
			return htm;
		},
		//设置图片位置
		setPicPosition:function(left_x,top_y){
			moving_relate.dobj.offset({top:top_y,left:left_x});
		},
		//保存答案
		saveImgAnsweers:function(questionId,num){
			for(var i=0;i<moving_relate.answerObj.length;i++){
				if(moving_relate.answerObj[i].ID == questionId && moving_relate.answerObj[i].number == num){
					break;
				}else if(moving_relate.answerObj[i].ID == questionId){
					var index=moving_relate.answerObj[i].number;
					if(index !=''){
						var source=moving_relate.sourceImgs[index].source;
						var top_y=moving_relate.sourceImgs[index].source_y;
						var left_x=moving_relate.sourceImgs[index].source_x;
						source.offset({top:top_y,left:left_x});
					}
					moving_relate.answerObj[i].number=num;
				}else if(moving_relate.answerObj[i].number == num){
					moving_relate.answerObj[i].number='';
					moving_relate.answerObj[i].source.html('');
				}
			}
		},
		//还原图片位置
		goBackToOrginPosition:function(num){
			var source=moving_relate.sourceImgs[num].source;
			var before_y=moving_relate.sourceImgs[num].source_y;
			var before_x=moving_relate.sourceImgs[num].source_x;
			source.offset({top:before_y,left:before_x});
			source.css('z-index',1);
		}
}