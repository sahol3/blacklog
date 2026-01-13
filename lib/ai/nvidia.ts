
export async function generateWeeklyReview(logs: any[], userProfile: any) {
    const apiKey = process.env.NVIDIA_NIM_API_KEY
    if (!apiKey) throw new Error('Missing NVIDIA API Key')

    const prompt = `
    ROLE: Ruthless Drill Sergeant / Elite Performance Coach.
    USER: ${userProfile.username} (${userProfile.domain} Operator).
    GOAL: ${userProfile.goals_json.main_quest}.
    ANTI-GOAL: ${userProfile.goals_json.the_enemy}.
    
    DATA (Last 7 Days Logs):
    ${JSON.stringify(logs.map(l => ({
        date: l.date,
        body: l.body_energy,
        mind: l.mind_focus,
        money: l.money_value,
        skill: l.skill_difficulty,
        war_log: l.war_log
    })))}

    INSTRUCTIONS:
    1. Analyze the performance data ruthlessly.
    2. Identify WEAKNESSES and PATTERNS of failure.
    3. Compare against the GOAL and ANTI-GOAL.
    4. Provide a brutal, short, actionable review.
    5. Format as Markdown.
    
    OUTPUT STRUCTURE:
    ## SITREP
    (Summary of the week's performance. Call out laziness.)
    
    ## TACTICAL ERRORS
    (Bulleted list of specific failures from the logs.)
    
    ## DIRECTIVES
    (3 specific commands for next week.)
    
    TONE: Harsh, direct, military, no fluff.
  `

    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: "meta/llama-3.1-70b-instruct",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            top_p: 1,
            max_tokens: 1024,
            stream: false
        })
    })

    const data = await response.json()
    return data.choices[0].message.content
}
