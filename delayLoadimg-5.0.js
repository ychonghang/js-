	

	/*
		延迟加载页面图片


		注意：
		把延迟加载的img加入data-url属性，其属性值为图片url地址如
		<img src="images/default.jpg" data-url="images/1.jpg" width="280px">

		浏览器：谷歌、火狐、IE

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
		var advance = "advance" in obj?obj.advance:0;	//  advance属性是否存在

		compatibleIeMethod();  // 启动兼容IE方法



		var oldTime = [];	//  存储执行事件时的时间戳
		//  函数节流：防止事件短事件内执行多次，
		function throttle(func,time){
			var timer = null;
			return function(){
				var tempOldTime = func.name in oldTime?oldTime[func.name]:0;	// 如果数组里没有该事件记录就返回0，有返回记录
				var currentTime = new Date();	// 当前时间戳
				if(currentTime - tempOldTime > time){	//  如果 当前执行事件时间-之前执行事件的时间 大于 给定时间就执行函数
					oldTime[func.name] = currentTime;
					func();
				} else {
					clearTimeout(timer);	
					timer = setTimeout(func,time);	// 在滚动结束后执行一次滚动事件
				}
			}
		}



		// 根据滚动条延迟加载图片事件
		function scrollDelayImg(){
			var height = window.innerHeight || document.documentElement.clientHeight;  //  获取窗体可视文档高度
			var currentWindowTop = document.body.scrollTop || document.documentElement.scrollTop;	//  获取窗体在文档的Top坐标
			var currentWindowButton = currentWindowTop + height;	//  获取窗体Button在文档的坐标
			var seekStart = Seek(imgPositionStart,currentWindowTop,currentWindowButton);  // 返回查找到的值
			var seekEnd = Seek(imgPositionEnd,currentWindowTop,currentWindowButton);  // 返回查找到的值
			
			var length = seekEnd.length;
			for(var i=0; i<length; i++){	// 数组去重
				if(seekStart.indexOf(seekEnd[i]) < 0){
					seekStart.unshift(seekEnd[i]);
				}
			}
			seekStart.concat(seekCoverWindowImg(imgPositionStart,imgPositionEnd,currentWindowTop,currentWindowButton));  // 把图片大于可视窗口的图片也加载
			seekStart = seekStart.sort(function(a,b){	//  进行降序排序
				var sortNum = a-b;
	    		return -sortNum;
			});
			
			changeImg(seekStart);	//  修改img属性
		}



		// 防抖：防止一些无用事件触发（如窗口大小变化，拖动时触发的事件就有些无用了，只有在拖动结束后触发才有用）
		var debounceObj = [];
		function debounce(func,time){
			var tempDebounceObj = func.name in debounceObj?debounceObj[func.name]:null;
			clearTimeout(tempDebounceObj);
			debounceObj[func.name] = setTimeout(func,time);
		}


		//  窗口大小变化事件
		function windowResize(){
			imgPositionStart = [];
			imgPositionEnd = [];
			notLoadImg = document.querySelectorAll("img["+ tempSrc +"]")  //  获取为加载图片


			try{
				notLoadImg = Array.prototype.slice.call(notLoadImg);	// 把NodeList转成Array
			}catch(e){
				//  上面的NodeList转换Array失败，就执行下面转换数组
				var tempArray = [],length = notLoadImg.length;
				for(var i=0; i<length; i++){
					tempArray.push(notLoadImg[i]);
				}
				notLoadImg = tempArray;
			}	

			for(var index in notLoadImg){
				var el = notLoadImg[index];
				var top = toBodyDistance(el);	//  获取图片顶部与body顶部的距离
				imgPositionStart[index] = top;  
				imgPositionEnd[index] = el.offsetHeight + top;  //  获取图片底部与body顶部的距离
				
			}

			setTimeout(scrollDelayImg,200); //	窗口大小改变一次，就执行一下延迟加载事件看看有没有图片满足要求加载的(加计时器是因为刷新一次滚动条就会跳到顶部，从而触发滚动事件，把之前没看顶部的图片给提前修改了，导致之前记录的图片高度不一致延迟加载不准确)
		}


		//  查找要加载的图片
		function Seek(arr,top,bottom){
			//var length = arr.length;	
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


		//  查找大于可视窗口的图片
		function seekCoverWindowImg(start,end,top,bottom){
			var newArr = [];
			for(var index in start){
				if(start[index] <= top && end[index] >= bottom){	// 在图片top小于窗口top 和 图片bottom大于窗口bottom时添加新数组
					newArr.push(index);
				}
			}
			return newArr;
		}



		//  修改img标签属性
		function changeImg(arr){
			if(typeof arr !== 'object'){
				return;
			}

			var length = arr.length;
			for(var index=0; index<length; index++){
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
		compatibleEvent('scroll',throttle(scrollDelayImg,200));


		//  共存resize
		compatibleEvent('resize',function(){debounce(windowResize,100)});


		//  共存load
		compatibleEvent('load',windowResize);  //  页面加载成功时执行事件。获取初始窗口值






		//  兼容监听事件
		function compatibleEvent(event,func){
			if(window.attachEvent){
				window.attachEvent("on"+event,func);	//  IE
			} else {
				window.addEventListener(event,func);
			}
		}


		




		// 兼容IE方法
		function compatibleIeMethod(){
			// indexof
			if (!Array.prototype.indexOf){
				  Array.prototype.indexOf = function(target){
				    var len = this.length;
				    for (var i=0; i < len; i++){
				      if (i in this && this[i] === target)  //  如果i是array的属性和其属性值为目标值，则返回其属性
				        return i;
				    }
				    return -1;	//  没找到目标值则返回-1
				  };
			}
			




			//document.querySelectorAll
			if (!document.querySelectorAll) {
			    document.querySelectorAll = function (selectors) {
			        var style = document.createElement('style'), elements = [], element;
			        document.documentElement.firstChild.appendChild(style);
			        document._img = [];

			        style.styleSheet.cssText = selectors + '{temp-obj:expression(document._img && document._img.push(this))}';	//先使用css选择器获取img元素,在selectors里执行的javascritpt代码，把img元素添加到_img属性数组里去
			        style.parentNode.removeChild(style);
			        while (document._img.length) {		//在根据img元素数量进行循环
			            element = document._img.shift();	//把_img数组里的元素弹出，添加到先数组中去
			            element.style.removeAttribute('temp-obj');	//把img元素里的temp-obj属性去掉
			            elements.push(element);
			        }
			        document._img = null;	// 在清空_img属性
			        return elements;
			    };
			}
		}


	}





	