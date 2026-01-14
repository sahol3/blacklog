export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    username: string
                    full_name: string
                    email: string
                    avatar_url: string | null
                    goals_json: Json
                    current_streak: number
                    total_xp: number
                    bio: string | null
                    domain: 'Dev' | 'Designer' | 'Agency' | 'Student' | 'Other' | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    username: string
                    full_name: string
                    email: string
                    avatar_url?: string | null
                    goals_json?: Json
                    current_streak?: number
                    total_xp?: number
                    bio?: string | null
                    domain?: 'Dev' | 'Designer' | 'Agency' | 'Student' | 'Other' | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    username?: string
                    full_name?: string
                    email?: string
                    avatar_url?: string | null
                    goals_json?: Json
                    current_streak?: number
                    total_xp?: number
                    bio?: string | null
                    domain?: 'Dev' | 'Designer' | 'Agency' | 'Student' | 'Other' | null
                    created_at?: string
                    updated_at?: string
                }
            }
            daily_logs: {
                Row: {
                    id: string
                    user_id: string
                    date: string
                    is_public: boolean
                    body_unhealthy_flag: boolean
                    body_energy: number | null
                    mind_read_flag: boolean
                    mind_focus: number | null
                    money_value: number
                    money_currency: 'BDT' | 'USD' | null
                    money_speed: number | null
                    skill_practice_flag: boolean
                    skill_difficulty: number | null
                    war_log: string | null
                    image_url: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    date: string
                    is_public?: boolean
                    body_unhealthy_flag?: boolean
                    body_energy?: number | null
                    mind_read_flag?: boolean
                    mind_focus?: number | null
                    money_value?: number
                    money_currency?: 'BDT' | 'USD' | null
                    money_speed?: number | null
                    skill_practice_flag?: boolean
                    skill_difficulty?: number | null
                    war_log?: string | null
                    image_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    date?: string
                    is_public?: boolean
                    body_unhealthy_flag?: boolean
                    body_energy?: number | null
                    mind_read_flag?: boolean
                    mind_focus?: number | null
                    money_value?: number
                    money_currency?: 'BDT' | 'USD' | null
                    money_speed?: number | null
                    skill_practice_flag?: boolean
                    skill_difficulty?: number | null
                    war_log?: string | null
                    image_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
        }
        Views: {
            public_profiles: {
                Row: {
                    id: string
                    username: string
                    avatar_url: string | null
                    domain: 'Dev' | 'Designer' | 'Agency' | 'Student' | 'Other' | null
                    current_streak: number
                    total_xp: number
                    created_at: string
                }
            }
        }
    }
}
