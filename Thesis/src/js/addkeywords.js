/**
 * Created by Soyal on 2016/3/24.
 */
var directSum = 0;
var $alert = $("#J-alert");
var $paperform = $("#J-form-paper");//论文修改的表单
var $opItems = $paperform.find(".operation-item");//论文信息的可操作项
var $paperEdit = $paperform.find("#J-paper-edit");
var $paperSubmit = $paperform.find("#J-paper-update");
var $keywordsTable = $paperform.find("#J-table-keywords");
var $papertitle = $paperform.find("#papertitle");//论文题目
var $papertype = $paperform.find("#papertype");//论文类型
var $keywordsAdd = $paperform.find("#J-keywords-add");//关键字添加按钮
var $keywordsDel = $paperform.find("#J-keywords-delete");//关键字删除按钮
var $initpage = $("#J-pageforinit");
var $initinfo = $("#J-initinfo");
var $movepanel = $("#J-movepanel");                     //全局移动的信息面板
var $theory = $("#J-theory");                           //理论研究的关键字操作
var $hardsoft = $("#J-hardsoft");                         //软件和硬件操作对应的关键字操作
var $direct1;
var $onlyImport;                                         //不能自己输入，只能引入的input
var $direct2;
var $keywords;
var paperkeys = [];                                   //用于软件和硬件研究方向的关键字添加
var $curTarget = null;//当前的选择目标
var $lastTarget = null;//上一个选择目标
var focusType = 0;
var FOCUS_TYPE = {
    KEYWORDS : 1,  //关键字
    DIRECTION : 2, //方向
    TYPE : 3       //研究类型
};
var keywordIds = [];
var trIndex = 0;
var keywordsCache = [];         //关键字缓存[{direct2_id:1,data:{}}]

function enableEdit(){
    $opItems.attr("disabled",false);
    $paperEdit.attr("disabled",true);
    $paperSubmit.attr("disabled",false);
}
function forbidEdit(){
    $opItems.attr("disabled",true);
    $paperEdit.attr("disabled",false);
    $paperSubmit.attr("disabled",true);
}

initDirectAndKeywords();

//信息编辑
$paperEdit.click(enableEdit);

//信息提交
$paperSubmit.click(function(){

    var data = {};
    //检测是否有论文题目这一个input
    if($papertitle.length !== 0){//有,学生
console.log("学生");
        if(!$papertitle.val() || !$papertype.val()){
            alert("请输入论文信息");
            return false;
        }
        data.paper = {
            papertitle : $papertitle.val(),
            papertype : $papertype.val()
        }
    }else{  //没有，老师
console.log("老师");
    }

    //1.选择的研究类型为理论研究
    if(!data.paper||data.paper.papertype == "应用基础研究"){
        //检测是否有填写关键字
        if(keywordIds.length == 0&&$keywordsTable.find("tr").length>0){
            showWarning("请完善研究方向或关键字信息");
            return false;
        }

        data.researchDirection = [];
        keywordIds.forEach(function(e){
            data.researchDirection.push({
                researchdirectionid : e.value
            })
        });
    //2.选择的研究类型为软件和硬件
    } else{
        var $paperkeys = $hardsoft.find(".paperkey");
        $paperkeys.each(function(){
            var value = $.trim($(this).val());
            if(value){
                paperkeys.push(value);
            }
        });
        var paperkeysStr = paperkeys.join(",");
        if(!paperkeysStr){
            showWarning("请输入关键字");
            return;
        }
        data.paper.paperkey = paperkeysStr;
    }
    forbidEdit();
console.log(data);
    //TODO

    $.ajax("../../WEB-INF/static/json/test.json",{
        type : "post",
        data : JSON.stringify(data),
        headers: {'Content-type': 'application/json;charset=UTF-8'},
        success : function(){
            console.log("success");
        }
    })
});

$alert.find(".close").click(function(){
    hideWarning();
});
//添加关键字方向的面板操作
$keywordsAdd.click(function(){
    //检测添加数量并提示
    if(directSum >= DIRECT_MAX){
        showWarning("研究方向已经达到添加上限");
        return;
    }
    addDomTr();
});

function showWarning(info){
    $alert.find(".alert-content").html(info);
    $alert.slideDown();
}
function hideWarning(){
    $alert.slideUp();
    $alert.find(".alert-content").html("");
}

//删除关键字操作
$keywordsDel.click(function(){
    var $checked = $keywordsTable.find("input:checkbox:checked");
    var $tr;
    $checked.each(function(){
        //dom的移除
        $tr = $(this).parents("tr");
        deleteDirectAndKeywords($tr);
    });
});

function deleteDirectAndKeywords($tr){
    //keywordIds的移除
    keywordIds.forEach(function(e,i,array){
        if(e.trIndex == $tr.attr("data-index")){
            array[i] = undefined;
        }
    });
    keywordIds = filterUndefined(keywordIds);
    $tr.remove();
    directSum--;
}

function showInitInfo(){//展示信息加载的信息，隐藏内容面板
    $initpage.hide();
    $initinfo.show();
}
function hideInitInfo(){//隐藏信息加载的信息，展示内容面板
    $initpage.show();
    $initinfo.hide();
}
//研究方向及关键字初始化
function initDirectAndKeywords(){
    if($papertype.val() == "应用基础研究"||$papertype.length == 0){
        showInitInfo();
        $.getJSON("../../WEB-INF/static/json/initinfo.json",function(data){
            //理论研究的dom渲染
            data.forEach(function(e){
                if(e.isnull){
                    hideInitInfo();
                    return ;
                }
                addDomTrAndFillData(e);
            });
            showTheory();
        });
    //软件和硬件研究初始化渲染由服务器端负责
    }else{
        showHardsoft();
        hideInitInfo();
    }
}

function addDomTr(callback){
    directSum ++;
    var src = $("#table-tr").attr("src");
    var $tr;
    $.ajax(src,{
        type : "get",
        success : function(data){
            $tr = $(data);
            $keywordsTable.append($tr);
            $tr.attr("data-index",trIndex++);
            bindEventForKeywords();
            if(callback){
                callback($tr);
            }
        },
        error : function(){
            throw new Error("数据传输出错");
        }
    })
}
function addDomTrAndFillData(obj){
    addDomTr(function($tr){
        //$tr.find("#J-direct1").val(obj.researchdirection1);
        //$tr.find("#J-direct2").val(obj.researchdirection2);
        var direct1 = obj.researchdirection1;
        var direct2 = obj.researchdirection2;
        var keywords = obj.keywords;

        //在dom中插入数据
        var $direct1Input = $tr.find(".J-direct1");//1级研究方向
        var $direct2Input = $tr.find(".J-direct2");//2级研究方向
        var $keywordsInput = $tr.find(".J-keyword");//关键字
        $tr.find(":checkbox").attr("disabled",true);
        writeDirection(direct1.researchdirectionid,direct1.name,$direct1Input);
        $direct1Input.attr("disabled",true);
        writeDirection(direct2.researchdirectionid,direct2.name,$direct2Input);
        $direct2Input.attr("disabled",true);
        keywords.forEach(function(el,i,array){        //遍历从服务器获取的keywords
            writeKeyword(el.id,el.value,$keywordsInput.eq(i));
        });
        $keywordsInput.each(function(){
            $(this).attr("disabled",true);
        });

        hideInitInfo();
    });
}

//清除全局移动窗口的数据
function clearMovePanel(){
    $movepanel.html("");
}

//为所有与keywords功能相关的元素绑定事件
function bindEventForKeywords(){
    //因为引入模板会加入新的元素，所以需要重新查找
    $opItems = $paperform.find(".operation-item");//论文信息的可操作项
    $onlyImport = $paperform.find(".only-import");
    $direct1 =$onlyImport.filter(".J-direct1");
    $direct2 = $onlyImport.filter(".J-direct2");
    $keywords = $onlyImport.filter(".J-keyword");

    $onlyImport.unbind();//移除所有事件，否则会造成重复绑定
    //让所有只能引入的input不能进行自定义输入
    $onlyImport.keydown(function(e){
        e.preventDefault();
        e.returnValue =false;
    });


    var isSwitch = false;//是否为各个input之间的切换


    //焦点到input上出现信息框

    $onlyImport.focus(function(e){
console.log("focus");
        $movepanel.html("请稍等···");
        var $this = $(this);
        var offset = $this.offset();
        var height = $this.outerHeight();
        $lastTarget = $curTarget;
        $curTarget = $this;
        $movepanel.css("left",offset.left+"px");
        $movepanel.css("top",offset.top + height + "px");
        $movepanel.show();
        isSwitch = true;

        //根据direct1|2,keyword进行不同功能的添加
        //第一级研究方向直接从远端获取
        focusType = FOCUS_TYPE.DIRECTION;
        if($this.hasClass("J-direct1")){ //direct1
            //TODO
            $.getJSON("../../WEB-INF/static/json/test3.json",function(data){
                insertIntoMovePanel(data);
            });
            //第二级研究方向根据第一级研究方向获取
        }else if($this.hasClass("J-direct2")){
            var direct1 = $this.parents("td").find(".J-direct1").attr("data-id");
            if(!direct1) {
                clearMovePanel();
                return;
            }
            $.getJSON("../../WEB-INF/static/json/test3.json",{researchdirectionid : direct1},function(data){
                insertIntoMovePanel(data);
            });
            //关键字根据第二级研究方向获取
        }else if($this.hasClass("J-keyword")){
            focusType = FOCUS_TYPE.KEYWORDS;
            var direct2 = $this.parents("td").find(".J-direct2").attr("data-id");
            if(!direct2) {
                clearMovePanel();
                return;
            }
            //进行缓存
            if(keywordsCache[direct2]){
                //缓存中有
console.log("line:318","缓存中有");
                insertIntoMovePanel(keywordsCache[direct2]);
            //缓存中没有
            }else{
console.log("line:322","从服务器端取");
                $.getJSON("../../WEB-INF/static/json/test3.json",{researchdirectionid : direct2},function(data){
                    keywordsCache[direct2] = data;
                    insertIntoMovePanel(data,direct2);
                });
            }

        }else if($this.hasClass("J-papertype")){
            focusType = FOCUS_TYPE.TYPE;
            insertIntoMovePanel([{
                id : 0,
                name : "应用基础研究"
            },{
                id : 1,
                name : "技术开发（软件）"
            },{
                id : 2,
                name : "技术开发（硬件）"
            },{
                id : 3,
                name : "系统（工程）设计"
            }]);
        }
    });
    //失去焦点，信息框隐藏
    $onlyImport.blur(function(e){
        isSwitch = false;
        setTimeout(function(){
            if(!isSwitch){
                $movepanel.hide();
            }
        },200);
    });
}

bindEventForKeywords();
//全局信息框的点击

$movepanel.delegate("li","click",function(e){
    var $this = $(this);
console.log("click");
    //如果focus的是关键字的input
    if(focusType == FOCUS_TYPE.KEYWORDS){
        writeKeyword($this.attr('data-id'),$this.html(),$curTarget);
    }else if(focusType == FOCUS_TYPE.DIRECTION){
        writeDirection($this.attr('data-id'),$this.html(),$curTarget);
    }else if(focusType == FOCUS_TYPE.TYPE){
        writeResearchType($this.attr('data-id'),$this.html(),$curTarget);
    }

    //$curTarget.val( $this.html());
    //$curTarget.attr("data-id",$this.attr("data-id"));
    //$movepanel.html("");//清空信息框的数据
});

/**
 * 往keyword input中填入数据时的数据操作，不包括将值写入Input
 * @param id  要出入input的 data-id的值
 * @param value
 * @param target
 */
function writeKeyword(id,value,target){
//console.log("write keyword","value = "+value,"id = "+id);
    var $tr = target.parents("tr");
    var inputIndex = $tr.find(".J-keyword").index(target);
    if(target.val()){//如果已经有值
        keywordIds.forEach(function(e,i,array){
            if(e.inputIndex == inputIndex){
                array[i].value = id;
            }
        });
        exchangeInPanelAndInput(value,target);
    }else{//focus的input没有值
        var index = $tr.attr("data-index");
        keywordIds.push({
            trIndex : index,
            inputIndex : inputIndex,
            value : id
        });
        renderPanelToInput(value);
    }
    target.val( value);
    target.attr("data-id",id);
    $movepanel.html("");//清空信息框的数据
}

/**
 * 向direction input 写入数据并插入data-id
 * @param id
 * @param value
 * @param $target  目前的焦点
 */
function writeDirection(id,value,$target){
    //$target.val(value);
    //$target.attr("data-id",id);
    $target.val( value);
    $target.attr("data-id",id);
    $movepanel.html("");//清空信息框的数据
}

/**
 * 写研究类型
 * @param id
 * @param value
 * @param $target
 */
function writeResearchType(id,value,$target){
    //1.进行数据添加
    $target.val( value);
    $target.attr("data-id",id);
    $movepanel.html("");//清空信息框的数据

    //2.根据所选的研究方向不同，设置不同的关键字操作
    if(value == "应用基础研究"){
        showTheory();
    }else {
        showHardsoft();
    }
}
/**
 * 删除数组中的undefined的值
 * @param array
 */
function filterUndefined(array){
    return array.filter(function(e){
        if(e !== undefined){
            return true
        }
        return false;
    })
}

/**
 * 显示理论研究关键字操作，隐藏软硬件关键字操作
 */
function showTheory(){
    $theory.show();
    $hardsoft.hide();
}

/**
 * 显示软硬件关键字操作，隐藏理论研究关键字操作
 */
function showHardsoft(){
    $theory.hide();
    $hardsoft.show();
}


/**
 * 将data信息插入movepanel
 * @param data   一段json
 * @param direct2_id
 */
function insertIntoMovePanel(data,direct2_id){
    $movepanel.html("");
    var $fragment = $(document.createDocumentFragment());//文档碎片
    for(var i= 0,len=data.length;i<len;i++){
        var $li = $("<li class='list-group-item'></li>");
        $li.attr("data-id",data[i].researchdirectionid);
        $li.html(data[i].name);
        $fragment.append($li);
    }
    $movepanel.append($fragment);
    $movepanel.attr("data-direct2-id",direct2_id);
}

/**
 * 将panel中点击的li的值给予input(这个值会从panel中删除)
 * @param value 要给与的值
 * @param $input 目标
 */
function renderPanelToInput(value){
    var direct2_id = $movepanel.attr("data-direct2-id");
    var data = keywordsCache[direct2_id];
    if(!data) return;
    deleteDataFromCache(value,data);
    insertIntoMovePanel(data);
}

/**
 * 删除缓存中的数据
 * @param value
 * @param direct2_id
 */
function deleteDataFromCache(value,data){
    //删除缓存中对应的数据
    data.forEach(function(e,i,array){
        if(e.name == value){
            array.splice(i,1);
            return true;
        }
    });
}

/**
 * 交换input和movepanel上的信息
 * @param value
 * @param $target
 */
function exchangeInPanelAndInput(value,$target){
    var direct2_id = $movepanel.attr("data-direct2-id");
    var data = keywordsCache[direct2_id];
    if(!data) return;
    deleteDataFromCache(value,data);
    data.push({
        researchdirectionid : $target.attr("data-id"),
        name : $target.val()
    });
    insertIntoMovePanel(data);
}