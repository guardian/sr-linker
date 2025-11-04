# Supporter Revenue Linker Extension

## The problem
Often when looking at logs there are plenty of subscription ids,
identity ids, account ids and salesforce ids.
It's a bit of an effort to navigate to the various tools we have
including salesforce, zuora etc to find out more about the
subscriptions in question.

## What does it do
This Chrome extension monitors the highlighted text on selected
sites, and depending on the format, opens a tooltip showing
relevant links to other systems.

If the format isn't detected, use the context menu to search
for

## Quick start
1. clone the repo
1. go to chrome and "Load unpacked extension"
1. add the root of this repo

## Limitations
- you have to log into the relevant systems in advance (zuora, salesforce)

## Potential improvements
- more places to link from/to
- pack the extension and publish (needs correct org access)
- add a lookup-and-redirect endpoint to allow e.g. viewing zuora account for a sub
- add a "all associated IDs for this ID" html endpoint e.g. lookup.support.guardianapis.com/?id=A-S1234
