// Runs before first paint. Marks that JavaScript is available so CSS can collapse the
// mobile menu only when the script that opens it will also run.
document.documentElement.classList.add("js");
