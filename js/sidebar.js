const Sidebar = (function() {
  function init() {
    const items = document.querySelectorAll('.sidebar__item, .panel__item');
    items.forEach(item => {
      item.addEventListener('click', function() {
        if (!this.classList.contains('sidebar__item')) {
           const siblings = this.parentElement.querySelectorAll('.panel__item');
           siblings.forEach(s => s.classList.remove('panel__item--active'));
           this.classList.add('panel__item--active');
        } else {
           const siblings = this.parentElement.querySelectorAll('.sidebar__item');
           siblings.forEach(s => s.classList.remove('sidebar__item--active'));
           this.classList.add('sidebar__item--active');
        }
        // On mobile the sidebar/panel are an overlay drawer — picking
        // something in it should close it, same as any mobile nav menu.
        closeMobileNav();
      });
    });

    const menuBtn = document.getElementById('mobile-menu-btn');
    const backdrop = document.getElementById('mobile-backdrop');
    if (menuBtn) {
      menuBtn.addEventListener('click', function() {
        document.body.classList.toggle('mobile-nav-open');
      });
    }
    if (backdrop) {
      backdrop.addEventListener('click', closeMobileNav);
    }

    initPanelToggle();
  }

  function closeMobileNav() {
    document.body.classList.remove('mobile-nav-open');
  }

  const PANEL_COLLAPSED_KEY = 'clickup_panel_collapsed';

  function initPanelToggle() {
    const panel = document.getElementById('panel');
    const toggleBtn = document.getElementById('panel-toggle');
    if (!panel || !toggleBtn) return;

    function setCollapsed(collapsed) {
      panel.classList.toggle('panel--collapsed', collapsed);
      toggleBtn.classList.toggle('is-collapsed', collapsed);
      toggleBtn.title = collapsed ? 'Expandir panel' : 'Colapsar panel';
      localStorage.setItem(PANEL_COLLAPSED_KEY, collapsed ? '1' : '0');
    }

    setCollapsed(localStorage.getItem(PANEL_COLLAPSED_KEY) === '1');

    toggleBtn.addEventListener('click', function() {
      setCollapsed(!panel.classList.contains('panel--collapsed'));
    });
  }

  return { init };
})();
document.addEventListener('DOMContentLoaded', Sidebar.init);
