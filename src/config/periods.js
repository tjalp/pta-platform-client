export function calculateWeeks(startPeriod1, endPeriod) {
    if (endPeriod >= startPeriod1) {
        return endPeriod - startPeriod1 + 1;
    } else {
        return endPeriod + 52 - startPeriod1 + 1;
    }
}

export function getWeekFromString(periods, weekString) {
    if (isNaN(weekString)) {
        if (weekString.trim().startsWith('SE')) {
            const se = weekString.trim().split(' ')[1];
            const seNumber = parseInt(se, 10);

            return periods.at(seNumber - 1).endWeek;
        }
    }

    return parseInt(weekString.trim(), 10);
}