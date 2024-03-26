<script>
  import * as d3 from "d3";
  import { onMount } from "svelte";

  import Stats from "$lib/Stats.svelte";

  let data = [];
  let commits = [];
  let stats = [];

  onMount(async () => {
    data = await d3.csv("loc.csv", (row) => ({
      ...row,
      line: Number(row.line),
      depth: Number(row.depth),
      length: Number(row.length),
      date: new Date(row.date + "T00:00" + row.timezone),
      datetime: new Date(row.datetime),
    }));
    commits = d3
      .groups(data, (d) => d.commit)
      .map(([commit, lines]) => {
        let first = lines[0];
        let { author, date, time, timezone, datetime } = first;
        let ret = {
          id: commit,
          url: "https://github.com/vis-society/lab-7/commit/" + commit,
          author,
          date,
          time,
          timezone,
          datetime,
          hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
          totalLines: lines.length,
        };

        Object.defineProperty(ret, "lines", {
          value: lines,
          configurable: true,
          writable: true,
          enumerable: false,
        });

        return ret;
      });
    stats = [
      { title: "TOTAL LINES", data: data.length },
      { title: "TOTAL COMMITS", data: commits.length },
      { title: "NUMBER OF FILES", data: d3.group(data, (d) => d.file).size },
      { title: "LONGEST FILE LENGTH", data: d3.max(data, (d) => d.length) },
      { title: "LONGEST LINE LENGTH", data: d3.max(data, (d) => d.line) },
      { title: "DEEPEST LINE DEPTH", data: d3.max(data, (d) => d.depth) },
    ];
  });
</script>

<svelte:head>
  <title>Meta</title>
</svelte:head>
<h1>Meta</h1>
<p>This page contains data stats about the code of this website.</p>
<Stats {stats} />
