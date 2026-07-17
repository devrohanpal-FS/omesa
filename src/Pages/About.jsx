

import AboutSection from "../Components/AboutSection";
import ClientSlider from "../Components/ClientsSlider";
import TeamSection from "../Components/TeamSection";

const About = () => {

  // const [animateLines, setAnimateLines] = useState(false);

  // Initial animation trigger
  // useEffect(() => {
  //   setTimeout(() => setAnimateLines(true), 100); // small delay for transition
  // }, []);

  return (
    <div className=" about-main h-full w-full bg-[#010616]" >

     <div className="h-48 sm:h-56 md:h-64 lg:h-72 xl:h-28  w-full bg-gradient-to-r from-[#03051E] via-[#0e1f4b] to-[#1D53B7]">
      {/* <h1
        className="text-4xl sm:text-2xl md:text-5xl lg:text-4xl xl:text-5xl 
                     px-4 sm:px-6 md:px-8 lg:px-12 xl:px-32
                     py-44 sm:py-10 md:py-40 lg:py-16 xl:py-48
                     mb-4 sm:mb-6 md:mb-8
                     font-normal text-white 
                     bg-gradient-to-r from-gray-500 via-neutral-300 to-slate-200 
                     bg-clip-text text-transparent
                     flex items-center"
      >
        <span
          className={`block mb-1 transform transition-all duration-700 ease-out ${
            animateLines ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          About Us
        </span>
      </h1> */}
    </div>

      <div>
        <AboutSection></AboutSection>
      </div>



      <div>
        <ClientSlider></ClientSlider>
      </div>


       {/* <div>
        <WorkProgress></WorkProgress>
      </div> */}
      <div>
        <TeamSection></TeamSection>
      </div>
     
    </div>


  )
}

export default About
