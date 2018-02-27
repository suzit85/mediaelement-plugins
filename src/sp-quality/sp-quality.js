'use strict';

/**
 * Sp Quality feature
 *
 * This feature allows the generation of a menu with different video/audio qualities, depending of the elements set
 * in the <source> tags, such as `title` and `data-quality`
 */

// Translations (English required)
mejs.i18n.en['mejs.quality-chooser'] = 'Quality Chooser';

// Feature configuration
Object.assign(mejs.MepDefaults, {
	/**
	 * @type {String}
	 */
	// defaultQuality: 'auto',
	/**
	 * @type {String}
	 */
	// qualityText: null
});

Object.assign(MediaElementPlayer.prototype, {

	/**
	 * Feature constructor.
	 *
	 * Always has to be prefixed with `build` and the name that will be used in MepDefaults.features list
	 * @param {MediaElementPlayer} player
	 * @param {HTMLElement} controls
	 * @param {HTMLElement} layers
	 * @param {HTMLElement} media
	 */
	buildspquality (player, controls, layers, media) {
		const
			t = this,
            isNative = t.media.rendererName !== null && t.media.rendererName.match(/(native|html5)/) !== null;

		if(!isNative){
			return
		}

        const interval = setInterval(() => {
            if (media.hlsPlayer !== undefined) {
                clearInterval(interval);
                // Manifest file was parsed, invoke loading method
                media.hlsPlayer.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
                    t.createQualityLevel(player, data.levels, media);
                });
            }
        }, 100);

	}, // build sp-quality end

    createQualityLevel(player, levels, media){
        const t = this;
        t.clearquality(player);
        const qualityTitle = "Quality Levels";

        let qualityLevels = levels.map(function (val, idx) {
            return {
                name: parseInt(val.bitrate / 1000) + " kbps",
                value: idx
            };
        });

        qualityLevels.sort((a, b) => {
            return parseInt(b.value) - parseInt(a.value);
        });
        qualityLevels.unshift({
            name: "Auto",
            value: -1
        });

        const getQualityNameFromValue = (value) => {
            for (let i = 0, total = qualityLevels.length; i < total; i++) {
                if (qualityLevels[i].value === value) {
                    return qualityLevels[i].name;
                }
            }
        };

        let playbackQuality = -1;


        player.qualityButton = document.createElement('div');
        player.qualityButton.className = `${t.options.classPrefix}button ${t.options.classPrefix}quality-button`;
        player.qualityButton.innerHTML = `<button type="button" aria-controls="${t.id}" title="${qualityTitle}" ` +
            `aria-label="${qualityTitle}" tabindex="0">${getQualityNameFromValue(playbackQuality)}</button>` +
            `<div class="${t.options.classPrefix}quality-selector ${t.options.classPrefix}offscreen">` +
            `<ul class="${t.options.classPrefix}quality-selector-list"></ul>` +
            `</div>`;

        t.addControlElement(player.qualityButton, 'spquality');

        for (let i = 0, total = qualityLevels.length; i < total; i++) {

            const inputId = `${t.id}-quality-${qualityLevels[i].value}`;

            player.qualityButton.querySelector('ul').innerHTML += `<li class="${t.options.classPrefix}quality-selector-list-item">` +
                `<input class="${t.options.classPrefix}quality-selector-input" type="radio" name="${t.id}_quality"` +
                `disabled="disabled" value="${qualityLevels[i].value}" id="${inputId}"  ` +
                `${(qualityLevels[i].value === playbackQuality ? ' checked="checked"' : '')}/>` +
                `<label class="${t.options.classPrefix}quality-selector-label` +
                `${(qualityLevels[i].value === playbackQuality ? ` ${t.options.classPrefix}quality-selected` : '')}">` +
                `${qualityLevels[i].name}</label>` +
                `</li>`;
        }

        //playbackQuality = playbackQuality;

        //player.qualitySelector = player.qualityButton.querySelector(`.${t.options.classPrefix}quality-selector`);

        const
            inEvents = ['mouseenter', 'focusin'],
            outEvents = ['mouseleave', 'focusout'],
            // Enable inputs after they have been appended to controls to avoid tab and up/down arrow focus issues
            radios = player.qualityButton.querySelectorAll('input[type="radio"]'),
            labels = player.qualityButton.querySelectorAll(`.${t.options.classPrefix}quality-selector-label`),
            selector = player.qualityButton.querySelector(`.${t.options.classPrefix}quality-selector`)
        ;

        // hover or keyboard focus
        for (let i = 0, total = inEvents.length; i < total; i++) {
            player.qualityButton.addEventListener(inEvents[i], () => {
                mejs.Utils.removeClass(selector, `${t.options.classPrefix}offscreen`);
                selector.style.height = `${selector.querySelector('ul').offsetHeight}px`;
                selector.style.top = `${(-1 * parseFloat(selector.offsetHeight))}px`;
            });
        }

        for (let i = 0, total = outEvents.length; i < total; i++) {
            player.qualityButton.addEventListener(outEvents[i],  () =>{
                mejs.Utils.addClass(selector, `${t.options.classPrefix}offscreen`);
            });
        }

        for (let i = 0, total = radios.length; i < total; i++) {
            const radio = radios[i];
            radio.disabled = false;
            radio.addEventListener('click', function () {
                const
                    self = this,
                    newQuality = self.value
                ;
                playbackQuality = parseInt(newQuality);
                media.hlsPlayer.currentLevel = playbackQuality;
                player.qualityButton.querySelector('button').innerHTML = (getQualityNameFromValue(playbackQuality));

                const selected = player.qualityButton.querySelectorAll(`.${t.options.classPrefix}quality-selected`);
                for (let i = 0, total = selected.length; i < total; i++) {
                    mejs.Utils.removeClass(selected[i], `${t.options.classPrefix}quality-selected`);
                }

                self.checked = true;
                const siblings = mejs.Utils.siblings(self, (el) => mejs.Utils.hasClass(el, `${t.options.classPrefix}quality-selector-label`));
                for (let j = 0, total = siblings.length; j < total; j++) {
                    mejs.Utils.addClass(siblings[j], `${t.options.classPrefix}quality-selected`);
                }
            });
        }

        for (let i = 0, total = labels.length; i < total; i++) {
            labels[i].addEventListener('click', function () {
                const
                    radio = mejs.Utils.siblings(this, (el) => el.tagName === 'INPUT')[0],
                    event = mejs.Utils.createEvent('click', radio)
                ;
                radio.dispatchEvent(event);
            });
        }

        //Allow up/down arrow to change the selected radio without changing the volume.
        player.qualitySelector.addEventListener('keydown', (e) => {
            e.stopPropagation();
        });


    },


    /**
	 * Feature destructor.
	 *
	 * Always has to be prefixed with `clean` and the name that was used in MepDefaults.features list
	 * @param {MediaElementPlayer} player
	 */
	cleanquality (player) {
        if (player) {
            if (player.qualityButton) {
                player.qualityButton.parentNode.removeChild(player.qualityButton);
            }
            if (player.qualitySelector) {
                player.qualitySelector.parentNode.removeChild(player.qualitySelector);
            }
        }

    },


});
