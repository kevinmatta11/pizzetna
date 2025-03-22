
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { loyaltyService } from '@/services/loyaltyService';

// Wheel segment definitions with improved weightings and visuals
const segments = [
  { text: 'Better Luck Next Time', value: 0, color: '#EEEEEE', probability: 0.3 },
  { text: '50 Points', value: 50, color: '#FFF7CD', probability: 0.25 },
  { text: 'Better Luck Next Time', value: 0, color: '#EEEEEE', probability: 0.3 },
  { text: '100 Points', value: 100, color: '#FFE7BA', probability: 0.2 },
  { text: 'Better Luck Next Time', value: 0, color: '#EEEEEE', probability: 0.3 },
  { text: '300 Points', value: 300, color: '#FFD1A1', probability: 0.1 },
  { text: 'Better Luck Next Time', value: 0, color: '#EEEEEE', probability: 0.3 },
  { text: '50 Points', value: 50, color: '#FFF7CD', probability: 0.25 },
  { text: 'Better Luck Next Time', value: 0, color: '#EEEEEE', probability: 0.3 },
  { text: '100 Points', value: 100, color: '#FFE7BA', probability: 0.2 },
];

// Improved weighted random selection with better distribution
const getWeightedRandomSegment = () => {
  // Normalize probabilities to ensure they sum to 1
  const totalProbability = segments.reduce((acc, segment) => acc + segment.probability, 0);
  const normalizedSegments = segments.map(segment => ({
    ...segment,
    probability: segment.probability / totalProbability
  }));
  
  // Get a random value between 0 and 1
  const random = Math.random();
  let cumulativeProbability = 0;
  
  for (let i = 0; i < normalizedSegments.length; i++) {
    cumulativeProbability += normalizedSegments[i].probability;
    if (random <= cumulativeProbability) {
      return i;
    }
  }
  
  return 0; // Fallback
};

// Function to calculate the rotation angle to land on a specific segment
const calculateTargetRotation = (segmentIndex: number, currentRotation: number) => {
  const segmentAngle = 360 / segments.length;
  const segmentOffset = segmentAngle / 2; // Target middle of segment
  
  // Calculate base rotation (minimum 5 full rotations + offset to target segment)
  const baseRotation = 1800 + (segmentIndex * segmentAngle);
  
  // Small random offset for natural feel (10% of segment width)
  const randomOffset = (Math.random() - 0.5) * (segmentAngle * 0.2);
  
  // Calculate final rotation from current position
  return currentRotation + baseRotation + segmentOffset + randomOffset;
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
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null);

  const spinWheel = async () => {
    if (isSpinning || !hasSpinAvailable) return;
    
    setIsSpinning(true);
    setResult(null);
    
    try {
      // Determine the winning segment (weighted random)
      const winningSegmentIndex = getWeightedRandomSegment();
      setSelectedSegment(winningSegmentIndex);
      
      // Calculate precise rotation to land on the winning segment
      const targetRotation = calculateTargetRotation(winningSegmentIndex, rotation);
      setRotation(targetRotation);
      
      // Wait for animation to complete
      setTimeout(async () => {
        const points = segments[winningSegmentIndex].value;
        setResult(points);
        
        if (points > 0) {
          try {
            // Add points to user's balance
            await loyaltyService.addPointsFromSpin(points);
          } catch (error) {
            console.error("Error adding points:", error);
            toast.error("Failed to add points. Please try again.");
          }
        } else {
          toast.info("Better luck next time!");
        }
        
        // Always call onComplete, even if points were not added successfully
        if (onComplete) {
          onComplete(points);
        }
        
        // Reset the spinning state but keep the rotation value
        setIsSpinning(false);
      }, 5000); // 5 seconds to match animation duration
    } catch (error) {
      console.error("Error in spinWheel:", error);
      setIsSpinning(false);
      toast.error("Something went wrong with the spin. Please try again.");
    }
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
          transition={{ 
            duration: 5, 
            type: "spring", 
            damping: 30,
            ease: "easeOut"
          }}
        >
          {segments.map((segment, index) => {
            const angle = 360 / segments.length;
            const isHighlighted = selectedSegment === index && !isSpinning && result !== null;
            
            return (
              <div
                key={index}
                className={`absolute w-full h-full origin-center ${isHighlighted ? 'z-10' : ''}`}
                style={{
                  transform: `rotate(${index * angle}deg)`,
                  clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((angle * Math.PI) / 180)}% ${50 - 50 * Math.sin((angle * Math.PI) / 180)}%)`
                }}
              >
                <div 
                  className={`w-full h-full flex items-center justify-center pt-6 ${isHighlighted ? 'ring-4 ring-yellow-400' : ''}`}
                  style={{ 
                    backgroundColor: segment.color, 
                    transform: `rotate(${angle / 2}deg)`,
                    transition: "all 0.3s ease"
                  }}
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
