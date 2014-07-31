//jquery.flot.comments.js
//=======================
//  Copyright (c) 2013 - 2014 http://zizhujy.com.
//
//Flot plugin that shows extra comments to the flot chart. There are several types of comments:
//    - **tooltip**: Show the data point value (x, y) when mouse over a data point;
//- **comment**: A callout style textbox that always shows at the specified position;
//- **sidenote**: Texts that shows at the right side of the chart that only associated with the
//    y-axis coordinate.
//
//   **Usage:**
//
//Inside the `<head></head>` area of your html page, add the following lines:
//   
//```html
//<script type="text/javascript" src="http://zizhujy.com/Scripts/flot/jquery.flot.comments/jquery.flot.comments.js"></script>
//```
//
//pass your comments, sidenotes to the options object when you draw the flot chart by $.plot():
//
//```javascript
//var options = {
//    comment: {
//        show: true
//    },
//    comments: [
//		{
//		    x: -2,
//		    y: 1,
//		    contents: "this point 1"
//		},
//		...
//    ],
//    sidenote: {
//        show: true
//    },
//    sidenotes: [
//		{
//		    y: -4,
//		    contents: "Low Level",
//		    offsetX: 0,
//		    offsetY: 0,
//		    maxWidth: 0.15
//		},
//		...
//    ]
//};
//
//$.plot("#canvas-wrapper", data, options);
//```
//
//**Online examples:**
//
//- [Comment Example](examples/CommentExample.html "Comment Example")
//
//**Dependencies:**
//
//- jquery.js
//- jquery.colorhelpers.js
//- jquery.flot.js
//
//**Customizations:**
//
//```javascript
//options{
//    comment: {
//        "class": "jquery-flot-comment",
//        wrapperCss: {
//            "position": "absolute",
//            "display": "block",
//            "margin": "0",
//            "line-height": "1em",
//            "background-color": "transparent",
//            "color": "white",
//            "padding": "0",
//            "font-size": "xx-small",
//            "box-sizing": "border-box",
//            "text-align": "center"
//        },
//        notch: {
//                size: "5px",
//                position: 'bottom'
//        },
//        htmlTemplate: function() {
//            return "<div class='{1}'><div class='callout' style='position: relative; margin: 0; box-sizing: border-box; padding: 5px; width: auto; _width: 1%\0 /* IE 8 width hack */;'><div style='line-height: 1em; position: relative;'>{{0}}</div><b class='notch' style='position: absolute; {{1}}: -{0}; left: 50%; margin: 0 0 0 -{0}; border-{{2}}: {0} solid {2}; border-left: {0} solid transparent; border-right: {0} solid transparent; border-{{1}}: 0; padding: 0; width: 0; height: 0; font-size: 0; line-height: 0; _border-right-color: pink; _border-left-color: pink; _filter: chroma(color=pink);'></b></div></div>".format(this.notch.size, this["class"], this.notch.color);
//        },
//        show: true,
//        position: {
//            offsetX: 0,
//            offsetY: 0,
//            x: function (x) {
//                return {
//                    "left": x + parseFloat(this.offsetX || 0)
//                };
//            },
//            y: function (y) {
//                return {
//                    "top": y + parseFloat(this.offsetY || 0)
//                };
//            }
//        }
//    },
//    sidenote: {
//        "class": "jquery-flot-sidenote",
//        wrapperCss: {
//            "position": "absolute",
//            "display": "block",
//            "line-height": "1.1em",
//            "margin": "0",
//            "font-size": "smaller"
//        },
//        maxWidth: 0.2, /* Width percentage of the whole chart width */
//        show: true,
//        position: {
//            offsetX: "5px",
//            offsetY: 0,
//            x: function(x) {
//                return {
//                    "left": x + parseFloat(this.offsetX || 0)
//                };
//            },
//            y: function(y) {
//                return {
//                    "top": y + parseFloat(this.offsetY || 0)
//                };
//            }
//        }
//    }
//}
//```
//
//**Online demos:**
//
//- [Online plotter (tooltip)](http://zizhujy.com/plotter "Online plotter")
//- [Online Function Grapher (tooltip)](http://zizhujy.com/functiongrapher "Online Function Grapher")
//
;

// String extensions:
if (!String.prototype.format) {
    String.prototype.format = function () {

        if (arguments.length <= 0) {
            return this;
        } else {
            var format = this;
            var args = arguments;

            var s = format.replace(/(?:[^{]|^|\b|)(?:{{)*(?:{(\d+)}){1}(?:}})*(?=[^}]|$|\b)/g, function (match, number) {
                number = parseInt(number);

                return typeof args[number] != "undefined" ? match.replace(/{\d+}/g, args[number]) : match;
            });

            return s.replace(/{{/g, "{").replace(/}}/g, "}");
        }
    };
}

if (!Array.prototype.map) {
    Array.prototype.map = function (fun /*, thisArg */) {
        var originalArray = Object(this);
        var len = originalArray.length >>> 0;
        if (typeof fun !== "function")
            throw new TypeError(fun + " is not a function");

        var res = new Array(len);
        var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
        for (var i = 0; i < len; i++) {
            // NOTE: Absolute correctness would demand Object.defineProperty
            //       be used.  But this method is fairly new, and failure is
            //       possible only if Object.prototype or Array.prototype
            //       has a property |i| (very unlikely), so use a less-correct
            //       but more portable alternative.
            if (i in originalArray) {
                res[i] = fun.call(thisArg, originalArray[i], i, originalArray);
            }
        }

        return res;
    };
}

if (!Array.prototype.filter) {
    Array.prototype.filter = function (fun /*, thisArg */) {
        var t = Object(this);
        var len = t.length >>> 0;
        if (typeof fun != "function")
            throw new TypeError();

        var res = [];
        var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
        for (var i = 0; i < len; i++) {
            if (i in t) {
                var val = t[i];

                // NOTE: Technically this should Object.defineProperty at
                //       the next index, as push can be affected by
                //       properties on Object.prototype and Array.prototype.
                //       But that method's new, and collisions should be
                //       rare, so use the more-compatible alternative.
                if (fun.call(thisArg, val, i, t))
                    res.push(val);
            }
        }

        return res;
    };
}

if (!Array.prototype.max) {
    Array.prototype.max = function () {
        return Math.max.apply(null, this);
    };
}

(function ($) {
    var classes = null;
    var surface = null;

    // plugin default options
    var options = {
        grid: {
            hoverable: true,
            clickable: true
        },
        tooltip: {
            id: "jquery-flot-comments-tooltip",
            css: {
                "position": "absolute",
                "display": "none",
                "border": "1px solid #fdd",
                "padding": "2px",
                "background-color": "#fee",
                "opacity": "0.80"
            },
            position: {
                offsetX: 5,
                offsetY: 5,
                x: function (x) {
                    return {
                        "left": x + (this.offsetX || 5)
                    };
                },
                y: function (y) {
                    return {
                        "top": y + (this.offsetY || 5)
                    };
                }
            }
        },
        comment: {
            "class": "jquery-flot-comment",
            wrapperCss: {
                "position": "absolute",
                "display": "block",
                "margin": "0",
                "line-height": "1em",
                "background-color": "#000",
                "color": "white",
                "padding": "0",
                "font-size": "xx-small",
                "box-sizing": "border-box",
                "text-align": "center"
            },
            notch: {
                size: "5px",
                color: "#000",
                position: 'bottom'
            },
            htmlTemplate: function (commentContent, notchPosition) {
                var inverse = {
                    'bottom': 'top',
                    'top': 'bottom'
                };

                var template = "<div class='{1}'><div class='callout' style='position: relative; margin: 0; box-sizing: border-box; padding: 5px; width: auto; _width: 1%\0 /* IE 8 width hack */;'><div style='line-height: 1em; position: relative;'>{{0}}</div><b class='notch' style='position: absolute; {{1}}: -{0}; left: 50%; margin: 0 0 0 -{0}; border-{{2}}: {0} solid {2}; border-left: {0} solid transparent; border-right: {0} solid transparent; border-{{1}}: 0; padding: 0; width: 0; height: 0; font-size: 0; line-height: 0; _border-right-color: pink; _border-left-color: pink; _filter: chroma(color=pink);'></b></div></div>".format(this.notch.size, this["class"], this.notch.color);

                notchPosition = notchPosition || this.notch.position;

                return template.format(commentContent, notchPosition, inverse[notchPosition]);
            },
            show: true,
            position: {
                offsetX: 0,
                offsetY: 0,
                x: function (x) {
                    return {
                        "left": x + parseFloat(this.offsetX || 0)
                    };
                },
                y: function (y) {
                    return {
                        "top": y + parseFloat(this.offsetY || 0)
                    };
                }
            }
        },
        sidenote: {
            "class": "jquery-flot-sidenote",
            wrapperCss: {
                "position": "absolute",
                "display": "inline",
                "line-height": "1.1em",
                "margin": "0",
                "font-size": "smaller",
                "width": "auto"
            },
            maxWidth: 0.2, /* Width percentage of the whole chart width */
            show: true,
            position: {
                offsetX: "5px",
                offsetY: 0,
                x: function (x) {
                    return {
                        "left": x + parseFloat(this.offsetX || 0)
                    };
                },
                y: function (y) {
                    return {
                        "top": y + parseFloat(this.offsetY || 0)
                    };
                }
            }
        }
    };

    // Tooltip:
    var previousPoint = null;

    function initTooltip(plot) {

        $(plot.getPlaceholder()).bind("plothover", function (event, pos, item) {
            if (item) {
                if (previousPoint != item.dataIndex) {
                    previousPoint = item.dataIndex;

                    var x = item.datapoint[0].toFixed(2),
                        y = item.datapoint[1].toFixed(2);

                    $("#" + plot.getOptions().tooltip.id).remove();
                    showTooltip(item.pageX, item.pageY, "(" + x + ", " + y + ") <br />" + (item.serials ? (item.serials.label || "") : ""));
                }
            } else {
                previousPoint = null;
                $("#" + plot.getOptions().tooltip.id).remove();
            }
        });

        $(plot.getPlaceholder()).bind("plotclick", function (event, pos, item) {
            if (item) {
                plot.highlight(item.series, item.datapoint);
            }
        });

        // Nested functions
        function showTooltip(x, y, contents) {
            $("<div id='" + plot.getOptions().tooltip.id + "'>" + contents + "</div>")
                .css(plot.getOptions().tooltip.css)
                .css(plot.getOptions().tooltip.position.x(x))
                .css(plot.getOptions().tooltip.position.y(y))
                .appendTo("body").fadeIn(200);
        }
    }

    // Comment:
    function initComment(plot) {
        plot.hooks.draw.push(processComments);
    }

    function processComments(plot) {
        var comments = plot.getOptions().comments;

        if (comments) {
            drawComments(plot);
        }
    }

    function drawComments(plot) {
        var $canvas = $(plot.getCanvas());
        var $placeholder = $(plot.getPlaceholder());
        $placeholder.find("." + plot.getOptions().comment["class"]).remove();

        var commentOptions = plot.getOptions().comment || {};
        var comments = plot.getOptions().comments;

        if ($.isArray(comments) && commentOptions.show) {
            $.each(comments, function (index, comment) {
                drawComment.apply(plot, [comment]);
            });
        }
    }

    function drawComment(comment) {
        var plot = this;

        var axes = plot.getAxes();
        var xaxis = axes.xaxis;
        var yaxis = axes.yaxis;

        var xmin = axes.xaxis.min;
        var xmax = axes.xaxis.max;
        var ymin = axes.yaxis.min;
        var ymax = axes.yaxis.max;

        var commentOptions = plot.getOptions().comment || {};

        var notchPosition = comment.notch && comment.notch.position
            || commentOptions.notch && commentOptions.notch.position
            || 'bottom';

        var html = commentOptions.htmlTemplate(comment.contents, notchPosition);

        var size = measureHtmlSize($(html)[0].innerHTML, plot.getPlaceholder()[0], commentOptions.wrapperCss || null);
        if (comment.x >= xmin && comment.x <= xmax) {
            if (comment.y >= ymin && comment.y <= ymax) {
                var canvasX = xaxis.p2c(comment.x) + plot.getPlotOffset().left - size.width / 2 + (comment.offsetX || 0);
                var canvasY;

                switch (notchPosition.toLowerCase()) {
                    case 'top':
                        canvasY = yaxis.p2c(comment.y) + plot.getPlotOffset().top + parseFloat(commentOptions.notch.size) - (comment.offsetY || 0);
                        break;
                    default:
                        canvasY = yaxis.p2c(comment.y) + plot.getPlotOffset().top - size.height - parseFloat(commentOptions.notch.size) + (comment.offsetY || 0);
                        break;
                }

                $(html)
                    .css(commentOptions.wrapperCss)
                    .css(commentOptions.position.x(canvasX))
                    .css(commentOptions.position.y(canvasY))
                    .appendTo(plot.getPlaceholder());
            }
        }
    }

    // Marking:
    function initMarking(plot) {
        plot.hooks.draw.push(processMarkings);
    }

    function processMarkings(plot) {
        var markings = plot.getOptions().markings;

        if (markings) {
            drawMarkings(plot);
        }
    }

    function drawMarkings(plot) {
        var markingOptions = plot.getOptions().marking || {};
        var markings = plot.getOptions().markings;

        if (surface == null) {
            surface = new classes.Canvas("flot-base", plot.getPlaceholder());
        }

        surface.removeText("flot-markings-extra");

        if ($.isArray(markings)) {
            $.each(markings, function (index, marking) {
                if (marking.isExtra) {
                    drawMarking.apply(plot, [marking]);
                }
            });
        }
    }

    function drawMarking(marking, markingLayer) {
        var plot = this;
        markingLayer = markingLayer || "flot-markings-extra";

        if (surface == null) {
            surface = new classes.Canvas("flot-base", plot.getPlaceholder());
        }

        var plotOptions = plot.getOptions();
        var plotOffset = plot.getPlotOffset();
        var xrange = $.extend(true, {}, marking.xaxis);
        var yrange = $.extend(true, {}, marking.yaxis);

        var axes = plot.getAxes();
        var xaxis = axes.xaxis;
        var yaxis = axes.yaxis;

        // fill in missing
        if (xrange.from == null) {
            xrange.from = xaxis.min;
        }

        if (xrange.to == null) {
            xrange.to = xaxis.max;
        }

        if (yrange.from == null) {
            yrange.from = yaxis.min;
        }

        if (yrange.to == null) {
            yrange.to = yaxis.max;
        }

        // clip
        if (xrange.to < xaxis.min || xrange.from > xaxis.max ||
            yrange.to < yaxis.min || yrange.from > yaxis.max) {
            return;
        }

        xrange.from = Math.max(xrange.from, xaxis.min);
        xrange.to = Math.min(xrange.to, xaxis.max);
        yrange.from = Math.max(yrange.from, yaxis.min);
        yrange.to = Math.min(yrange.to, yaxis.max);

        // then draw
        xrange.from = Math.floor(xaxis.p2c(xrange.from));
        xrange.to = Math.floor(xaxis.p2c(xrange.to));
        yrange.from = Math.floor(yaxis.p2c(yrange.from));
        yrange.to = Math.floor(yaxis.p2c(yrange.to));

        var ctx = surface.context;
        ctx.fillStyle = marking.color || plotOptions.grid.markingsColor;
        ctx.fillRect(xrange.from, yrange.to, xrange.to - xrange.from, yrange.from - yrange.to);

        if (marking.text) {
            // left aligned horizontal position:
            var xPos = xrange.from + plotOffset.left;
            // top baselined vertical position:
            var yPos = yrange.to + plotOffset.top;

            if (!!marking.textAlign) {
                switch (marking.textAlign.toLowerCase()) {
                    case "right":
                        xPos = xrange.to + plotOffset.left;
                        break;
                    case "center":
                        xPos = (xrange.from + plotOffset.left + xrange.to + plotOffset.left) / 2;
                        break;
                }
            }

            if (!!marking.textBaseline) {
                switch (marking.textBaseline.toLowerCase()) {
                    case "bottom":
                        yPos = (yrange.from + plotOffset.top);
                        break;
                    case "middle":
                        yPos = (yrange.from + plotOffset.top + yrange.to + plotOffset.top) / 2;
                        break;
                }
            }

            surface.addText(markingLayer, xPos, yPos, marking.text, marking.font || "flot-marking-extra", 0, null, marking.textAlign, marking.textBaseline);

            surface.render();
        }
    }

    // Side note:
    var maxWidth = 0;

    function initSidenote(plot) {
        plot.hooks.bindEvents.push(processSidenotes);
    }

    function getSidenoteStyle(plot, sidenoteOptions) {
        var style = $.extend(true, {
            "display": "inline"
        }, sidenoteOptions.wrapperCss);

        if (sidenoteOptions.maxWidth) {
            style["max-width"] = (plot.width() * sidenoteOptions.maxWidth) + "px";
        }

        return style;
    }

    function measureSidenote(plot, sidenote, style) {
        var size = measureHtmlSize(sidenote.contents, plot.getPlaceholder()[0], style);

        return size;
    }

    function processSidenotes(plot) {
        var sidenoteOptions = plot.getOptions().sidenote || {};
        var sidenotes = plot.getOptions().sidenotes;

        if ($.isArray(sidenotes) && sidenoteOptions.show) {
            maxWidth = sidenotes.map(function (element) {
                var style = getSidenoteStyle(plot, sidenoteOptions);
                var size = measureSidenote(plot, element, style);

                var ret = Math.min(typeof element.maxWidth !== "undefined" ? element.maxWidth : Infinity, size.width / plot.width(), typeof sidenoteOptions.maxWidth !== "undefined" ? sidenoteOptions.maxWidth : Infinity);

                return ret;
            }).max();

            resize(plot);

            plot.getPlaceholder().resize(function () {
                drawSidenotes(plot);
            });
            drawSidenotes(plot);
        }
    }

    function resize(plot) {
        plot.resize(plot.width() * (1 - maxWidth));
        plot.setupGrid();
        plot.draw();
    }

    function drawSidenotes(plot) {
        var sidenoteOptions = plot.getOptions().sidenote;
        plot.getPlaceholder().find("." + sidenoteOptions["class"]).remove();

        var sidenotes = plot.getOptions().sidenotes;
        var axes = plot.getAxes();
        var xaxis = axes.xaxis;
        var yaxis = axes.yaxis;

        if ($.isArray(sidenotes) && sidenoteOptions.show) {
            $.each(sidenotes, function (index, sidenote) {
                var style = getSidenoteStyle(plot, sidenoteOptions);
                var size = measureSidenote(plot, sidenote, style);

                var canvasX = xaxis.p2c(xaxis.max) + plot.getPlotOffset().left + parseFloat(sidenote.offsetX || 0);
                var canvasY = yaxis.p2c(sidenote.y) + plot.getPlotOffset().top - size.height / 2 + parseFloat(sidenote.offsetY || 0);

                style.minWidth = style['min-width'] = size.width + "px";
                style.minHeight = style['min-height'] = size.height + "px";

                drawSidenote(plot, canvasX, canvasY, sidenote.contents, style);
            });
        }
    }

    function drawSidenote(plot, canvasX, canvasY, contents, style) {
        var sidenoteOptions = plot.getOptions().sidenote;
        var html = "<div class='" + sidenoteOptions["class"] + "'>" + contents + "</div>";

        style.width = "100%";

        $(html)
            .css(style)
            .css(sidenoteOptions.position.x(canvasX))
            .css(sidenoteOptions.position.y(canvasY))
            .appendTo(plot.getPlaceholder());
    }

    // helpers:
    function measureHtmlSize(html, measureContainer, style) {

        // This global variable is used to cache repeated calls with the same arguments
        if (typeof (__measurehtml_cache__) == "object" && __measurehtml_cache__[html] &&
            __measurehtml_cache__[html][JSON.stringify(style)]) {
            return __measurehtml_cache__[html][JSON.stringify(style)];
        }

        measureContainer = measureContainer || document.body;

        var div = document.createElement("DIV");
        div.innerHTML = html;
        if (!style) {
            div.style.top = "-1000px";
            div.style.left = "-1000px";
            div.style.position = "absolute";
            div.style.lineHeight = "1em";
            div.style.margin = "0";
            div.style.padding = "0";
            div.style.dispay = "block";
        } else {
            for (var p in style) {
                div.style[p] = style[p];

                // IE 8 style handling:
                // for example:
                //if (!div.style.backgroundColor) {
                //    div.style.backgroundColor = div.style["background-color"];
                //}

                //if (!div.style.fontSize) {
                //    div.style.fontSize = div.style["font-size"];
                //}

                if (p.indexOf("-") >= 0) {
                    var camelStyle = p.replace(/-(\w)/, function (m, p1, offset, s) {
                        return p1.toUpperCase();
                    });

                    if (!div.style[camelStyle]) {
                        div.style[camelStyle] = div.style[p];
                    }
                }
            }
        }

        measureContainer.appendChild(div);

        var result = { width: div.offsetWidth, height: div.offsetHeight };
        measureContainer.removeChild(div);

        // Add the sizes to the cache as adding DOM elements is costly and can cause slow downs
        if (typeof (__measurehtml_cache__) != "object") {
            __measurehtml_cache__ = {};
        }

        if (typeof (__measurehtml_cache__[html]) != 'object') {
            __measurehtml_cache__[html] = {};
        }

        __measurehtml_cache__[html][JSON.stringify(style)] = result;

        return result;
    }

    function init(plot, theClasses) {
        classes = theClasses;

        initSidenote(plot);
        initTooltip(plot);
        initComment(plot);
        initMarking(plot);

        plot.drawComment = drawComment;
        plot.drawMarking = drawMarking;

        function onResize() {
            // Wait for the jquery.flot.resize.js to resize the plot, then draw side process sidenotes.
            setTimeout(function () {
                processSidenotes(plot);
            }, 200);
        }

        // Work with jquery.flot.resize.js
        if ($.plot.plugins.filter(function (item) { return item.name === 'resize'; }).length > 0) {
            plot.hooks.bindEvents.push(function () {
                plot.getPlaceholder().resize(onResize);
            });

            plot.hooks.shutdown.push(function () {
                plot.getPlaceholder().unbind('resize', onResize);
            });
        }
    }

    $.plot.plugins.push({
        init: init,
        options: options,
        name: "comments",
        version: "2.3"
    });
})(jQuery);