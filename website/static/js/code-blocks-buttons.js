/* global ClipboardJS */

window.addEventListener('load', function () {
  function button(label, ariaLabel, icon, className) {
    const btn = document.createElement('button');
    btn.classList.add('btnIcon', className);
    btn.setAttribute('aria-label', ariaLabel);
    btn.innerHTML =
      '<div class="btnIcon__body">' +
      icon +
      '<strong class="btnIcon__label">' +
      label +
      '</strong>' +
      '</div>' +
      '</button>';
    return btn;
  }

  function addButtons(codeBlockSelector, btn) {
    document.querySelectorAll(codeBlockSelector).forEach(function (code) {
      code.parentNode.appendChild(btn.cloneNode(true));
    });
  }

  const copyIcon =
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>';

  addButtons(
    '.hljs',
    button('', 'Copy code to clipboard', copyIcon, 'btnClipboard')
  );

  const clipboard = new ClipboardJS('.btnClipboard', {
    target: function (trigger) {
      return trigger.parentNode.querySelector('code');
    },
  });

  clipboard.on('success', function (event) {
    event.clearSelection();
    const textEl = event.trigger.querySelector('.btnIcon__label');
    textEl.textContent = 'Copied';
    setTimeout(function () {
      textEl.textContent = '';
    }, 2000);
  });
});

