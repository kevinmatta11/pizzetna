import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { loyaltyService } from '@/services/loyaltyService';
import { Trophy, Gift, Coins, RotateCw } from 'lucide-react';
import confetti from 'canvas-confetti';

// Define the wheel segments with their values, display text, colors, and icons
const segments = [
  { text: 'Try Again', value: 0, color: '#F1F1F1', icon: '🎲' },
  { text: '50 Points', value: 50, color: '#FFE7AD', icon: '🌟' },
  { text: 'Try Again', value: 0, color: '#F1F1F1', icon: '🎲' },
  { text: '100 Points', value: 100, color: '#FFDDA1', icon: '✨' },
  { text: '300 Points', value: 300, color: '#FFC285', icon: '🎁' },
];

// Function to get the index based on point value
const getSegmentIndexByValue = (value: number): number => {
  const index = segments.findIndex(segment => segment.value === value);
  return index >= 0 ? index : 0; // Default to first segment if not found
};

interface SpinningWheelProps {
  onComplete?: (points: number) => void;
  hasSpinAvailable?: boolean;
  orderId?: string | null;
}

export const SpinningWheel: React.FC<SpinningWheelProps> = ({ 
  onComplete,
  hasSpinAvailable = false,
  orderId = null 
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  const [winAnimation, setWinAnimation] = useState(false);
  const [winningSegmentIndex, setWinningSegmentIndex] = useState<number | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const confettiRef = useRef<HTMLDivElement>(null);
  
  const triggerConfetti = () => {
    if (!confettiRef.current) return;
    
    const rect = confettiRef.current.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { 
        x: x / window.innerWidth, 
        y: y / window.innerHeight 
      }
    });
  };

  const spinWheel = async () => {
    if (isSpinning || !hasSpinAvailable) return;

    setIsSpinning(true);
    setResult(null);
    setWinAnimation(false);
    setWinningSegmentIndex(null);

    try {
      // Call backend to calculate the reward
      const points = await loyaltyService.calculateSpinReward();
      
      // Find segment index based on the reward points
      const selectedSegmentIndex = getSegmentIndexByValue(points);
      setWinningSegmentIndex(selectedSegmentIndex);
      
      // Calculate rotation angle to land on this segment
      const segmentAngle = 360 / segments.length;
      const targetRotation = 1800 + (selectedSegmentIndex * segmentAngle);
      const finalRotation = rotation + targetRotation + (segmentAngle / 2);

      setRotation(finalRotation);

      // Wait for animation to finish before showing result
      setTimeout(async () => {
        setResult(points);
        
        // Show win animation for non-zero points
        if (points > 0) {
          setWinAnimation(true);
          // Add a small delay before triggering confetti
          setTimeout(() => {
            triggerConfetti();
          }, 300);
        }

        try {
          // Mark spin as used in database if orderId provided
          if (orderId) {
            await loyaltyService.markSpinUsed(orderId);
          }
          
          // Add points if won
          if (points > 0) {
            await loyaltyService.addPointsFromWheel(points);
          } else {
            toast.info("Better luck next time!");
          }
        } catch (error) {
          console.error("Error processing spin result:", error);
          toast.error("Failed to process spin result. Please try again.");
        }

        // Call onComplete callback
        if (onComplete) onComplete(points);
        
        setIsSpinning(false);
      }, 5000);
    } catch (error) {
      console.error("Error in spinWheel:", error);
      setIsSpinning(false);
      
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong with the spin. Please try again.");
      }
    }
  };

  return (
    <div ref={confettiRef} className="flex flex-col items-center justify-center gap-6 py-6 relative">
      <div className="text-center mb-2 text-pizzetna-600">
        <p className="font-medium">Spin the wheel to win loyalty points!</p>
      </div>
      
      <div className="relative">
        <div className="absolute top-[-25px] left-1/2 transform -translate-x-1/2 z-10">
          <div className="w-0 h-0 border-l-[18px] border-r-[18px] border-t-[35px] border-l-transparent border-r-transparent border-t-pizzetna-600 drop-shadow-md" />
        </div>

        <motion.div
          ref={wheelRef}
          className="w-[320px] h-[320px] rounded-full overflow-hidden relative border-[10px] border-pizzetna-600 shadow-lg"
          animate={{ rotate: rotation }}
          transition={{ duration: 5, type: "spring", damping: 30 }}
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <svg width="100%" height="100%" viewBox="0 0 100 100" className="absolute inset-0">
            <defs>
              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="1" floodOpacity="0.2" />
              </filter>
            </defs>
            {segments.map((segment, index) => {
              const angle = 360 / segments.length;
              const startAngle = index * angle - 90;
              const endAngle = (index + 1) * angle - 90;
              
              const startRad = (startAngle * Math.PI) / 180;
              const endRad = (endAngle * Math.PI) / 180;
              
              const x1 = 50 + 50 * Math.cos(startRad);
              const y1 = 50 + 50 * Math.sin(startRad);
              const x2 = 50 + 50 * Math.cos(endRad);
              const y2 = 50 + 50 * Math.sin(endRad);
              
              const largeArcFlag = angle > 180 ? 1 : 0;
              const path = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
              
              const textAngle = (startAngle + endAngle) / 2;
              const textRad = (textAngle * Math.PI) / 180;
              const textDistance = 32;
              const textX = 50 + textDistance * Math.cos(textRad);
              const textY = 50 + textDistance * Math.sin(textRad);
              
              return (
                <g key={index}>
                  <path
                    d={path}
                    fill={segment.color}
                    stroke="rgba(0,0,0,0.1)"
                    strokeWidth="0.5"
                  />
                  
                  <g
                    transform={`translate(${textX}, ${textY}) rotate(${textAngle + 90})`}
                    textAnchor="middle"
                  >
                    <text 
                      fontSize="4.5" 
                      fontWeight="bold" 
                      textAnchor="middle" 
                      fill="#333"
                      filter="url(#shadow)"
                      style={{ textShadow: "0px 0px 2px rgba(255,255,255,0.8)" }}
                    >
                      {segment.text}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>
        </motion.div>

        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 w-20 h-20 rounded-full bg-pizzetna-600 flex items-center justify-center shadow-md">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
            <span className="text-pizzetna-800 font-bold text-sm flex items-center">
              {isSpinning ? (
                <RotateCw className="h-5 w-5 animate-spin text-pizzetna-600" />
              ) : (
                <span className="text-pizzetna-700 font-bold">SPIN</span>
              )}
            </span>
          </div>
        </div>
      </div>

      <Button
        onClick={spinWheel}
        disabled={isSpinning || !hasSpinAvailable}
        className={`${isSpinning ? 'bg-pizzetna-400' : 'bg-pizzetna-500 hover:bg-pizzetna-600'} text-white font-bold px-8 py-6 rounded-full shadow-md transition-all duration-300 relative overflow-hidden flex items-center gap-2`}
      >
        {isSpinning ? (
          <>
            <RotateCw className="h-5 w-5 animate-spin" />
            Spinning...
          </>
        ) : hasSpinAvailable ? (
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

      <AnimatePresence>
        {result !== null && winningSegmentIndex !== null && (
          <motion.div 
            className="mt-4 text-center p-4 rounded-lg bg-white shadow-md border border-pizzetna-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
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
                <h3 className="text-xl font-bold text-pizzetna-700">
                  Congratulations!
                </h3>
                <p className="text-pizzetna-600">
                  You won <span className="font-bold text-pizzetna-700">{result} points</span>!
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="mb-2 text-2xl">🎲</div>
                <h3 className="text-xl font-bold text-pizzetna-700">
                  Better luck next time!
                </h3>
                <p className="text-pizzetna-500">Try again after your next order.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
