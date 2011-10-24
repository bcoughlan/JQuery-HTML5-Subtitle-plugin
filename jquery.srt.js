/*
 * jQuery srt
 *
 * version 0.2
 *
 * Licensed under the GPL license:
 *   http://www.gnu.org/licenses/gpl.html
 * 
 */

(function($) {
    //Array of video objects
    v = [];
    
    wrapperCSS = {
        'position' : 'relative'
    }
    srtContainerCSS = {
        'position' : 'absolute',
        'bottom' : '10px',
        'width' : '100%',
        'margin' : '0 auto',
        'text-align' : 'center'
    };
    srtCSS = {
        'background-color' : 'rgba(16,16,16,0.8)',
        'border' : '#000',
        'display' : 'inline-block',
        'color' : '#fff',
        'font-size' : '1.5em',
        'line-height' : '1.5em',
        'padding' : '.3em 2.5em'
    }

    function toSeconds(t) {
        var s = 0.0;
        if(t) {
            var p = t.split(':');
            for( i = 0; i < p.length; i++)
            s = s * 60 + parseFloat(p[i].replace(',', '.'))
        }
        return s;
    }

    var splitSubtitles = function(srt) {
        var subtitles = {};
        srt = $.trim(srt.replace(/\r\n|\r|\n/g, '\n')).split('\n\n');

        for(s in srt) {
            st = srt[s].split('\n');
            if(st.length >= 2) {
                var n = st[0];
                split = st[1].split(' --> ');
                var start = toSeconds($.trim(split[0]));
                var end = toSeconds($.trim(split[1]));
                var text = st[2];
                if(st.length > 2) {
                    for( j = 3; j < st.length; j++) {
                        text += '<br />' + st[j];
                    }
                }

                subtitles[start] = {
                    end : end,
                    text : text
                };
            }
        }
        return subtitles;
    }
    var playSubtitles = function(video) {
        var currentTime = video.prop('currentTime');
        var currentSubtitle = video.data('subtitle');
        var srtEl = v[video]['srt'];
        var srtContainerEl = v[video]['srtContainer'];
        var subtitles = v[video]['subtitles'];

        var subtitle = -1;
        for(s in subtitles) {
            if(s > currentTime) {
                subtitle = s;
                break;
            }
        }
        if(subtitle > 0) {
            if(subtitle != currentSubtitle) {
                srtEl.html(subtitles[subtitle].text);
                srtContainerEl.show();
                video.data('subtitle', subtitle);
            } else if(subtitles[subtitle].end < currentTime) {
                srtContainerEl.hide();
            }
        }

        if(methods.isEnabled.call(video))
            setTimeout(playSubtitles, 50, video);
        else
            srtContainerEl.hide();
    };
    var methods = {
        isEnabled : function() {
            return $(this).data('enabled');
        },
        disable : function() {
            $(this).data('enabled', false);
            v[$(this)]['srtContainer'].hide();
        },
        enable : function() {
            $(this).data('enabled', true);
            playSubtitles($(this));
        },
        init : function() {
            video = $(this);
            if(!video)
                return;

            var srtContainerEl = $('<div class="srt_container" />').css(srtContainerCSS);
            var srtEl = $('<div class="srt" />').css(srtCSS);
            var wrapper = $('<div class="wrapper" />').css(wrapperCSS);
            video.wrap(wrapper).after(srtContainerEl.html(srtEl));
            video.data('subtitle', -1);

            var track = $("track", video);

            var srtUrl = track.attr('src');
            if(srtUrl) {
                $.get(srtUrl, function(responseText) {
                    v[video] = {};
                    v[video]['subtitles'] = splitSubtitles(responseText);
                    v[video]['srt'] = srtEl;
                    v[video]['srtContainer'] = srtContainerEl;
                    
                    //Start with subs disabled
                    methods.disable.call(video);
                });
            }
        },
    };

    $.fn.srt = function(method) {
        if(methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if( typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.srt');
        }
    };
})(jQuery);
