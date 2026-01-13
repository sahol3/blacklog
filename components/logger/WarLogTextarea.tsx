'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export function WarLogTextarea({ value, onChange }: { value: string, onChange: (val: string) => void }) {
    return (
        <section className="space-y-2">
            <div className="flex justify-between items-center">
                <label className="text-[#9db9b0] text-sm font-medium uppercase tracking-wider">War Log (The Soul)</label>
                <span className={`text-xs font-mono ${value.length > 4500 ? 'text-red-500' : 'text-slate-500'}`}>
                    {value.length}/5000
                </span>
            </div>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                maxLength={5000}
                className="w-full h-48 bg-surface border border-border rounded-xl p-4 text-white placeholder:text-slate-700 focus:border-primary focus:outline-none transition-all resize-none font-mono text-sm leading-relaxed"
                placeholder="Document the battle. What conquered you? What did you conquer?"
            />
        </section>
    )
}

export function ImageUpload({ onUploadComplete }: { onUploadComplete: (url: string) => void }) {
    const [uploading, setUploading] = useState(false)
    const [preview, setPreview] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return

        const file = e.target.files[0]

        if (file.size > 5 * 1024 * 1024) {
            toast.error('File too large (Max 5MB)')
            return
        }

        if (!file.type.startsWith('image/')) {
            toast.error('Only images allowed')
            return
        }

        try {
            setUploading(true)

            const user = (await supabase.auth.getUser()).data.user
            if (!user) throw new Error('Unauthorized - please login first')

            const fileExt = file.name.split('.').pop()
            const fileName = `${user.id}/${Date.now()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('war-proofs')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (uploadError) {
                throw new Error(uploadError.message || 'Upload failed')
            }

            const { data: { publicUrl } } = supabase.storage
                .from('war-proofs')
                .getPublicUrl(fileName)

            setPreview(URL.createObjectURL(file))
            onUploadComplete(publicUrl)
            toast.success('Proof Uploaded')
        } catch (error: any) {
            const message = error?.message || error?.error_description || 'Upload Failed'
            toast.error(message)
        } finally {
            setUploading(false)
        }
    }

    return (
        <section
            className="bg-surface border border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:border-primary/50 transition-colors cursor-pointer group relative overflow-hidden"
            onClick={() => fileInputRef.current?.click()}
        >
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileChange}
            />

            {preview ? (
                <div className="absolute inset-0 z-10">
                    <img src={preview} className="w-full h-full object-cover opacity-50 group-hover:opacity-30 transition-opacity" alt="Preview" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="bg-black/50 px-3 py-1 rounded text-white text-xs font-bold uppercase backdrop-blur-md">Change Proof</span>
                    </div>
                </div>
            ) : (
                <>
                    <span className="material-symbols-outlined text-4xl text-border group-hover:text-primary transition-colors">
                        {uploading ? 'cloud_upload' : 'add_a_photo'}
                    </span>
                    <p className="text-[#9db9b0] text-sm font-bold tracking-widest uppercase">
                        {uploading ? 'Uploading...' : 'Upload Proof of Work'}
                    </p>
                    <p className="text-[#4a5e57] text-xs">Drag and drop mission evidence here</p>
                </>
            )}
        </section>
    )
}
