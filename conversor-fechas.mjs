// An ordinal date uses a one-based day of year, not a Julian calendar date.
// UTC is used solely for stable formatting: input times are never shifted.
const calendarFormatter = new Intl.DateTimeFormat('es-ES', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
});
export function convertOrdinalDate(value) {
  const source = String(value).trim();
  if (!source) return { status: 'empty' };
  const match = /^(\d{4})\.(\d{1,3})\.(\d{1,2})\.(\d{1,2})\.(\d{1,2})\.(\d{1,3})$/.exec(source);
  if (!match) return { status: 'invalid', error: 'Usa año.día-del-año.hora.minuto.segundo.milisegundo.' };
  const [year, ordinal, hour, minute, second, millisecond] = match.slice(1).map(Number);
  if (year < 1 || year > 9999) return { status: 'invalid', error: 'El año debe estar entre 0001 y 9999.' };
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const lastDay = leap ? 366 : 365;
  if (ordinal < 1 || ordinal > lastDay) return { status: 'invalid', error: `El día del año debe estar entre 001 y ${lastDay} para ${year}.` };
  if (hour > 23) return { status: 'invalid', error: 'La hora debe estar entre 00 y 23.' };
  if (minute > 59) return { status: 'invalid', error: 'Los minutos deben estar entre 00 y 59.' };
  if (second > 59) return { status: 'invalid', error: 'Los segundos deben estar entre 00 y 59.' };
  const monthDays = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let day = ordinal;
  let month = 0;
  while (day > monthDays[month]) { day -= monthDays[month]; month++; }
  const pad = (number, length = 2) => String(number).padStart(length, '0');
  const date = `${pad(day)}/${pad(month + 1)}/${pad(year, 4)}`;
  const time = `${pad(hour)}:${pad(minute)}:${pad(second)}.${pad(millisecond, 3)}`;
  const instant = new Date(0);
  instant.setUTCFullYear(year, month, day);
  instant.setUTCHours(hour, minute, second, millisecond);
  const description = calendarFormatter.format(instant);
  return { status: 'valid', date, time, description, text: `${date} ${time}` };
}

function bindConverter(card) {
  const input = card.querySelector('[data-date-input]');
  const date = card.querySelector('[data-result-date]');
  const time = card.querySelector('[data-result-time]');
  const description = card.querySelector('[data-description]');
  const help = card.querySelector('[data-help]');
  const state = card.querySelector('[data-state]');
  const copy = card.querySelector('[data-copy]');
  const feedback = card.querySelector('[data-copy-feedback]');
  let result = { status: 'empty' };
  let copyAttempt = 0;
  function render() {
    result = convertOrdinalDate(input.value);
    copyAttempt++;
    feedback.textContent = '';
    copy.disabled = result.status !== 'valid';
    input.setAttribute('aria-invalid', result.status === 'invalid' ? 'true' : 'false');
    if (result.status === 'valid') {
      card.dataset.valid = 'true';
      date.textContent = result.date;
      time.textContent = result.time;
      description.textContent = result.description;
      state.textContent = 'Convertida';
      help.textContent = 'Fecha válida. Hora original y milisegundos conservados.';
    } else {
      if (result.status === 'empty') delete card.dataset.valid;
      else card.dataset.valid = 'false';
      date.textContent = '—';
      time.textContent = '—';
      description.textContent = result.status === 'empty' ? 'El resultado aparecerá aquí.' : 'Revisa la fecha de origen para continuar.';
      state.textContent = result.status === 'empty' ? 'Sin datos' : 'Revisar';
      help.textContent = result.error || 'Introduce los seis bloques separados por puntos.';
    }
  }
  input.addEventListener('input', render);
  copy.addEventListener('click', async () => {
    if (result.status !== 'valid') return;
    const attempt = ++copyAttempt;
    const text = result.text;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      if (attempt === copyAttempt) feedback.textContent = 'Resultado copiado';
    } catch {
      if (attempt === copyAttempt) feedback.textContent = 'No se pudo copiar. Selecciona el resultado para copiarlo manualmente.';
    }
  });
  // Recalculate values restored by the browser without persisting any data here.
  window.addEventListener('pageshow', render);
  render();
}
if (typeof document !== 'undefined') document.querySelectorAll('[data-converter]').forEach(bindConverter);
