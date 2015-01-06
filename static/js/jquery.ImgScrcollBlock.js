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
		imgScrollBlock: function (options) {
			'use strict';//启用严格模式
            //var container = this,
            //var self = this,
			//@默认参数
			var	defaults = {
					topScroll:false,   //定义是否是上下滚动
					leftScroll:true,   //定义是否是左右滚动
					childrenSel:1,    //定义滚动div的个数
					controldot:true//定义是否有下端滚动控制球
			};
			
			var opts = $.extend(defaults, options);
			
			//@public 变量
			var topScroll = opts.topScroll,
				leftScroll = opts.leftScroll,
				childrenSel = opts.childrenSel,
				controldot = opts.controldot
				
			//@private 方法，滚动函数
			function imgscroll(div,childSel,movePX,callback){
				if(topScroll){
					div.animate({top:"-"+movePX+"px"}, "slow",function(){
						div.children(":lt("+ childSel +")").appendTo(div);
						div.css("top",0);
						if($.isFunction(callback)){
                            callback();
                        }
					});
				}
				if(leftScroll){
					div.animate({left:"-"+movePX+"px"}, "slow",function(){
						div.children(":lt("+ childSel +")").appendTo(div);
						div.css("left",0);
						if($.isFunction(callback)){
                            callback();
                        }
					});
				}
			};
			
			//@private 方法，点击轮换滚动球执行滚动
			function clickDotScroll(div,childSel,movePX,currpage,gotoPage,callback){
			    var direction = parseInt(currpage)-parseInt(gotoPage);
			    //var movePxl = div.find('.tuwen[data-page="'+gotoPage+'"]:first').position().left;
			    var Num = Math.abs(direction);
			    var childrenNum = div.children().length;
			    
			    if(div.is(":animated") == false){
                    if(direction < 0){
                        if(topScroll){
                            div.animate({top:"-"+(movePX*Num)+"px"}, "slow",function(){
                                div.children(":lt("+ (childSel*Num) +")").appendTo(div);
                                div.css("top",0);
                                if($.isFunction(callback)){
                                    callback();
                                }
                            });
                        }
                        if(leftScroll){
                            div.animate({left:"-"+movePX*Num+"px"}, "slow",function(){
                                div.children(":lt("+ childSel*Num +")").appendTo(div);
                                div.css("left",0);
                                if($.isFunction(callback)){
                                    callback();
                                }
                            });
                        }
                    }else{
                        if(topScroll){
                            div.css("top","-"+(movePX*Num)+"px");
                            var moNum = childrenNum - childSel*Num-1;
                            div.children(":gt("+ moNum +")").prependTo(div);
                            div.animate({top: "0"}, "slow",function(){
                                if($.isFunction(callback)){
                                    callback();
                                }
                            });
                        }
                        if(leftScroll){
                            div.css("left","-"+(movePX*Num)+"px");
                            var moNum = childrenNum - childSel*Num-1;
                            div.children(":gt("+ moNum +")").prependTo(div);
                            div.animate({left: "0"}, "slow",function(){
                                if($.isFunction(callback)){
                                    callback();
                                }
                            });
                        }
                    } 
                }  
			};
			
			//@private 方法，轮换滚动球
			function showDot(dom){
			    if(dom.next().length > 0){
                    var cPage = dom.find(":first").attr("data-page");
                    var a = dom.next().find("li a");
                    a.removeClass("active");
                    a.eq(parseInt(cPage)-1).addClass("active");
                }
			};
			
			//@代码主要功能
			this.each(function(){
				var thisDiv = $(this);

				var tuwen_scroll = {};
				var preScrollBtn = thisDiv.parent().prev();
				var nextScrollBtn = thisDiv.parent().next();
				var currPage = 1;
				var childrenWidth = thisDiv.children().outerWidth(true);//每个轮换快的总宽度
				var childrenHeight = thisDiv.children().outerHeight(true);//每个轮换快的总高度
                var fatherWidth = thisDiv.parent().outerWidth(true);//父层级的总宽度
                var fatherHeight = thisDiv.parent().outerHeight(true);//父层级的总高度
                tuwen_scroll.child = thisDiv.children().length;//取得所有滚动快的个数
                tuwen_scroll.childrenSel = childrenSel;
                tuwen_scroll.controldot = controldot;
                
                if(topScroll){
                    tuwen_scroll.numInFather = Math.round(fatherHeight/childrenHeight);//获取轮换一屏所需要的轮换块的个数
                    tuwen_scroll.singleMovePX = childrenHeight;
                }
                if(leftScroll){
                    tuwen_scroll.numInFather = Math.round(fatherWidth/childrenWidth);//获取轮换一屏所需要的轮换块的个数
                    tuwen_scroll.singleMovePX = childrenWidth;
                }
                //设置只有轮换块的个数大于等于一屏所需的轮换个数+一次轮换所需的个数才能轮换，否则只能以每次一个轮换块进行轮换
                if(tuwen_scroll.child <= tuwen_scroll.numInFather){
                    if(tuwen_scroll.childrenSel <= tuwen_scroll.child){
                        tuwen_scroll.canScroll = false;
                        tuwen_scroll.controldot = false;
                        tuwen_scroll.childrenSel = 0;
                    }
                    if(tuwen_scroll.child < tuwen_scroll.childrenSel && tuwen_scroll.childrenSel <= tuwen_scroll.numInFather){
                        tuwen_scroll.canScroll = false;
                        tuwen_scroll.controldot = false;
                        tuwen_scroll.childrenSel = 0;
                    }
                    if(tuwen_scroll.numInFather< tuwen_scroll.childrenSel && tuwen_scroll.childrenSel < tuwen_scroll.numInFather*2){
                        tuwen_scroll.canScroll = false;
                        tuwen_scroll.controldot = false;
                        tuwen_scroll.childrenSel = 0;
                    }
                    if(tuwen_scroll.childrenSel >= tuwen_scroll.numInFather*2){
                        tuwen_scroll.canScroll = false;
                        tuwen_scroll.controldot = false;
                        tuwen_scroll.childrenSel = 0;
                    }
                }
                if(tuwen_scroll.numInFather < tuwen_scroll.child && tuwen_scroll.child < tuwen_scroll.numInFather*2){
                    if(tuwen_scroll.childrenSel <= tuwen_scroll.numInFather){
                        tuwen_scroll.canScroll = true;
                        tuwen_scroll.controldot = false;
                        if((tuwen_scroll.childrenSel+tuwen_scroll.numInFather) > tuwen_scroll.child){
                            tuwen_scroll.childrenSel = tuwen_scroll.child - tuwen_scroll.numInFather;
                        }
                    }
                    if(tuwen_scroll.numInFather < tuwen_scroll.childrenSel && tuwen_scroll.childrenSel <= tuwen_scroll.child){
                        tuwen_scroll.canScroll = true;
                        tuwen_scroll.controldot = false;
                        tuwen_scroll.childrenSel = tuwen_scroll.child - tuwen_scroll.numInFather;
                    }
                    if(tuwen_scroll.child < tuwen_scroll.childrenSel && tuwen_scroll.childrenSel < tuwen_scroll.numInFather*2){
                        tuwen_scroll.canScroll = true;
                        tuwen_scroll.controldot = false;
                        tuwen_scroll.childrenSel = tuwen_scroll.child - tuwen_scroll.numInFather;
                    }
                    if(tuwen_scroll.childrenSel >= tuwen_scroll.numInFather*2){
                        tuwen_scroll.canScroll = true;
                        tuwen_scroll.controldot = false;
                        tuwen_scroll.childrenSel = tuwen_scroll.child - tuwen_scroll.numInFather;
                    }
                }
                if(tuwen_scroll.child >= tuwen_scroll.numInFather*2){
                    if(tuwen_scroll.childrenSel <= tuwen_scroll.numInFather){
                        tuwen_scroll.canScroll = true;
                    }
                    if(tuwen_scroll.numInFather < tuwen_scroll.childrenSel && tuwen_scroll.childrenSel <= tuwen_scroll.numInFather*2){
                        tuwen_scroll.canScroll = true;
                        tuwen_scroll.childrenSel = tuwen_scroll.numInFather;
                    }
                    if(tuwen_scroll.numInFather*2 < tuwen_scroll.childrenSel && tuwen_scroll.childrenSel < tuwen_scroll.child){
                        tuwen_scroll.canScroll = true;
                        tuwen_scroll.childrenSel = tuwen_scroll.numInFather;
                    }
                    if(tuwen_scroll.childrenSel >= tuwen_scroll.child){
                        tuwen_scroll.canScroll = true;
                        tuwen_scroll.childrenSel = tuwen_scroll.numInFather;
                    }
                }
                
                tuwen_scroll.movePX = tuwen_scroll.singleMovePX*tuwen_scroll.childrenSel;//总体移动的像素

				//判断是否有下端滚动球，有则添加
				if(tuwen_scroll.controldot){
				    if(tuwen_scroll.canScroll){
				        var totalPage = Math.ceil(tuwen_scroll.child/tuwen_scroll.childrenSel);
                        var dotdom = $('<ul class="lunhuanBtn clearfix"></ul>');
                        //设置滚动div属于哪页
                        thisDiv.children().each(function(i){
                            var n = Math.ceil((i+1)/tuwen_scroll.childrenSel);
                            $(this).attr("data-page",n);
                        });
                        //创建滚动球
                        for(var i=0;i<totalPage;i++){
                            var html = "";
                            if(i==0){
                                html = '<li><a class="active" data-page="'+(i+1)+'" href="javascript:void(0);"></a></li>';
                            }else{
                                html = '<li><a data-page="'+(i+1)+'" href="javascript:void(0);"></a></li>';
                            }
                            dotdom.append(html);
                        }       
                        thisDiv.parent().append(dotdom);
                        var w = thisDiv.parent().width();
                        dotdom.css("left",function(){
                            return ((w-dotdom.width())/2);
                        });
                        dotdom.find("li a").on("click",function(){
                            if(thisDiv.is(":animated") == false){
                                if(!$(this).hasClass("active")){
                                    var page = $(this).attr("data-page");
                                    clickDotScroll(thisDiv,tuwen_scroll.childrenSel,tuwen_scroll.movePX,currPage,page);
                                    dotdom.find("li a").removeClass("active");
                                    $(this).addClass("active");
                                    currPage = page;
                                }
                            }
                        });
				    }
				}

				//设置滚动快的长度
				if(topScroll){
					thisDiv.height(tuwen_scroll.singleMovePX*tuwen_scroll.child+10);
				}
				if(leftScroll){
					thisDiv.width(tuwen_scroll.singleMovePX*tuwen_scroll.child+10);
				}
				
				//前滚按钮按下向前滚
				if(preScrollBtn != undefined){
					preScrollBtn.click(function(){
					    if(tuwen_scroll.canScroll){
                            //当前非动画状态下执行
                            if(thisDiv.is(":animated") == false){
                                if(topScroll){
                                    thisDiv.css("top","-"+tuwen_scroll.movePX+"px");
                                    var moNum = tuwen_scroll.child - tuwen_scroll.childrenSel-1;
                                    thisDiv.children(":gt("+ moNum +")").prependTo(thisDiv);
                                    thisDiv.animate({top: "0"}, "slow",function(){
                                        if(tuwen_scroll.controldot){
                                            showDot(thisDiv);
                                        }
                                        currPage = thisDiv.find(":first").attr("data-page");
                                    });
                                }
                                if(leftScroll){
                                    thisDiv.css("left","-"+tuwen_scroll.movePX+"px");
                                    var moNum = tuwen_scroll.child - tuwen_scroll.childrenSel-1;
                                    thisDiv.children(":gt("+ moNum +")").prependTo(thisDiv);
                                    thisDiv.animate({left: "0"}, "slow",function(){
                                        if(tuwen_scroll.controldot){
                                            showDot(thisDiv);
                                        }
                                        currPage = thisDiv.find(":first").attr("data-page");
                                    });
                                }
                            }
                            return false;
                        }
					});
				}
				
				//后滚按钮按下向后滚
				if(nextScrollBtn != undefined){
					nextScrollBtn.click(function(){
						if(tuwen_scroll.canScroll){
                            //当前非动画状态下执行
                            if(thisDiv.is(":animated") == false){
                                imgscroll(thisDiv,tuwen_scroll.childrenSel,tuwen_scroll.movePX,function(){
                                    if(tuwen_scroll.controldot){
                                        showDot(thisDiv);
                                    }
                                    currPage = thisDiv.find(":first").attr("data-page");
                                });
                            }
                            return false;
                        }
					});
				}
			});
		}
    });
 })(jQuery);