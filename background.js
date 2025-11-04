const salesforceEnvs = {
  dev1: "https://gnmtouchpoint--dev1.sandbox.lightning.force.com",
  PROD: "https://gnmtouchpoint.lightning.force.com",
};

chrome.runtime.onInstalled.addListener(() => {
  Object.entries(salesforceEnvs).forEach(([envName, envUrl]) => {
    chrome.contextMenus.create({
      id: `salesforce-search-${envName}`,
      title: `Search Salesforce (${envName}) for "%s"`,
      contexts: ["selection"],
    });
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId.startsWith('salesforce-search-') && info.selectionText && tab.id) {
    const envKey = info.menuItemId.replace('salesforce-search-', '');
    const env = salesforceEnvs[envKey];
    chrome.tabs.sendMessage(tab.id, {
      type: 'SALESFORCE_SEARCH',
      env,
      selectedText: info.selectionText
    });
  }
});

