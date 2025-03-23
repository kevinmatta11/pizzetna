
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { loyaltyService } from '@/services/loyaltyService';
import { Trophy, Gift, Coins, RotateCw } from 'lucide-react';

// Improved segment definitions with better colors
const segments = [
  { text: 'Try Again', value: 0, color: '#F1F1F1', probability: 0.5, icon: '🎲' },
  { text: '50 Points', value: 50, color: '#FFE7AD', probability: 0.2, icon: '🌟' },
  { text: 'Try Again', value: 0, color: '#F1F1F1', probability: 0.5, icon: '🎲' },
  { text: '100 Points', value: 100, color: '#FFDDA1', probability: 0.2, icon: '✨' },
  { text: 'Try Again', value: 0, color: '#F1F1F1', probability: 0.5, icon: '🎲' },
  { text: '300 Points', value: 300, color: '#FFC285', probability: 0.1, icon: '🎁' },
  { text: 'Try Again', value: 0, color: '#F1F1F1', probability: 0.5, icon: '🎲' },
  { text: '50 Points', value: 50, color: '#FFE7AD', probability: 0.2, icon: '🌟' },
  { text: 'Try Again', value: 0, color: '#F1F1F1', probability: 0.5, icon: '🎲' },
  { text: '100 Points', value: 100, color: '#FFDDA1', probability: 0.2, icon: '✨' },
];

// Weighted random selection
const getWeightedRandomSegment = () => {
  const weights = segments.map(segment => segment.probability);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < segments.length; i++) {
    if (random < weights[i]) {
      return i;
    }
    random -= weights[i];
  }
  return 0; // Fallback
};

interface SpinningWheelProps {
  onComplete?: (points: number) => void;
  hasSpinAvailable?: boolean;
}

export const SpinningWheel: React.FC<SpinningWheelProps> = ({ 
  onComplete,
  hasSpinAvailable = true
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  const [hasPendingSpin, setHasPendingSpin] = useState(true);
  const [winAnimation, setWinAnimation] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);
  
  // Check if user has a pending spin from URL parameter
  useEffect(() => {
    const checkPendingSpin = async () => {
      try {
        const hasSpin = await loyaltyService.checkPendingSpin();
        setHasPendingSpin(hasSpin);
      } catch (error) {
        console.error("Error checking for pending spin:", error);
        setHasPendingSpin(false);
      }
    };
    
    checkPendingSpin();
  }, []);

  const spinWheel = async () => {
    if (isSpinning || !hasPendingSpin) return;

    setIsSpinning(true);
    setResult(null);
    setWinAnimation(false);

    try {
      const winningSegmentIndex = getWeightedRandomSegment();
      const segmentAngle = 360 / segments.length;
      const targetRotation = 1800 + (winningSegmentIndex * segmentAngle) + (0.5 * segmentAngle);
      const randomOffset = Math.random() * (segmentAngle * 0.7);
      const finalRotation = rotation + targetRotation + randomOffset;

      setRotation(finalRotation);

      setTimeout(async () => {
        const points = segments[winningSegmentIndex].value;
        setResult(points);
        
        if (points > 0) {
          setWinAnimation(true);
        }

        try {
          await loyaltyService.markSpinAsUsed();
          setHasPendingSpin(false);

          if (points > 0) {
            await loyaltyService.addPointsFromSpin(points);
          } else {
            toast.info("Try again next time!");
          }
        } catch (error) {
          console.error("Error adding points:", error);
          toast.error("Failed to update points. Please try again.");
        }

        if (onComplete) onComplete(points);
        setIsSpinning(false);
      }, 5000);
    } catch (error) {
      console.error("Error in spinWheel:", error);
      setIsSpinning(false);
      toast.error("Something went wrong with the spin. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-6 relative">
      {/* Instructions */}
      <div className="text-center mb-2 text-brunch-600">
        <p className="font-medium">Spin the wheel to win loyalty points!</p>
      </div>
      
      <div className="relative">
        {/* Pointer */}
        <div className="absolute top-[-25px] left-1/2 transform -translate-x-1/2 z-10">
          <div className="w-0 h-0 border-l-[18px] border-r-[18px] border-t-[35px] border-l-transparent border-r-transparent border-t-brunch-600 drop-shadow-md" />
        </div>

        {/* Wheel */}
        <motion.div
          ref={wheelRef}
          className="w-[320px] h-[320px] rounded-full overflow-hidden relative border-[10px] border-brunch-600 shadow-lg"
          animate={{ rotate: rotation }}
          transition={{ duration: 5, type: "spring", damping: 30 }}
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {/* SVG for precise wheel segments */}
          <svg width="100%" height="100%" viewBox="0 0 100 100" className="absolute inset-0">
            <defs>
              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="2" floodOpacity="0.3" />
              </filter>
            </defs>
            {segments.map((segment, index) => {
              const angle = 360 / segments.length;
              const startAngle = index * angle - 90; // Start at top
              const endAngle = (index + 1) * angle - 90;
              
              // Convert angles to radians
              const startRad = (startAngle * Math.PI) / 180;
              const endRad = (endAngle * Math.PI) / 180;
              
              // Calculate points for the segment path
              const x1 = 50 + 50 * Math.cos(startRad);
              const y1 = 50 + 50 * Math.sin(startRad);
              const x2 = 50 + 50 * Math.cos(endRad);
              const y2 = 50 + 50 * Math.sin(endRad);
              
              // Create segment path
              const largeArcFlag = angle > 180 ? 1 : 0;
              const path = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
              
              // Calculate position for text
              const textAngle = (startAngle + endAngle) / 2;
              const textRad = (textAngle * Math.PI) / 180;
              const textDistance = 35; // Distance from center (0-50)
              const textX = 50 + textDistance * Math.cos(textRad);
              const textY = 50 + textDistance * Math.sin(textRad);
              
              return (
                <g key={index}>
                  {/* Segment */}
                  <path
                    d={path}
                    fill={segment.color}
                    stroke="rgba(0,0,0,0.1)"
                    strokeWidth="0.5"
                  />
                  
                  {/* Text container */}
                  <g
                    transform={`translate(${textX}, ${textY}) rotate(${textAngle + 90})`}
                    textAnchor="middle"
                  >
                    {/* Background for text */}
                    <rect
                      x="-20"
                      y="-12"
                      width="40"
                      height="24"
                      rx="4"
                      fill="white"
                      fillOpacity="0.85"
                      filter="url(#shadow)"
                    />
                    
                    {/* Icon */}
                    <text y="-2" fontSize="8" textAnchor="middle">
                      {segment.icon}
                    </text>
                    
                    {/* Text */}
                    <text y="7" fontSize="5" fontWeight="bold" textAnchor="middle">
                      {segment.text}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>
        </motion.div>

        {/* Center button */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 w-20 h-20 rounded-full bg-brunch-600 flex items-center justify-center shadow-md">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
            <span className="text-brunch-800 font-bold text-sm flex items-center">
              {isSpinning ? (
                <RotateCw className="h-5 w-5 animate-spin text-brunch-600" />
              ) : (
                <span className="text-brunch-700 font-bold">SPIN</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Spin button */}
      <Button
        onClick={spinWheel}
        disabled={isSpinning || !hasPendingSpin}
        className={`${isSpinning ? 'bg-brunch-400' : 'bg-brunch-500 hover:bg-brunch-600'} text-white font-bold px-8 py-6 rounded-full shadow-md transition-all duration-300 relative overflow-hidden flex items-center gap-2`}
      >
        {isSpinning ? (
          <>
            <RotateCw className="h-5 w-5 animate-spin" />
            Spinning...
          </>
        ) : hasPendingSpin ? (
          <>
            <Gift className="h-5 w-5" />
            Spin the Wheel
          </>
        ) : (
          <>
            <Coins className="h-5 w-5" />
            No Spins Available
          </>
        )}
      </Button>

      {/* Result display */}
      {result !== null && (
        <motion.div 
          className="mt-4 text-center p-4 rounded-lg bg-white shadow-md border border-brunch-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {result > 0 ? (
            <div className="flex flex-col items-center">
              <motion.div
                animate={winAnimation ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                <Trophy className="h-8 w-8 text-yellow-500 mb-2" />
              </motion.div>
              <h3 className="text-xl font-bold text-brunch-700">
                Congratulations!
              </h3>
              <p className="text-brunch-600">
                You won <span className="font-bold text-brunch-700">{result} points</span>!
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="mb-2 text-2xl">🎲</div>
              <h3 className="text-xl font-bold text-brunch-700">
                Better luck next time!
              </h3>
              <p className="text-brunch-500">Try again after your next order.</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};
