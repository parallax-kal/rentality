import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";

const FeaturedLocations = () => {
  const locations = [
    {
      title: "Paris",
      description: "The city of love and lights.",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/La_Tour_Eiffel_vue_de_la_Tour_Saint-Jacques%2C_Paris_ao%C3%BBt_2014_%282%29.jpg/1024px-La_Tour_Eiffel_vue_de_la_Tour_Saint-Jacques%2C_Paris_ao%C3%BBt_2014_%282%29.jpg",
    },
    {
      title: "New York",
      description: "The city that never sleeps.",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu.jpg/288px-View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu.jpg",
    },
    {
      title: "Bali",
      description: "Tropical paradise with stunning beaches.",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Pura_Bratan_Bali.jpg/220px-Pura_Bratan_Bali.jpg",
    },
    {
      title: "Tokyo",
      description: "A vibrant mix of tradition and modernity.",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Skyscrapers_of_Shinjuku_2009_January.jpg/1280px-Skyscrapers_of_Shinjuku_2009_January.jpg",
    },
  ];

  return (
    <div className="py-12 bg-gray-100 dark:bg-neutral-950">
      <div className="container">
        <h2 className="text-3xl font-bold text-center mb-6">
          Featured Locations
        </h2>
        <BentoGrid className="max-w-6xl mx-auto">
          {locations.map((location, index) => (
            <BentoGridItem
              key={index}
              title={location.title}
              description={location.description}
              image={location.image}
              className={index === 0 || index === 3 ? "md:col-span-2" : ""}
            />
          ))}
        </BentoGrid>
      </div>
    </div>
  );
};

export default FeaturedLocations;
