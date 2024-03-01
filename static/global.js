function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// NAVIGATION BAR
let pages = {
  ".": "Home",
  resume: "Resume",
  projects: "Projects",
  contact: "Contact",
  "https://github.com/brianzheng205": "GitHub",
};

let nav = document.createElement("nav");
document.body.prepend(nav);

for (let url in pages) {
  let title = pages[url];
  let a = document.createElement("a");
  a.href = url;
  a.textContent = title;

  a.classList.toggle(
    "current",
    a.host === location.host && a.pathname === location.pathname
  );

  if (a.host !== location.host) {
    a.target = "_blank";
  }

  nav.append(a);
}

// COLOR THEME
const autoColor = matchMedia("(prefers-color-scheme: dark)").matches
  ? "Dark"
  : "Light";
document.body.insertAdjacentHTML(
  "afterbegin",
  `
	<label class="color-scheme">
		Theme:
		<select>
      <option value="light dark">Automatic (${autoColor})</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
		</select>
	</label>`
);

function setColorScheme(colorScheme) {
  document.documentElement.style.setProperty("color-scheme", colorScheme);
}

let select = document.querySelector("select");
// load user preference
if ("colorScheme" in localStorage) {
  setColorScheme(localStorage.colorScheme);
  select.value = localStorage.colorScheme;
}

select.addEventListener("input", function (event) {
  setColorScheme(event.target.value);
  localStorage.colorScheme = event.target.value;
});
