

'use client';
import React, { useState } from 'react';

const CreateProjectPage: React.FC = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            // استبدل هذا الطلب بطلب API الخاص بك
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setSuccess(true);
            setName('');
            setDescription('');
        } catch (err) {
            setError('حدث خطأ أثناء إنشاء المشروع.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
            <h1 className="text-2xl font-bold mb-4">إنشاء مشروع جديد</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1 font-medium">اسم المشروع</label>
                    <input
                        type="text"
                        className="w-full border px-3 py-2 rounded"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="أدخل اسم المشروع"
                    />
                </div>
                <div>
                    <label className="block mb-1 font-medium">وصف المشروع</label>
                    <textarea
                        className="w-full border px-3 py-2 rounded"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="أدخل وصف المشروع"
                    />
                </div>
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    disabled={loading}
                >
                    {loading ? 'جاري الإنشاء...' : 'إنشاء المشروع'}
                </button>
                {success && <div className="text-green-600 mt-2">تم إنشاء المشروع بنجاح!</div>}
                {error && <div className="text-red-600 mt-2">{error}</div>}
            </form>
        </div>
    );
};

export default CreateProjectPage;