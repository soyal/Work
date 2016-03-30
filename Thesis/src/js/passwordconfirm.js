/**
 * Created by Soyal on 2016/3/30.
 */
(function(){
    console.log("passchek");
    $(".passsubmit").click(function(){
        var $form = $(this).parents("form");
        var password = $form.find("[name=password]").val();
        var confirm = $form.find("[name=confirm]").val();
        if($.trim(password)==""|| $.trim(confirm)==""){
            alert("请进行完整的输入！");
            return false;
        }
        if(password !== confirm){
            alert("两次输入的密码不一致");
            return false;
        }
    });
})();