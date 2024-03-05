<script>
  import { page } from '$app/stores';
  import "../style.css";
  
  let pages = [
    {url: "./", title: "Home"},
    {url: "./resume", title: "Resume"},
    {url: "./projects", title: "Projects"},
    {url: "./contact", title: "Contact"},
    {url: "https://github.com/brianzheng205", title: "GitHub"},
  ];
</script>

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
</style>

<nav>
	{#each pages as p}
  <a
    href={ p.url }
    class:current={ "." + $page.route.id === p.url }
    target={ p.url.startsWith("http") ? "_blank" : null }
  >
    { p.title }
  </a>
	{/each}
</nav>

<slot />