
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { loyaltyService } from '@/services/loyaltyService';

// Wheel segment definitions
const segments = [
  { text: 'Better Luck Next Time', value: 0, color: '#EEEEEE', probability: 0.5 },
  { text: '50 Points', value: 50, color: '#FFF7CD', probability: 0.2 },
  { text: 'Better Luck Next Time', value: 0, color: '#EEEEEE', probability: 0.5 },
  { text: '100 Points', value: 100, color: '#FFE7BA', probability: 0.2 },
  { text: 'Better Luck Next Time', value: 0, color: '#EEEEEE', probability: 0.5 },
  { text: '300 Points', value: 300, color: '#FFD1A1', probability: 0.1 },
  { text: 'Better Luck Next Time', value: 0, color: '#EEEEEE', probability: 0.5 },
  { text: '50 Points', value: 50, color: '#FFF7CD', probability: 0.2 },
  { text: 'Better Luck Next Time', value: 0, color: '#EEEEEE', probability: 0.5 },
  { text: '100 Points', value: 100, color: '#FFE7BA', probability: 0.2 },
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

        try {
          await loyaltyService.markSpinAsUsed();
          setHasPendingSpin(false);

          if (points > 0) {
            await loyaltyService.addPointsFromSpin(points);
          } else {
            toast.info("Better luck next time!");
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
      <div className="relative">
        {/* Pointer */}
        <div className="absolute top-[-20px] left-1/2 transform -translate-x-1/2 z-10">
          <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[30px] border-l-transparent border-r-transparent border-t-brunch-600" />
        </div>

        {/* Wheel */}
        <motion.div
          ref={wheelRef}
          className="w-[300px] h-[300px] rounded-full overflow-hidden relative border-8 border-brunch-600"
          animate={{ rotate: rotation }}
          transition={{ duration: 5, type: "spring", damping: 30 }}
        >
          {segments.map((segment, index) => {
            const angle = 360 / segments.length;
            const rotation = index * angle;

            return (
              <div
                key={index}
                className="absolute w-full h-full origin-center"
                style={{
                  transform: `rotate(${rotation}deg)`
                }}
              >
                <div
                  className="absolute w-1/2 h-full flex items-center justify-center"
                  style={{
                    backgroundColor: segment.color,
                    transform: `skewY(-${90 - angle}deg) rotate(${angle / 2}deg)`,
                    transformOrigin: '100% 50%',
                    clipPath: `polygon(100% 0, 100% 100%, 0% 50%)`
                  }}
                >
                  <div
                    className="text-center text-xs font-bold text-brunch-800"
                    style={{
                      transform: `rotate(-${angle / 2}deg)`,
                      whiteSpace: 'nowrap',
                      textShadow: '0px 0px 2px white, 0px 0px 2px white'
                    }}
                  >
                    {segment.text}
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Center Button (non-clickable) */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 w-16 h-16 rounded-full bg-brunch-600 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
            <span className="text-brunch-800 font-bold text-sm">SPIN</span>
          </div>
        </div>
      </div>

      {/* Spin Button */}
      <Button
        onClick={spinWheel}
        disabled={isSpinning || !hasPendingSpin}
        className="bg-brunch-500 hover:bg-brunch-600 text-white font-bold px-8 py-2 rounded-full"
      >
        {isSpinning ? "Spinning..." : hasPendingSpin ? "Spin the Wheel" : "No Spins Available"}
      </Button>

      {result !== null && (
        <div className="mt-4 text-center">
          <h3 className="text-xl font-bold text-brunch-700">
            {result > 0 ? `Congratulations! You won ${result} points!` : "Better luck next time!"}
          </h3>
        </div>
      )}
    </div>
  );
};
