import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Code, Users, Zap, Globe, Lock, Cpu } from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center">
        {icon}
        <span className="ml-2">{title}</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <CardDescription>{description}</CardDescription>
    </CardContent>
  </Card>
);

interface TestimonialProps {
  quote: string;
  author: string;
  role: string;
}

const Testimonial: React.FC<TestimonialProps> = ({ quote, author, role }) => (
  <Card className="bg-gray-100">
    <CardContent className="pt-6">
      <p className="text-lg italic mb-4">"{quote}"</p>
      <p className="font-semibold">{author}</p>
      <p className="text-sm text-gray-600">{role}</p>
    </CardContent>
  </Card>
);

const LandingPage: React.FC = () => {
  const features: FeatureCardProps[] = [
    {
      icon: <Code />,
      title: "Real-time Editing",
      description: "Edit code simultaneously with your team members, seeing changes instantly."
    },
    {
      icon: <Users />,
      title: "Multi-user Collaboration",
      description: "Invite team members to join your coding sessions and work together effortlessly."
    },
    {
      icon: <Zap />,
      title: "Instant Syncing",
      description: "Changes sync instantly across all connected devices, ensuring everyone is up-to-date."
    },
    {
      icon: <Globe />,
      title: "Cross-platform Compatibility",
      description: "Access your collaborative workspace from any device, anywhere in the world."
    },
    {
      icon: <Lock />,
      title: "Secure Environment",
      description: "Your code is protected with state-of-the-art encryption and security measures."
    },
    {
      icon: <Cpu />,
      title: "Resource utilization",
      description: "Abundant resources to avoid bottleneck and provide seamless coding experience."
    }
  ];

  const testimonials: TestimonialProps[] = [
    {
      quote: "This collaborative editor has revolutionized our team's workflow. We're more productive than ever!",
      author: "Sarah Johnson",
      role: "Lead Developer at TechCorp"
    },
    {
      quote: "The real-time collaboration feature is a game-changer for our remote team. It's like we're all in the same room.",
      author: "Michael Chen",
      role: "CTO of StartupX"
    },
    {
      quote: "I've tried many collaborative coding tools, but this one stands out for its performance and user-friendly interface.",
      author: "Emily Rodriguez",
      role: "Freelance Software Engineer"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <section className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Collaborative Code Editor</h1>
        <p className="text-xl mb-8">Real-time collaboration for seamless coding experiences</p>
        <Button size="lg">
          Get Started
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Features that Empower Your Team</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">What Our Users Say</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Testimonial key={index} {...testimonial} />
          ))}
        </div>
      </section>

      <section className="text-center bg-gray-100 py-16 rounded-lg">
        <h2 className="text-3xl font-bold mb-4">Experience the Future of Collaborative Coding</h2>
        <p className="text-lg mb-8">Join thousands of developers who are already using our platform to code smarter, faster, and more efficiently.</p>
        <Button size="lg">
          Start Collaborating Now
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </section>
    </div>
  );
};

export default LandingPage;