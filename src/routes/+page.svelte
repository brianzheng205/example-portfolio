<script>
  import Projects from "$lib/Projects.svelte";
  import projects from '$lib/projects.json';
</script>

<svelte:head>
	<title>Brian Zheng Portfolio</title>
</svelte:head>
<h1>Brian Zheng</h1>
<p>
  Hi, I'm Brian. I'm a CS major at MIT and I'm always looking forward to
  working on meaningful projects.
</p>
<img src="images/black hole gif.gif" alt="black hole" />
<h2>Latest Projects</h2>
<Projects projects={projects.slice(0, 3)} />
