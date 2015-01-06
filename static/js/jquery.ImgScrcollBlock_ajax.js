/**
 * 名称: imgScrollBlock
 * 版本: 1.0
 * 作者: wangjun
 * Copyright © 2012 wangjun
 * 制作日期: 2012-08-02
 
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 
 * 使用说明：
 * 使用imgScrollBlock插件，可以做图片上下或者左右的前滚动和后滚动的自动滚动和按钮滚动，支持几个图片一起滚动，具体参数如下：
 * 	topScroll:false,  //定义是否是上下滚动，布尔类型，默认值是false
 * 	leftScroll:true,  //定义是否是左右滚动，布尔类型，默认值是true
 * 	preScrollBtn:undefined,  //定义前滚按钮，默认值是undefined（无定义），定以后是jquery的选择器（对象类型）
 * 	nextScrollBtn:undefined, //定义后滚按钮，默认值是undefined（无定义），定以后是jquery的选择器（对象类型）
 * 	childrenSel:1,    //定义滚动div的个数，默认值是1，数字类型，支持多个
 * 	movePX:100,       //定义滚动的像素值，默认值是100像素，数字类型
 * 	scrollTime:3000,  //定义滚动的事件间隔(毫秒)，默认值是3000毫秒，数字类型
 * 	fatherDIV:undefined   //定义鼠标移入后暂停的DIV，默认值是undefined（无定义），定以后是jquery的选择器（对象类型）
 **/
 (function ($) {
    $.fn.extend({
		imgScrollBlock_ajax: function (options) {
			'use strict';//启用严格模式
            //var container = this,
            //var self = this,
			//@默认参数
			var defaults = {
					topScroll:false,  //定义是否是上下滚动
					leftScroll:true  //定义是否是左右滚动
			};
			
			var opts = $.extend(defaults, options);
			
			//@public 变量
			var topScroll = opts.topScroll,
                  leftScroll = opts.leftScroll,
                  applicate = true;
				
			//@private 方法
			//获取字符串utf-8长度，中文算2个字符，英文数字算一个字符
            function getStrUTF8Length(str) { 
                var len = str.length; 
                var reLen = 0; 
                for (var i = 0; i < len; i++) {        
                    if (str.charCodeAt(i) < 27 || str.charCodeAt(i) > 126) { 
                        // 全角    
                        reLen += 2; 
                    } else { 
                        reLen++; 
                    } 
                } 
                return reLen;    
            }
            //获取字符串utf-8指定长度的字符，中文算2个字符，英文数字算一个字符
            function getUTF8SubStr(str,num) { 
                var len = str.length;
                var s = "";
                var reLen = 0;
                var wholeLen = getStrUTF8Length(str);
                var addStr = "...";
                if(wholeLen <= num){
                    return str;
                }else{
                    for (var i = 0; i < len; i++) {        
                        if (str.charCodeAt(i) < 27 || str.charCodeAt(i) > 126) { 
                            // 全角 
                            reLen += 2;
                        }else { 
                            reLen++;
                        }
                        if(reLen <= (num-addStr.length)){
                            s += str.charAt(i);
                        }else{
                            break;
                        }
                    }
                    return (s+addStr);
                }
            }
			
            //获取浏览器参数，返回获取后的对象
            function getUrlParam(){
                var src = window.location.hash;
                var obj = {};
                var re = /[^#&][^&]+/ig;
                var paramArr = [];
                if(src){
                    paramArr = src.match(re);
                    if(paramArr !== null){
                        for(var i=0;i<paramArr.length;i++){
                            var tempArr = paramArr[i].split(/=/g);
                            if(tempArr[1] !== ""){
                                obj[tempArr[0]] = tempArr[1].split(",");
                            }else{
                                obj[tempArr[0]] = [];
                            }
                        }
                    }
                    return obj;
                }else{
                    return null;
                }
            }

            //next滚动函数
			function imgscroll_next(div,movePX,currPage,childrenSel){
		        var urlParam = getUrlParam();
		        var idsArr = urlParam.ids!==undefined?(JSON.stringify(urlParam.ids)):JSON.stringify([]);
				var send = {
					ids : idsArr,
					page : currPage
				}
			    $.ajax({
                    url:'/index.php/video/guess/format/jsonp/callback/jsonpcallback',
                    dataType:'jsonp',
                    data:send,
                    success: function(data) {
                        if(data.status == 1){
                            $.each(data.result.items,function(i,n){
                                var clone = div.children().eq(i).clone(true);//获取一个滚动快的副本
                                
                                var img_src = n.preview_image_url;
                                var id = n.id;
                                var type = n.type;
                                var wholeText = n.title;
                                var text = getUTF8SubStr(n.title,42);
                                var url = n.play_url;
                                var vid = n.vid;
                                if(url == ""){
                                    url = 'http://search.cctv.com/playVideo.php?detailsid='+vid;
                                }
                                
                                clone.find("a:first").attr("href",url);
                                clone.find("a:first img").attr({
                                    "data-type":type,
                                    "data-id":vid,
                                    "src":img_src
                                });
                                clone.find("a:first span").attr("data-id",vid);
                                clone.find("p em").attr("title",wholeText).html(text);
                                clone.find("p a").attr("href",url);
    
                                clone.appendTo(div);
                            });
                            if(topScroll){
                                div.animate({top:"-"+movePX+"px"}, "slow",function(){
                                    div.children(":lt("+ childrenSel +")").remove();
                                    div.css("top",0);
                                });
                            }
                            if(leftScroll){
                                div.animate({left:"-"+movePX+"px"}, "slow",function(){
                                    div.children(":lt("+ childrenSel +")").remove();
                                    div.css("left",0);
                                });
                            }
                        }else{
                            alert("数据错误!");
                        }
                        applicate = true;
                        $("#theMask").hide();
                    },
                    error:function (XMLHttpRequest, textStatus, errorThrown) {
                        alert("服务器连接错误!");
                        applicate = true;
                        $("#theMask").hide();
                    }
                });
			};
			
			function imgscroll_preview(div,movePX,currPage,childrenSel){
		        var urlParam = getUrlParam();
		        var idsArr = urlParam.ids!==undefined?(JSON.stringify(urlParam.ids)):JSON.stringify([]);
			    var send = {
					ids : idsArr,
                    page:currPage
                }
                $.ajax({
                    url:'/index.php/video/guess/format/jsonp/callback/jsonpcallback',
                    dataType:'jsonp',
                    data:send,
                    success: function(data) {
                        if(data.status == 1){
                            var tempDiv = $("<div></div>");
                            $.each(data.result.items,function(i,n){
                                var clone = div.children().eq(i).clone(true);//获取一个滚动快的副本
                                
                                var img_src = n.preview_image_url;
                                var id = n.id;
                                var type = n.type;
                                var wholeText = n.title;
                                var text = getUTF8SubStr(n.title,42);
                                var url = n.play_url;
                                var vid = n.vid;
                                if(url == ""){
                                    url = 'http://search.cctv.com/playVideo.php?detailsid='+vid;
                                }
                                
                                clone.find("a:first").attr("href",url);
                                clone.find("a:first img").attr({
                                    "data-type":type,
                                    "data-id":vid,
                                    "src":img_src
                                });
                                clone.find("a:first span").attr("data-id",vid);
                                clone.find("p em").attr("title",wholeText).html(text);
                                clone.find("p a").attr("href",url);
    
                                clone.appendTo(tempDiv);
                            });
                            
                            if(topScroll){
                                div.css("top","-"+movePX+"px");
                                tempDiv.children().prependTo(div);
                                //div.children(":gt("+ (childrenSel-1) +")").prependTo(div);
                                div.animate({top: "0"}, "slow",function(){
                                    div.children(":gt("+ (childrenSel-1) +")").remove();
                                });
                            }
                            if(leftScroll){
                                div.css("left","-"+movePX+"px");
                                tempDiv.children().prependTo(div);
                                //div.children(":gt("+ (childrenSel-1) +")").prependTo(div);
                                div.animate({left: "0"}, "slow",function(){
                                    div.children(":gt("+ (childrenSel-1) +")").remove();
                                });
                            }
                        }else{
                            alert("数据错误!");
                        }
                        applicate = true;
                        $("#theMask").hide();
                    },
                    error:function (XMLHttpRequest, textStatus, errorThrown) {
                        alert("服务器连接错误!");
                        applicate = true;
                        $("#theMask").hide();
                    }
                });
			}
			
			//@代码主要功能
			this.each(function(){
				var thisDiv = $(this);
				
				var tuwen_scroll = {};
				var preScrollBtn = thisDiv.parent().prev();
                var nextScrollBtn = thisDiv.parent().next();
                
                var mask = $('<div id="theMask"></div>')
                .css({
                    "background": 'url("/static/iframe/videoguess/images/bg/grid_loader.gif") no-repeat scroll center center #666666',
                    "display": 'none',
                    "height": '100%',
                    "left": '0',
                    "opacity": '0.3',
                    "position": 'absolute',
                    "top": '0',
                    "width": '100%',
                    "z-index": '50'
                });
                
                mask.prependTo(thisDiv.parent().parent());
                
                
                var childrenWidth = thisDiv.children().outerWidth(true);//每个轮换快的总宽度
                var childrenHeight = thisDiv.children().outerHeight(true);//每个轮换快的总高度
                var fatherWidth = thisDiv.parent().outerWidth(true);//父层级的总宽度
                var fatherHeight = thisDiv.parent().outerHeight(true);//父层级的总高度
                tuwen_scroll.childNum = thisDiv.children().length;//取得所有滚动快的个数
                tuwen_scroll.currPage = 0;//当前的页数
                tuwen_scroll.applicate = true;//是否允许申请
                
                if(topScroll){
                    tuwen_scroll.numInFather = Math.round(fatherHeight/childrenHeight);//获取轮换一屏所需要的轮换块的个数
                    tuwen_scroll.singleMovePX = childrenHeight;//移动单一的一块所需的高度
                }
                if(leftScroll){
                    tuwen_scroll.numInFather = Math.round(fatherWidth/childrenWidth);//获取轮换一屏所需要的轮换块的个数
                    tuwen_scroll.singleMovePX = childrenWidth;//移动单一的一块所需的宽度
                }
                
                //整屏的移动像素
                tuwen_scroll.screenPX = tuwen_scroll.singleMovePX*tuwen_scroll.numInFather;
				
				//设置滚动快的长度
				if(topScroll){
					thisDiv.height(tuwen_scroll.singleMovePX*tuwen_scroll.numInFather*2+10);
					thisDiv.width(childrenWidth);
					thisDiv.parent().width(childrenWidth);
				}
				if(leftScroll){
					thisDiv.width(tuwen_scroll.singleMovePX*tuwen_scroll.numInFather*2+10);
					thisDiv.height(childrenHeight);
					thisDiv.parent().height(childrenHeight);
				}
				
				/*//设滚动定时器
				tuwen_scroll.timer=setInterval(function(){imgscroll(thisDiv)},scrollTime);
				
				//鼠标移动父层级上终止滚动，离开后重新滚动
				if(fatherDIV != undefined){
					fatherDIV.hover(function(){
						clearInterval(tuwen_scroll.timer);
					},function(){
						tuwen_scroll.timer=setInterval(function(){imgscroll(thisDiv)},scrollTime);
					})
				}*/
				
				//前滚按钮按下向前滚
				if(preScrollBtn != undefined){
					preScrollBtn.click(function(){
						//当前非动画状态下执行
                        if(thisDiv.is(":animated") == false){
                            $("#theMask").show();
                            if(applicate === true){
                                applicate = false;
                                tuwen_scroll.currPage -= 1;
                                imgscroll_preview(thisDiv,tuwen_scroll.screenPX,tuwen_scroll.currPage,tuwen_scroll.numInFather);
                            }
                        }
                        return false;
					});
				}
				
				//后滚按钮按下向后滚
				if(nextScrollBtn != undefined){
					nextScrollBtn.click(function(){
						//当前非动画状态下执行
                        if(thisDiv.is(":animated") == false){
                            $("#theMask").show();
                            if(applicate === true){
                                applicate = false;
                                tuwen_scroll.currPage += 1;
                                imgscroll_next(thisDiv,tuwen_scroll.screenPX,tuwen_scroll.currPage,tuwen_scroll.numInFather);
                            }
                        }
                        return false;
					});
				}
			});
		}
    });
 })(jQuery);