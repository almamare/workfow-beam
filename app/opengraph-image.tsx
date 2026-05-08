import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Shuaa Al-Ranou Trade & General Contracting';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: 'linear-gradient(135deg, #0058de 0%, #003d99 55%, #001f52 100%)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'sans-serif',
                    position: 'relative',
                }}
            >
                {/* Background decoration circles */}
                <div
                    style={{
                        position: 'absolute',
                        top: -80,
                        right: -80,
                        width: 320,
                        height: 320,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.05)',
                        display: 'flex',
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        bottom: -60,
                        left: -60,
                        width: 240,
                        height: 240,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.05)',
                        display: 'flex',
                    }}
                />

                {/* Logo circle */}
                <div
                    style={{
                        width: 110,
                        height: 110,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.15)',
                        border: '3px solid rgba(255,255,255,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 56,
                        marginBottom: 28,
                    }}
                >
                    ☀️
                </div>

                {/* Arabic company name */}
                <div
                    style={{
                        fontSize: 58,
                        fontWeight: 800,
                        color: '#ffffff',
                        textAlign: 'center',
                        marginBottom: 12,
                        letterSpacing: '-1px',
                        display: 'flex',
                    }}
                >
                    شعاع الرنو
                </div>

                {/* English subtitle */}
                <div
                    style={{
                        fontSize: 26,
                        color: 'rgba(255,255,255,0.8)',
                        textAlign: 'center',
                        marginBottom: 32,
                        display: 'flex',
                    }}
                >
                    Shuaa Al-Ranou Trade &amp; General Contracting
                </div>

                {/* Badge */}
                <div
                    style={{
                        padding: '14px 40px',
                        background: 'rgba(255,255,255,0.12)',
                        border: '1px solid rgba(255,255,255,0.25)',
                        borderRadius: 12,
                        fontSize: 22,
                        color: 'rgba(255,255,255,0.9)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                    }}
                >
                    <span style={{ display: 'flex' }}>📋</span>
                    <span style={{ display: 'flex' }}>Project Management System</span>
                </div>
            </div>
        ),
        { ...size }
    );
}
