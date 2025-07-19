import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    avatar: 'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    rating: 5,
    text: 'Amazing service! SkyWings helped me plan the perfect honeymoon to Bali. The booking process was smooth and their customer support was exceptional.',
    location: 'New York, USA',
    trip: 'Honeymoon to Bali',
  },
  {
    id: 2,
    name: 'Michael Chen',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    rating: 5,
    text: 'I\'ve been using SkyWings for my business travels for over a year. They consistently find the best deals and their mobile app is incredibly user-friendly.',
    location: 'San Francisco, USA',
    trip: 'Business Travel',
  },
  {
    id: 3,
    name: 'Emma Thompson',
    avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    rating: 5,
    text: 'The visa application process was so much easier with SkyWings. They handled everything professionally and kept me updated throughout the process.',
    location: 'London, UK',
    trip: 'Work Visa to Australia',
  },
  {
    id: 4,
    name: 'David Rodriguez',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    rating: 5,
    text: 'Fantastic experience! The hotel recommendations were spot-on and saved me so much time. Will definitely use SkyWings for all my future travels.',
    location: 'Madrid, Spain',
    trip: 'Family Vacation to Japan',
  },
  {
    id: 5,
    name: 'Lisa Park',
    avatar: 'https://images.pexels.com/photos/2613260/pexels-photo-2613260.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    rating: 5,
    text: 'Their 24/7 customer support saved my trip when my flight got cancelled. They rebooked me immediately and even upgraded my hotel. Incredible service!',
    location: 'Seoul, South Korea',
    trip: 'Solo Trip to Europe',
  },
  {
    id: 6,
    name: 'James Wilson',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    rating: 5,
    text: 'The price guarantee feature is amazing! I found a cheaper flight elsewhere and they not only matched it but gave me an extra discount. Highly recommended!',
    location: 'Toronto, Canada',
    trip: 'Adventure Trip to New Zealand',
  },
];

export default function Testimonials() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What Our Travelers Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust SkyWings for their travel needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  "{testimonial.text}"
                </p>
                
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                    <p className="text-xs text-sky-600 font-medium">{testimonial.trip}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-4 bg-gray-50 dark:bg-gray-800 rounded-full px-6 py-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-lg font-semibold">4.9/5</span>
            <span className="text-muted-foreground">from 12,000+ reviews</span>
          </div>
        </div>
      </div>
    </section>
  );
}