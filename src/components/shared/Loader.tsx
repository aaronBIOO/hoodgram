import Image from "next/image"; // Import Next.js Image component

// A simple placeholder for a loading spinner
const Loader = () => {
  return (
    <div className="flex-center w-full">
      {/* You can replace this with an actual loading spinner GIF/SVG later */}
      <Image
        src="/assets/icons/loader.svg" // Placeholder path for a loader icon
        alt="loader"
        width={24} // Specify width for Next.js Image
        height={24} // Specify height for Next.js Image
        className="animate-spin" // Example: Add a spinning animation with Tailwind CSS
      />
    </div>
  );
};

export default Loader;