<script>
  import { page } from "$app/stores";
  import "../style.css";

  let pages = [
    { url: "./", title: "Home" },
    { url: "./resume", title: "Resume" },
    { url: "./projects", title: "Projects" },
    { url: "./contact", title: "Contact" },
    { url: "./meta", title: "Meta" },
    { url: "https://github.com/brianzheng205", title: "GitHub" },
  ];

  let root = globalThis?.document?.documentElement;
  let localStorage = globalThis.localStorage ?? {};
  let colorScheme = localStorage.colorScheme ?? "light dark";
  $: root?.style.setProperty("color-scheme", colorScheme);
  $: localStorage.colorScheme = colorScheme;
</script>

<nav>
  {#each pages as p}
    <a
      href={p.url}
      class:current={"." + $page.route.id === p.url}
      target={p.url.startsWith("http") ? "_blank" : null}
    >
      {p.title}
    </a>
  {/each}
</nav>

<label class="color-scheme">
  Theme:
  <select bind:value={colorScheme}>
    <option value="light dark">Automatic</option>
    <option value="light">Light</option>
    <option value="dark">Dark</option>
  </select>
</label>

<slot />

<style>
  nav {
    --border-color: oklch(50% 10% 200 / 40%);
    display: flex;
    margin-bottom: 2rem;
    border-bottom: 1px solid var(--border-color);
  }

  a {
    flex: 1;
    text-decoration: none;
    color: inherit;
    text-align: center;
    padding: 0.5rem;
  }

  a:hover {
    border-bottom: 0.4em solid var(--color-accent);
    padding-bottom: 0.1em;
  }

  .current {
    border-bottom: 0.4em solid var(--border-color);
    padding-bottom: 0.1em;
  }

  .color-scheme {
    position: absolute;
    top: 1rem;
    right: 3rem;
    font-family: inherit;
    font-size: 90%;
  }
</style>
