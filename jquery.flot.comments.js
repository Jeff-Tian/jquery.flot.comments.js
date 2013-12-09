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

(function ($) {
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
                x: function(x) {
                    return {
                        "left": x + (this.offsetX || 5)
                    };
                },
                y: function(y) {
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
                "background-color": "transparent",
                "color": "white",
                "padding": "0",
                "font-size": "xx-small",
                "box-sizing": "border-box",
                "text-align": "center"
            },
            notch: {
                size: "5px"
            },
            htmlTemplate: function() {
                return "<div class='{1}'><div class='callout' style='position: relative; margin: 0; padding: 0; background-color: #000; width: 1%\0 /* IE 8 width hack */; box-sizing: border-box; padding: 5px;'><div style='line-height: 1em; position: relative;'>{{0}}</div><b class='notch' style='position: absolute; bottom: -{0}; left: 50%; margin: 0 0 0 -{0}; border-top: {0} solid #000; border-left: {0} solid transparent; border-right: {0} solid transparent; border-bottom: 0; padding: 0; width: 0; height: 0; font-size: 0; line-height: 0; _border-right-color: pink; _border-left-color: pink; _filter: chroma(color=pink);'></b></div></div>".format(this.notch.size, this.class);
            },
            show: true,
            position: {
                offsetX: 0,
                offsetY: 0,
                x: function (x) {
                    return {
                        "left": x + (this.offsetX || 0)
                    };
                },
                y: function (y) {
                    return {
                        "top": y + (this.offsetY || 0)
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
        plot.hooks.bindEvents.push(processComments);
    }

    function processComments(plot) {
        var comments = plot.getOptions().comments;

        if (comments) {
            drawComments(plot);
        }
    }

    function drawComments(plot) {
        plot.getPlaceholder().find("." + plot.getOptions().comment.class).remove();

        var commentOptions = plot.getOptions().comment;
        var comments = plot.getOptions().comments;
        var axes = plot.getAxes();
        var xaxis = axes.xaxis;
        var yaxis = axes.yaxis;

        if ($.isArray(comments) && plot.getOptions().comment.show) {
            $.each(comments, function (index, comment) {
                var size = measureHtmlSize($(commentOptions.htmlTemplate().format(comment.contents))[0].innerHTML, plot.getPlaceholder()[0], commentOptions.wrapperCss);
                var canvasX = xaxis.p2c(comment.x) + plot.getPlotOffset().left - size.width / 2 + (comment.offsetX || 0);
                var canvasY = yaxis.p2c(comment.y) + plot.getPlotOffset().top - size.height - parseFloat(commentOptions.notch.size) + (comment.offsetY || 0);

                drawComment(plot, canvasX, canvasY, comment.contents, commentOptions.wrapperCss);
            });
        }
    }

    function drawComment(plot, canvasX, canvasY, contents, style) {
        var commentOptions = plot.getOptions().comment;
        var html = commentOptions.htmlTemplate().format(contents);

        $(html)
            .css(style)
            .css(commentOptions.position.x(canvasX))
            .css(commentOptions.position.y(canvasY))
            .appendTo(plot.getPlaceholder());
    }

    // helpers:
    function measureHtmlSize(html, measureContainer, style) {

        // This global variable is used to cache repeated calls with the same arguments
        if (typeof (__measurehtml_cache__) == "object" && __measurehtml_cache__[html]) {
            return __measurehtml_cache__[html];
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
            }
        }
        measureContainer.appendChild(div);

        var result = { width: div.offsetWidth, height: div.offsetHeight };
        measureContainer.removeChild(div);

        // Add the sizes to the cache as adding DOM elements is costly and can cause slow downs
        if (typeof (__measurehtml_cache__) != "object") {
            __measurehtml_cache__ = [];
        }

        __measurehtml_cache__[html] = result;

        return result;
    }

    function init(plot, classes) {
        initTooltip(plot);
        initComment(plot);
    }

    $.plot.plugins.push({
        init: init,
        options: options,
        name: "comments",
        version: "1.1"
    });
})(jQuery);