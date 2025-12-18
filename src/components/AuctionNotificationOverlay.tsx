
import { wicketFallingAnimation, batSwingAnimation, trophyAnimation } from "./CricketAnimations";
import Lottie from "lottie-react";

interface AuctionNotificationOverlayProps {
    type: "sold" | "unsold";
    teamName?: string;
    isVisible: boolean;
}

export const AuctionNotificationOverlay = ({
    type,
    teamName,
    isVisible,
}: AuctionNotificationOverlayProps) => {
    if (!isVisible) return null;

    const isSold = type === "sold";

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-300 ${isSold ? "bg-emerald-900/95" : "bg-red-900/95"
                }`}
        >
            <div className="text-center space-y-6 animate-scale-in max-w-4xl mx-auto px-4">
                {/* Animation Icon */}
                <div className="flex justify-center mb-8">
                    <div className="w-48 h-48 md:w-64 md:h-64 filter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                        <Lottie
                            animationData={isSold ? trophyAnimation : wicketFallingAnimation}
                            loop={true}
                        />
                    </div>
                </div>

                {/* Status Text (SOLD / UNSOLD) */}
                <h1 className="text-8xl md:text-9xl font-display font-black text-white animate-pulse tracking-tighter drop-shadow-[0_0_50px_rgba(255,255,255,0.4)]">
                    {isSold ? "SOLD!" : "UNSOLD!"}
                </h1>

                {/* Cricket Themed Subtext */}
                <p className={`text-4xl md:text-6xl font-bold uppercase tracking-wider font-display transform -rotate-2 ${isSold ? "text-yellow-400" : "text-white/90"
                    }`}>
                    {isSold ? (
                        <>
                            That's a Six! 🏏
                        </>
                    ) : (
                        <>
                            Clean Bowled! 🎯
                        </>
                    )}
                </p>

                {/* Sold To Team (Only for Sold) */}
                {isSold && teamName && (
                    <div className="mt-8 pt-8 border-t border-white/20 animate-slide-up-fade">
                        <p className="text-xl text-emerald-200 uppercase tracking-widest font-medium mb-2">Sold To</p>
                        <h2 className="text-4xl md:text-6xl font-display font-bold text-white drop-shadow-lg">
                            {teamName}
                        </h2>
                    </div>
                )}
            </div>
        </div>
    );
};
