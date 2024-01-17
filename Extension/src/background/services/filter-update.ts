/**
 * @file
 * This file is part of AdGuard Browser Extension (https://github.com/AdguardTeam/AdguardBrowserExtension).
 *
 * AdGuard Browser Extension is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * AdGuard Browser Extension is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with AdGuard Browser Extension. If not, see <http://www.gnu.org/licenses/>.
 */

import { FilterUpdateApi } from '../api';
import { storage } from '../storages';
import { isNumber } from '../../common/guards';
import { Log } from '../../common/log';

/**
 * Service for scheduling filters update checks.
 *
 * After initialization scheduler checks filter updates
 * {@link CHECK_PERIOD_MS every 30 minutes}.
 */
export class FilterUpdateService {
    /**
     * Storage key for storing last update check time in the storage.
     */
    private static STORAGE_KEY = 'updateCheckTimeMs';

    /**
     * Checking period
     * That timer should check every specified period of time if it is time to update filters.
     */
    private static readonly CHECK_PERIOD_MS = 1000 * 60 * 5; // 5 min

    /**
     * Filter update period.
     * This means that filters should be updated if it was updated more than the specified value.
     */
    private static readonly FILTER_UPDATE_PERIOD_MS = 1000 * 60 * 30; // 30 min

    /**
     * Stores scheduler timer id for checking update in every
     * {@link CHECK_PERIOD_MS} time.
     */
    private schedulerTimerId: number | undefined;

    /**
     * Creates new {@link FilterUpdateService}.
     */
    constructor() {
        this.update = this.update.bind(this);
    }

    /**
     * Initially starts checking filters update.
     */
    public init(): void {
        this.update();
    }

    /**
     * Checks every {@link CHECK_PERIOD_MS} period whether the enabled filters
     * should be updated with setTimeout which saved to {@link schedulerTimerId}.
     */
    private async update(): Promise<void> {
        window.clearTimeout(this.schedulerTimerId);

        const prevCheckTimeMs = await storage.get(FilterUpdateService.STORAGE_KEY);

        /**
         * Check updates if prevCheckTimeMs is not set or
         * if it is set and last check was more than {@link CHECK_PERIOD_MS} ago.
         */
        const shouldCheckUpdates = !prevCheckTimeMs
            || (isNumber(prevCheckTimeMs)
                && Date.now() - prevCheckTimeMs > FilterUpdateService.FILTER_UPDATE_PERIOD_MS);

        if (shouldCheckUpdates) {
            try {
                await FilterUpdateApi.autoUpdateFilters();
            } catch (e) {
                Log.error('An error occurred during filters update:', e);
            }
            // Saving current time to storage is required in the cases
            // when background page is often unloaded,
            // for example, in the cases of service workers.
            await storage.set(FilterUpdateService.STORAGE_KEY, Date.now());
        }

        this.schedulerTimerId = window.setTimeout(async () => {
            await this.update();
        }, FilterUpdateService.CHECK_PERIOD_MS);
    }
}

export const filterUpdateService = new FilterUpdateService();
