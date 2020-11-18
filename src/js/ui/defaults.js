const slider = {
  prevButton: '#backbutton',
  prevButtonLabel: '#backbutton',
  nextButton: '#nextbutton',
  nextButtonLabel: '#nextbutton',
  navParent: '#navcircles',
  navClasses: 'circ',
  navClassesSelected: 'circ selected',
};

const missionControl = {
  // tabbing
  missionTabButton: '#missionbutton',
  missionTabContent: '.content .mission',
  helpTabButton: '#helpmebutton',
  helpTabContent: '.content .helper',
  tabButtonSelectedClasses: 'selected',
  tabContentVisibleClasses: 'visible',
  // content
  showGradientToggle: '',
  showGradientLabel: '#show-gradient-label',
  trainLabel: '#mission-control-train-label',
  resetButton: '.controls .reset',
  pauseResumeButton: '.controls .pause-resume',
  pauseResumeButtonPauseClasses: 'pause',
  pauseResumeButtonResumeClasses: 'resume',
  singleStepButton: '.controls .single-step',
};

const trainingData = {
  trainingDataTableContainer: '#training-table-container',
  trainingDataTitle: '#training-data-title',
};

const level = {
  networkContainer: '#network-container',
  title: '#leveltitle',
  description: '.mission #description',
};

export {
  slider,
  missionControl,
  trainingData,
  level,
};
