// Progressive enhancement only. Every feature here has a no-JavaScript fallback:
// the menu stays open as a plain link list, and the direct email and phone stay on the page.

const MOBILE_QUERY = window.matchMedia("(max-width: 54.99em)");

function setupMenu() {
  const button = document.querySelector(".menu-button");
  const nav = document.getElementById("site-nav");
  if (!button || !nav) return;

  const isOpen = () => button.getAttribute("aria-expanded") === "true";
  const setOpen = (open) => {
    button.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
  };

  button.addEventListener("click", () => setOpen(!isOpen()));

  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) setOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isOpen()) {
      setOpen(false);
      button.focus();
    }
  });

  // Close when focus or a pointer leaves the header area.
  document.addEventListener("click", (event) => {
    if (isOpen() && !button.contains(event.target) && !nav.contains(event.target)) setOpen(false);
  });
  nav.addEventListener("focusout", (event) => {
    if (
      isOpen() &&
      MOBILE_QUERY.matches &&
      !nav.contains(event.relatedTarget) &&
      event.relatedTarget !== button
    ) {
      setOpen(false);
    }
  });

  MOBILE_QUERY.addEventListener("change", () => setOpen(false));
}

function setupEmailWriter() {
  const form = document.getElementById("email-writer");
  const result = document.getElementById("email-result");
  if (!form || !result) return;

  const to = form.dataset.to;
  const subject = form.dataset.subject;
  const preview = document.getElementById("email-preview");
  const openLink = document.getElementById("email-open");
  const copyButton = document.getElementById("email-copy");
  const copyStatus = document.getElementById("copy-status");

  const checks = [
    { input: form.elements.namedItem("name"), message: "Enter your name." },
    {
      input: form.elements.namedItem("message"),
      message: "Tell me what Gardner should take on first.",
    },
  ];

  const showError = (input, message) => {
    const error = document.getElementById(`${input.id}-error`);
    error.textContent = message;
    error.hidden = !message;
    if (message) input.setAttribute("aria-invalid", "true");
    else input.removeAttribute("aria-invalid");
  };

  form.hidden = false;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    let firstInvalid = null;
    for (const { input, message } of checks) {
      const empty = input.value.trim() === "";
      showError(input, empty ? message : "");
      if (empty && !firstInvalid) firstInvalid = input;
    }
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    const name = form.elements.namedItem("name").value.trim();
    const street = form.elements.namedItem("street").value.trim();
    const message = form.elements.namedItem("message").value.trim();
    const body = `Hi Nate,\n\n${message}\n\n${name}${street ? `\n${street}` : ""}`;

    preview.textContent = body;
    openLink.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    copyStatus.textContent = "";
    result.hidden = false;
    result.focus();
  });

  copyButton.addEventListener("click", async () => {
    const text = `To: ${to}\nSubject: ${subject}\n\n${preview.textContent}`;
    try {
      await navigator.clipboard.writeText(text);
      copyStatus.textContent = "Copied.";
    } catch {
      copyStatus.textContent = "Copying didn't work here. Select the message above and copy it.";
    }
  });
}

setupMenu();
setupEmailWriter();
