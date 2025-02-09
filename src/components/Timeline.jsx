import React, { useState, useEffect, useRef } from "react";
import { motion, useAnimationControls } from "framer-motion";

const BranchingTreeTimeline = ({
  events = [
    { id: 1, title: "Root Timeline", date: "Start", branch: 0 },
    { id: 2, title: "Branching Event", date: "Split Occurred", branch: 1 },
    { id: 3, title: "Divergence", date: "New Growth", branch: -1 },
    { id: 4, title: "Correction", date: "Path Adjusted", branch: 1 },
    { id: 5, title: "Correction", date: "Path Adjusted", branch: -1 },
    { id: 6, title: "Further Growth", date: "Expanded", branch: 1 },
    { id: 7, title: "Main Path", date: "Continued", branch: 0 },
  ],
}) => {
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const timelineRef = useRef(null);
  const mainLineControls = useAnimationControls();

  const centerY = 300;
  const branchLength = 100;
  const horizontalOffset = 160;
  const totalWidth = events.length * horizontalOffset;
  const totalHeight = 600;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          mainLineControls.start("visible");
        }
      },
      { threshold: 0.2 },
    );

    if (timelineRef.current) {
      observer.observe(timelineRef.current);
    }

    return () => observer.disconnect();
  }, [mainLineControls]);

  const getBranchEndPoint = (startX, branch) => {
    if (branch === 0) return { x: startX, y: centerY };
    const endX = startX + horizontalOffset / 2;
    const endY = centerY + branch * branchLength;
    return { x: endX, y: endY };
  };

  const getBranchPath = (startX, branch) => {
    if (branch === 0) return "";
    const endpoint = getBranchEndPoint(startX, branch);
    const controlX1 = startX + horizontalOffset / 3;
    const controlY1 = centerY - branch * branchLength * 0.6;
    const controlX2 = startX + horizontalOffset / 1.5;
    const controlY2 = centerY + branch * branchLength * 0.6;
    return `M ${startX} ${centerY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endpoint.x} ${endpoint.y}`;
  };

  const mainLineVariants = {
    hidden: { pathLength: 0 },
    visible: {
      pathLength: 1,
      transition: {
        duration: 3,
        ease: "linear",
      },
    },
  };

  const calculateBranchDelay = (index) => {
    const branchPosition =
      (index * horizontalOffset + 100) / (totalWidth - 100);
    return branchPosition * 3;
  };

  const branchVariants = (index) => ({
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        duration: 1,
        type: "spring",
        stiffness: 50,
        delay: calculateBranchDelay(index),
      },
    },
  });

  const nodeVariants = (index) => ({
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 10,
        delay: calculateBranchDelay(index),
      },
    },
  });

  return (
    <div className="w-full p-8 rounded-lg overflow-x-auto" ref={timelineRef}>
      <div
        className="relative"
        style={{
          width: "100%",
          maxWidth: totalWidth,
          height: totalHeight,
          minHeight: "400px", // Adjust for smaller screens
        }}
      >
        <svg
          width="100%"
          height={totalHeight}
          className="absolute inset-0"
        >
          <g>
            <motion.line
              x1="50"
              y1={centerY}
              x2={totalWidth - 50}
              y2={centerY}
              stroke="#f8861e"
              strokeWidth="6"
              strokeOpacity="0.6"
              initial="hidden"
              animate={mainLineControls}
              variants={mainLineVariants}
            />
          </g>
          {events.map(
            (event, index) =>
              event.branch !== 0 && (
                <g key={`branch-${event.id}`}>
                  <motion.path
                    d={getBranchPath(
                      index * horizontalOffset + 100,
                      event.branch,
                    )}
                    stroke="#f8861e"
                    strokeWidth="4"
                    fill="none"
                    initial="hidden"
                    animate={isVisible ? "visible" : "hidden"}
                    variants={branchVariants(index)}
                  />
                  <motion.circle
                    cx={index * horizontalOffset + 100}
                    cy={centerY}
                    r="5"
                    fill="#f8861e"
                    variants={nodeVariants(index)}
                    initial="hidden"
                    animate={isVisible ? "visible" : "hidden"}
                  />
                </g>
              ),
          )}
        </svg>
        <div className="relative h-full">
          {events.map((event, index) => {
            const startX = index * horizontalOffset + 100;
            const endpoint = getBranchEndPoint(startX, event.branch);
            return (
              <motion.div
                key={event.id}
                className="absolute"
                style={{
                  left: `${endpoint.x}px`,
                  top: `${endpoint.y}px`,
                }}
                initial="hidden"
                animate={isVisible ? "visible" : "hidden"}
                variants={nodeVariants(index)}
              >
                <div
                  className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                  onMouseEnter={() => setHoveredEvent(event.id)}
                  onMouseLeave={() => setHoveredEvent(null)}
                >
                  <div className="absolute w-6 h-6 bg-[#f8861e] rounded-full" />
                </div>
                {hoveredEvent === event.id && (
                  <div className="absolute z-10 transform -translate-x-1/2 bg-gray-800 p-4 rounded-lg border border-[#f8861e] backdrop-blur-md transition-all w-48 shadow-lg mt-8">
                    <h3 className="text-[#f8861e] font-medium mb-1">
                      {event.title}
                    </h3>
                    <p className="text-gray-400 text-sm">{event.date}</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BranchingTreeTimeline;
