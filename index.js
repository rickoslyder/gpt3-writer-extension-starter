const checkForKey = () => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["openai-key"], (result) => {
      resolve(result["openai-key"]);
    });
  });
};

const checkForExistingTenantGroup = () => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["rentletter-tenant-group"], (result) => {
      console.log(result);
      resolve(result["rentletter-tenant-group"]);
    });
  });
};

const encode = (input) => {
  return btoa(input);
};

const saveKey = async () => {
  const input = document.getElementById("key_input");

  if (input) {
    const { value } = input;

    // Encode String
    const encodedValue = encode(value);

    // Save to google storage
    chrome.storage.local.set({ "openai-key": encodedValue }, () => {
      document.getElementById("key_needed").style.display = "none";
      document.getElementById("key_entered").style.display = "block";
    });
  }
};

const changeKey = () => {
  document.getElementById("key_needed").style.display = "block";
  document.getElementById("key_entered").style.display = "none";
};

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

const getTenantGroup = () => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["rentletter-tenant-group"], (result) => {
      if (result["rentletter-tenant-group"]) {
        resolve(result["rentletter-tenant-group"]);
      }
    });
  });
};

const saveTenant = async (event) => {
  const form = document.getElementById("tenantInputForm");

  // on form submission, prevent default
  event.preventDefault();

  // construct a FormData object, which fires the formdata event
  const formData = new FormData(form);

  if (form) {
    const tenant = Object.fromEntries(formData);

    checkForExistingTenantGroup().then((response) => {
      if (response) {
        const data = response;
        chrome.storage.local.set(
          { "rentletter-tenant-group": [...data, tenant] },
          () => {
            document.getElementById("tenants_needed").style.display = "none";
            document.getElementById("tenants_entered").style.display = "block";
          }
        );
      } else {
        // Save to google storage
        chrome.storage.local.set(
          { "rentletter-tenant-group": [tenant] },
          () => {
            document.getElementById("tenants_needed").style.display = "none";
            document.getElementById("no_tenants_yet").style.display = "none";
            document.getElementById("tenants_entered").style.display = "block";
          }
        );

        console.log("Tenant saved");
      }
    });
  }
};

const addNewTenant = () => {
  document.getElementById("tenants_needed").style.display = "block";
  document.getElementById("tenants_entered").style.display = "none";
  document.getElementById("no_tenants_yet").style.display = "none";
};

document.getElementById("save_key_button").addEventListener("click", saveKey);
document
  .getElementById("change_key_button")
  .addEventListener("click", changeKey);

checkForKey().then((response) => {
  if (response) {
    document.getElementById("key_needed").style.display = "none";
    document.getElementById("key_entered").style.display = "block";
  }
});

document
  .getElementById("save_tenant_button")
  .addEventListener("click", saveTenant);

document
  .getElementById("add-tenant-btn")
  .addEventListener("click", addNewTenant);

// const tenantGroup = getTenantGroup();

checkForExistingTenantGroup().then((response) => {
  if (response) {
    let tenantGroup = response;
    document.getElementById("tenants_needed").style.display = "none";
    document.getElementById("tenants_entered").style.display = "block";
    document.getElementById(
      "tenantCount"
    ).innerHTML = `You've added ${tenantGroup.length} tenants so far:`;
    console.log(tenantGroup);
    const tenantGroupArray = tenantGroup.reduce((tenants, nextTenant) => {
      return (tenants +=
        "<details><summary>" +
        nextTenant["name"] +
        " - " +
        nextTenant["age"] +
        '<button style="float: right" id=' +
        tenantGroup.indexOf(nextTenant) +
        ">Remove</button></summary>" +
        Object.keys(nextTenant).reduce((details, nextDetail) => {
          console.log(nextTenant, nextDetail, details);
          return (details +=
            "<ul><li>" +
            nextDetail +
            ": " +
            nextTenant[nextDetail] +
            "</li></ul>");
        }, "") +
        "</details>");
    }, "");

    document.getElementById("existing-tenants").innerHTML = tenantGroupArray;
  }
});

/* const form = document.forms.namedItem("tenantInputForm");
formElem.addEventListener('submit', (e) => {
    // on form submission, prevent default
    e.preventDefault();
  
    // construct a FormData object, which fires the formdata event
    new FormData(formElem);
  }); */
