	

	/*
		延迟加载页面图片


		注意：
		把延迟加载的img加入data-url属性，其属性值为图片url地址如
		<img src="images/default.jpg" data-url="images/1.jpg" width="280px">

	*/




	var notLoadImg = null;	//  未加载图片信息
	var imgPositionStart = [];  //  未加载图片开始位置信息
	var imgPositionEnd = [];  //  未加载图片结束位置信息

	window.onscroll = function(){
		scrollDelayImg();
	}

	// 根据滚动条延迟图片事件
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
		
		changeImg(seekStart);
	}


	//  根据窗口变化进行获取图片信息
	$(window).resize(function() {
		var Height = $(window).height();  //  窗体高度 
		var Width = $(window).width();  //  窗体宽度
		imgPositionStart = [];
		imgPositionEnd = [];

		notLoadImg = $('img[data-url]');  //  获取为加载图片
		notLoadImg.each(function(index, el) {
			imgPositionStart[index] = el.offsetTop;  //  获取图片顶部与body顶部的距离
			imgPositionEnd[index] = el.offsetHeight + el.offsetTop;  //  获取图片底部与body顶部的距离
		});
	});

	$(window).resize();	//  获取初始窗口值

	function Seek(arr,top,bottom){
		var length = arr.length;
		var newArr = [];
		for(var index in arr){
			var position = arr[index];
			if(position > top && position < bottom){
				newArr.unshift(index);
			}
		}
		return newArr;
	}


	function changeImg(arr){
		if(arr==[] || arr == undefined || arr == null){
			return;
		}

		if(typeof arr !== 'object'){
			return;
		}

		for(var index in arr){
			var mark = arr[index];
			var img = notLoadImg[mark];
			var imgUrl = img.getAttribute('data-url');
			if(imgUrl == null){
				continue;
			}
			img.src = img.getAttribute('data-url');
			img.removeAttribute('data-url');
			notLoadImg.splice(mark,1);
			imgPositionStart.splice(mark,1);
			imgPositionEnd.splice(mark,1);
		}
	}

	scrollDelayImg();