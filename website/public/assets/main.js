(function () {
  "use strict";

  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    var id = btn.getAttribute("data-copy");
    if (!id) return;
    var el = document.getElementById(id);
    if (!el) return;
    btn.addEventListener("click", function () {
      var text = el.textContent || "";
      var status = document.getElementById("copy-status");
      function done(msg) {
        if (status) {
          status.textContent = msg;
        }
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(
          function () {
            done("Copied.");
          },
          function () {
            done("Copy failed — select the text in the box.");
          }
        );
      } else {
        done("Select the text in the box to copy (clipboard API unavailable).");
      }
    });
  });
})();
