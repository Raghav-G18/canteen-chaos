# Debug log

Your notes. One entry per bug you fixed, using the template below.

This file is read as carefully as your code. A correct fix you cannot explain counts for little; a bug you could not fix but investigated honestly still counts for something.


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

## CC-04 — "Add to Cart and star buttons do nothing on tablet"

**Reproduced:** Opened the application on a tablet-sized screen between 761px and 900px wide. The Add to Cart and favourite star buttons were visible, but tapping them did nothing. The same buttons worked correctly on laptop and phone-sized screens.

**Cause:** In the 761px–900px media query, `.dish-card::after` created an invisible overlay positioned over the bottom 58px of each dish card with `z-index: 3`. This overlay sat above the Add to Cart button and intercepted pointer events, preventing the button's delegated click handler from receiving the click.

**Fix:** Added `pointer-events: none` to the `.dish-card::after` and `.img-wrap::after` pseudo-elements so they remain visually available without intercepting mouse or touch interactions.

**Checked:** Refreshed the application on the tablet and tested both Add to Cart and favourite star buttons. Both now respond correctly. Also verified that the existing laptop and phone behaviour remains unaffected.

**Time:** About 20 minutes, including reproducing the issue, tracing the click handling and CSS overlay, applying the fix, and testing.

## CC-05 — "Category/filter bar scrolls away on smaller screens"

**Reproduced:** Tested the application at a 391px mobile viewport and scrolled through the menu. The filter/category section initially appeared correctly but eventually scrolled away instead of remaining visible.

**Cause:** On small screens, `.view` used `overflow-x: hidden`. This created a scrolling context that interfered with the `position: sticky` behavior of the `.filters` section. As a result, the filter section eventually moved out of view while scrolling.

**Fix:** Changed the mobile `.view` overflow from `hidden` to `clip` for the horizontal axis, preventing it from creating the conflicting scrolling context. Also changed the sticky `.filters` offset from `top: 0` to `top: 92px` so the entire filter/category section remains below the sticky site header.

**Checked:** Tested at a 391px mobile viewport and scrolled through the menu. The complete filter and category section now remains visible below the sticky header while scrolling.

**Time:** About 45 minutes, including reproducing the issue, tracing the sticky/overflow behavior, applying the fix, and testing.

## CC-06 — "Can order more than stock"

**Reproduced:** Created a test dish with 2 units in stock and submitted an order for 3 units. The backend incorrectly returned `valid: true` with no errors.

**Cause:** `validateLine()` checked whether a dish was sold out (`stock <= 0`) but did not check whether the requested quantity was greater than the available stock. As a result, an order could request more units than were available, and `reserveStock()` could reduce the stock below zero.

**Fix:** Added a validation check that rejects an order when the requested quantity is greater than the dish's current stock.

**Checked:** Verified that ordering 3 units when 2 are in stock is rejected with `Test Dish: only 2 left in stock`. Verified that ordering exactly 2 units when 2 are in stock is accepted. Also verified that reserving 2 units reduces the stock from 2 to 0.

**Time:** About 20 minutes, including reproducing the issue, tracing the validation logic, applying the fix, and testing.

## CC-07 — "Cancelling makes it worse"

**Reproduced:** Placed an order and then cancelled it. The stock was expected to return to its previous value, but the cancellation logic reduced the stock instead.

**Cause:** The `releaseStock()` function in `backend/logic/validation.js` used subtraction when restoring stock. It changed the stock using `dish.stock - line.qty`, which decreased the available quantity instead of returning the cancelled quantity.

**Fix:** Changed the stock calculation in `releaseStock()` from subtraction to addition, so cancelled quantities are returned to the available stock.

**Checked:** Tested ordering and cancelling an item. The stock returned to its previous value after cancellation. Also tested placing an order without cancelling it; the stock remained reduced as expected. Refreshed the menu to confirm that the displayed stock matched the backend stock.

**Time:** About 30 minutes, including reproducing the issue, tracing the cancellation logic, applying the fix, and testing.

## CC-08 — "An old coupon still works"

**Reproduced:** Applied the `FRESHERS24` coupon even though its expiry date was September 30, 2024. The coupon was still accepted by the pricing logic and could provide a discount.

**Cause:** The `applyCoupon()` function in `backend/logic/pricing.js` checked whether the coupon existed, had uses remaining, met the minimum order, and satisfied other restrictions, but it did not check the coupon's `expiresAt` date.

**Fix:** Added an expiry-date check to `applyCoupon()`. If the coupon's expiry time is at or before the current time, the coupon is rejected with an expiration message and a discount of 0.

**Checked:** Tested `FRESHERS24` directly against the pricing function. The result was `valid: false`, `discount: 0`, with the reason `FRESHERS24 has expired`. Also tested `BYTE10`, a non-expired coupon, which remained valid and correctly provided a ₹20 discount on a ₹200 order.

**Time:** About 20 minutes, including reproducing the issue, tracing the coupon validation logic, applying the fix, and testing.

## CC-09 — "The menu shows more dishes than it should"

**Reproduced:** Opened the menu and found that all available dishes were displayed at once instead of loading a small number of dishes at a time as the user scrolled.

**Cause:** The `paginate()` function in `backend/logic/search.js` correctly calculated the requested page using `list.slice(...)`, but the returned `items` property incorrectly contained the complete list. As a result, every page returned all available dishes instead of only the requested batch.

**Fix:** Changed the returned `items` property to use the paginated `items` array instead of the complete list. Also changed the frontend page size from 5 to 8 dishes per batch for a better browsing experience.

**Checked:** Tested the menu API with `page=2&limit=5` and confirmed that it returned a different set of dishes for page 2. Then tested the website after changing the frontend batch size to 8. The menu now displays 8 dishes initially and loads the next batch as the user scrolls, without repeating the previous dishes.

**Time:** About 20 minutes, including reproducing the issue, tracing the pagination logic, applying the fix, and testing.

## CC-10 — "Sorting by price is backwards"

**Reproduced:** Selected "Price: low to high" and found that the most expensive dishes appeared first. Selecting "Price: high to low" produced the opposite order.

**Cause:** The price sorting functions in `backend/logic/search.js` were reversed. The `price-asc` sorter used descending comparison (`b.price - a.price`), while the `price-desc` sorter used ascending comparison (`a.price - b.price`).

**Fix:** Corrected the two price comparison functions so that `price-asc` sorts from the lowest price to the highest price, and `price-desc` sorts from the highest price to the lowest price.

**Checked:** Tested both price sorting options in the application. "Price: low to high" now shows the cheapest dishes first, while "Price: high to low" shows the most expensive dishes first.

**Time:** About 10 minutes, including reproducing the issue, tracing the sorting logic, applying the fix, and testin


## Could not fix


## Extra credit
### Extra Credit Test — Concurrent last-item ordering

**Scenario:** Tested what happens when two students attempt to order the same dish at the same time when only 1 unit is available.

**Test:** Set `Rajma Chawal` stock to 1 and sent two order requests concurrently using separate requests/keys.

**Result:** One request returned HTTP 201 (order created) and the other returned HTTP 400 (insufficient stock). Only one order was accepted.

**Checked:** Verified that the final stock was not oversold and restored the dish's original stock of 24 after testing.

**Conclusion:** The current single-server implementation prevents two simultaneous requests from consuming the same last item. No code change was made because the concurrency issue could not be reproduced.


