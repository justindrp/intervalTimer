speechSynthesis.onvoiceschanged = () => {};

let countdown;
let isRunning = false;
let intervalDurations = [];
let restDuration = 0;
let currentInterval = 0;
let inRest = false;
let timeLeft = 0;
let totalDuration = 0;

const timerDisplay = document.getElementById('timer');
const intervalDurationsInput = document.getElementById('intervalDurationsInput');
const restDurationInput = document.getElementById('restDuration');
const intervalsContainer = document.getElementById('intervals');

function readInputs() {
  const rawDurations = intervalDurationsInput.value.split(',').map(s => parseFloat(s.trim()));
  const newRest = parseFloat(restDurationInput.value);

  if (
    rawDurations.length === 0 ||
    rawDurations.some(d => isNaN(d) || d <= 0) ||
    isNaN(newRest) || newRest < 0
  ) {
    return null;
  }

  return {
    intervalDurations: rawDurations.map(d => d * 60),
    restDuration: newRest * 60
  };
}

function renderIntervals() {
  const inputs = readInputs();
  if (!inputs) {
    intervalsContainer.innerHTML = '';
    return;
  }

  const items = [];
  for (let i = 0; i < inputs.intervalDurations.length; i++) {
    items.push({ type: 'interval', index: i + 1, duration: inputs.intervalDurations[i] });
    if (inputs.restDuration > 0 && i < inputs.intervalDurations.length - 1) {
      items.push({ type: 'rest', duration: inputs.restDuration });
    }
  }

  intervalsContainer.innerHTML = items.map((item, i) => {
    let isActive = false;
    let isCompleted = false;
    let progress = 0;

    if (isRunning) {
      if (item.type === 'interval') {
        if (!inRest) {
          if (currentInterval === item.index - 1) {
            isActive = true;
            const total = item.duration;
            progress = ((total - timeLeft) / total) * 100;
          } else if (currentInterval > item.index - 1) {
            isCompleted = true;
          }
        } else if (currentInterval >= item.index) {
          isCompleted = true;
        }
      } else if (item.type === 'rest') {
        if (inRest) {
          const restIndex = items.slice(0, i).filter(x => x.type === 'interval').length;
          if (currentInterval === restIndex) {
            isActive = true;
            const total = item.duration;
            progress = ((total - timeLeft) / total) * 100;
          } else if (currentInterval > restIndex) {
            isCompleted = true;
          }
        }
      }
    }

    const classes = ['interval-item'];
    if (item.type === 'rest') classes.push('rest');
    if (isActive) classes.push('active');
    if (isCompleted) classes.push('completed');

    const label = item.type === 'rest' ? 'Rest' : `${item.index}`;
    const mins = Math.floor(item.duration / 60);

    const progressBar = isActive ? `<div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div>` : '';

    return `<span class="${classes.join(' ')}">${label}: ${mins}m${progressBar}</span>`;
  }).join('');
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  renderIntervals();
}

function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = speechSynthesis.getVoices();

  const femaleVoice = voices.find(voice =>
    voice.name.toLowerCase().includes('female') ||
    voice.name.toLowerCase().includes('woman') ||
    voice.gender === 'female' ||
    voice.name.toLowerCase().includes('zira') ||
    voice.name.toLowerCase().includes('samantha') ||
    voice.name.toLowerCase().includes('google us english')
  );

  if (femaleVoice) {
    utterance.voice = femaleVoice;
  }

  speechSynthesis.speak(utterance);
}

function startTimer() {
  if (isRunning) return;

  const inputs = readInputs();
  if (!inputs) {
    alert("Please enter valid durations.");
    return;
  }

  intervalDurations = inputs.intervalDurations;
  restDuration = inputs.restDuration;

  isRunning = true;

  if (timeLeft === 0) {
    currentInterval = 0;
    inRest = false;
    timeLeft = intervalDurations[currentInterval];
    totalDuration = timeLeft;
    speak(`Interval ${currentInterval + 1} started`);
  }

  countdown = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();

    if (timeLeft === 0) {
      clearInterval(countdown);
      isRunning = false;

      if (!inRest && restDuration > 0) {
        inRest = true;
        timeLeft = restDuration;
        totalDuration = timeLeft;
        speak('Rest time!');
        startTimer();
      } else {
        if (currentInterval + 1 < intervalDurations.length) {
          currentInterval++;
          inRest = false;
          timeLeft = intervalDurations[currentInterval];
          totalDuration = timeLeft;
          speak(`Interval ${currentInterval + 1} started`);
          startTimer();
        } else {
          speak('All intervals completed!');
        }
      }
    }
  }, 1000);

  updateTimerDisplay();
}

function pauseTimer() {
  clearInterval(countdown);
  isRunning = false;
  renderIntervals();
}

function resetTimer() {
  pauseTimer();
  currentInterval = 0;
  inRest = false;
  timeLeft = 0;
  updateTimerDisplay();
}

function editTimer() {
  const inputs = readInputs();
  if (!inputs) {
    alert("Please enter valid durations.");
    return;
  }

  pauseTimer();
  intervalDurations = inputs.intervalDurations;
  restDuration = inputs.restDuration;
  currentInterval = 0;
  inRest = false;
  timeLeft = 0;
  updateTimerDisplay();
}

function testSpeech() {
  speak('Interval 1 started');
  setTimeout(() => speak('Rest time!'), 1500);
  setTimeout(() => speak('Interval 2 started'), 3000);
  setTimeout(() => speak('All intervals completed!'), 4500);
}

updateTimerDisplay();

intervalDurationsInput.addEventListener('input', renderIntervals);
restDurationInput.addEventListener('input', renderIntervals);
