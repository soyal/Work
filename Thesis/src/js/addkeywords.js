/**
 * Created by Soyal on 2016/3/24.
 */
var MAX_DIRECT = 2;

var $paperform = $("#J-form-paper");//论文修改的表单
var $opItems = $paperform.find(".operation-item");//论文信息的可操作项
var $paperEdit = $paperform.find("#J-paper-edit");
var $paperSubmit = $paperform.find("#J-paper-update");
var $keywordsTable = $paperform.find("#J-table-keywords");
var $papertitle = $paperform.find("#papertitle");//论文题目
var $papertype = $paperform.find("#papertype");//论文类型
var $keywordsAdd = $paperform.find("#J-keywords-add");//关键字添加按钮
var $keywordsDel = $paperform.find("#J-keywords-delete");//关键字删除按钮
var $onlyImport;                                         //不能自己输入，只能引入的input
var $movepanel = $("#J-movepanel");                     //全局移动的信息面板
var $direct1;
var $direct2;
var $keywords;
var curTarget = null;//当前的选择目标
var isfocusKeyword = false;
var keywordIds = [];
//信息编辑
$paperEdit.click(function(){
    $opItems.attr("disabled",false);
    $paperEdit.attr("disabled",true);
    $paperSubmit.attr("disabled",false);
});

//信息提交
$paperSubmit.click(function(){
    $opItems.attr("disabled",true);
    $paperEdit.attr("disabled",false);
    $paperSubmit.attr("disabled",true);
console.log("keywordIds",keywordIds);
    var data = {};
    //检测是否有论文题目这一个input
    if($papertitle.length !== 0){//有,学生
        if(!$papertitle.val() || !$papertype.val()){
            alert("请输入论文信息");
            return false;
        }
        data.paper = {
            papertitle : $papertitle.val(),
            papertype : $papertype.val()
        }
    }else{  //没有，老师

    }

    //检测是否有填写关键字
    if(keywordIds.length == 0&&$keywordsTable.find("tr").length>0){
        alert("请选择关键字");
        return false;
    }




    data.researchDirection = [];
    keywordIds.forEach(function(e){
        data.researchDirection.push({
            researchdirectionid : e.value
        })
    });
console.log(data);
    //TODO

    $.ajax("../../WEB-INF/static/json/test.json",{
        type : "post",
        data : data,
        success : function(){
            console.log("success");
        }
    })
});

//添加关键字操作
$keywordsAdd.click(function(){
    if($keywordsTable.find("tr").length>MAX_DIRECT-1){
        alert("你的研究方向已经达到添加上限");
        return;
    }
    //获取模板并将模板内容添加到dom
    var src = $("#table-tr").attr("src");
    $.ajax(src,{
        type : "get",
        success : function(data){
            $keywordsTable.append(data);
            bindEventForKeywords();
        },
        error : function(){
            throw new Error("数据传输出错");
        }
    })
});

//删除关键字操作
$keywordsDel.click(function(){
    var $checked = $keywordsTable.find("input:checkbox:checked");
    var $tr;
    $checked.each(function(){
        //dom的移除
        $tr = $(this).parents("tr");

        var index = $tr.index();
        //keywordIds的移除
        keywordIds.forEach(function(e,i,array){

            if(e.trIndex == index){
               array.splice(i,1);
            }
        });
        $tr.remove();
    });
});

function clearMovePanel(){
    $movepanel.html("");
}

//为所有与keywords功能相关的元素绑定事件
function bindEventForKeywords(){
    //因为引入模板会加入新的元素，所以需要重新查找
    $onlyImport = $paperform.find(".only-import");
    $direct1 =$onlyImport.filter(".J-direct1");
    $direct2 = $onlyImport.filter(".J-direct2");
    $keywords = $onlyImport.filter(".J-keyword");

    //让所有只能引入的input不能进行自定义输入
    $onlyImport.keydown(function(e){
        e.preventDefault();
        e.returnValue =false;
    });


    var isSwitch = false;//是否为各个input之间的切换

    function insertIntoMovePanel(data){
        $movepanel.html("");
        var $fragment = $(document.createDocumentFragment());//文档碎片
        for(var i= 0,len=data.length;i<len;i++){
            var $li = $("<li class='list-group-item'></li>");
            for(var key in data[i]){
                if(key != "name"){
                    $li.attr("data-name",key);
                    $li.attr("data-id",data[i][key]);
                }else{
                    $li.html(data[i][key]);
                }
            }
            $fragment.append($li);
        }
        $movepanel.append($fragment);
    }
    //焦点到input上出现信息框
    $onlyImport.focus(function(e){
console.log("focus!");
        $movepanel.html("请稍等···");
        var $this = $(this);
        var offset = $this.offset();
        var height = $this.outerHeight();
        curTarget = $this;
        $movepanel.css("left",offset.left+"px");
        $movepanel.css("top",offset.top + height + "px");
        $movepanel.show();
        isSwitch = true;

        //根据direct1|2,keyword进行不同功能的添加
        //第一级研究方向直接从远端获取
        isfocusKeyword = false;
        if($this.hasClass("J-direct1")){ //direct1
            //TODO
            $.getJSON("../../WEB-INF/static/json/test3.json",function(data){
                insertIntoMovePanel(data);
            });
            //第二级研究方向根据第一级研究方向获取
        }else if($this.hasClass("J-direct2")){
            var direct1 = $this.parents("td").find(".J-direct1").attr("data-id");
            console.log(direct1);
            if(!direct1) {
                clearMovePanel();
                return;
            }
            //TODO
            $.getJSON("../../WEB-INF/static/json/test3.json",{userResearchDirectionId : direct1},function(data){
                insertIntoMovePanel(data)
            });
            //关键字根据第二级研究方向获取
        }else if($this.hasClass("J-keyword")){
            isfocusKeyword = true;
            var direct2 = $this.parents("td").find(".J-direct2").attr("data-id");
            if(!direct2) {
                clearMovePanel();
                return;
            }
            //TODO
            $.getJSON("../../WEB-INF/static/json/test3.json",{userResearchDirectionId : direct2},function(data){
                insertIntoMovePanel(data);
            })
        }else if($this.hasClass("J-papertype")){
            insertIntoMovePanel([{
                name : "理论研究"
            }])
        }
    });
    //失去焦点，信息框隐藏
    $onlyImport.blur(function(e){
        isSwitch = false;
        setTimeout(function(){
            if(!isSwitch){
                $movepanel.hide();
            }
        },100);
    });
}

//向form里面插入 hidden的input
//function insertHidden(form,name,id){
//    form.prepend("<input type='hidden' name='"+name+"' id='J-"+name+"' value='"+id+"'>");
//}

bindEventForKeywords();
//全局信息框的点击

$movepanel.delegate("li","click",function(e){
    var $this = $(this);
    //var $item = $("#J-" + $this.attr('data-name'));
    if(isfocusKeyword){
        //insertHidden($paperform,$this.attr('data-name'),$this.attr('data-id'));
        var index = $(curTarget).parents("tr").index();
        keywordIds.push({
            trIndex : index,
            value : $this.attr('data-id')
        });
    }

    curTarget.val( $this.html());
    curTarget.attr("data-id",$this.attr("data-id"));
    $movepanel.html("");//清空信息框的数据
});