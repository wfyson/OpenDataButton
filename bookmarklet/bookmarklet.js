javascript:(function() {

var v = "1.10.2";

if (window.jQuery === undefined || window.jQuery.fn.jquery < v) {
    var done = false
    var script = document.createElement("script");
    script.src = "http://ajax.googleapis.com/ajax/libs/jquery/" + v + "/jquery.min.js";
    script.onload = script.onreadystatechange = function() {
        if (!done && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
            done = true;
            initMyBookmarklet();
        }
    };
    document.getElementsByTagName("head")[0].appendChild(script);
} else {
    initMyBookmarklet();
}

function initMyBookmarklet() {
    (window.myBookmarklet = function() {

        var dialog = $('#odb-bkmlt-dialog-form'); 
        if (dialog.length > 0) {
            dialog.fadeIn(); return;
        }

        $("body").append("\
     <div id=\"odb-bkmlt-dialog-form\" style=\"display:none\">\
     <h5>Open this data!</h5>\
     <form><fieldset>\
     <label for=\"title\">Title</label>\
        <input type=\"text\" name=\"title\"/><br/>\
     <label for=\"context\">Context</label>\
     <select name=\"context\">\
         <option value=\"private\">Private</option>\
         <option value=\"academic\">Academic</option>\
         <option value=\"commercial\">Commercial</option>\
         <option value=\"government\">Government</option>\
     </select><br/>\
     <label for=\"reason\">Reason</label>\
         <input type=\"checkbox\" checked name=\"reason\" value=\"legal\">Legal</button>\
         <input type=\"checkbox\" name=\"reason\" value=\"technical\">Technical</button>\
     </fieldset>\
     <label></label><button class=\"submit\">Submit</button>\
     </form>\
     <button style=\"float:right\" class=\"cancel\">Close</button>\
     </div>\
     <style type=\"text/css\">\
     #odb-bkmlt-dialog-form { width:30em; z-index:9999; font-size:16px; position:fixed; top:0px; left:5em; padding:2em; border:1px solid black; box-shadow:5px 5px 10px #888; background: white; }\
     #odb-bkmlt-dialog-form h5 { font-size:24px; } #odb-bkmlt-dialog-form label { width:6em; display:inline-block; }\
     </style>\
     ");
        
        dialog = $('#odb-bkmlt-dialog-form').fadeIn(); 
        $('input[name=\"title\"]', dialog).val(document.title);

        var lat = 0, lon = 0;        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position){
                lat = position.coords.latitude;
                lon = position.coords.longitude;
            });
        }

        $('button.submit', dialog).click(function() {
            var formdata = {
                    "url":      location.href,
                    "title":    $("input[name=\"title\"]", dialog).val(),
                    "context":  $("select[name=\"context\"]", dialog).val(),
                    "reason":   $("input[name=\"reason\"]:checked", dialog).val(),
                    "lat":      lat,
                    "lon":      lon
                };
            //console.log(formdata); return false;
            $.post(
                'http://localhost:5000/submit', 
                formdata,
                function(d) { 
                    $('form', dialog).html('Thanks!<br><br><tt>' + d + '</tt>');
                }
            );
            return false;
        });

        $('button.cancel', dialog).click(function() {
            dialog.fadeOut().remove();
        });

    })();
}
})();