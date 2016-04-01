/**
 * Created by Soyal on 2016/4/1.
 */
(function(){
    $("#J-submit").click(function(){
        console.log($("#username").val());
        console.log($("#password").val());
        $.ajax("../../WEB-INF/static/json/checkpass.json",{
            type : "post",
            data : {
                username : $("#username").val(),
                password : $("#password").val()
            },
            success : function(data){
                console.log(data);
                if(data.ispasswordtrue){
                    $("#J-login").submit();
                }else{
                    $("#J-passwordalert").show();
                }
            },
            dataType : "json"
        });
    });

})();