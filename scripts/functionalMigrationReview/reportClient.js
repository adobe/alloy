/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { h, render } from "preact";
// These package subpaths are public exports, but the repo's resolver does not inspect exports.
// eslint-disable-next-line import/extensions
import { useEffect, useRef, useState } from "preact/hooks";
// eslint-disable-next-line import/named
import { animate } from "motion/mini";

/* global document, window */

const readPreference = (key) => {
  try {
    return localStorage.getItem(key) === "true";
  } catch {
    return false;
  }
};

const writePreference = (key, value) => {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // Local reports can run under storage-restricted file URLs.
  }
};

const setWordWrap = (enabled) => {
  document.querySelectorAll("diffs-container").forEach((container) => {
    container.shadowRoot
      ?.querySelectorAll("[data-overflow]")
      .forEach((diff) => {
        diff.dataset.overflow = enabled ? "wrap" : "scroll";
      });
  });
};

const ReportControls = () => {
  const shell = document.querySelector(".shell");
  const sidebar = document.querySelector(".sidebar");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const initialCollapsed = readPreference("migration-review-sidebar-collapsed");
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [wordWrap, setWrap] = useState(() =>
    readPreference("migration-review-word-wrap"),
  );
  const collapseTarget = useRef(initialCollapsed);
  const sidebarAnimation = useRef();
  const initialized = useRef(false);

  if (!initialized.current) {
    shell.classList.toggle("sidebar-collapsed", initialCollapsed);
    initialized.current = true;
  }

  useEffect(() => setWordWrap(wordWrap), [wordWrap]);

  const toggleSidebar = async (event) => {
    const nextCollapsed = !collapseTarget.current;
    const shouldAnimate = event.detail > 0 && !reduceMotion.matches;
    collapseTarget.current = nextCollapsed;
    setCollapsed(nextCollapsed);
    writePreference("migration-review-sidebar-collapsed", nextCollapsed);
    sidebarAnimation.current?.stop();

    if (!shouldAnimate) {
      shell.classList.toggle("sidebar-collapsed", nextCollapsed);
      return;
    }

    if (!nextCollapsed) {
      shell.classList.remove("sidebar-collapsed");
    }

    const animation = animate(
      sidebar,
      {
        opacity: nextCollapsed ? 0 : 1,
        transform: nextCollapsed ? "translateX(-12px)" : "translateX(0)",
      },
      nextCollapsed
        ? { duration: 0.16, ease: [0.23, 1, 0.32, 1] }
        : { type: "spring", duration: 0.32, bounce: 0 },
    );
    sidebarAnimation.current = animation;
    try {
      await animation.finished;
      if (nextCollapsed && collapseTarget.current) {
        shell.classList.add("sidebar-collapsed");
      }
    } catch {
      // A new toggle intentionally interrupts the current animation.
    }
  };

  const toggleWrap = () => {
    const nextWordWrap = !wordWrap;
    setWrap(nextWordWrap);
    setWordWrap(nextWordWrap);
    writePreference("migration-review-word-wrap", nextWordWrap);
  };

  return h(
    "div",
    { class: "view-actions" },
    h(
      "a",
      {
        class: "home-link",
        href: "./index.html",
        "aria-label": "Back to all reports",
      },
      h("span", { "aria-hidden": "true" }, "←"),
      "All reports",
    ),
    h(
      "button",
      {
        type: "button",
        "aria-controls": "case-sidebar",
        "aria-expanded": String(!collapsed),
        onClick: toggleSidebar,
      },
      collapsed ? "Show sidebar" : "Hide sidebar",
    ),
    h(
      "button",
      {
        type: "button",
        "aria-pressed": String(wordWrap),
        onClick: toggleWrap,
      },
      wordWrap ? "Disable wrap" : "Wrap lines",
    ),
  );
};

const IndexControls = () => {
  const [query, setQuery] = useState("");
  const rows = [...document.querySelectorAll("tbody tr")];
  const normalizedQuery = query.trim().toLowerCase();

  useEffect(() => {
    rows.forEach((row) => {
      row.hidden = !row.dataset.search.includes(normalizedQuery);
    });
  }, [normalizedQuery, rows]);

  return h("input", {
    class: "index-search",
    type: "search",
    value: query,
    placeholder: "Filter branches",
    "aria-label": "Filter migration branches",
    onInput: (event) => setQuery(event.currentTarget.value),
  });
};

document.querySelectorAll("template[shadowrootmode]").forEach((template) => {
  if (!template.parentElement.shadowRoot) {
    const root = template.parentElement.attachShadow({
      mode: template.getAttribute("shadowrootmode"),
    });
    root.append(template.content.cloneNode(true));
    template.remove();
  }
});

const cases = [...document.querySelectorAll("details.case")];
const navItems = [...document.querySelectorAll(".case-nav li")];
const search = document.querySelector("#search");
const statusInputs = [...document.querySelectorAll("[data-status-filter]")];
const visibleCount = document.querySelector("#visible-count");

const applyFilters = () => {
  const query = search.value.trim().toLowerCase();
  const enabled = new Set(
    statusInputs.filter(({ checked }) => checked).map(({ value }) => value),
  );
  let visible = 0;
  cases.forEach((item) => {
    item.hidden =
      !enabled.has(item.dataset.status) || !item.dataset.search.includes(query);
    visible += Number(!item.hidden);
  });
  navItems.forEach((item) => {
    item.hidden =
      !enabled.has(item.dataset.status) || !item.dataset.search.includes(query);
  });
  visibleCount.textContent = String(visible);
};

if (search) {
  search.addEventListener("input", applyFilters);
  statusInputs.forEach((input) =>
    input.addEventListener("change", applyFilters),
  );
  document.querySelector("#open-flagged").addEventListener("click", () => {
    cases
      .filter(({ hidden, dataset }) => !hidden && dataset.status !== "green")
      .forEach((item) => {
        item.open = true;
      });
  });
  document.querySelector("#collapse-all").addEventListener("click", () => {
    cases.forEach((item) => {
      item.open = false;
    });
  });
  render(h(ReportControls), document.querySelector("#report-controls"));
}

const indexControls = document.querySelector("#index-controls");
if (indexControls) {
  render(h(IndexControls), indexControls);
}
