/**
 * Created by Soyal on 2016/4/8.
 */
(function(exports){
    /**
     * 日历的构造函数
     * @param selector
     * @constructor
     */
    var Sldate = function(selector){
        this.main = document.querySelector(selector)||document.querySelector(".sldate");
        this.headYear = null;
        this.headMonth = null;
        this.table = null;

        var date = new Date();
        this.__init(date.getFullYear(),date.getMonth()+1);
    };

    Sldate.prototype.__init = function(year,month){
        //*************初始化dom结构************
        //1.sldate-head
        var sldateHead = this.__initHead();
        this.setYearAndMonthOfHead(year,month);
        //2.sldate-nav-prev
        var sldateNavPrev = this.__initNavPrev();
        //3.sldate-nav-next
        var sldateNavNext = this.__initNavNext();
        //3.sldate-content
        var sldateContent = this.__initContent();

        var fragment = document.createDocumentFragment();
        fragment.appendChild(sldateHead);
        fragment.appendChild(sldateNavPrev);
        fragment.appendChild(sldateNavNext);
        fragment.appendChild(sldateContent);

        this.main.appendChild(fragment);

    };

    /**
     * 初始化头部dom
     * @private
     */
    Sldate.prototype.__initHead = function(){
        var sldateHead = document.createElement("h3");
        sldateHead.classList.add("sldate-head");
        var sldateHeadYear = document.createElement("span");
        sldateHeadYear.classList.add("sldate-head-year");
        var textYear = document.createTextNode("年");
        var sldateHeadMonth = document.createElement("span");
        sldateHeadMonth.classList.add("sldate-head-month");
        var textMonth = document.createTextNode("月");
        sldateHead.appendChild(sldateHeadYear);
        sldateHead.appendChild(textYear);
        sldateHead.appendChild(sldateHeadMonth);
        sldateHead.appendChild(textMonth);

        this.headYear = sldateHeadYear;
        this.headMonth = sldateHeadMonth;
        return sldateHead;
    };

    /**
     * 初始化上一页按钮
     * @returns {Element}
     * @private
     */
    Sldate.prototype.__initNavPrev = function(){
        var prev = document.createElement("span");
        prev.classList.add("sldate-nav-prev");
        prev.id = "J-sldate-prev";
        //TODO 设置事件监听
        return prev;
    };

    /**
     * 初始化下一页按钮
     * @returns {Element}
     * @private
     */
    Sldate.prototype.__initNavNext = function(){
        var next = document.createElement("span");
        next.classList.add("sldate-nav-next");
        next.id = "J-sldate-next";
        //TODO 设置事件监听
        return next;
    };

    /**
     * 初始化日历的内容部分
     * @returns {Element}
     * @private
     */
    Sldate.prototype.__initContent = function(){
        var content = document.createElement("div");
        content.classList.add("sldate-content");
        var table = document.createElement("table");
        content.appendChild(table);

        //添加thead
        var thead = document.createElement("thead");
        var ths = ["日","一","二","三","四","五","六"];
        var theadTr = document.createElement("tr");
        ths.forEach(function(e){
            var th = document.createElement("th");
            th.innerHTML = e;
            theadTr.appendChild(th);
        });
        table.appendChild(theadTr);

        //添加tbody
        //TODO 构造合适的数据结构用于存储日期

        this.table = table;
        return content;
    };

    /**
     * 设置头部的年月显示
     * @param year
     * @param month
     */
    Sldate.prototype.setYearAndMonthOfHead = function(year,month){
        this.headYear.innerHTML = year;
        this.headMonth.innerHTML = month;
    };


    exports.Sldate = Sldate;
})(window);