export type DailyLog = {
    body_unhealthy_flag: boolean
    body_energy: number
    mind_read_flag: boolean
    mind_focus: number
    money_value: number
    money_speed: number
    skill_practice_flag: boolean
    skill_difficulty: number
}

export function calculatePotentialXP(log: DailyLog): number {
    let xp = 10; // Base

    if (log.mind_read_flag) xp += 5;
    if (log.skill_practice_flag) xp += 5;

    if (log.money_value > 0) {
        xp += 20; // Flat bonus
        // Scale bonus: Log10 of value * 5, capped at 30
        const scaleBonus = Math.min(Math.floor(Math.log10(log.money_value) * 5), 30);
        xp += scaleBonus;
    }

    if (log.money_speed >= 4) xp += 10;
    if (log.skill_difficulty >= 4) xp += 5;
    if (log.body_unhealthy_flag) xp -= 10;

    return Math.max(xp, 0);
}
