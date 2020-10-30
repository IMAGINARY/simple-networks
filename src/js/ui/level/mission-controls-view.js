import { EventEmitter } from 'events';

export default class MissionControlsView extends EventEmitter {
  constructor() {
    super();

    this._setupDOM();
  }

  _setupDOM() {
    this._setupMissionAndTrainingTabs();
  }

  _setupMissionAndTrainingTabs() {
    this._missionContent = document.querySelector('.content .mission');
    this._missionButton = document.querySelector('#missionbutton');
    this._missionButton.addEventListener('click', this.showMissionTab.bind(this));

    this._helpContent = document.querySelector('.content .helper');
    this._helpButton = document.querySelector('#helpmebutton');
    this._helpButton.addEventListener('click', this.showHelpTab.bind(this));

    this._setupTrainingTab();
  }

  _setupTrainingTab() {
    const resetButton = document.querySelector('.controls .reset');
    resetButton.addEventListener('click', () => this.emit('reset-training'));

    const pauseResumeButton = document.querySelector('.controls .pause-resume');
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
    pauseResumeButton.addEventListener('click', () => {
      return pauseResumeButton.classList.contains('resume') ? resume() : pause();
    });

    const stepButton = document.querySelector('.controls .single-step');
    stepButton.addEventListener('click', () => this.emit('step-training'));
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
}
