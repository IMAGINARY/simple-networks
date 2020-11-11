import { EventEmitter } from 'events';
import EventManager from '../../util/event-manager';

export default class MissionControlsView extends EventEmitter {
  constructor() {
    super();

    this._dem = new EventManager();
    this._setupDOM();
  }

  _setupDOM() {
    this._setupMissionAndTrainingTabs();
  }

  _setupMissionAndTrainingTabs() {
    const ael = this._dem.ael;

    this._missionContent = document.querySelector('.content .mission');
    this._missionButton = document.querySelector('#missionbutton');
    ael(this._missionButton, 'click', this.showMissionTab.bind(this));

    this._helpContent = document.querySelector('.content .helper');
    this._helpButton = document.querySelector('#helpmebutton');
    ael(this._helpButton, 'click', this.showHelpTab.bind(this));

    this._setupTrainingTab();
  }

  _setupTrainingTab() {
    const ael = this._dem.ael;

    const resetButton = document.querySelector('.controls .reset');
    ael(resetButton, 'click', () => this.emit('reset-training'));

    const pauseResumeButton = document.querySelector('.controls .pause-resume');
    const isPlaying = () => pauseResumeButton.classList.contains('pause');
    const resume = () => {
      pauseResumeButton.classList.add('pause');
      pauseResumeButton.classList.remove('resume');
      this.emit('resume-training');
    };
    const pause = () => {
      pauseResumeButton.classList.add('resume');
      pauseResumeButton.classList.remove('pause');
      this.emit('pause-training');
    };
    pause();
    ael(pauseResumeButton, 'click', () => isPlaying() ? pause() : resume());

    const stepButton = document.querySelector('.controls .single-step');
    ael(stepButton, 'click', () => this.emit('step-training'));
  }

  showHelpTab() {
    this._missionButton.classList.remove('selected');
    this._missionContent.classList.remove('visible');
    this._helpButton.classList.add('selected');
    this._helpContent.classList.add('visible');
  }

  showMissionTab() {
    this._helpButton.classList.remove('selected');
    this._helpContent.classList.remove('visible');
    this._missionButton.classList.add('selected');
    this._missionContent.classList.add('visible');
  }

  dispose() {
    this._dem.dispose();
    return this;
  }
}
