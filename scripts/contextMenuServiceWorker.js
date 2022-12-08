const getKey = () => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["openai-key"], (result) => {
      if (result["openai-key"]) {
        const decodedKey = atob(result["openai-key"]);
        resolve(decodedKey);
      }
    });
  });
};

const sendMessage = (content) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0].id;

    chrome.tabs.sendMessage(
      activeTab,
      { message: "inject", content },
      (response) => {
        if (response.status === "failed") {
          console.log("injection failed.");
        }
      }
    );
  });
};

// New function here
const generate = async (prompt) => {
  // Get your API key from storage
  const key = await getKey();
  const url = "https://api.openai.com/v1/completions";

  // Call completions endpoint
  const completionResponse = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "text-davinci-003",
      prompt: prompt,
      max_tokens: 1250,
      temperature: 0.7,
    }),
  });

  // Select the top choice and send back
  const completion = await completionResponse.json();
  return completion.choices.pop();
};

const generateCompletionAction = async (info) => {
  try {
    sendMessage("generating...");
    const tenantDetails = (tenantGroup) => {
      let details = "";
      tenantGroup.tenantDetails.forEach((tenant, index) => {
        details += `Tenant ${index + 1}\n`;
        Object.keys(tenant).forEach((key) => {
          details += `- ${key} = ${tenant[key]}\n`;
        });
      });
      return details;
    };

    const getTenantGroup = () => {
      return new Promise((resolve, reject) => {
        chrome.storage.local.get(["rentletter-tenant-group"], (result) => {
          if (result["rentletter-tenant-group"]) {
            resolve(result["rentletter-tenant-group"]);
          }
        });
      });
    };

    const tenantArray = await getTenantGroup();

    const tenantGroup = {
      tenantDetails: tenantArray,
      relationshipType: "in a relationship",
    };

    if (tenantGroup) {
      console.log(tenantArray);
      console.log(tenantGroup);
      const pronoun = () =>
        tenantGroup.tenantDetails.length == 1 ? "I" : "we";
      const declarative = () =>
        tenantGroup.tenantDetails.length == 1 ? "I am" : "We are";
      const possessivePronoun = () =>
        tenantGroup.tenantDetails.length == 1 ? "my" : "our";

      const tenantPlural = () =>
        tenantDetails.length > 1 ? "good tenants" : "a good tenant";

      const prompt = `${declarative()} ${(tenantGroup.tenantRelationship = ""
        ? "an individual tenant."
        : tenantGroup.tenantRelationship)}. Write a letter that ${pronoun()} can attach to a house offer to convince the landlord that ${pronoun()} would be ${tenantPlural()}, and that they should choose ${possessivePronoun()} offer. The letter should be 500+ characters, written in British English, and be emotionally persuasive.`;

      const basePromptPrefix = prompt;

      //   console.log(`API: ${basePromptPrefix}\n\n${tenantDetails(tenantGroup)}`);

      const finalPrompt = `${basePromptPrefix}\n\n${tenantDetails(
        tenantGroup
      )}\n\nLetter:\n`;

      // Add this to call GPT-3
      const baseCompletion = await generate(finalPrompt);

      // Let's see what we get!
      console.log(baseCompletion.text);
      sendMessage(baseCompletion.text);
    }
  } catch (error) {
    console.log(error);
    sendMessage(error.toString());
  }
};

// Don't touch this
chrome.contextMenus.create({
  id: "context-run",
  title: "Generate letter",
  contexts: ["editable"],
});

chrome.contextMenus.onClicked.addListener(generateCompletionAction);
