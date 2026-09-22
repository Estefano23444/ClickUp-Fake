const NotesStore = (function() {
  const STORAGE_KEY = 'clickup_notes';
  const CATEGORIES_KEY = 'clickup_categories';
  const changeListeners = [];

  const DEFAULT_CATEGORIES = [
    { id: 'editorial', name: 'Dpto. Producción Editorial', emoji: '📚', color: '#6BC950' },
    { id: 'guias', name: 'Guías de ClickUp', emoji: '📖', color: '#F2C94C' },
    { id: 'avance', name: 'Avance de Proyectos', emoji: '📊', color: '#0091FF' },
    { id: 'educacion', name: 'Educación Financiera', emoji: '💰', color: '#FC6D2D' },
    { id: 'robotica', name: 'Aulas Interactivas', emoji: '🤖', color: '#F2836B' },
    { id: 'actividades', name: 'Actividades Internas', emoji: '🏢', color: '#E91E63' },
    { id: 'civica', name: 'Cívica - Para la vida', emoji: '🔒', color: '#7B68EE' },
    { id: 'digitales', name: 'Recursos Digitales - GPS', emoji: '🌐', color: '#00B5D8' },
    { id: 'infra', name: 'Desarrollo de Infraestructura', emoji: '🏗️', color: '#8D6E63' },
    { id: 'proceso', name: 'Proyectos - Proceso Editorial', emoji: '📝', color: '#84CC16' },
    { id: 'skills', name: 'Skills', emoji: '⚡', color: '#78909C' }
  ];

  const AV_E = { initials: 'E', color: '#7B68EE' };
  const AV_L = { initials: 'L', color: '#00B5D8' };
  const AV_N = { initials: 'N', color: '#FC6D2D' };
  const AV_B = { initials: 'B', color: '#6BC950' };

  const DEFAULT_CUSTOM_FIELDS = [
    { key: 'departamento', label: 'Departamento', type: 'dropdown', value: 'Editorial' },
    { key: 'actualizaciones', label: 'Actualizaciones de proceso', type: 'text', value: '', warn: true },
    { key: 'adjuntos', label: 'Archivos adjuntos', type: 'text', value: '' },
    { key: 'avance', label: 'Avance', type: 'progress', value: 0 },
    { key: 'avanceEje', label: 'Avance por eje %', type: 'text', value: '' },
    { key: 'deptoResponsable', label: 'Departamento Responsable', type: 'text', value: '' },
    { key: 'fechaInicio', label: 'Fecha de Inicio', type: 'text', value: '' },
    { key: 'fechaPublicacion', label: 'Fecha de Publicación', type: 'text', value: '' }
  ];

  const DEFAULT_NOTES = [
    {
      id: 'note-1', title: 'Release Planning', description: 'Planificación del release trimestral',
      startDate: '2026-09-07', endDate: '2026-09-13',
      category: 'infra', color: '#E8C8EC', status: 'AGENDA', emoji: '🚀', createdAt: '2026-09-01',
      breadcrumbPath: 'Desarrollo de Infraestructura > Infraestructura',
      timeLabel: '7h 10m', taskType: 'Tarea', assignees: [AV_E]
    },
    {
      id: 'note-2', title: 'Planificación EDINUM Conecta', description: '',
      startDate: '2026-09-14', endDate: '2026-09-14',
      category: 'digitales', color: '#CCE8D8', status: 'AGENDA', emoji: '📝', createdAt: '2026-09-01',
      breadcrumbPath: 'Agenda - GPS > ING. Estefano Proaño',
      timeLabel: '3h 21m', taskType: 'Tarea', assignees: [AV_E]
    },
    {
      id: 'note-3', title: 'Revisar Carga Masiva', description: '',
      startDate: '2026-09-14', endDate: '2026-09-14',
      category: 'digitales', color: '#CCE8D8', status: 'AGENDA', emoji: '📦', createdAt: '2026-09-01',
      breadcrumbPath: 'Agenda - GPS > ING. Estefano Proaño',
      timeLabel: '19m', taskType: 'Tarea', assignees: [AV_E]
    },
    {
      id: 'note-4', title: 'Explicar Módulo de Inglés', description: '',
      startDate: '2026-09-16', endDate: '2026-09-16',
      category: 'digitales', color: '#CCE8D8', status: 'EN PROGRESO', emoji: '📗', createdAt: '2026-09-01',
      breadcrumbPath: 'Agenda - GPS > ING. Estefano Proaño',
      timeLabel: '1h 3m', taskType: 'Tarea', assignees: [AV_E]
    },
    {
      id: 'note-5', title: 'Informe de Actividades', description: '',
      startDate: '2026-09-18', endDate: '2026-09-18',
      category: 'actividades', color: '#FCE8B4', status: 'AGENDA', emoji: '📊', createdAt: '2026-09-01',
      breadcrumbPath: 'Actividades Internas > Reuniones de todo el equipo',
      timeLabel: '1h 3m', taskType: 'Tarea', assignees: [AV_E]
    },
    {
      id: 'note-6', title: 'Sprint Review', description: 'Revisión del sprint actual',
      startDate: '2026-09-18', endDate: '2026-09-19',
      category: 'digitales', color: '#CCE8D8', status: 'AGENDA', emoji: '🏃', createdAt: '2026-09-01',
      breadcrumbPath: 'Agenda - GPS > Reuniones de equipo',
      timeLabel: '8:30am-10:30am · 6h 42m', taskType: 'Tarea', assignees: [AV_E, AV_L, AV_N]
    },
    {
      id: 'note-7', title: 'Release Planning', description: 'Continuación planificación',
      startDate: '2026-09-13', endDate: '2026-09-14',
      category: 'infra', color: '#E8C8EC', status: 'AGENDA', emoji: '🚀', createdAt: '2026-09-01',
      breadcrumbPath: 'Desarrollo de Infraestructura > Infraestructura',
      timeLabel: '7h 10m', taskType: 'Tarea', assignees: [AV_E]
    },
    {
      id: 'note-8', title: 'Sprint 4', description: 'Ejecución Sprint 4',
      startDate: '2026-09-14', endDate: '2026-09-19',
      category: 'infra', color: '#E8C8EC', status: 'EN PROGRESO', emoji: '🏃', createdAt: '2026-09-01',
      breadcrumbPath: 'Desarrollo de Infraestructura > Infraestructura',
      timeLabel: '3h 13m', taskType: 'Tarea', assignees: [AV_E]
    },
    {
      id: 'note-9', title: 'Comité de Robótica - Recursos fi...', description: '',
      startDate: '2026-09-20', endDate: '2026-09-20',
      category: 'digitales', color: '#CCE8D8', status: 'AGENDA', emoji: '🤖', createdAt: '2026-09-01',
      breadcrumbPath: 'Agenda - GPS > Lizeth Hermosa',
      timeLabel: '10:00am-11:30am · 5h 36m', taskType: 'Tarea', assignees: [AV_L, AV_N, AV_B]
    },
    {
      id: 'note-10', title: 'Elaboración de estructura nueva serie adaptada al nuevo currículo', description: '',
      startDate: '2026-09-22', endDate: '2026-09-22',
      category: 'guias', color: '#FCE8B4', status: 'AGENDA', emoji: '📝', createdAt: '2026-09-01',
      breadcrumbPath: 'Agenda - Gestores > Shared with me',
      timeLabel: '10:00am-1:00pm', taskType: 'Tarea',
      assignees: [AV_E, AV_N, AV_B, AV_L, { initials: 'M', color: '#E91E63' }, { initials: 'D', color: '#FC6D2D' }, { initials: 'R', color: '#00B5D8' }, { initials: 'S', color: '#84CC16' }],
      taskUrl: 'https://app.clickup.com/t/9013257060/86akm6x3j',
      lockedCount: 4, createdAtLabel: 'sep. 18',
      customFields: [
        { key: 'departamento', label: 'Departamento', type: 'dropdown', value: 'Editorial' },
        { key: 'actualizaciones', label: 'Actualizaciones de proceso', type: 'text', value: '', warn: true },
        { key: 'adjuntos', label: 'Archivos adjuntos', type: 'text', value: '' },
        { key: 'avance', label: 'Avance', type: 'progress', value: 0 },
        { key: 'avanceEje', label: 'Avance por eje %', type: 'text', value: '' },
        { key: 'deptoResponsable', label: 'Departamento Responsable', type: 'text', value: '' },
        { key: 'fechaInicio', label: 'Fecha de Inicio', type: 'text', value: '' },
        { key: 'fechaPublicacion', label: 'Fecha de Publicación', type: 'text', value: '' }
      ]
    },
    {
      id: 'note-11', title: 'Capacitación CLAUDE - CIE y GPS', description: '',
      startDate: '2026-09-22', endDate: '2026-09-22',
      category: 'guias', color: '#FCE8B4', status: 'AGENDA', emoji: '🤖', createdAt: '2026-09-01',
      breadcrumbPath: 'Actividades Internas > Reuniones de todo el equipo',
      timeLabel: '3:00pm-5:00pm', taskType: 'Tarea', assignees: [AV_L, AV_B]
    },
    {
      id: 'note-12', title: 'Retirar Tarjeta de Innovación', description: '',
      startDate: '2026-09-24', endDate: '2026-09-24',
      category: 'guias', color: '#FCE8B4', status: 'AGENDA', emoji: '💡', createdAt: '2026-09-01',
      breadcrumbPath: 'Agenda - GPS > ING. Estefano Proaño',
      timeLabel: 'Vacío', taskType: 'Tarea', assignees: [AV_E]
    },
    {
      id: 'note-13', title: 'Factura AWS Octubre 2026', description: '',
      startDate: '2026-09-25', endDate: '2026-09-25',
      category: 'infra', color: '#FCE8B4', status: 'AGENDA', emoji: '🧾', createdAt: '2026-09-01',
      breadcrumbPath: 'Shared with me > Shared with me',
      timeLabel: '10:00am-10:00am', taskType: 'Tarea', assignees: [AV_E]
    }
  ];

  function seededDefaultNotes() {
    return DEFAULT_NOTES.map(n => ({
      lockedCount: 0,
      createdAtLabel: 'sep. 1',
      customFields: DEFAULT_CUSTOM_FIELDS,
      ...n
    }));
  }

  function init() {
    if (!localStorage.getItem(CATEGORIES_KEY)) {
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(DEFAULT_CATEGORIES));
    }
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seededDefaultNotes()));
    }

    // Optional: js/firebase-sync.js (loaded as a <script type="module">, which
    // is why it can safely expose a real `window.RemoteSync` global) turns this
    // into a shared board. It's absent when testing without that script.
    if (window.RemoteSync) {
      const seedById = {};
      seededDefaultNotes().forEach(n => { seedById[n.id] = n; });
      window.RemoteSync.seedIfEmpty(seedById);

      window.RemoteSync.subscribe(function(notesById) {
        const notes = Object.keys(notesById).map(id => notesById[id]);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
        changeListeners.forEach(fn => fn());
      });
    }
  }

  function onChange(fn) {
    changeListeners.push(fn);
  }

  function getAll() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  }

  function getCategories() {
    return JSON.parse(localStorage.getItem(CATEGORIES_KEY) || '[]');
  }

  function getById(id) {
    const notes = getAll();
    return notes.find(n => n.id === id) || null;
  }

  function create(note) {
    const notes = getAll();
    const newNote = {
      breadcrumbPath: '',
      timeLabel: '',
      taskType: 'Tarea',
      assignees: [AV_E],
      ...note,
      id: 'note-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      createdAt: new Date().toISOString().split('T')[0]
    };
    notes.push(newNote);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    if (window.RemoteSync) window.RemoteSync.setNote(newNote.id, newNote);
    return newNote;
  }

  function update(id, data) {
    const notes = getAll();
    const index = notes.findIndex(n => n.id === id);
    if (index !== -1) {
      notes[index] = { ...notes[index], ...data };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
      if (window.RemoteSync) window.RemoteSync.setNote(id, notes[index]);
      return notes[index];
    }
    return null;
  }

  function deleteNote(id) {
    let notes = getAll();
    notes = notes.filter(n => n.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    if (window.RemoteSync) window.RemoteSync.removeNote(id);
  }

  function getForMonth(year, month) {
    const notes = getAll();
    const monthStart = new Date(year, month, 1).toISOString().split('T')[0];
    const monthEnd = new Date(year, month + 1, 0).toISOString().split('T')[0];

    return notes.filter(note => {
      return note.startDate <= monthEnd && note.endDate >= monthStart;
    });
  }

  return { init, getAll, getById, create, update, delete: deleteNote, getCategories, getForMonth, onChange };
})();
