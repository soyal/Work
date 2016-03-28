/**
 * Created by Soyal on 2016/3/24.
 */
//团队归属
var $hometeamForm = $("#J-form-hometeam")
var $hometeam = $hometeamForm.find("#hometeam");//团队归属的输入框
var $hometeamSubmit = $hometeamForm.find("#J-hometeam-update");//修改信息提交按钮
var $hometeanEdit =  $hometeamForm.find("#J-hometeam-edit");//团队归属编辑按钮
var $movepanel = $("#J-movepanel");
$hometeanEdit.click(function(e){
    $hometeam.attr("disabled",false);
    $hometeamSubmit.attr("disabled",false);
    $hometeanEdit.attr("disabled",true);
});
$hometeam.keydown(function(e){
    e.returnValue = false;
    e.preventDefault();
});
$hometeam.focus(function(){
    $movepanel.html("请稍等...")
    var $this = $(this);
    var offset = $this.offset();
    $movepanel.css("left",offset.left + "px");
    $movepanel.css("top",offset.top + $this.outerHeight() + "px");
    $movepanel.show();

    //读取数据
    $.getJSON("../../WEB-INF/static/json/test.json",function(data){
        console.log(data);
        clearMovePanel();
        var $fragment = $(document.createDocumentFragment());
        data.forEach(function(e){
            $fragment.append("<li class='list-group-item' data-id='"+e.researchTeamId+"'>"+e.TeamName+"</li>")
        });
        $movepanel.append($fragment);
    });
});
$hometeam.blur(function(){
    setTimeout(function(){
        $movepanel.hide();
    },200);

});
$movepanel.delegate("li","click",function(){
    var $this = $(this);
    $hometeam.val($this.html());
    var $researchTeamId = $("#researchTeamId");
    if($researchTeamId.length == 0){
        insertHidden($this.attr("data-id"));
    }else{
        $researchTeamId.val($this.attr("data-id"));
    }
});
//清空movepanel
function clearMovePanel(){
    $movepanel.html("");
}

//向form里面插入 hidden的input
function insertHidden(id){
    $hometeamForm.prepend("<input type='hidden' name='researchTeamId' id='J-researchTeamId' value='"+id+"'>");
}