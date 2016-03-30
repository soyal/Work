/**
 * Created by Soyal on 2016/3/30.
 */
(function(){
    $.getJSON("../../WEB-INF/static/json/isnewuser.json",function(data){
        //如果是新用户
        if(data.isnewuser){
            $("#J-passalert").modal("show");
            $("a").click(function(){
                alert("请修改密码");
                return false;
            });

        }
    });
})();