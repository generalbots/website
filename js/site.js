document.addEventListener('DOMContentLoaded', function () {

  var mobileToggle = document.getElementById('mobile-menu-toggle');
  var mobileMenu = document.getElementById('mobile-menu');
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', function () {
      mobileMenu.classList.toggle('hidden');
      var icon = mobileToggle.querySelector('.menu-icon');
      var closeIcon = mobileToggle.querySelector('.close-icon');
      if (icon && closeIcon) {
        icon.classList.toggle('hidden');
        closeIcon.classList.toggle('hidden');
      }
    });
  }

  document.querySelectorAll('.mobile-nav-link').forEach(function (link) {
    link.addEventListener('click', function () {
      if (mobileMenu) mobileMenu.classList.add('hidden');
      var icon = mobileToggle ? mobileToggle.querySelector('.menu-icon') : null;
      var closeIcon = mobileToggle ? mobileToggle.querySelector('.close-icon') : null;
      if (icon) icon.classList.remove('hidden');
      if (closeIcon) closeIcon.classList.add('hidden');
    });
  });

  document.querySelectorAll('.mobile-dropdown-trigger').forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      var content = this.nextElementSibling;
      if (content && content.classList.contains('mobile-dropdown-content')) {
        content.classList.toggle('hidden');
      }
    });
  });

  var dropdowns = document.querySelectorAll('.nav-dropdown');
  dropdowns.forEach(function (dd) {
    var trigger = dd.querySelector('.nav-dropdown-trigger');
    var content = dd.querySelector('.nav-dropdown-content');
    if (!trigger || !content) return;
    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = !content.classList.contains('hidden');
      document.querySelectorAll('.nav-dropdown-content').forEach(function (c) { c.classList.add('hidden'); });
      if (!isOpen) content.classList.remove('hidden');
    });
  });
  document.addEventListener('click', function () {
    document.querySelectorAll('.nav-dropdown-content').forEach(function (c) { c.classList.add('hidden'); });
  });

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-in-up');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal').forEach(function (el) {
    el.style.opacity = '0';
    observer.observe(el);
  });

  var gtranslateSettings = document.createElement('script');
  gtranslateSettings.textContent = 'window.gtranslateSettings={default_language:"pt",detect_browser_language:true,languages:["en","fr","it","es","pt","zh-CN","ru","ar","ja"],wrapper_selector:".gtranslate_wrapper",switcher_horizontal_position:"right",alt_flags:{"en":"usa","pt":"brazil"}};';
  document.head.appendChild(gtranslateSettings);

  var gc = document.createElement('script');
  gc.async = true;
  gc.src = '//gc.zgo.at/count.js';
  gc.setAttribute('data-goatcounter', 'https://generalbots-pragmatismo.goatcounter.com/count');
  document.body.appendChild(gc);

  var gt = document.createElement('script');
  gt.src = 'https://cdn.gtranslate.net/widgets/latest/float.js';
  gt.defer = true;
  document.body.appendChild(gt);

  var header = document.querySelector('.nav-header') || document.querySelector('.site-header');
  if (header) {
    var shrunk = false;
    window.addEventListener('scroll', function () {
      var shouldShrink = window.scrollY > 60;
      if (shouldShrink !== shrunk) {
        shrunk = shouldShrink;
        header.classList.toggle('header-shrunk', shouldShrink);
      }
    }, { passive: true });
  }
});
