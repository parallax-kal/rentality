import { Landing } from "@/components/home/Landing";
import HomeCarousel from "@/components/home/HomeCarousel";
import Testimonies from "@/components/home/Testimonies";
import { BackgroundBeams } from "@/components/ui/background-beams";

export default function Home() {
  return (
    <div>
      <BackgroundBeams />
      <Landing />
      <div className="bg-gray-100 dark:bg-neutral-950 py-4 px-1">
        <div className="max-w-[80rem] xl:px-0 px-12 overflow-x-hidden mx-auto">
          <div className="sm:text-[41px] text-[25px] font-semibold">
            Top Offers
          </div>
          <div>
            Fulfill your career dreams, enjoy all the achievements of the city
            center and luxury housing to the fullest.
          </div>
          <HomeCarousel />
        </div>
      </div>
      <div className="bg-gray-100 py-28 dark:bg-neutral-950 ">
        <div className="max-w-[80rem] flex justify-between mx-auto">
          <div className="text-[32px] max-w-[19rem]">Insights and Performance Metrics</div>
          <div className="flex gap-5 text-white font-medium">
            <div className="bg-primary flex items-center justify-center rounded-xl flex-col p-5">
              <div className="text-4xl font-bold">10+</div>
              <div>Total listing in system.</div>
            </div>
            <div className="bg-primary flex items-center justify-center rounded-xl flex-col p-5">
              <div className="text-4xl font-bold">5+</div>
              <div>Total bookings in system.</div>
            </div>
          </div>
        </div>
      </div>
      <div className="py-12">
        <div className="container mb-12">
          <h2 className="text-3xl font-bold text-center">
            What Our Guests Say
          </h2>
          <div className="text-xl text-center text-muted-foreground">
            These are reviews from satisified customers.
          </div>
          <Testimonies />
        </div>
      </div>
    </div>
  );
}
