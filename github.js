// This rewrites GitHub's "blame" UI labels to the friendlier term "annotate".

/**
 * Query `selector` within `root`, also testing `root` itself.
 * querySelectorAll only returns *descendants*, so a newly-added node that is
 * itself the target element would otherwise be missed.
 *
 * @param {Element} root
 * @param {string} selector
 * @returns {Element[]}
 */
function findAll(root, selector) {
  const results = root.querySelectorAll ? Array.from(root.querySelectorAll(selector)) : [];
  if (root.matches && root.matches(selector)) results.unshift(root);
  return results;
}

/**
 * Replace the first direct text-node child of `el` whose trimmed value equals
 * `from` with `to`, preserving any surrounding whitespace.
 *
 * @param {Element} el
 * @param {string} from
 * @param {string} to
 */
function swapText(el, from, to) {
  for (const node of el.childNodes) {
    if (node.nodeType === Node.TEXT_NODE && node.nodeValue.trim() === from) {
      node.nodeValue = node.nodeValue.replace(from, to);
      return;
    }
  }
}

/**
 * Apply targeted blame→annotate replacements within `root`.
 * Called once on initial load and again for every batch of DOM additions.
 *
 * @param {Element} root
 */
function makeInclusiveLanguage(root) {
  // ── A. Segmented-control tab (Code / Blame toggle) ───────────────────────
  // [data-text="Blame"] is an exact-value attribute selector; nothing else on
  // the page matches it. We update both data-text (GitHub uses it for tab
  // width measurement in CSS) and the visible text node.
  for (const el of findAll(root, '[data-text="Blame"]')) {
    el.setAttribute('data-text', 'Annotate');
    swapText(el, 'Blame', 'Annotate');
  }

  // ── B. Action-list labels (per-line context menu) ────────────────────────
  // data-component="ActionList.Item.Label" is GitHub's React component marker
  // for every item label in an ActionList (menus, dropdowns, etc.).
  // The text-content check ensures only the blame entry is changed.
  for (const el of findAll(root, '[data-component="ActionList.Item.Label"]')) {
    const t = el.textContent.trim();
    if (t === 'View git blame') swapText(el, 'View git blame', 'View git annotate');
  }

  // ── C. File-header navigation button ("Blame" beside Raw / Edit) ─────────
  // GitHub nests every button's visible label in:
  //   <button>
  //     <span data-component="buttonContent">
  //       <span data-component="text">Blame</span>   ← target
  //     </span>
  //   </button>
  // Scoping to `button` descendants and checking exact text avoids touching
  // any other button labels (Raw, Edit, History, …).
  for (const el of findAll(root, 'button [data-component="buttonContent"] [data-component="text"]')) {
    if (el.textContent.trim() === 'Blame') swapText(el, 'Blame', 'Annotate');
  }
}

// ── Bootstrap ────────────────────────────────────────────────────────────────

makeInclusiveLanguage(document.body);

const observer = new MutationObserver(mutations => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        makeInclusiveLanguage(node);
      }
    }
  }
});

observer.observe(document.body, { childList: true, subtree: true });
