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
    
	//推荐函数
	function recommend() {
        $("#mask").show();
        $.ajax({
            url: '/index.php/video/recommend/format/jsonp/callback/jsonpcallback',
            dataType: 'jsonp',
            success: function(data) {
                $("#mask").hide();
                if (data.status === 1) {
                    var n = 2;
                    var len = Math.floor(data.result.length/n);
                    var dom = $('#recomm .lunhuan .lunhuan_content .pics');
                    for(var i = 0;i<=len;i++){
                        var count = i*n;
                        var div = $('<div class="tuwen"></div>');
                        for(var j = 0;j<n;j++){
                            if((count+j) <= data.result.length-1){
                                var html = "";
                                var img_src = data.result[count+j].preview_image_url;
                                var id = data.result[count+j].id;
                                var type = data.result[count+j].type;
                                var wholeText = data.result[count+j].title;
                                var text = getUTF8SubStr(data.result[count+j].title,42);
                                var url = data.result[count+j].play_url;
                                var vid = data.result[count+j].vid;
                                if(url == ""){
                                    url = 'http://search.cctv.com/playVideo.php?detailsid='+vid;
                                }
                                var a = '<a target="_blank" href="'+url+'">[详细]</a>';
                                html = '<div class="tuwen'+j+'">\
                                                <img src="'+img_src+'" data-id="'+vid+'" data-type="'+type+'">\
                                                <span data-id="'+vid+'"></span>\
                                                <p class="clearfix"><em title="'+wholeText+'">'+text+'</em>'+a+'</p>\
                                            </div>';
                                div.append(html);   
                            }
                        }
                        if(div.children().length > 0){
                            dom.append(div);
                        }
                    }
                    var new_id = [];
                    dom.find(".tuwen span").each(function(i){
                        var _vid = $(this).attr("data-id");
                        //var _ids = _id.join(',');
                        if($.inArray(_vid,_id) >= 0){
                            $(this).addClass('like');
                            new_id.push(_vid);
                        }
                    });
                     _id = new_id;
                     _num = _id.length;
                     $("#main .titlelist .title_left p.tip span.dhong").html(_num);
                    
                    dom.find('img').on("click", function(){
                        var datatype = $(this).attr("data-type");
                        var data_id = $(this).attr("data-id");
                        if($(this).next().hasClass("like")){
                            $(this).next().removeClass('like');
                            _num -= 1;
                             _id = $.grep(_id, function(n,i){
                                  return n != data_id;
                                });
                        }else{
                            $(this).next().addClass('like');
                            _num += 1;
                            _id.push(data_id);
                        }
                        var _ids = _id.join(',');
                        setCookie("uservids",_ids,240);
                        $("#main .titlelist .title_left p.tip span.dhong").html(_num);
                    });
                    
                    /////为您推荐滚动////
                    $("#recomm .lunhuan .lunhuan_content .pics ").imgScrollBlock({//需要滚动图片的父级块元素
                        topScroll:false,//是否是上下滚动
                        leftScroll:true,//是否是左右滚动
                        childrenSel:5,//滚动的图片张数
                        controldot:true//定义是否有下端滚动控制球
                    });
                    
                    //为您推荐按钮点击
                    $("#recommandBtn").on("click", function(){
                        //guess();
                        if(_num >=3){
                            $("#mask").show();
                            if(urlParam && urlParam.uid){
                                var sendData = {};
                                sendData = {
                                    "uid":urlParam.uid[0],
                                    "vids":_id
                                };
                                $.ajax({
                                    url: '/index.php/video/select/format/json',
                                    dataType: 'json',
                                    data:sendData,
                                    type:"POST",
                                    success: function(data) {
                                        if(data.status == 1){
                                            var _ids = _id.join(',');
                                            //var typelist = urlPram.videoTypeList?('&videoTypeList='+urlPram.videoTypeList.join(',')):'';
                                            //window.location.href = ("/iframe/guessresult#ids="+_ids+typelist);
                                            var hash = window.location.hash.replace("#","&");
                                            window.location.href = ("/iframe/guessresult#ids="+_ids+hash);
                                        }else{
                                            alert("服务器连接错误!");
                                        }
                                    },
                                    error:function (XMLHttpRequest, textStatus, errorThrown) {
                                        $("#mask").hide();
                                        alert("服务器连接错误!");
                                    }
                                });
                            }else{
                                var _ids = _id.join(',');
                                //var typelist = urlPram.videoTypeList?('&videoTypeList='+urlPram.videoTypeList.join(',')):'';
                                //window.location.href = ("/iframe/guessresult#ids="+_ids+typelist);
                                var hash = window.location.hash.replace("#","&");
                                window.location.href = ("/iframe/guessresult#ids="+_ids+hash);
                            }
                        }else{
                            alert("请选择3部以上的推荐视频!");
                        }
                    });
                }else{
                    alert("没有数据!")
                }
            },
            error:function (XMLHttpRequest, textStatus, errorThrown) {
                $("#mask").hide();
                alert("服务器连接错误!");
            }
        });
    }
    
    var href = window.location.href;
    var hash = window.location.hash;
    //var defultSwich = {c1:["0"],c2:["0"],c3:["0"],c4:["0"],c5:["0"]};
    var para = ["uid","c1","c2","c3","c4","c5"];
    var urlParam = getUrlParam();
    //$.extend(true,defultSwich,urlParam);
    var arr = objToArray(urlParam);
    var param = "";
    var _id= [];
    var newP = {};
    var _num = 0;
    
    if(urlParam){
        $.each(urlParam, function(key,val){
            if($.inArray(key,para) !== -1){
                newP[key] = val;
            }
        });
        $.each(newP, function(key,val){
            param += key+"="+val+"&";
        });
        param = param.slice(0,(param.length-1));
        window.location.hash = param;

       //uid存在时候申请ajax
        if(urlParam.uid){
            var sendData = {
                "uid":urlParam.uid[0]
            };
            $.ajax({
                url: '/index.php/video/select/format/json',
                dataType: 'json',
                data:sendData,
                type:"GET",
                cache:false,
                success: function(data) {
                    if(data.status == 1){
                        _id = data.vids;
                        _num = _id.length;
                        recommend();
                    }else{
                        if(urlParam.ids){
                            _id = urlParam.ids
                        }else{
                            if(getCookie("uservids") !== ''){
                                _id = getCookie("uservids").split(",");
                            }
                        }
                        _num = _id.length;
                        recommend();
                    }
                },
                error:function (XMLHttpRequest, textStatus, errorThrown) {
                    $("#mask").hide();
                    //alert("服务器连接错误!");
                    if(urlParam.ids){
                        _id = urlParam.ids
                    }else{
                        if(getCookie("uservids") !== ''){
                            _id = getCookie("uservids").split(",");
                        }
                    }
                    _num = _id.length;
                    recommend();
                }
            });
        }else if(urlParam.ids){
            _id = urlParam.ids
            _num = _id.length;
            recommend();
        }else{
            if(getCookie("uservids") !== ''){
                _id = getCookie("uservids").split(",");
            }
            _num = _id.length;
            recommend();
        }
    }else{
        if(getCookie("uservids") !== ''){
            _id = getCookie("uservids").split(",");
        }
        _num = _id.length;
        recommend();
    }
});
