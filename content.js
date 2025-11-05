const zuoraEnvs = {
  sandbox: "https://apisandbox.zuora.com",
  PROD: "https://www.zuora.com",
};
const salesforceEnvs = {
  dev1: "https://gnmtouchpoint--dev1.sandbox.lightning.force.com",
  PROD: "https://gnmtouchpoint.lightning.force.com",
};

const zuoraId = /[0-9a-f]{32}/;
const zuoraSubName = /A-S\d{8}/;
const zuoraAccountName = /A\d{8}/;
const salesforceId = /[0-9A-Za-z]{18}/;
const identityId = /\d{9}/;
const emailAddress = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

const salesforceSearch = "{env}/_ui/search/ui/UnifiedSearchResults?str={id}";

const bigqueryConsole = 'https://console.cloud.google.com/bigquery?project=datatech-platform-prod';
const patterns = [
  {
    regex: zuoraId,
    linkText: "Zuora Susbcription",
    envs: zuoraEnvs,
    urlTemplate: "{env}/platform/subscriptions/{id}"
  },
  {
    regex: zuoraId,
    linkText: "Zuora Account",
    envs: zuoraEnvs,
    urlTemplate: "{env}/apps/CustomerAccount.do?method=view&id={id}"
  },
  {
    regex: zuoraSubName,
    linkText: "Zuora Subscription Search",
    envs: zuoraEnvs,
    urlTemplate: "{env}/platform/apps/search?searchTerm={id}&searchObjectType=subscription"
  },
  {
    regex: zuoraSubName,
    linkText: "Copy zuora fivetran bigquery",
    copyTextTemplate: `select rp.name, rpc.name
from \`datatech-fivetran.zuora.subscription\` s
join \`datatech-fivetran.zuora.rate_plan\` rp on rp.subscription_id = s.id
join \`datatech-fivetran.zuora.rate_plan_charge\` rpc on rpc.rate_plan_id = rp.id
where 1 = 1
  and s.status in ('Active', 'Cancelled')
  and s.name = '{id}'`,
    targetUrl: bigqueryConsole,
  },
  {
    regex: zuoraAccountName,
    linkText: "Zuora account Search",
    envs: zuoraEnvs,
    urlTemplate: "{env}/platform/apps/search?searchTerm={id}&searchObjectType=account"
  },
  {
    regex: salesforceId,
    linkText: "Salesforce subscription",
    envs: salesforceEnvs,
    urlTemplate: "{env}/lightning/r/SF_Subscription__c/{id}/view"
  },
  {
    regex: salesforceId,
    linkText: "Salesforce contact",
    envs: salesforceEnvs,
    urlTemplate: "{env}/lightning/r/Contact/{id}/view"
  },
  {
    regex: salesforceId,
    linkText: "Salesforce search",
    envs: salesforceEnvs,
    urlTemplate: salesforceSearch
  },
  {
    regex: zuoraSubName,
    linkText: "Salesforce search",
    envs: salesforceEnvs,
    urlTemplate: salesforceSearch
  },
  {
    regex: zuoraId,
    linkText: "Salesforce search",
    envs: salesforceEnvs,
    urlTemplate: salesforceSearch
  },
  {
    regex: identityId,
    linkText: "Salesforce search",
    envs: salesforceEnvs,
    urlTemplate: salesforceSearch
  },
  {
    regex: identityId,
    linkText: "Copy identity bigquery",
    copyTextTemplate: `select i.primary_email_address
from \`datatech-platform-prod.datalake.identity\` i
where 1=1
  and i.id = '{id}'`,
    targetUrl: bigqueryConsole,
  },
  {
    regex: emailAddress,
    linkText: "Salesforce search",
    envs: salesforceEnvs,
    urlTemplate: salesforceSearch
  },
  {
    regex: emailAddress,
    linkText: "Copy identity bigquery",
    copyTextTemplate: `select i.id
from \`datatech-platform-prod.datalake.identity\` i
where 1=1
  and i.primary_email_address = '{id}'`,
    targetUrl: bigqueryConsole,
  },
];

function removeTooltipIfEventOutside(e, win) {
  console.log("remove tooltip?", e.target, win._zuoraTooltip);
  if (!win._zuoraTooltip || !e) return true;
  // if (!win._zuoraTooltip.contains(e.target)) {
    console.log("removing tooltip");
    win._zuoraTooltip.remove();
    win._zuoraTooltip = null;
  //   return true;
  // }
  // return true;
}

function createTooltip(links, x, y) {
  const tooltip = document.createElement('div');
  links.forEach(linkData => {
    const linkLine = document.createElement('div');
    if (linkData.urls) {
      linkData.urls.forEach(({name, url}, idx) => {
        if (idx !== 0) {
          linkLine.appendChild(document.createTextNode(' ')); // Add a space between links
        }
        const link = document.createElement('a');
        link.href = url;
        link.textContent = (idx === 0 ? linkData.linkText + " " : "") + "(" + name + ")";
        link.target = '_blank';
        linkLine.appendChild(link);
      });
    } else {
      const link = document.createElement('a');
      link.href = linkData.targetUrl;
      link.textContent = linkData.linkText + " (copy and navigate)";
      link.target = '_blank';
      link.addEventListener('click', function(event) {
        // event.preventDefault();
        navigator.clipboard.writeText(linkData.copyText).then(function() {
          console.log('Copied to clipboard!');
        }, function(err) {
          alert('Failed to copy: ' + err);
        });
      });
      linkLine.appendChild(link);
    }

    tooltip.appendChild(linkLine);
  });

  tooltip.style.position = 'absolute';
  tooltip.style.background = '#fff';
  tooltip.style.border = '1px solid #ccc';
  tooltip.style.padding = '2px 6px';
  tooltip.style.zIndex = 10000;
  tooltip.style.fontSize = '18px';
  tooltip.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
  tooltip.style.borderRadius = '4px';
  tooltip.style.color = '#0073bb';
  tooltip.style.textDecoration = 'underline';
  tooltip.style.left = (x + 10) + 'px';
  tooltip.style.top = (y) + 'px';

  return tooltip;
}

function showTooltipForSelectionInWindow(win, e) {
  console.log("showTooltipForSelectionInWindow", win, e);
  if (!removeTooltipIfEventOutside(e, win)) return;

  const selection = win.getSelection();
  console.log("selection", selection);
  if (!selection) return;
  const selectedText = selection.toString().trim();
  console.log("selectedText", selectedText);
  if (selectedText === "") return;

  const links = patterns
      .map(({ regex, ...pattern }) => {
        // Only match if the whole selectedText matches the pattern
        const fullRegex = new RegExp('^' + regex.source + '$', regex.flags);
        const matches = selectedText.match(fullRegex);
        return matches ? { ...pattern, id: matches[0] } : null;
      })
      .filter(Boolean)
      .map (({ id, envs, urlTemplate, linkText, copyTextTemplate, targetUrl }) => {
        if (urlTemplate) {
          const urlWithId = urlTemplate.replace('{id}', id);
          const urls = envs ? Object.entries(envs)
              .map(([name, baseUrl]) =>
                  ({name, url: urlWithId.replace('{env}', baseUrl)})
              ) : [urlWithId];
          return {linkText, urls};
        } else if (copyTextTemplate) {
          const copyText = copyTextTemplate.replace('{id}', id);
          return {linkText, copyText, targetUrl}
        }
      });

  if (links.length === 0) return;

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  let tooltipX, tooltipY;
  if (rect.right !== 0) {
    tooltipX = rect.right;
    tooltipY = rect.top;
  } else {
    tooltipX = window.innerWidth / 2;
    tooltipY = window.innerHeight / 2;
  }

  const tooltip = createTooltip(links, win.scrollX + tooltipX, win.scrollY + tooltipY);

  win.document.body.appendChild(tooltip);
  console.log("setting _zuoraTooltip", tooltip);
  win._zuoraTooltip = tooltip;

  function removeTooltip(e) {
    removeTooltipIfEventOutside(e, win);
    win.document.removeEventListener('selectionchange', removeTooltip);
  }
  win.document.addEventListener('selectionchange', removeTooltip);
}

// Listen for messages from the background script to open Salesforce search
chrome.runtime && chrome.runtime.onMessage && chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.type === 'SALESFORCE_SEARCH' && msg.env && msg.selectedText) {
    const url = salesforceSearch
      .replace('{env}', msg.env)
      .replace('{id}', encodeURIComponent(msg.selectedText));
    window.open(url, '_blank');
  }
});

function injectSelectionListener(win) {
  win.document.addEventListener('selectionchange', (e) => showTooltipForSelectionInWindow(win, e));
}

function injectIntoIframes(nodes) {
  let iframes = [];
  if (nodes) {
    nodes.forEach(node => {
      if (node.nodeType === 1) { // Element
        iframes = iframes.concat(Array.from(node.querySelectorAll('iframe')));
        if (node.tagName === 'IFRAME') {
          iframes.push(node);
        }
      }
    });
  } else {
    iframes = Array.from(document.querySelectorAll('iframe'));
  }
  for (const iframe of iframes) {
    try {
      if (iframe.contentWindow && iframe.contentDocument) {
        injectSelectionListener(iframe.contentWindow);
      }
    } catch (e) {
      // Ignore cross-orin iframes
    }
  }
}

const observer = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    if (mutation.addedNodes.length) {
      injectIntoIframes(mutation.addedNodes);
    }
  });
});

// MAIN //
injectSelectionListener(window);
injectIntoIframes();
observer.observe(document.body, { childList: true, subtree: true });
