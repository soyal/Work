/**
 * Created by Soyal on 2016/4/1.
 */
(function(){
    $.getJSON("../../WEB-INF/static/json/checkpass.json",function(data){
        if(data && data.ispasswordtrue===false){
console.log(data);
            $("#J-passwordalert").show();
        }
    });
})();