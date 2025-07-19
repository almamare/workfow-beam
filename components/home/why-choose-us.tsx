import { Shield, Clock, Award, HeadphonesIcon, Globe, CreditCard } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Secure Booking',
    description: 'Your personal and payment information is protected with industry-leading security measures.',
  },
  {
    icon: Clock,
    title: '24/7 Customer Support',
    description: 'Our travel experts are available around the clock to assist you with any questions or concerns.',
  },
  {
    icon: Award,
    title: 'Best Price Guarantee',
    description: 'Find a lower price elsewhere? We\'ll match it and give you an additional 5% discount.',
  },
  {
    icon: Globe,
    title: 'Global Network',
    description: 'Access to over 500 airlines and 1 million hotels worldwide with exclusive partnerships.',
  },
  {
    icon: CreditCard,
    title: 'Flexible Payment',
    description: 'Multiple payment options including installments and pay-later options for your convenience.',
  },
  {
    icon: HeadphonesIcon,
    title: 'Expert Travel Advice',
    description: 'Get personalized recommendations from our experienced travel consultants.',
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose SkyWings?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We're committed to making your travel experience seamless, secure, and memorable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center group hover:bg-white dark:hover:bg-gray-800 p-6 rounded-xl transition-all duration-300 hover:shadow-lg"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-sky-100 to-blue-100 dark:from-sky-900 dark:to-blue-900 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="h-8 w-8 text-sky-600 dark:text-sky-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-8 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>SSL Secured</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="h-4 w-4" />
              <span>IATA Certified</span>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4" />
              <span>Global Coverage</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}