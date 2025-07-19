"use client";

import React, { useState } from 'react';

const CreateTender: React.FC = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [deadline, setDeadline] = useState('');
    const [budget, setBudget] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // هنا يمكنك إضافة منطق إرسال البيانات للسيرفر
        alert('تم إنشاء التندر بنجاح!');
    };

    return (
        <div style={{ maxWidth: 500, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee' }}>
            <h2 style={{ textAlign: 'center', marginBottom: 24 }}>إنشاء تندر جديد</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8 }}>عنوان التندر</label>
                    <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        required
                        style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                    />
                </div>
                <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8 }}>وصف التندر</label>
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        required
                        rows={4}
                        style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                    />
                </div>
                <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8 }}>تاريخ الإنتهاء</label>
                    <input
                        type="date"
                        value={deadline}
                        onChange={e => setDeadline(e.target.value)}
                        required
                        style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                    />
                </div>
                <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', marginBottom: 8 }}>الميزانية المتوقعة</label>
                    <input
                        type="number"
                        value={budget}
                        onChange={e => setBudget(e.target.value)}
                        required
                        style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                    />
                </div>
                <button
                    type="submit"
                    style={{
                        width: '100%',
                        padding: 12,
                        background: '#0070f3',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        fontSize: 16,
                        cursor: 'pointer'
                    }}
                >
                    إنشاء التندر
                </button>
            </form>
        </div>
    );
};

export default CreateTender;