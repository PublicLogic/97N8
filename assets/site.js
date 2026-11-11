(function () {
  // Mobile menu
  var button = document.querySelector('.navtoggle');
  var nav = document.getElementById('navigation');
  if (button && nav) {
    var close = function () {
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-label', 'Open menu');
      nav.classList.remove('open');
    };
    button.addEventListener('click', function () {
      if (button.getAttribute('aria-expanded') === 'true') { close(); return; }
      button.setAttribute('aria-expanded', 'true');
      button.setAttribute('aria-label', 'Close menu');
      nav.classList.add('open');
    });
    nav.querySelectorAll('a').forEach(function (link) { link.addEventListener('click', close); });
    document.addEventListener('click', function (e) {
      if (!button.contains(e.target) && !nav.contains(e.target)) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') { close(); button.focus(); }
    });
    window.addEventListener('resize', function () { if (window.innerWidth > 880) close(); });
  }

  // Email writer: builds a message for the visitor to send from their own account. Nothing is stored or sent.
  var form = document.getElementById('talk-form');
  if (!form) return;
  var TO = 'nate@boudreauforrep.org';
  var result = document.getElementById('result');
  var out = document.getElementById('msg-out');
  var err = document.getElementById('form-error');
  var mail = document.getElementById('mail-link');
  var copyBtn = document.getElementById('copy-btn');
  var copyStatus = document.getElementById('copy-status');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var nameEl = document.getElementById('f-name');
    var msgEl = document.getElementById('f-msg');
    var name = nameEl.value.trim();
    var street = document.getElementById('f-street').value.trim();
    var msg = msgEl.value.trim();
    if (!name) { err.textContent = 'Please add your name.'; nameEl.setAttribute('aria-invalid', 'true'); nameEl.focus(); return; }
    nameEl.removeAttribute('aria-invalid');
    if (!msg) { err.textContent = 'Please tell me what Gardner should take on first.'; msgEl.setAttribute('aria-invalid', 'true'); msgEl.focus(); return; }
    msgEl.removeAttribute('aria-invalid');
    err.textContent = '';
    var body = 'Hi Nate,\n\n' + msg + '\n\n' + name + (street ? '\n' + street : '');
    out.textContent = body;
    mail.href = 'mailto:' + TO + '?subject=' + encodeURIComponent('Thoughts about Gardner') + '&body=' + encodeURIComponent(body);
    copyStatus.textContent = '';
    result.hidden = false;
    result.focus();
  });

  copyBtn.addEventListener('click', function () {
    var text = 'To: ' + TO + '\nSubject: Thoughts about Gardner\n\n' + out.textContent;
    var fail = function () { copyStatus.textContent = "Copying didn't work here. Select the message above and copy it."; };
    try {
      navigator.clipboard.writeText(text).then(function () { copyStatus.textContent = 'Copied.'; }, fail);
    } catch (x) { fail(); }
  });
})();
