const CalendarUtils = (function() {
  function getMonthData(year, month) {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startDate = new Date(firstDayOfMonth);
    const dayOfWeek = startDate.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(startDate.getDate() - diff);

    const endDate = new Date(lastDayOfMonth);
    const endDayOfWeek = endDate.getDay();
    const endDiff = endDayOfWeek === 0 ? 0 : 7 - endDayOfWeek;
    endDate.setDate(endDate.getDate() + endDiff);

    const weeks = [];
    let currentWeek = [];
    let currentDate = new Date(startDate);
    const today = new Date();

    while (currentDate <= endDate) {
      const isCurrentMonth = currentDate.getMonth() === month;
      const isToday = currentDate.getDate() === today.getDate() &&
                      currentDate.getMonth() === today.getMonth() &&
                      currentDate.getFullYear() === today.getFullYear();

      const dayOfWeekNum = currentDate.getDay();
      const isWeekend = dayOfWeekNum === 0 || dayOfWeekNum === 6;

      const yearStr = currentDate.getFullYear();
      const monthStr = String(currentDate.getMonth() + 1).padStart(2, '0');
      const dayStr = String(currentDate.getDate()).padStart(2, '0');

      currentWeek.push({
        date: new Date(currentDate),
        dayNum: currentDate.getDate(),
        isCurrentMonth,
        isToday,
        isWeekend,
        dateStr: `${yearStr}-${monthStr}-${dayStr}`
      });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return weeks;
  }

  const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

  function formatMonthTitle(year, month) {
    return `${MONTHS[month]} ${year}`;
  }

  function parseDateStr(str) {
    const parts = str.split('-');
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  }

  function segmentEvents(notes, weekStartDate, weekEndDate) {
    const segments = [];
    const wStart = parseDateStr(weekStartDate);
    const wEnd = parseDateStr(weekEndDate);

    notes.forEach(note => {
      const nStart = parseDateStr(note.startDate);
      const nEnd = parseDateStr(note.endDate);

      if (nStart <= wEnd && nEnd >= wStart) {
        const start = nStart < wStart ? wStart : nStart;
        const end = nEnd > wEnd ? wEnd : nEnd;

        const startDiff = Math.round((start - wStart) / 86400000);
        const spanDiff = Math.round((end - start) / 86400000) + 1;

        let type = 'single';
        if (nStart < wStart && nEnd > wEnd) type = 'middle';
        else if (nStart < wStart) type = 'end';
        else if (nEnd > wEnd) type = 'start';

        const isMultiDay = (parseDateStr(note.endDate) - parseDateStr(note.startDate)) / 86400000 > 0;

        segments.push({
          note,
          startCol: startDiff + 1,
          span: spanDiff,
          type,
          isMultiDay
        });
      }
    });

    return segments;
  }

  function assignTracks(segments) {
    segments.sort((a, b) => {
      if (a.startCol !== b.startCol) return a.startCol - b.startCol;
      return b.span - a.span;
    });

    const tracks = [];

    segments.forEach(segment => {
      let trackIndex = 0;
      let placed = false;

      while (!placed) {
        if (!tracks[trackIndex]) {
          tracks[trackIndex] = [];
        }

        const hasOverlap = tracks[trackIndex].some(existing => {
          const eStart = existing.startCol;
          const eEnd = existing.startCol + existing.span - 1;
          const sStart = segment.startCol;
          const sEnd = segment.startCol + segment.span - 1;
          return sStart <= eEnd && sEnd >= eStart;
        });

        if (!hasOverlap) {
          tracks[trackIndex].push(segment);
          segment.track = trackIndex + 1;
          placed = true;
        } else {
          trackIndex++;
        }
      }
    });

    return segments;
  }

  function getTrackCount(segments) {
    return segments.reduce((max, seg) => Math.max(max, seg.track || 0), 0);
  }

  function generateId() {
    return 'id-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  }

  function formatDateShort(dateStr) {
    const d = parseDateStr(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}/${String(d.getFullYear()).substr(-2)}`;
  }

  function formatDateLong(dateStr) {
    const d = parseDateStr(dateStr);
    return `${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;
  }

  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      return `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`;
    }
    return '123,104,238';
  }

  return {
    getMonthData,
    formatMonthTitle,
    segmentEvents,
    assignTracks,
    getTrackCount,
    generateId,
    formatDateShort,
    formatDateLong,
    hexToRgb,
    parseDateStr
  };
})();
