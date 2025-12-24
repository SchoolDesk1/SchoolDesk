import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import '../pages/Home.css'; // Use the same premium styles

const PremiumLayout = ({ children, title, subtitle }) => {
    const navigate = useNavigate();

    // Particle effect (reused from Home.jsx logic)
    useEffect(() => {
        const canvas = document.getElementById('particles-auth');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = Array.from({ length: 30 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 0.5,
            speedX: Math.random() * 1 - 0.5,
            speedY: Math.random() * 1 - 0.5,
            opacity: Math.random() * 0.5 + 0.1
        }));

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.x += p.speedX;
                p.y += p.speedY;
                if (p.x > canvas.width) p.x = 0;
                if (p.x < 0) p.x = canvas.width;
                if (p.y > canvas.height) p.y = 0;
                if (p.y < 0) p.y = canvas.height;

                ctx.fillStyle = `rgba(139, 92, 246, ${p.opacity})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });
            requestAnimationFrame(animate);
        }
        animate();

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="min-h-screen bg-[#0A0E27] text-white overflow-hidden relative selection:bg-purple-500/30 flex items-center justify-center p-4 pt-20 sm:pt-4">
            <canvas id="particles-auth" className="fixed inset-0 z-0 pointer-events-none"></canvas>

            {/* Dynamic Background */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="mesh-gradient opacity-50"></div>
                <div className="gradient-orb orb-1" style={{ top: '10%', left: '10%' }}></div>
                <div className="gradient-orb orb-2" style={{ bottom: '10%', right: '10%' }}></div>
            </div>

            {/* Back Button */}
            <button
                onClick={() => navigate('/')}
                className="absolute top-6 left-6 z-20 flex items-center space-x-2 text-gray-400 hover:text-white transition-colors group"
            >
                <div className="p-2 rounded-full bg-white/5 border border-white/10 group-hover:bg-white/10 transition-all">
                    <ArrowLeft size={20} />
                </div>
                <span className="hidden sm:inline">Back to Home</span>
            </button>

            {/* Main Content Card */}
            <div className="relative z-10 w-full max-w-md">
                <div className="text-center mb-8 animate-in" style={{ animationDelay: '0.1s' }}>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white relative z-10 opacity-100 mb-2">{title}</h1>
                    {subtitle && <p className="text-white/90 text-sm sm:text-base relative z-10">{subtitle}</p>}
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl animate-in" style={{ animationDelay: '0.2s' }}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default PremiumLayout;
