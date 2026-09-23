const QuickCreate = (function() {
  let selectedDate = null;
  let selectedCategory = 'editorial';
  
  function init() {
    const qc = document.getElementById('quick-create');
    if (!qc) return;
    
    const saveBtn = document.getElementById('qc-save');
    if (saveBtn) {
      saveBtn.onclick = save;
    }

    const closeBtn = document.getElementById('qc-close');
    if (closeBtn) {
      closeBtn.onclick = close;
    }
    
    const input = document.getElementById('qc-input');
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') save();
      });
    }
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && qc.style.display === 'block') close();
    });
    
    document.addEventListener('mousedown', (e) => {
      if (qc.style.display === 'block' && !qc.contains(e.target) && !e.target.closest('.calendar__day')) {
        close();
      }
    });
  }
  
  function open(dateStr, anchorRect) {
    selectedDate = dateStr;
    const qc = document.getElementById('quick-create');
    if (!qc) return;

    const dateDisplay = document.getElementById('qc-date');
    if (dateDisplay) {
      dateDisplay.textContent = CalendarUtils.formatDateShort(dateStr);
    }

    qc.style.display = 'block';

    // Below this width there's no sensible place to anchor a 360px popover
    // next to the tapped cell without it running off-screen — center it
    // like a small modal instead, same as when there's no anchor at all.
    const canAnchor = anchorRect && window.innerWidth > 640;

    if (canAnchor) {
      let top = anchorRect.top + window.scrollY + 20;
      let left = anchorRect.left + window.scrollX;

      if (left + 360 > window.innerWidth) left = window.innerWidth - 380;
      left = Math.max(8, left);

      qc.style.top = top + 'px';
      qc.style.left = left + 'px';
      qc.style.transform = '';
    } else {
      qc.style.top = '50%';
      qc.style.left = '50%';
      qc.style.transform = 'translate(-50%, -50%)';
    }
    
    const input = document.getElementById('qc-input');
    if (input) {
      input.value = '';
      setTimeout(() => input.focus(), 10);
    }
  }
  
  function close() {
    const qc = document.getElementById('quick-create');
    if (qc) {
      qc.style.display = 'none';
      qc.style.transform = '';
    }
    selectedDate = null;
  }
  
  function save() {
    const input = document.getElementById('qc-input');
    if (!input || !input.value.trim()) return;
    
    const title = input.value.trim();
    const categories = NotesStore.getCategories();
    const categoryObj = categories.find(c => c.id === selectedCategory) || categories[0];
    
    NotesStore.create({
      title,
      description: '',
      startDate: selectedDate,
      endDate: selectedDate,
      category: categoryObj.id,
      color: categoryObj.color,
      status: 'AGENDA',
      emoji: '📝'
    });
    
    close();
    Calendar.render();
  }
  
  return { init, open, close };
})();

document.addEventListener('DOMContentLoaded', QuickCreate.init);
