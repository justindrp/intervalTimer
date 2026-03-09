speechSynthesis.onvoiceschanged = () => {};

let countdown;
let isRunning = false;

let intervalDurations = [180, 120, 240];
let restDuration = 0;

let currentInterval = 0;
let inRest = false;
let timeLeft = 0;

const timerDisplay = document.getElementById('timer');
const intervalDurationsInput = document.getElementById('intervalDurationsInput');
const restDurationInput = document.getElementById('restDuration');

function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
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
  isRunning = true;

  if (timeLeft === 0) {
    currentInterval = 0;
    inRest = false;
    timeLeft = intervalDurations[currentInterval];
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
        speak('Rest time!');
        startTimer();
      } else {
        if (currentInterval + 1 < intervalDurations.length) {
          currentInterval++;
          inRest = false;
          timeLeft = intervalDurations[currentInterval];
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
}

function resetTimer() {
  pauseTimer();
  currentInterval = 0;
  inRest = false;
  timeLeft = 0;
  updateTimerDisplay();
}

function editTimer() {
  const rawDurations = intervalDurationsInput.value.split(',').map(s => parseFloat(s.trim()));
  const newRest = parseFloat(restDurationInput.value);

  if (
    rawDurations.length === 0 ||
    rawDurations.some(d => isNaN(d) || d <= 0) ||
    isNaN(newRest) || newRest < 0
  ) {
    alert("Please enter valid durations.");
    return;
  }

  pauseTimer();
  intervalDurations = rawDurations.map(d => d * 60);
  restDuration = newRest * 60;
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
