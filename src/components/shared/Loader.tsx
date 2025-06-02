import Image from "next/image"; 

const Loader = () => {
  return (
    <div className="flex-center w-full">
      <Image
        src="/assets/icons/loader.svg" 
        alt="loader"
        width={24} 
        height={24} 
        className="animate-spin" 
      />
    </div>
  );
};

export default Loader;