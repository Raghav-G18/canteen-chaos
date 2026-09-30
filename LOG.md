# Debug log

Your notes. One entry per bug you fixed, using the template below.

This file is read as carefully as your code. A correct fix you cannot explain counts for little; a bug you could not fix but investigated honestly still counts for something.

Delete the example before you submit.

## CC-01 — "Search suggestions appear behind everything"

**Reproduced:** Typed a search term with at least two characters. The suggestion list appeared behind the category/filter area, so only the top part was visible and clickable. Happened consistently when reproduced locally.

**Cause:** The `.search-wrap` had `z-index: 1`, while the category tabs had a higher stacking level of `z-index: 40`. The `.suggest-box` had `z-index: 100`, but that z-index only applied within the `.search-wrap` stacking context, so it could not appear above the higher-level category tabs.

**Fix:** Changed the `.search-wrap` z-index from `1` to `50`, placing its stacking context above the category tabs while keeping the existing `.suggest-box` z-index of `100`.

**Checked:** Refreshed the application and tested search suggestions again. The complete suggestion list now appears above the filter/category area, and the suggestion buttons are fully visible and clickable.

**Time:** about 20 minutes, including reproducing the issue and tracing the stacking context.

## CC-02 — "Dish names and prices are nearly invisible in dark mode"

**Reproduced:** Enabled Dark Mode and viewed the menu. Dish names and prices appeared in a very dark brown, making them difficult to read against the dark dish cards.

**Cause:** The dark theme changes the `--ink` variable to a light color, but `.dish-body` had a hard-coded `color: #2b2118`. Dish names and prices inherit the `.dish-body` color, so they remained dark in Dark Mode.

**Fix:** Changed `.dish-body` to use `color: var(--ink)` instead of the hard-coded dark brown, so the text follows the active theme.

**Checked:** Refreshed the menu with Dark Mode enabled and verified that dish names and prices are clearly readable.

**Time:** About 15 minutes.

## Could not fix

For anything you investigated but did not solve. Say what you tried and where you got to. This is worth marks — leaving it blank when you got stuck is not.

## Extra credit

Anything not on the bug log: a problem you found yourself, a test you wrote, or a fix you are unsure about. Same format, plus one line on how you noticed it.
