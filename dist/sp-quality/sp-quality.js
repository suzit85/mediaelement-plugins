/*!
 * MediaElement.js
 * http://www.mediaelementjs.com/
 *
 * Wrapper that mimics native HTML5 MediaElement (audio and video)
 * using a variety of technologies (pure JavaScript, Flash, iframe)
 *
 * Copyright 2010-2017, John Dyer (http://j.hn/)
 * License: MIT
 *
 */(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(_dereq_,module,exports){
'use strict';

mejs.i18n.en['mejs.quality-chooser'] = 'Quality Chooser';

Object.assign(mejs.MepDefaults, {});

Object.assign(MediaElementPlayer.prototype, {
    buildspquality: function buildspquality(player, controls, layers, media) {
        var t = this,
            isNative = t.media.rendererName !== null && t.media.rendererName.match(/(native|html5)/) !== null;

        if (!isNative) {
            return;
        }
        console.log('buildspquality building createQualityLevelPlaceHolder');
        t.createQualityLevelPlaceHolder(player);
        if (Hls !== undefined) {
            media.addEventListener(Hls.Events.MANIFEST_PARSED, function (event, data) {
                var levels;
                if (data && data.levels) {
                    levels = data.levels;
                    console.log('buildspquality building Settign from data', levels);
                } else {
                    levels = event.data[1].levels;
                    console.log('buildspquality building Settign from event', levels);
                }
                console.log('buildspquality building MANIFEST_PARSED=', event, ', data--', data);
                console.log('buildspquality building levels=', levels);
                t.createQualityLevel(player, levels, media);
            });
        }
    },
    createQualityLevelPlaceHolder: function createQualityLevelPlaceHolder(player) {
        var t = this;
        t.clearquality(player);
        var qualityTitle = "Quality Levels";

        player.qualityButton = document.createElement('div');
        player.qualityButton.className = t.options.classPrefix + 'button ' + t.options.classPrefix + 'spquality-button';
        player.qualityButton.innerHTML = '<button type="button" aria-controls="' + t.id + '" title="' + qualityTitle + '" ' + ('aria-label="' + qualityTitle + '" tabindex="0">Auto</button>') + ('<div class="' + t.options.classPrefix + 'spquality-selector ' + t.options.classPrefix + 'offscreen">') + ('<ul class="' + t.options.classPrefix + 'spquality-selector-list"></ul>') + '</div>';

        t.addControlElement(player.qualityButton, 'spquality');
    },
    createQualityLevel: function createQualityLevel(player, levels, media) {
        var t = this;

        var qualityTitle = "Quality Levels";

        var qualityLevels = levels.map(function (val, idx) {
            return {
                name: parseInt(val.bitrate / 1000) + " kbps",
                value: idx
            };
        });

        qualityLevels.sort(function (a, b) {
            return parseInt(b.value) - parseInt(a.value);
        });
        qualityLevels.unshift({
            name: "Auto",
            value: -1
        });

        var getQualityNameFromValue = function getQualityNameFromValue(value) {
            for (var i = 0, total = qualityLevels.length; i < total; i++) {
                if (qualityLevels[i].value === value) {
                    return qualityLevels[i].name;
                }
            }
        };

        var playbackQuality = -1;

        player.qualityButton.innerHTML = '<button type="button" aria-controls="' + t.id + '" title="' + qualityTitle + '" ' + ('aria-label="' + qualityTitle + '" tabindex="0">' + getQualityNameFromValue(playbackQuality) + '</button>') + ('<div class="' + t.options.classPrefix + 'spquality-selector ' + t.options.classPrefix + 'offscreen">') + ('<ul class="' + t.options.classPrefix + 'spquality-selector-list"></ul>') + '</div>';

        t.addControlElement(player.qualityButton, 'spquality');

        for (var i = 0, total = qualityLevels.length; i < total; i++) {

            var inputId = t.id + '-spquality-' + qualityLevels[i].value;

            player.qualityButton.querySelector('ul').innerHTML += '<li class="' + t.options.classPrefix + 'spquality-selector-list-item">' + ('<input class="' + t.options.classPrefix + 'spquality-selector-input" type="radio" name="' + t.id + '_quality"') + ('disabled="disabled" value="' + qualityLevels[i].value + '" id="' + inputId + '"  ') + ((qualityLevels[i].value === playbackQuality ? ' checked="checked"' : '') + '/>') + ('<label class="' + t.options.classPrefix + 'spquality-selector-label') + ((qualityLevels[i].value === playbackQuality ? ' ' + t.options.classPrefix + 'spquality-selected' : '') + '">') + (qualityLevels[i].name + '</label>') + '</li>';
        }

        var inEvents = ['mouseenter', 'focusin'],
            outEvents = ['mouseleave', 'focusout'],
            radios = player.qualityButton.querySelectorAll('input[type="radio"]'),
            labels = player.qualityButton.querySelectorAll('.' + t.options.classPrefix + 'spquality-selector-label'),
            selector = player.qualityButton.querySelector('.' + t.options.classPrefix + 'spquality-selector');

        for (var _i = 0, _total = inEvents.length; _i < _total; _i++) {
            player.qualityButton.addEventListener(inEvents[_i], function () {
                mejs.Utils.removeClass(selector, t.options.classPrefix + 'offscreen');
                selector.style.height = selector.querySelector('ul').offsetHeight + 'px';
                selector.style.top = -1 * parseFloat(selector.offsetHeight) + 'px';
            });
        }

        for (var _i2 = 0, _total2 = outEvents.length; _i2 < _total2; _i2++) {
            player.qualityButton.addEventListener(outEvents[_i2], function () {
                mejs.Utils.addClass(selector, t.options.classPrefix + 'offscreen');
            });
        }

        for (var _i3 = 0, _total3 = radios.length; _i3 < _total3; _i3++) {
            var radio = radios[_i3];
            radio.disabled = false;
            radio.addEventListener('click', function () {
                var self = this,
                    newQuality = self.value;
                playbackQuality = parseInt(newQuality);
                media.hlsPlayer.currentLevel = playbackQuality;
                player.qualityButton.querySelector('button').innerHTML = getQualityNameFromValue(playbackQuality);

                var selected = player.qualityButton.querySelectorAll('.' + t.options.classPrefix + 'spquality-selected');
                for (var _i4 = 0, _total4 = selected.length; _i4 < _total4; _i4++) {
                    mejs.Utils.removeClass(selected[_i4], t.options.classPrefix + 'spquality-selected');
                }

                self.checked = true;
                var siblings = mejs.Utils.siblings(self, function (el) {
                    return mejs.Utils.hasClass(el, t.options.classPrefix + 'spquality-selector-label');
                });
                for (var j = 0, _total5 = siblings.length; j < _total5; j++) {
                    mejs.Utils.addClass(siblings[j], t.options.classPrefix + 'spquality-selected');
                }
            });
        }

        for (var _i5 = 0, _total6 = labels.length; _i5 < _total6; _i5++) {
            labels[_i5].addEventListener('click', function () {
                var radio = mejs.Utils.siblings(this, function (el) {
                    return el.tagName === 'INPUT';
                })[0],
                    event = mejs.Utils.createEvent('click', radio);
                radio.dispatchEvent(event);
            });
        }

        player.qualitySelector.addEventListener('keydown', function (e) {
            e.stopPropagation();
        });
    },
    clearquality: function clearquality(player) {
        if (player) {
            if (player.qualityButton) {
                player.qualityButton.parentNode.removeChild(player.qualityButton);
            }
            if (player.qualitySelector) {
                player.qualitySelector.parentNode.removeChild(player.qualitySelector);
            }
        }
    }
});

},{}]},{},[1]);
