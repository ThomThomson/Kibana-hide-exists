const prompt = require("prompt-async");
const { Client } = require("@elastic/elasticsearch");

const promptSchema = {
  properties: {
    esUrl: {
      required: true,
      message: "Elasticsearch endpoint",
    },
    username: {
      pattern: /^[a-zA-Z\s\-]+$/,
      required: true,
    },
    password: {
      hidden: true,
      required: true,
    },
  },
};

const updateControlsJson = (originalJson) => {
  let updateCount = 0;
  const panelsParsed = JSON.parse(originalJson);
  for (let panel of Object.values(panelsParsed)) {
    if (panel.type !== "optionsListControl") continue;
    panel.explicitInput.hideExists = true;
    updateCount++;
  }
  return { newControlsJSON: JSON.stringify(panelsParsed), updateCount };
};

(async () => {
  prompt.start();
  const { esUrl, username, password } = await prompt.get(promptSchema);
  const kibanaIndex = ".kibana";
  const client = new Client({
    node: esUrl,
    auth: {
      username: username,
      password: password,
    },
  });

  const allDashboards = await client.search({
    index: ".kibana",
    body: {
      query: {
        match: {
          type: "dashboard",
        },
      },
      size: 10000,
    },
  });
  if (!allDashboards.hits?.hits) {
    return;
  }
  for (const hit of allDashboards.hits?.hits) {
    const dashboardId = hit._id;
    const dashboard = hit._source.dashboard;
    console.log("Analyzing: ", dashboard.title);
    const { newControlsJSON, updateCount } = updateControlsJson(
      dashboard.controlGroupInput.panelsJSON
    );

    if (updateCount === 0) {
      console.log("--No controls to update\n");
      continue;
    }

    await client.update({
      index: kibanaIndex,
      id: dashboardId,
      body: {
        doc: {
          dashboard: {
            controlGroupInput: {
              panelsJSON: newControlsJSON,
            },
          },
        },
      },
    });
    console.log(`--updated ${updateCount} panels\n`);
  }
})();
