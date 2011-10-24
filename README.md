Usage
=====

HTML:
-----
<video id="examplevideo" />
    <source src="myvideo.webm" type="video/webm" />
    <track kind="subtitle" src-lang="US" label="English" src="{{STATIC_URL}}media/test.srt" />
</video>

JS:
---
$(function () {
   var video = $('#examplevideo');
   video.srt(); //Starts disabled
   video.srt('enable'); //Enable (and show) subtitles
   video.srt('disable'); //Disable (and hide subtitles
       
   if (video.srt('isEnabled')) { // Check if subs are enabled
       console.log('Subs are enabled!)
   }
});