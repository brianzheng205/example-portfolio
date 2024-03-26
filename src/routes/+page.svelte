<script>
  import { onMount } from "svelte";

  import Projects from "$lib/Projects.svelte";
  import Stats from "$lib/Stats.svelte";

  import projects from "$lib/projects.json";

  let stats = [];

  onMount(async () => {
    const response = await fetch("https://api.github.com/users/brianzheng205");
    const data = await response.json();

    stats = [
      { title: "FOLLOWERS", data: data["followers"] },
      { title: "FOLLOWING", data: data["following"] },
      { title: "PUBLIC REPOS", data: data["public_repos"] },
    ];
  });
</script>

<svelte:head>
  <title>Brian Zheng Portfolio</title>
</svelte:head>
<h1>Brian Zheng</h1>
<p>
  Hi, I'm Brian. I'm a CS major at MIT and I'm always looking forward to working
  on meaningful projects.
</p>
<img src="images/black hole gif.gif" alt="black hole" />
<h2>Latest Projects</h2>
<Projects projects={projects.slice(0, 3)} hLevel="3" />

<section>
  <h2>My Github Stats</h2>
  <Stats {stats} />
</section>
