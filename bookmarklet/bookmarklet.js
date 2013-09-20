javascript:(function() {

var v = "1.10.2";
var BUTTON_SERVER = 'http://button.datalets.ch';

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
     <link rel=\"stylesheet\" type=\"text/css\" href=\"http://yui.yahooapis.com/3.12.0/build/cssreset-context/cssreset-context-min.css\">\
     <div id=\"odb-bkmlt-dialog-form\" class=\"yui3-cssreset\" style=\"display:none\">\
     <h5>Open this data!</h5><br>\
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
         <input type=\"checkbox\" name=\"reason\" value=\"technical\">Technical</button><br/>\
     <label for=\"lat\">Location</label>\
         lat <input type=\"text\" name=\"lat\" value=\"\" size=\"4\"/>\
         lon <input type=\"text\" name=\"lon\" value=\"\" size=\"4\"/>\
     </fieldset>\
     <label></label><button class=\"submit\">Submit</button>\
     </form>\
     <button style=\"float:right\" class=\"cancel\">Close</button>\
     </div>\
     <style type=\"text/css\">\
     #odb-bkmlt-dialog-form { width:30em; z-index:9999; font-size:16px; position:fixed; top:0px; left:5em; padding:2em; border:1px solid black; box-shadow:5px 5px 10px #888; background: white; }\
     #odb-bkmlt-dialog-form h5 { font-size:24px; } #odb-bkmlt-dialog-form label { width:6em; display:inline-block; }\
     #odb-bkmlt-dialog-form button.submit { background: #cfc; margin: 1em 0 0 6em; float: left; }\
     </style>\
     ");
        
        dialog = $('#odb-bkmlt-dialog-form').fadeIn(); 
        $('input[name=\"title\"]', dialog).val(document.title);

        var lat = 0, lon = 0;        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position){
                $("input[name=\"lat\"]", dialog).attr('value', position.coords.latitude);
                $("input[name=\"lon\"]", dialog).attr('value', position.coords.longitude);
                //console.log('Geolocation:', position.coords);
            });
        }

        $('button.submit', dialog).click(function() {
            var formdata = {
                    "url":      location.href,
                    "title":    $("input[name=\"title\"]", dialog).val(),
                    "context":  $("select[name=\"context\"]", dialog).val(),
                    "reason":   $("input[name=\"reason\"]:checked", dialog).val(),
                    "lat":      $("input[name=\"lat\"]", dialog).val(),
                    "lon":      $("input[name=\"lon\"]", dialog).val()
                };
            //console.log(formdata); return false;
            $.post(
                BUTTON_SERVER + '/submit', 
                formdata,
                function(d) { 
                    var data = $.parseJSON(d);
                    $('form', dialog).html(
                        'Thanks.<br><br>You can now <a href="' 
                        + BUTTON_SERVER + '/#' + data.id 
                        + '">see your post</a> here.<!--' 
                        + d + '-->');
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
