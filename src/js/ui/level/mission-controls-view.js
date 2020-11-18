import { EventEmitter } from 'events';
import EventManager from '../../util/event-manager';
import $ from 'jquery';
import { defaultsDeep } from 'lodash';

import { missionControl as missionControlDefaults } from '../defaults';

export default class MissionControlsView extends EventEmitter {
  constructor({ i18n, options = missionControlDefaults }) {
    super();

    this._options = defaultsDeep({ ...options }, missionControlDefaults);

    this._i18n = i18n;
    this._localizables = [];

    this._dem = new EventManager();
    this._setupDOM();

    this.localize();
  }

  _setupDOM() {
    this._setupMissionAndTrainingTabs();
  }

  _setupMissionAndTrainingTabs() {
    const ael = this._dem.ael;

    this._$missionContent = $(this._options.missionTabContent);
    this._$missionButton = $(this._options.missionTabButton);
    ael(this._$missionButton, 'click', this.showMissionTab.bind(this));

    this._$helpContent = $(this._options.helpTabContent);
    this._$helpButton = $(this._options.helpTabButton);
    ael(this._$helpButton, 'click', this.showHelpTab.bind(this));

    this._setupTrainingTab();
  }

  _setupTrainingTab() {
    const ael = this._dem.ael;

    const $showGradientLabel = $(this._options.showGradientLabel)
      .attr('data-i18n', 'main:mission-control.show-gradient');

    const $missionControlTrainLabel = $(this._options.trainLabel)
      .attr('data-i18n', 'main:mission-control.train');

    const $resetButton = $(this._options.resetButton)
      .attr('data-i18n', '[title]main:mission-control.reset-button');
    ael($resetButton, 'click', () => this.emit('reset-training'));

    const $pauseResumeButton = $(this._options.pauseResumeButton)
      .attr('data-i18n', '[title]main:mission-control.pause-resume-button');
    const pauseClasses = this._options.pauseResumeButtonPauseClasses;
    const resumeClasses = this._options.pauseResumeButtonResumeClasses;
    const isPlaying = () => $pauseResumeButton.hasClass(pauseClasses);
    const resume = () => {
      $pauseResumeButton.addClass(pauseClasses);
      $pauseResumeButton.removeClass(resumeClasses);
      this.emit('resume-training');
    };
    const pause = () => {
      $pauseResumeButton.addClass(resumeClasses);
      $pauseResumeButton.removeClass(pauseClasses);
      this.emit('pause-training');
    };
    pause();
    ael($pauseResumeButton, 'click', () => isPlaying() ? pause() : resume());

    const $singleStepButton = $(this._options.singleStepButton)
      .attr('data-i18n', '[title]main:mission-control.single-step-button');
    ael($singleStepButton, 'click', () => this.emit('step-training'));

    const localizables = [
      $showGradientLabel,
      $missionControlTrainLabel,
      $resetButton,
      $pauseResumeButton,
      $singleStepButton,
    ].map(l => l.toArray()).flat();
    this._localizables.push(...localizables);
  }

  showHelpTab() {
    this._$missionButton.removeClass(this._options.tabButtonSelectedClasses);
    this._$missionContent.removeClass(this._options.tabContentVisibleClasses);
    this._$helpButton.addClass(this._options.tabButtonSelectedClasses);
    this._$helpContent.addClass(this._options.tabContentVisibleClasses);
  }

  showMissionTab() {
    this._$helpButton.removeClass(this._options.tabButtonSelectedClasses);
    this._$helpContent.removeClass(this._options.tabContentVisibleClasses);
    this._$missionButton.addClass(this._options.tabButtonSelectedClasses);
    this._$missionContent.addClass(this._options.tabContentVisibleClasses);
  }

  localize() {
    this._i18n.localize(...this._localizables);
  }

  dispose() {
    this._dem.dispose();
    return this;
  }
}
