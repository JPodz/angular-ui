define([],{init:function($templateCache){  'use strict';

  $templateCache.put('ui/hamburger-menu/hamburger-menu.html',
    "<div class=jp-hamburger-menu><button class=jp-hamburger-menu__button><div class=jp-hamburger-menu__line></div><div class=jp-hamburger-menu__line></div><div class=jp-hamburger-menu__line></div></button></div>"
  );


  $templateCache.put('ui/video-player/video-player.html',
    "<videogular><vg-video vg-src=config.sources vg-native-controls=true></vg-video></videogular>"
  );
}});