"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apify_1 = require("apify");
const crawlee_1 = require("crawlee");
async function main() {
    await apify_1.Actor.init();
    const input = await apify_1.Actor.getInput();
    if (!input || !input.query) {
        throw new Error('Query is required');
    }
    const { query, location, limit = 20, language = 'en' } = input;
    // Build Google Maps search URL
    const searchQuery = location ? `${query} ${location}` : query;
    const url = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`;
    apify_1.log.info(`Searching: ${searchQuery}`);
    const places = [];
    const crawler = new crawlee_1.PlaywrightCrawler({
        maxConcurrency: 1,
        maxRequestRetries: 3,
        requestHandlerTimeoutSecs: 120,
        useSessionPool: true,
        preNavigationHooks: [
            async ({ page }) => {
                await page.setViewportSize({ width: 1280, height: 720 });
            }
        ],
        async requestHandler({ page, request }) {
            // Wait for results to load
            await page.waitForSelector('div[role="feed"]', { timeout: 30000 }).catch(() => { });
            // Scroll to load more results
            const scrollContainer = await page.$('div[role="feed"]');
            let prevCount = 0;
            let scrollAttempts = 0;
            const maxScrollAttempts = 10;
            while (places.length < limit && scrollAttempts < maxScrollAttempts) {
                // Get current place elements
                const cards = await page.$$('div[role="feed"] > div > div');
                for (const card of cards) {
                    try {
                        const place = await card.evaluate(() => {
                            // Try to extract data from the card
                            const nameEl = document.querySelector('.fontHeadlineSmall');
                            const ratingEl = document.querySelector('.fontBodyMedium span[aria-label]');
                            const categoryEl = document.querySelector('.fontBodyMedium.Knjakb');
                            const addressEl = document.querySelector('.fontBodyMedium span[aria-label*="Address"]');
                            const phoneEl = document.querySelector('a[href^="tel:"]');
                            if (!nameEl)
                                return null;
                            return {
                                name: nameEl.textContent?.trim() || '',
                                ratingText: ratingEl?.getAttribute('aria-label') || '',
                                category: categoryEl?.textContent?.trim() || '',
                                address: addressEl?.textContent?.trim() || '',
                                phone: phoneEl?.textContent?.trim() || '',
                            };
                        });
                        if (place && place.name && !places.find(p => p.name === place.name)) {
                            // Parse rating
                            const ratingMatch = place.ratingText.match(/(\d+\.?\d*)/);
                            const rating = ratingMatch ? parseFloat(ratingMatch[1]) : 0;
                            const reviewsMatch = place.ratingText.match(/(\d+)\s*review/);
                            const reviews = reviewsMatch ? parseInt(reviewsMatch[1]) : 0;
                            places.push({
                                name: place.name,
                                rating,
                                reviews,
                                category: place.category,
                                address: place.address,
                                phone: place.phone,
                                website: '',
                                coordinates: { lat: 0, lng: 0 },
                                url: '',
                                openingHours: []
                            });
                        }
                    }
                    catch (e) {
                        // Skip failed extractions
                    }
                }
                if (places.length >= limit)
                    break;
                // Scroll down
                if (scrollContainer) {
                    await scrollContainer.evaluate((el) => el.scrollBy(0, 1000));
                    await page.waitForTimeout(1500);
                }
                scrollAttempts++;
                if (places.length === prevCount) {
                    // No new results, might be at end
                    break;
                }
                prevCount = places.length;
            }
            apify_1.log.info(`Extracted ${places.length} places`);
        }
    });
    await crawler.run([{ url }]);
    // Save results
    const finalResults = places.slice(0, limit);
    await apify_1.Dataset.pushData({
        query: searchQuery,
        total: finalResults.length,
        places: finalResults
    });
    apify_1.log.info(`Saved ${finalResults.length} places to dataset`);
    await apify_1.Actor.exit();
}
main().catch((error) => {
    console.error('Actor error:', error);
    process.exit(1);
});
