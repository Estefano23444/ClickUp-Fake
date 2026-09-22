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
      });
    });
  }
  return { init };
})();
document.addEventListener('DOMContentLoaded', Sidebar.init);
