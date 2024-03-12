<script>
  import Projects from "$lib/Projects.svelte";
  import projects from "$lib/projects.json";

  let profileData = {
    followers: 100,
    following: 100,
    public_repos: 100,
    public_gists: 100,
  };
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
<Projects projects={projects.slice(0, 3)} />

<section>
  <h2>My Github Stats</h2>
  <!-- {#await fetch("https://api.github.com/users/brianzheng205")}
    <p>Loading...</p>
  {:then response}
    {#await response.json()}
      <p>Decoding...</p>
    {:then data}
      <dl>
        <dt>Followers</dt>
        <dd>{data["followers"]}</dd>
        <dt>Following</dt>
        <dd>{data["following"]}</dd>
        <dt>Public Repos</dt>
        <dd>{data["public_repos"]}</dd>
      </dl>
    {:catch error}
      <p class="error">
        Something went wrong: {error.message}
      </p>
    {/await}
  {:catch error}
    <p class="error">
      Something went wrong: {error.message}
    </p>
  {/await} -->
  <dl>
    <div>
      <dt>FOLLOWERS</dt>
      <dd>{profileData["followers"]}</dd>
    </div>

    <div>
      <dt>FOLLOWING</dt>
      <dd>{profileData["following"]}</dd>
    </div>

    <div>
      <dt>PUBLIC REPOS</dt>
      <dd>{profileData["public_repos"]}</dd>
    </div>
  </dl>
</section>

<style>
  dl {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;

    div {
      display: flex;
      flex-direction: column;

      dt {
        font-weight: bold;
        font-size: 12px;
      }

      dd {
        margin: 0;
        font-size: 35px;
        line-height: normal;
        font-weight: 50;
      }
    }
  }
</style>
