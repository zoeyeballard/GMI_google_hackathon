const form = document.getElementById('analysis-form');
const statusPill = document.getElementById('status-pill');
const statusText = document.getElementById('status-text');
const output = document.getElementById('output');
const demoFill = document.getElementById('demo-fill');
const sourceType = document.getElementById('source-type');
const clipUrl = document.getElementById('clip-url');
const clipFile = document.getElementById('clip-file');
const errorNote = document.getElementById('error-note');

const setStatus = (pill, text) => {
  statusPill.textContent = pill;
  statusText.textContent = text;
};

const setErrorNote = (message) => {
  if (!message) {
    errorNote.hidden = true;
    errorNote.textContent = '';
    return;
  }
  errorNote.hidden = false;
  errorNote.textContent = message;
};

const syncSourceControls = () => {
  const isUpload = sourceType.value === 'upload';
  clipUrl.required = !isUpload;
  clipFile.required = isUpload;
  clipUrl.disabled = isUpload;
  clipFile.disabled = !isUpload;
};

sourceType.addEventListener('change', syncSourceControls);
syncSourceControls();

demoFill.addEventListener('click', () => {
  sourceType.value = 'url';
  clipUrl.value = 'https://example.com/demo-clip';
  clipFile.value = '';
  form.team_name.value = 'Cabo Verde';
  form.tournament.value = 'World Cup';
  form.clip_minutes.value = '5';
  syncSourceControls();
  setStatus('Demo loaded', 'Ready to run the pipeline on a sample clip.');
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const isUpload = sourceType.value === 'upload';
  const clipMinutes = Number(form.clip_minutes.value || '5');

  setStatus('Running', 'Sending the clip through the analysis pipeline.');
  setErrorNote('');
  output.textContent = 'Working...';

  try {
    const response = isUpload
      ? await (() => {
          const formData = new FormData();
          if (!clipFile.files || clipFile.files.length === 0) {
            throw new Error('Choose a video file before running upload mode.');
          }
          formData.append('file', clipFile.files[0]);
          formData.append('team_name', form.team_name.value);
          formData.append('tournament', form.tournament.value);
          formData.append('clip_minutes', String(clipMinutes));
          return fetch('/analyze-upload', { method: 'POST', body: formData });
        })()
      : await fetch('/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source: clipUrl.value,
            source_type: 'url',
            team_name: form.team_name.value,
            tournament: form.tournament.value,
            clip_minutes: clipMinutes,
          }),
        });

    if (!response.ok) {
      let detailMessage = `Request failed with status ${response.status}`;
      try {
        const errorPayload = await response.json();
        if (errorPayload && errorPayload.detail) {
          const detail = errorPayload.detail;
          if (typeof detail === 'string') {
            detailMessage = detail;
          } else if (detail.message) {
            detailMessage = detail.hint ? `${detail.message} ${detail.hint}` : detail.message;
          }
        }
      } catch (e) {
        // Keep status-based fallback message.
      }
      throw new Error(detailMessage);
    }

    const data = await response.json();
    setStatus('Complete', 'The scouting report is ready.');
    output.textContent = data.rendered_report;
  } catch (error) {
    setStatus('Error', error.message);
    setErrorNote('The run failed. Most common cause: wrong GMI endpoint path in .env.');
    output.textContent = `Failed to analyze clip.\n\n${error.message}`;
  }
});