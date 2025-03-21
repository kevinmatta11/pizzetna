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
  const wheelRef = useRef<HTMLDivElement>(null);

  const spinWheel = async () => {
    if (isSpinning || !hasSpinAvailable) return;
    
    setIsSpinning(true);
    setResult(null);
    
    // Determine the winning segment (weighted random)
    const winningSegmentIndex = getWeightedRandomSegment();
    
    // Calculate the rotation to land on the winning segment
    // Each segment is 360/segments.length degrees
    const segmentAngle = 360 / segments.length;
    
    // Rotate at least 5 full spins (1800 degrees) plus the offset to land on the segment
    // We need to add 0.5 * segmentAngle to land in the middle of the segment
    const targetRotation = 1800 + (winningSegmentIndex * segmentAngle) + (0.5 * segmentAngle);
    
    // Add some randomness to make it look more natural
    const randomOffset = Math.random() * (segmentAngle * 0.7);
    const finalRotation = rotation + targetRotation + randomOffset;
    
    setRotation(finalRotation);
    
    // Wait for animation to complete
    setTimeout(async () => {
      const points = segments[winningSegmentIndex].value;
      setResult(points);
      
      if (points > 0) {
        // Add points to user's balance
        await loyaltyService.addPointsFromSpin(points);
      } else {
        toast.info("Better luck next time!");
      }
      
      if (onComplete) {
        onComplete(points);
      }
      
      // Reset the spinning state but keep the rotation value
      setIsSpinning(false);
    }, 5000); // 5 seconds to match animation duration
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-6 relative">
      <div className="relative">
        {/* Pointer/indicator */}
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
            return (
              <div
                key={index}
                className="absolute w-full h-full origin-center"
                style={{
                  transform: `rotate(${index * angle}deg)`,
                  clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((angle * Math.PI) / 180)}% ${50 - 50 * Math.sin((angle * Math.PI) / 180)}%)`
                }}
              >
                <div 
                  className="w-full h-full flex items-center justify-center pt-6"
                  style={{ backgroundColor: segment.color, transform: `rotate(${angle / 2}deg)` }}
                >
                  <p className="font-bold text-xs text-center text-brunch-800 transform -translate-y-20 rotate-90">
                    {segment.text}
                  </p>
                </div>
              </div>
            );
          })}
        </motion.div>
        
        {/* Center button */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 w-16 h-16 rounded-full bg-brunch-600 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
            <span className="text-brunch-800 font-bold text-sm">SPIN</span>
          </div>
        </div>
      </div>
      
      <Button
        onClick={spinWheel}
        disabled={isSpinning || !hasSpinAvailable}
        className="bg-brunch-500 hover:bg-brunch-600 text-white font-bold px-8 py-2 rounded-full"
      >
        {isSpinning ? "Spinning..." : hasSpinAvailable ? "Spin the Wheel" : "No Spins Available"}
      </Button>
      
      {result !== null && (
        <div className="mt-4 text-center">
          <h3 className="text-xl font-bold text-brunch-700">
            {result > 0 
              ? `Congratulations! You won ${result} points!` 
              : "Better luck next time!"}
          </h3>
        </div>
      )}
    </div>
  );
};
