const Calendar = (function() {
  let currentYear = 2026;
  let currentMonth = 8; // September (0-indexed)

  const TRACK_HEIGHT = 44;
  const TRACK_GAP = 4;
  const FOOTER_HEIGHT = 30;
  const MIN_TRACKS = 2;

  function init() {
    try {
      NotesStore.init();
      NotesStore.onChange(render);
      render();
      bindEvents();
    } catch (e) {
      console.error('Calendar init error:', e);
    }
  }

  function render() {
    const monthData = CalendarUtils.getMonthData(currentYear, currentMonth);
    const notes = NotesStore.getForMonth(currentYear, currentMonth);

    const titleEl = document.getElementById('month-title');
    if (titleEl) {
      titleEl.textContent = CalendarUtils.formatMonthTitle(currentYear, currentMonth);
    }

    const body = document.getElementById('calendar-body');
    if (!body) return;
    body.innerHTML = '';

    monthData.forEach(week => {
      const weekEl = createWeekRow(week, notes);
      body.appendChild(weekEl);
    });
  }

  function categoryFor(note) {
    const categories = NotesStore.getCategories();
    return categories.find(c => c.id === note.category) || null;
  }

  function createWeekRow(weekDays, allNotes) {
    const weekStartDate = weekDays[0].dateStr;
    const weekEndDate = weekDays[6].dateStr;
    const segments = CalendarUtils.segmentEvents(allNotes, weekStartDate, weekEndDate);
    const trackedSegments = CalendarUtils.assignTracks(segments);
    const trackCount = Math.max(CalendarUtils.getTrackCount(trackedSegments), MIN_TRACKS);
    const eventsAreaHeight = trackCount * TRACK_HEIGHT + (trackCount - 1) * TRACK_GAP;

    const weekEl = document.createElement('div');
    weekEl.className = 'calendar__week';
    weekEl.style.height = (eventsAreaHeight + FOOTER_HEIGHT) + 'px';

    // Background day cells (click/hover target for empty-cell "Crear Tarea")
    const daysBg = document.createElement('div');
    daysBg.className = 'calendar__days';
    daysBg.style.height = eventsAreaHeight + 'px';

    weekDays.forEach(day => {
      const dayEl = document.createElement('div');
      let classes = 'calendar__day';
      if (day.isToday) classes += ' calendar__day--today';
      if (!day.isCurrentMonth) classes += ' calendar__day--other-month';
      if (day.isWeekend) classes += ' calendar__day--weekend';
      dayEl.className = classes;
      dayEl.setAttribute('data-date', day.dateStr);

      const addBtn = document.createElement('button');
      addBtn.className = 'calendar__day-add-center';
      addBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>';
      addBtn.addEventListener('click', (function(dateStr, el) {
        return function(e) {
          e.stopPropagation();
          QuickCreate.open(dateStr, el.getBoundingClientRect());
        };
      })(day.dateStr, dayEl));

      const tooltip = document.createElement('span');
      tooltip.className = 'calendar__day-tooltip';
      tooltip.textContent = 'Crear Tarea';

      dayEl.appendChild(tooltip);
      dayEl.appendChild(addBtn);
      daysBg.appendChild(dayEl);
    });

    weekEl.appendChild(daysBg);

    // Event bars overlay
    const eventsLayer = document.createElement('div');
    eventsLayer.className = 'calendar__events';
    eventsLayer.style.height = eventsAreaHeight + 'px';
    eventsLayer.style.gridTemplateRows = `repeat(${trackCount}, ${TRACK_HEIGHT}px)`;
    eventsLayer.style.rowGap = TRACK_GAP + 'px';

    trackedSegments.forEach(seg => {
      eventsLayer.appendChild(createEventCard(seg));
    });

    weekEl.appendChild(eventsLayer);

    // Day-number footer row
    const footer = document.createElement('div');
    footer.className = 'calendar__week-footer';
    footer.style.height = FOOTER_HEIGHT + 'px';

    weekDays.forEach(day => {
      const cell = document.createElement('div');
      let classes = 'calendar__footer-cell';
      if (!day.isCurrentMonth) classes += ' calendar__footer-cell--other-month';
      cell.className = classes;

      const numWrap = document.createElement('span');
      numWrap.className = 'calendar__day-number';
      if (day.isToday) numWrap.classList.add('calendar__day-number--today');
      numWrap.textContent = day.dayNum;

      const addBtn = document.createElement('button');
      addBtn.className = 'calendar__footer-add';
      addBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>';
      addBtn.addEventListener('click', (function(dateStr, el) {
        return function(e) {
          e.stopPropagation();
          QuickCreate.open(dateStr, el.getBoundingClientRect());
        };
      })(day.dateStr, cell));

      cell.appendChild(addBtn);
      cell.appendChild(numWrap);
      footer.appendChild(cell);
    });

    weekEl.appendChild(footer);

    return weekEl;
  }

  function createEventCard(seg) {
    const note = seg.note;
    const category = categoryFor(note);

    const evEl = document.createElement('div');
    evEl.className = 'calendar__event calendar__event--' + seg.type + (seg.isMultiDay ? ' calendar__event--banner' : '');
    evEl.style.gridColumn = seg.startCol + ' / span ' + seg.span;
    evEl.style.gridRow = String(seg.track);

    const rgb = CalendarUtils.hexToRgb(note.color);
    evEl.style.setProperty('--event-color', note.color);
    evEl.style.setProperty('--event-color-rgb', rgb);
    evEl.setAttribute('data-note-id', note.id);

    const meta = document.createElement('div');
    meta.className = 'calendar__event-meta';
    meta.textContent = note.breadcrumbPath || (category ? category.name : '');
    evEl.appendChild(meta);

    const title = document.createElement('div');
    title.className = 'calendar__event-title';
    if (note.emoji) {
      const emoji = document.createElement('span');
      emoji.className = 'calendar__event-emoji';
      emoji.textContent = note.emoji;
      title.appendChild(emoji);
    }
    const titleText = document.createElement('span');
    titleText.textContent = note.title;
    title.appendChild(titleText);
    evEl.appendChild(title);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'calendar__event-delete';
    deleteBtn.title = 'Eliminar tarea';
    deleteBtn.innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';
    deleteBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      if (confirm('¿Eliminar "' + note.title + '"?')) {
        NotesStore.delete(note.id);
        render();
      }
    });
    evEl.appendChild(deleteBtn);

    const foot = document.createElement('div');
    foot.className = 'calendar__event-foot';

    const time = document.createElement('span');
    time.className = 'calendar__event-time';
    time.innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg><span>' + (note.timeLabel || '') + '</span>';
    foot.appendChild(time);

    const avatars = document.createElement('span');
    avatars.className = 'calendar__event-avatars';
    const list = note.assignees || [];
    const visible = list.slice(0, 3);
    visible.forEach(a => {
      const av = document.createElement('span');
      av.className = 'calendar__event-avatar';
      av.style.background = a.color;
      av.textContent = a.initials;
      avatars.appendChild(av);
    });
    if (list.length > visible.length) {
      const more = document.createElement('span');
      more.className = 'calendar__event-avatar calendar__event-avatar--more';
      more.textContent = '+' + (list.length - visible.length);
      avatars.appendChild(more);
    }
    foot.appendChild(avatars);

    evEl.appendChild(foot);

    evEl.addEventListener('click', function(e) {
      e.stopPropagation();
      DetailPanel.open(note.id);
    });

    return evEl;
  }

  function bindEvents() {
    const prevBtn = document.getElementById('btn-prev');
    if (prevBtn) {
      prevBtn.addEventListener('click', function() {
        currentMonth--;
        if (currentMonth < 0) { currentMonth = 11; currentYear--; }
        render();
      });
    }

    const nextBtn = document.getElementById('btn-next');
    if (nextBtn) {
      nextBtn.addEventListener('click', function() {
        currentMonth++;
        if (currentMonth > 11) { currentMonth = 0; currentYear++; }
        render();
      });
    }

    const todayBtn = document.getElementById('btn-today');
    if (todayBtn) {
      todayBtn.addEventListener('click', function() {
        const now = new Date();
        currentYear = now.getFullYear();
        currentMonth = now.getMonth();
        render();
      });
    }

    const addNoteBtn = document.getElementById('btn-add-note');
    if (addNoteBtn) {
      addNoteBtn.addEventListener('click', function() {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        const todayStr = y + '-' + m + '-' + d;
        QuickCreate.open(todayStr, addNoteBtn.getBoundingClientRect());
      });
    }
  }

  function goToMonth(year, month) {
    currentYear = year;
    currentMonth = month;
    render();
  }

  return { init, render, goToMonth };
})();

document.addEventListener('DOMContentLoaded', Calendar.init);
