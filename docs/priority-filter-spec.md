# Priority Filter Specification

## Goal

Help managers focus quickly on equipment requests with a selected priority while preserving every existing request.

## User Need

As a manager, I want to select a priority and see only matching equipment requests so I can focus on requests that need my attention.

## Functional Rules

1. Provide a visibly labeled, keyboard-accessible priority filter with the options All, High, Normal, and Low. Normal is the app's existing middle priority; do not introduce Medium.
2. Select All on initial page load and after refresh. The selection does not need to be saved.
3. All shows every request. A specific priority shows only requests with that priority, regardless of status.
4. Older requests saved before the priority field existed are treated as Normal, matching how the app already loads them. They appear under All and Normal. Filtering must not save or change their stored data.
5. Preserve the existing relative order of requests in every filtered view. Do not sort requests.
6. Update the visible requests when the manager changes the filter.
7. When no requests match the selected filter, display exactly: "No requests match this priority." This also applies when All is selected and there are no requests.
8. Adding a request continues to validate and save it using the existing form. Keep the selected filter active and show the new request if it matches, or when All is selected. Switching to All reveals every saved request.
9. Filtering changes only which requests are displayed. It must not modify, delete, or overwrite request data.

## Constraints

- Use the existing plain HTML, CSS, and JavaScript modules. Add no frameworks, build tools, external services, or production dependencies.
- Work without a login or database, using the app's existing local storage.
- Preserve existing stored requests and their fields; existing data must remain readable.
- Keep business and storage logic in `src/request-store.js` and browser interaction and rendering in `src/app.js`.
- Keep the interface changes limited to this feature. Retain visible labels and focus indicators, and render user content with safe DOM APIs such as `textContent`.
- Keep the existing loader behavior that treats older requests without a priority as Normal, and keep its existing test unchanged.

## Acceptance Criteria

1. Given saved requests with High, Normal, and Low priorities, opening the app selects All and shows every request in its existing order.
2. Selecting High, Normal, or Low shows exactly the requests with that priority, in their existing relative order. Status does not affect matching.
3. After selecting any specific priority, selecting All restores every request in its original order.
4. Given an older stored request without a priority, All and Normal show it, High and Low hide it, and changing filters leaves its stored fields unchanged.
5. Given no matching requests, the app displays "No requests match this priority." Verify both an empty specific-priority view and an empty request collection under All.
6. After selecting a specific priority and refreshing, All is selected and all saved requests remain available.
7. With a specific filter active, adding a matching request saves and displays it; adding a nonmatching request saves it and makes it visible under All. The selected filter remains active after either submission, and the existing validation behavior still works.
8. Switching repeatedly among filters does not change the stored request collection, request fields, or request order. Adding a request preserves all previously saved requests.
9. The filter can be reached and operated with the keyboard, has a visible label, and retains a visible focus indicator.
10. All existing automated tests pass with `npm test`; add or revise coverage for new business or storage behavior. Verify the acceptance criteria in the browser before considering implementation complete.

## Out of Scope

- Sorting requests or changing their existing order.
- Filtering by status or other request fields.
- Introducing new priority values or renaming Normal to Medium.
- Remembering the selected filter after refresh.
- Editing or deleting requests, changing stored priorities, or migrating request data as part of filtering.
- Login, accounts, a database, external services, or an unrelated interface redesign.



## Verification Results

I tested everything on Oct 18, 2026 in Chrome, and Codex ran the automated tests.

1. App opens on All and shows everything: Pass. I refreshed the page. The filter said All and all 4 requests showed.

2. Each priority only shows its own requests: Pass. I picked High, Normal, and Low. Each one only showed the matching requests.

3. Going back to All shows everything again: Pass. I switched from Low back to All. Everything came back in the same order.

4. Old requests with no priority count as Normal: Pass. I removed the priority from one test request. It showed under All and Normal but not High or Low, and its saved data didn't change.

5. "No requests match this priority." shows when nothing matches: Pass. I opened a fresh Incognito window with no requests, then tried Low with only a High request. The message showed both times.

6. Refreshing resets the filter to All: Pass. I picked High, refreshed, and it went back to All with nothing lost.

7. Adding a request while filtered still works: Pass. On High, a new High request showed right away. A new Low request stayed hidden until I picked All. The filter stayed on High, and the empty form still showed an error.

8. Filtering doesn't change saved requests: Pass. I saved a copy of the data, switched filters a bunch of times, and compared. It was exactly the same.

9. Filter works with the keyboard: Pass. I used Tab to get to the filter. I could see the label and outline, and the arrow keys changed it.

10. Automated tests pass: Pass. Codex ran the tests and 12 passed, 0 failed.