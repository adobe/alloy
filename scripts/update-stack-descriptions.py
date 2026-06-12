#!/usr/bin/env python3
"""Replaces the stack:links block in all migrate-integration PRs with a structured review-order section."""
import subprocess, json, re, sys

SPECS = [
    (1534, "Context"),
    (1535, "Logging"),
    (1536, "LibraryInfo"),
    (1537, "Location Hints"),
    (1538, "Config Overrides"),
    (1539, "Data Collector"),
    (1540, "Identity"),
    (1541, "ID Migration"),
    (1542, "Consent"),
    (1543, "IAB TCF"),
    (1544, "Personalization Render"),
    (1545, "Personalization SPA"),
    (1546, "Personalization"),
    (1547, "Personalization Interactions"),
    (1548, "Media Collection"),
    (1549, "Brand Concierge"),
    (1550, "RulesEngine"),
    (1551, "Migration"),
    (1552, "Visitor"),
]

ALL_PRS = [1532, 1533] + [n for n, _ in SPECS]


def spec_entry(pr_num, label, current):
    marker = " 👈" if pr_num == current else ""
    return f"#**{pr_num}**{marker} {label}" if pr_num == current else f"#{pr_num} {label}"


THIS = " ← _this PR_"


def build_stack_block(current_pr):
    infra_mark = THIS if current_pr == 1532 else ""
    sdk_mark   = THIS if current_pr == 1533 else ""

    spec_lines = []
    for pr_num, label in SPECS:
        mark = THIS if pr_num == current_pr else ""
        spec_lines.append(f"- #{pr_num} {label}{mark}")
    specs_block = "\n".join(spec_lines)

    return f"""<!-- stack:links:start -->
### Stack — Review Order

Sequential:
- #1532 — shared test harness{infra_mark} _(review first)_
- #1533 — Install SDK{sdk_mark} _(review second; depends on #1532)_

Parallel — all target #1532, review in any order:

{specs_block}
<!-- stack:links:end -->"""


def update_pr(pr_num):
    result = subprocess.run(
        ["gh", "pr", "view", str(pr_num), "--json", "body"],
        capture_output=True, text=True, check=True
    )
    body = json.loads(result.stdout)["body"]

    new_block = build_stack_block(pr_num)
    updated = re.sub(
        r"<!-- stack:links:start -->.*?<!-- stack:links:end -->",
        new_block,
        body,
        flags=re.DOTALL,
    )

    if updated == body:
        print(f"#{pr_num}: no stack block found, skipping")
        return

    subprocess.run(
        ["gh", "pr", "edit", str(pr_num), "--body", updated],
        check=True
    )
    print(f"#{pr_num}: updated")


for pr in ALL_PRS:
    update_pr(pr)
