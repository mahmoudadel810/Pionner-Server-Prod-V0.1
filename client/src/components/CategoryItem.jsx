import { Link } from "react-router-dom";
import { Card, CardContent } from "./ui/card";
import { cn } from "../lib/utils";

const CategoryItem = ({ category }) => {
  // console.log(category);

  return (
    <Card className="group relative overflow-hidden h-80 w-full cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
      <Link to={`/shop?category=${category.name.toLowerCase().replace(/\s+/g, '-')}`}>
        <CardContent className="p-0 h-full">
          <div className="relative w-full h-full">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70 z-10" />

            {/* Image */}
            <img
              src={category.imageUrl}
              alt={category.name}
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
              loading="lazy"
            />

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
              <h3 className="text-white text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                {category.name}
              </h3>
              <p className="text-gray-200 text-sm opacity-90 group-hover:opacity-100 transition-opacity">
                Explore {category.name}
              </p>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};

export default CategoryItem;
