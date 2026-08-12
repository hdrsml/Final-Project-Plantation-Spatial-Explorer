const NAV_ITEMS = [
  { page: "home", label: "Home", href: "/" },
  { page: "dashboard", label: "Dashboard", href: "/dashboard.html" },
  { page: "about", label: "About", href: "/about.html" },
];

export function mountSiteHeader(activePage) {
  const mount = document.getElementById("site-header");

  if (!mount) return;

  const navLinks = NAV_ITEMS.map((item) => {
    const activeClass = item.page === activePage ? " is-active" : "";
    return `<a class="site-nav-link${activeClass}" href="${item.href}">${item.label}</a>`;
  }).join("");

  mount.innerHTML = `
    <a class="site-brand" href="/">
      <span class="site-brand-mark">&#9670;</span>
      <span class="site-brand-text">
        <strong>Plantation Spatial Explorer</strong>
        <small>PT Mencari Cinta Sejati</small>
      </span>
    </a>
    <nav class="site-nav">${navLinks}</nav>
  `;
}
