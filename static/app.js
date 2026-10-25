const form = document.getElementById('analyzer-form');
const input = document.getElementById('password-input');
const state = document.getElementById('state');
const results = document.getElementById('results');
const submit = document.getElementById('analyze-btn');
const labels = ['Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'];
const colors = ['#ef7777', '#f59c65', '#e5bf68', '#79c6a0', '#53c29a'];

function addFeedback(message) {
  const item = document.createElement('div');
  item.className = 'fb-item';
  item.textContent = message;
  document.getElementById('feedback').appendChild(item);
}

document.getElementById('toggle-btn').addEventListener('click', () => {
  const show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  document.getElementById('toggle-btn').textContent = show ? 'Hide' : 'Show';
  document.getElementById('toggle-btn').setAttribute('aria-label', show ? 'Hide password' : 'Show password');
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const password = input.value;
  if (!password) return;
  results.hidden = true;
  submit.disabled = true;
  state.textContent = 'Analyzing in this browser and checking a hash range…';
  try {
    if (typeof zxcvbn !== 'function') throw new Error('Local strength library did not load.');
    const strength = zxcvbn(password);
    const breachResult = await PasswordCheck.checkBreach(password);
    const score = strength.score;
    const bar = document.getElementById('score-bar');
    bar.style.width = `${(score / 4) * 100}%`;
    bar.style.backgroundColor = colors[score];
    document.getElementById('score-track').setAttribute('aria-valuenow', score);
    const label = document.getElementById('score-label');
    label.textContent = labels[score];
    label.style.color = colors[score];
    document.getElementById('crack-time').textContent = strength.crack_times_display.offline_slow_hashing_1e4_per_second;

    const breach = document.getElementById('breach-msg');
    if (breachResult.status === 'found') {
      breach.textContent = `Found ${breachResult.count.toLocaleString()} times in the corpus`;
      breach.className = 'result-val danger';
    } else if (breachResult.status === 'not_found') {
      breach.textContent = 'Not found in this corpus';
      breach.className = 'result-val good';
    } else {
      breach.textContent = 'Lookup unavailable — status unknown';
      breach.className = 'result-val uncertain';
    }
    const feedback = document.getElementById('feedback');
    feedback.replaceChildren();
    if (strength.feedback.warning) addFeedback(strength.feedback.warning);
    for (const suggestion of strength.feedback.suggestions) addFeedback(suggestion);
    results.hidden = false;
    state.textContent = 'Analysis complete. The password field has been cleared.';
  } catch (error) {
    state.textContent = `Unable to analyze: ${error.message}`;
  } finally {
    input.value = '';
    input.type = 'password';
    document.getElementById('toggle-btn').textContent = 'Show';
    submit.disabled = false;
  }
});
