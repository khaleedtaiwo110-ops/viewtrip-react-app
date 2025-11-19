import { motion } from "framer-motion";

const AirplaneSVG = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    className="w-full h-full"
    fill="white"
  >
    <path d="M2 30 L62 2 L58 10 L38 24 L50 26 L50 36 L38 38 L58 52 L62 60 L2 32 Z" />
  </svg>
);

export default function AirplaneLoader() {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center z-50">
      <motion.div
        style={{ width: 120, height: 120 }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        className="mb-4"
      >
        <AirplaneSVG />
      </motion.div>
      <p className="text-white text-lg font-semibold animate-pulse">Loading...</p>
    </div>
  );
}
