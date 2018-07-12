	

	/*
		延迟加载页面图片


		注意：
		把延迟加载的img加入data-url属性，其属性值为图片url地址如
		<img src="images/default.jpg" data-url="images/1.jpg" width="280px">

	*/


	/*
		参数：
		obj{
			advance:0,    //  可选，提前多少像素进行加载图片，默认0px
			tempSrc:"temp-src",  //  可选，暂时存储img的src地址的属性名
		}

		实例：		
		delayLoadImg({advance:1000});

	*/

	function delayLoadImg(obj){
		obj = obj == undefined?{}:obj;	
		var type = typeof obj;
		if(type !== 'object'){
			console.log('delayLoadImg:'+'参数传入错误');
			return;		//  参数不为空，会不是对象就直接返回
		}

		var notLoadImg = null;	//  未加载图片信息
		var imgPositionStart = [];  //  未加载图片开始位置信息
		var imgPositionEnd = [];  //  未加载图片结束位置信息
		var tempSrc = "tempSrc" in obj?obj.tempSrc:"temp-src";	//  暂存src值的属性名

		var advance;
		
		if("advance" in obj){	//  advance属性是否存在
			advance = obj.advance;
		} else {
			advance = 0; 
		}


		// 根据滚动条延迟加载图片事件
		function scrollDelayImg(){
			var currentWindowTop = document.body.scrollTop;	//  获取窗体在文档的Top坐标
			var currentWindowButton = currentWindowTop + $(window).height();	//  获取窗体在文档的Button坐标
			var seekStart = Seek(imgPositionStart,currentWindowTop,currentWindowButton);  // 返回查找到的值
			var seekEnd = Seek(imgPositionEnd,currentWindowTop,currentWindowButton);  // 返回查找到的值

			var length = seekEnd.length;
			for(var i=0; i<length; i++){	// 数组去重
				if(seekStart.indexOf(seekEnd[i]) < 0){
					seekStart.unshift(seekEnd[i]);
				}
			}
			seekStart = seekStart.sort(function(a,b){	//  进行降序排序
				var sortNum = a-b;
	    		return -sortNum;
			});
			
			changeImg(seekStart);	//  修改img属性
		}


		
		//  窗口大小变化事件
		function windowResize(){
			imgPositionStart = [];
			imgPositionEnd = [];

			notLoadImg = $('img['+ tempSrc +']');  //  获取为加载图片
			notLoadImg.each(function(index, el) {
				var top = toBodyDistance(el);	//  获取图片顶部与body顶部的距离 
				imgPositionStart[index] = top;  
				imgPositionEnd[index] = el.offsetHeight + top;  //  获取图片底部与body顶部的距离
			});


			scrollDelayImg();	//	窗口大小改变一次，就执行一下延迟加载事件看看有没有图片满足要求加载的
		}


		//  查找要加载的图片
		function Seek(arr,top,bottom){
			var length = arr.length;	
			var newArr = [];
			top -= advance;		//  可加载区域的top位置
			bottom += advance;		//  可加载区域的bottom位置
			for(var index in arr){
				var position = arr[index];
				if(position > top && position < bottom){	//  如果图片的位置出现在top和bottom之间，就放入加载数组里
					newArr.unshift(index);
				}
			}
			return newArr;
		}


		//  修改img标签属性
		function changeImg(arr){
			if(typeof arr !== 'object'){
				return;
			}

			for(var index in arr){
				var mark = arr[index];	// 获取要加载图片的下标
				var img = notLoadImg[mark];		//  获取加载图片的img
				var imgUrl = img.getAttribute(tempSrc);	// 在img标签里获取data-url属性值
				if(imgUrl == null){		//  如果获取的值是空的则跳过
					continue;
				}
				img.src = imgUrl	//  把获取来的图片路径赋值给src
				img.removeAttribute(tempSrc);	//  移除img的data-url属性
				notLoadImg.splice(mark,1);	// 去除指定img标签
				imgPositionStart.splice(mark,1);  // 去除指定的img标签的top值
				imgPositionEnd.splice(mark,1);  // 去除指定的img标签的bottom值
			}
		}


		//  获取img到body的距离
		function toBodyDistance(obj){
			var count = 0;
			while(obj){		//  如果元素存在
				count += obj.offsetTop;		// 叠加与上一个容器（含有position属性relative或absolute的元素）的距离
				obj = obj.offsetParent;		// 获取元素的父元素 (含有position属性relative或absolute的元素)
			}
			return count;
		}


		//  共存scroll
		window.addEventListener('scroll',scrollDelayImg);


		//  共存resize
		window.addEventListener('resize',windowResize);


		windowResize();		//  获取初始窗口值

		
	}




	