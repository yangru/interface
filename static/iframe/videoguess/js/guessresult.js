/**
 * @author daizhaolin
 */

$(function() {
	/*//扩展对象的count方法
    Object.prototype.count = (Object.prototype.hasOwnProperty("count")) ? function () {return this.count;} : function () {
        var count = 0;
        for (var i in this){
          if (this.hasOwnProperty(i)){
              count ++;
          }
        }
        return count;
      };*/
     
	//添加cooike
    function setCookie(name,value,expireHours){ 
         var cookieString=name+"="+escape(value);          
         if(expireHours>0){ //判断是否设置过期时间
                var date=new Date(); 
                date.setTime(date.getTime+expireHours*3600*1000); 
                cookieString=cookieString+"; expire="+date.toGMTString(); 
         } 
         document.cookie=cookieString; 
    }
    //获取cooike
    function getCookie(name){
        //var _password = document.getElementById('password');
        var arr = document.cookie.match(new RegExp("(^| )"+name+"=([^;]*)(;|$)")); //通过正则表达式获取cookie为name的字符组
        if(arr!=null){
            return unescape(arr[2]); //输入返回
        }
        return '';
    }
    //删除cookie
    function deleteCookie(name){
        var exp = new Date();
        exp.setTime(exp.getTime() - 1);
        var cval = getCookie(name);
        if(cval!=null) document.cookie= name + "="+cval+";expires="+exp.toGMTString();
    }
    //obj转数组
    function objToArray(obj){
        var arr = [];
        if($.isPlainObject(obj)){
            $.each(obj, function(key,val){
                arr.push(val);
            });
        }
        return arr;
    }
    
	//获取指定长度字符串
	function getSubStr(str,len){
	    if(str){
	        var s = "";
            if(str.length <= len){
                s = str;
            }else{
                s = str.substring(0,len)+"...";
            }
            return s;
	    }else{
	        return str;
	    }
	    
	}
	//获取字符串utf-8长度，中文算2个字符，英文数字算一个字符
    function getStrUTF8Length(str) { 
        if(str){
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
        }else{
            return str;
        }
    }
    //获取字符串utf-8指定长度的字符，中文算2个字符，英文数字算一个字符
    function getUTF8SubStr(str,num) { 
        if(str){
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
        }else{
            return str;
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

    //猜你喜欢函数
	function guess(){
        $("#mask").show();
        var urlParam = getUrlParam();
        var idsArr = urlParam.ids!==undefined?(JSON.stringify(urlParam.ids)):JSON.stringify([]);
        //var type = urlParam.videoTypeList!==undefined?(JSON.stringify(urlParam.videoTypeList)):JSON.stringify([]);
        var send = {
            ids:idsArr,
            show:JSON.stringify(show),
            page:0
        }
        $.ajax({
            url:'/index.php/video/guess/format/jsonp/callback/jsonpcallback',
            dataType:'jsonp',
            data:send,
            success: function(data) {
                $("#mask").hide();
                if (data.status === 1) {
                    var n = 1;
                    var rdata = data.result.items;
                    var len = Math.floor(rdata.length/n);
                    var dom = $('#guess .lunhuan .lunhuan_content .pics');
                    for(var i = 0;i<=len;i++){
                        var count = i*n;
                        var div = $('<div class="tuwen"></div>');
                        for(var j = 0;j<n;j++){
                            if((count+j) <= rdata.length-1){
                                var html = "";
                                var img_src = rdata[count+j].preview_image_url;
                                var id = rdata[count+j].id;
                                var type = rdata[count+j].type;
                                var wholeText = rdata[count+j].title;
                                var text = getUTF8SubStr(rdata[count+j].title,42);
                                var url = rdata[count+j].play_url;
                                var vid = rdata[count+j].vid;
                                if(url == ""){
                                    url = 'http://search.cctv.com/playVideo.php?detailsid='+vid;
                                }
                                var a = '<a target="_blank" href="'+url+'">[详细]</a>';
                               
                                html = '<div class="tuwen'+j+'">\
                                                <a href="'+url+'" target="_blank">\
                                                    <img src="'+img_src+'" data-id="'+vid+'" data-type="'+type+'">\
                                                    <span data-id="'+vid+'"></span>\
                                                </a>\
                                                <p class="clearfix"><em title="'+wholeText+'">'+text+'</em>'+a+'</p>\
                                            </div>';
                                div.append(html);   
                            }
                        }
                        if(div.children().length > 0){
                            dom.append(div);
                        }
                    }
                    dom.find(".tuwen div a").hover(
                      function () {
                        $(this).find("span").addClass("active");
                      },
                      function () {
                        $(this).find("span").removeClass("active");
                      }
                    );
                    /////猜你喜欢滚动////
                    $("#guess .lunhuan .lunhuan_content .pics").imgScrollBlock_ajax({//需要滚动图片的父级块元素
                        topScroll:false,  //是否是上下滚动
                        leftScroll:true  //是否是左右滚动
                    });
                    
                    if(!$.isEmptyObject(data.result.types)){
                        classshow('#classresult',data.result.types);
                        /////分类滚动////
                        $(".imgscroll").imgScrollBlock({//需要滚动图片的父级块元素
                            topScroll:false,//是否是上下滚动
                            leftScroll:true,//是否是左右滚动
                            childrenSel:5,//滚动的图片张数
                            controldot:false//定义是否有下端滚动控制球
                        });
                    }
                }else{
                    alert("没有播放数据!")
                }
            },
            error:function (XMLHttpRequest, textStatus, errorThrown) {
                $("#mask").hide();
                alert("服务器连接错误!");
            }
        });

        
    }
    //分类添加
	function classshow(selstr,data){
        $("#classresult").empty();
        $("#classresult").show();
        var num = [];
        $.each(data,function(i,n){
            num.push(i);
        });
        $.each(data,function(i,n){
            var last = "";
            if (num.length==1){
                last = "classshowLanLast";
            }
            var lan = $('<div class="classshowLan '+last+'"></div>');
            lan.append('<h3>'+i+'</h3>');
            var content = $('<div class="lunhuanlan clearfix"><div class="Lbtn"><a class="prv" href="javascript:void(0);"></a></div><div class="lan_nr"><div class="imgscroll clearfix"></div></div><div class="Rbtn"><a class="next" href="javascript:void(0);"></a></div></div>');
            var div = content.find("div.imgscroll");
            $.each(n,function(key,v){
                var _url = v.play_url;
                var wholeText = v.title;
                var text = getUTF8SubStr(v.title,42);
                if(_url == ""){
                    _url = 'http://search.cctv.com/playVideo.php?detailsid='+v.vid;
                }
                var a = '<a target="_blank" href="'+_url+'">[详细]</a>';
                var html = '<div class="tuwen">\
                                        <a href="'+_url+'" target="_blank">\
                                            <img src="'+v.preview_image_url+'" />\
                                            <span></span>\
                                        </a>\
                                        <p class="clearfix"><em title="'+wholeText+'">'+text+'</em>'+a+'</p>\
                                    </div>';
                div.append(html);
            });
            lan.append(content);
            $(selstr).append(lan);
            lan.find(".lunhuanlan .lan_nr .imgscroll .tuwen a").hover(
              function () {
                $(this).find("span").addClass("active");
              },
              function () {
                $(this).find("span").removeClass("active");
              }
            );
            num.shift();
        });
    }
    
    
    var ids= [];
    var hash = window.location.hash;
    var urlPram = getUrlParam();
    var para = ["c1","c2","c3","c4","c5"];
    var defultSwich = {c1:["0"],c2:["0"],c3:["0"],c4:["0"],c5:["0"]};
    var newP = {};
    var show = [];
    //var history_len = history.length;
    if(urlPram){
        $.each(urlPram, function(key,val){
            if($.inArray(key,para) !== -1){
                newP[key] = val;
            }
        });
    }
    $.extend(true,defultSwich,newP);
    var arr = objToArray(defultSwich);
    $.each(arr,function(i,n){
        if(n[0] == "0"){
            show.push(i+1)
        }
    });

    //执行guess函数
    guess();
    
    //返回重选按钮点击
    $("#return").on("click", function(){
        $("#mask").show();
        window.location.href = ('/iframe/videoguess'+hash);
        
        /*if(history_len === 1){
            //console.log("shoudong");
            window.location.href = ('/iframe/videoguess'+hash);
        }else{
            //console.log("tuijian");
            history.back();
        }*/
        //window.location.href = ("/iframe/videoguess");
        
    });
});
