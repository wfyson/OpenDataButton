javascript:(function() {

    var v = "1.10.2";

    if (window.jQuery === undefined || window.jQuery.fn.jquery < v) {
        var done = false;
        var secondDone = false;
        var script = document.createElement("script");
        script.src = "http://ajax.googleapis.com/ajax/libs/jquery/" + v + "/jquery.min.js";
        script.onload = script.onreadystatechange = function() {
            if (!done && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
                done = true;

                var css = document.createElement("link");
                css.rel = "stylesheet";
                css.type = "text/css";
                css.href = "http://code.jquery.com/ui/1.10.3/themes/smoothness/jquery-ui.css";
                document.getElementsByTagName("head")[0].appendChild(css);

                var uiScript = document.createElement("script");
                uiScript.src = "http://code.jquery.com/ui/1.10.3/jquery-ui.js";
                uiScript.onload = uiScript.onreadystatechange = function() {
                    if (!secondDone && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
                        secondDone = true;
                        initMyBookmarklet();
                    }
                };
                document.getElementsByTagName("head")[0].appendChild(uiScript);
            }
        };
        document.getElementsByTagName("head")[0].appendChild(script);
    } else {
        initMyBookmarklet();
    }

    function initMyBookmarklet() {
        (window.myBookmarklet = function() {

            $("body").append("\
         <div id=\"dialog-form\" title=\"Open this data!\">\
         <form>\
         <fieldset>\
         <label for=\"title\">Title</label>\
         <input type=\"text\" name=\"title\" id=\"title\" class=\"text ui-widget-content ui-corner-all\"/>\
         <label for=\"context\">Context</label>\
         <select name=\"context\" id=\"context\">\
         <option value=\"Academic\">Academic</option>\
         <option value=\"Commercial\">Commercial</option>\
         <option value=\"Government\">Government</option>\
         </select>\
         <label for=\"reason\">Reason</label>\
         <input type=\"radio\" name=\"reason\" value=\"legal\"/> : Legal<br/>\
         <input type=\"radio\" name=\"reason\" value=\"technical\"/> : Technical<br/>\
         </fieldset>\
         </form>\
         </div>\
         ");

            $("#title").val(document.title);

            $("#dialog-form").dialog({
                autoOpen: false,
                height: 300,
                width: 350,
                modal: true,
                buttons: {
                    "Submit": function() {
                        console.log(document.title);
                        console.log($("#title").val());
                        console.log($("#context").val());
                        console.log($("input[name=\"reason\"]:checked").val());

                    },
                    Cancel: function() {
                        $(this).dialog("close");
                    }
                },
                close: function() {
                }
            });

            $("#dialog-form").dialog("open");

        })();
    }
})();