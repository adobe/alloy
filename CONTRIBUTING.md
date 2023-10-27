# Contributing

Welcome to the home of the AEP Web SDK! We appreciate your interest in contributing and are excited to collaborate.

The following guidelines will help ensure a smooth contribution process.

Our guidelines vary depending on the type of contribution: New Feature, Enhancement, or Bug Fix.


## Contributor license agreement

All third-party contributions to this project must be accompanied by a signed contributor
license agreement. This gives Adobe permission to redistribute your contributions
as part of the project. [Sign our CLA](http://opensource.adobe.com/cla.html). You
only need to submit an Adobe CLA one time, so if you have submitted one previously,
you are good to go!


## Bug Fix Process

Submit bug fixes via pull requests, to be reviewed by the AEP Web SDK's Core team.

1. Create a pull request.
2. Describe the bug, and provide steps to reproduce it. (More details on the PR process below)


## New Feature Process

New feature contributions start with a Concept Approval (CA) / Proposal document.

- Internal Contributors: Create a Wiki page and engage with the AEP Web SDK's Product team to discuss your proposal.
- External Contributors: Create a GitHub issue detailing your feature and assign the ticket to https://github.com/jfkhoury.
- No need for detailed architectural insights at this stage.


#### Post Approval

1. Add a thorough architecture and design proposal to a technical document.
    - Seek assistance from the AEP Web SDK Engineering team for design input if necessary.
    - This document will be shared with Adobe's documentation writers, so ensure it's detailed.
2. Share your CA and technical documents with the AEP Web SDK engineering team for further discussion and approval.
    - A work session will be scheduled for a kickoff discussion. (Joe to set up)
3. Upon design approval, proceed with development. The technical document will be shared with the documentation team for public documentation preparation.


## Pull Request Approval Process

We strive to review all pull requests promptly and may suggest improvements or alternatives.

Include in your pull request:


- Break down your PR into manageable commits and add a descriptive PR title and thorough description, including screenshots if applicable.
- Ensure code adheres to our formatting and usage standards (`npm run format` and `npm run lint`)
- Testing:
    - Detail your test cases comprehensively. PRs lacking tests will not be reviewed.
    - Include unit and functional tests.
    - Test your feature in the [Sandbox](https://github.com/adobe/alloy/wiki/Running-the-sandbox-locally-over-HTTPS-on-Mac-OS).
- Make sure the PR merges cleanly with the latest main.
- Obtain 3 approvals from the Core Web SDK team to have your PR approved.
- If a consensus isn’t reached regarding any code concern, Joe will provide the final say.
    - We encourage and enjoy open minded, deep discussions on this team. Try your best to propose a design that the whole team agrees with.


## Ownership

While contributors are not expected to maintain the feature post-contribution, for a smooth handover, we require:

- Detailed technical documents explaining the feature and architecture.
- Engage in discussions with the AEP Web SDK core team to ensure full understanding and approval of the design and code.
