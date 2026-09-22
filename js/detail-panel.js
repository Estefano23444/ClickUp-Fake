const DetailPanel = (function() {
  let currentNoteId = null;

  const ICONS = {
    link: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>',
    lock: '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>',
    chevronDown: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>',
    star: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>',
    layout: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"></rect><line x1="15" y1="3" x2="15" y2="21"></line></svg>',
    close: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
    more: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>',
    comment: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
    refresh: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>',
    grid: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>',
    clock: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
    calendar: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',
    check: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    warn: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
    search: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
    bell: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>',
    filter: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>',
    plus: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>',
    puzzle: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.23 8.77c.24-.24.581-.353.917-.303.515.077.877.526 1.073 1.01a2.5 2.5 0 1 0 3.259-3.259c-.484-.196-.933-.558-1.01-1.073-.05-.336.062-.676.303-.917l1.611-1.611A2.402 2.402 0 0 1 12.086 2c.617 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.878.29.492-.074.84-.504 1.019-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.893.527-.967 1.02z"></path></svg>',
    paperclip: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>',
    at: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"></circle><path d="M16 12v1.5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0-5.5 8.28"></path></svg>',
    smile: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>',
    checklist: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>',
    image: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>',
    send: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>',
    trash: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>'
  };

  function init() {
    const overlay = document.getElementById('detail-overlay');
    if (!overlay) return;

    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) close();
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && overlay.style.display === 'flex') close();
    });

    document.addEventListener('click', function(e) {
      const menu = document.getElementById('detail-more-menu');
      if (menu && !e.target.closest('.detail-modal__more-wrap')) {
        menu.classList.remove('is-open');
      }
    });
  }

  function open(noteId) {
    const note = NotesStore.getById(noteId);
    if (!note) return;

    currentNoteId = noteId;
    renderContent(note);

    const overlay = document.getElementById('detail-overlay');
    if (overlay) overlay.style.display = 'flex';
  }

  function close() {
    const overlay = document.getElementById('detail-overlay');
    if (overlay) overlay.style.display = 'none';
    currentNoteId = null;
  }

  function statusColor(status) {
    const colors = { 'AGENDA': '#FFC43C', 'EN PROGRESO': '#0091FF', 'COMPLETADA': '#87909E' };
    return colors[status] || '#FFC43C';
  }

  function fieldRow(label, valueHtml) {
    return '<div class="detail-field"><span class="detail-field__label">' + label + '</span><div class="detail-field__value">' + valueHtml + '</div></div>';
  }

  function emptyValue() {
    return '<span class="detail-field__empty">Vacío</span>';
  }

  function avatarStack(assignees) {
    const list = assignees || [];
    const visible = list.slice(0, 2);
    let html = '<span class="detail-avatars">';
    visible.forEach(a => {
      html += '<span class="detail-avatar" style="background:' + a.color + '">' + a.initials + '</span>';
    });
    if (list.length > visible.length) {
      html += '<span class="detail-avatar detail-avatar--more">+' + (list.length - visible.length) + '</span>';
    }
    html += '</span>';
    return html;
  }

  function customFieldRow(field) {
    let valueHtml;
    if (field.type === 'dropdown') {
      valueHtml = '<span class="detail-cf__chip">' + field.value + ICONS.chevronDown + '</span>';
    } else if (field.type === 'progress') {
      valueHtml = '<div class="detail-cf__progress"><div class="detail-cf__progress-track"><div class="detail-cf__progress-fill" style="width:' + field.value + '%"></div></div><span class="detail-cf__progress-label">' + field.value + '%</span></div>';
    } else {
      valueHtml = field.value ? field.value : '<span class="detail-cf__dash">–</span>';
    }
    const warn = field.warn ? '<span class="detail-cf__warn">' + ICONS.warn + '</span>' : '';
    return '<div class="detail-cf-row"><span class="detail-cf-row__icon">' + ICONS.grid + '</span><span class="detail-cf-row__label">' + field.label + warn + '</span><div class="detail-cf-row__value">' + valueHtml + '</div></div>';
  }

  function renderContent(note) {
    const panel = document.getElementById('detail-panel');
    if (!panel) return;

    const dateRange = CalendarUtils.formatDateShort(note.startDate) + (note.startDate !== note.endDate ? ' → ' + CalendarUtils.formatDateShort(note.endDate) : '');
    const customFields = note.customFields || [];

    let html = '';

    html += '<div class="detail-modal__topbar">';
    html += '  <div class="detail-modal__breadcrumb">';
    html += '    <span class="detail-modal__icon-btn">' + ICONS.link + '</span>';
    html += '    <span>' + (note.breadcrumbPath || '').split(' > ').join(' / ') + '</span>';
    if (note.lockedCount) {
      html += '    <span class="detail-modal__breadcrumb-lock">' + ICONS.lock + '</span>';
      html += '    <span class="detail-modal__breadcrumb-more">+' + note.lockedCount + '</span>';
    }
    html += '    ' + ICONS.chevronDown;
    html += '  </div>';
    html += '  <div class="detail-modal__topbar-actions">';
    html += '    <span class="detail-modal__created">Se creó el ' + (note.createdAtLabel || '') + '</span>';
    html += '    <span class="detail-modal__brain">Brain² ' + ICONS.chevronDown + '</span>';
    html += '    <div class="detail-modal__more-wrap">';
    html += '      <button class="detail-modal__icon-btn" id="detail-more-btn">' + ICONS.more + '</button>';
    html += '      <div class="detail-modal__more-menu" id="detail-more-menu">';
    html += '        <button class="detail-modal__more-item detail-modal__more-item--danger" id="detail-delete-btn">' + ICONS.trash + ' Eliminar tarea</button>';
    html += '      </div>';
    html += '    </div>';
    html += '    <button class="detail-modal__icon-btn">' + ICONS.star + '</button>';
    html += '    <button class="detail-modal__icon-btn">' + ICONS.layout + '</button>';
    html += '    <button class="detail-modal__icon-btn" id="detail-close-btn">' + ICONS.close + '</button>';
    html += '  </div>';
    html += '</div>';

    html += '<div class="detail-modal__body">';

    html += '  <div class="detail-modal__rail">';
    html += '    <button class="detail-modal__rail-btn">' + ICONS.link + '</button>';
    html += '    <button class="detail-modal__rail-btn">' + ICONS.comment + '</button>';
    html += '    <button class="detail-modal__rail-btn">' + ICONS.refresh + '</button>';
    html += '    <button class="detail-modal__rail-btn">' + ICONS.grid + '</button>';
    html += '  </div>';

    html += '  <div class="detail-modal__main">';

    html += '    <div class="detail-modal__type"><span class="detail-modal__type-dot" style="background:' + note.color + '"></span><span>' + (note.taskType || 'Tarea') + '</span>' + ICONS.chevronDown + '</div>';
    html += '    <h1 class="detail-modal__title" contenteditable="true">' + note.title + '</h1>';
    html += '    <div class="detail-modal__ai-prompt"><span>🧩</span> Pídele a Brain² un <u>presentación</u>, <u>documento</u> o <u>prototipo</u></div>';

    html += '    <div class="detail-fields">';
    html += fieldRow('Estado', '<span class="detail-status-chip" style="background:' + statusColor(note.status) + '">' + note.status + '<span class="detail-status-chip__arrow">' + ICONS.chevronDown + '</span></span><button class="detail-status-check">' + ICONS.check + '</button>');
    html += fieldRow('Personas asignadas', avatarStack(note.assignees));
    html += fieldRow('Fechas', '<span class="detail-field__with-icon">' + ICONS.calendar + ' ' + dateRange + '</span>');
    html += fieldRow('Prioridad', emptyValue());
    html += fieldRow('Duración estimada', emptyValue());
    html += fieldRow('Puntos de sprint', emptyValue());
    html += fieldRow('Registrar el tiempo', '<button class="detail-start-btn"><span class="detail-start-btn__dot"></span>Start</button>');
    html += fieldRow('Etiquetas', emptyValue());
    html += '    </div>';

    html += '    <div class="detail-modal__collapse">' + ICONS.close + ' Contraer campos vacíos</div>';

    html += '    <div class="detail-modal__description" contenteditable="true" data-placeholder="Añade una descripción o escribe con ✨ IA">' + (note.description || '') + '</div>';

    html += '    <div class="detail-modal__custom-fields">';
    html += '      <div class="detail-modal__cf-header" id="detail-cf-toggle">' + ICONS.chevronDown + ' <span>Campos</span> <span class="detail-modal__cf-warn">' + ICONS.warn + '</span></div>';
    html += '      <div class="detail-modal__cf-body" id="detail-cf-body">';
    customFields.forEach(f => { html += customFieldRow(f); });
    html += '      </div>';
    html += '    </div>';

    html += '  </div>'; // end main

    html += '  <div class="detail-modal__activity">';
    html += '    <div class="detail-modal__activity-header">';
    html += '      <span>Activity</span>';
    html += '      <span class="detail-modal__activity-spacer"></span>';
    html += '      <span class="detail-modal__icon-btn">' + ICONS.search + '</span>';
    html += '      <span class="detail-modal__icon-btn detail-modal__bell">' + ICONS.bell + '<span class="detail-modal__bell-count">9</span></span>';
    html += '      <span class="detail-modal__icon-btn">' + ICONS.filter + '</span>';
    html += '    </div>';
    html += '    <div class="detail-modal__activity-feed"></div>';
    html += '    <div class="detail-modal__comment-box">';
    html += '      <textarea class="detail-modal__comment-input" placeholder="Escribe un comentario..."></textarea>';
    html += '      <div class="detail-modal__comment-toolbar">';
    ['plus', 'puzzle', 'paperclip', 'at', 'smile', 'checklist', 'image'].forEach(k => {
      html += '<button class="detail-modal__icon-btn detail-modal__icon-btn--sm">' + ICONS[k] + '</button>';
    });
    html += '        <span class="detail-modal__activity-spacer"></span>';
    html += '        <button class="detail-modal__send-btn">' + ICONS.send + ICONS.chevronDown + '</button>';
    html += '      </div>';
    html += '    </div>';
    html += '  </div>';

    html += '</div>'; // end body

    panel.innerHTML = html;

    const closeBtn = document.getElementById('detail-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', close);

    const moreBtn = document.getElementById('detail-more-btn');
    const moreMenu = document.getElementById('detail-more-menu');
    if (moreBtn && moreMenu) {
      moreBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        moreMenu.classList.toggle('is-open');
      });
    }

    const deleteBtn = document.getElementById('detail-delete-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (confirm('¿Eliminar "' + note.title + '"?')) {
          NotesStore.delete(note.id);
          close();
          Calendar.render();
        }
      });
    }

    const cfToggle = document.getElementById('detail-cf-toggle');
    const cfBody = document.getElementById('detail-cf-body');
    if (cfToggle && cfBody) {
      cfToggle.addEventListener('click', function() {
        cfToggle.classList.toggle('is-collapsed');
        cfBody.classList.toggle('is-collapsed');
      });
    }

    const titleEl = panel.querySelector('.detail-modal__title');
    if (titleEl) {
      titleEl.addEventListener('blur', function() {
        NotesStore.update(note.id, { title: titleEl.textContent });
        Calendar.render();
      });
    }

    const descEl = panel.querySelector('.detail-modal__description');
    if (descEl) {
      descEl.addEventListener('blur', function() {
        NotesStore.update(note.id, { description: descEl.textContent });
      });
    }
  }

  return { init, open, close };
})();

document.addEventListener('DOMContentLoaded', DetailPanel.init);
