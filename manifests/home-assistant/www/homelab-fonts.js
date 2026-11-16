// Loads IBM Plex (Sans, Sans Condensed, Mono) for the Graphite theme. Served at /local/homelab-fonts.js.
(() => {
  if (document.getElementById("homelab-fonts")) return;
  const link = document.createElement("link");
  link.id = "homelab-fonts";
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500" +
    "&family=IBM+Plex+Sans+Condensed:wght@500;600;700" +
    "&family=IBM+Plex+Sans:wght@400;500;600&display=swap";
  document.head.appendChild(link);
})();
