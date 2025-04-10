import MainLayout from "@/components/layout/MainLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MessageCircleIcon,
  BookOpenIcon,
  VideoIcon,
  MailIcon,
} from "lucide-react";

const Help = () => {
  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <section>
          <h1 className="text-3xl font-bold">Help & Support</h1>
          <p className="text-muted-foreground mt-1">
            Explore solutions to common questions or reach out for assistance.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <SupportCard
            icon={<MessageCircleIcon className="h-6 w-6 text-primary" />}
            title="Chat Support"
            description="Connect with our support team for real-time assistance."
            buttonText="Start Chat"
            href="mailto:yeddulamadhu6@gmail.com"
          />

          <SupportCard
            icon={<BookOpenIcon className="h-6 w-6 text-primary" />}
            title="Documentation"
            description="Explore detailed guides and documentation."
            buttonText="View Docs"
            href="https://github.com/ymadhumohanreddy/CourseGPT"
          />

          <SupportCard
            icon={<VideoIcon className="h-6 w-6 text-primary" />}
            title="Video Tutorials"
            description="Learn how to use CourseGPT with step-by-step videos."
            buttonText="Watch Videos"
            href="https://youtu.be/ndXDwEgPw7A"
          />
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <CardDescription>
              Browse commonly asked questions about CourseGPT.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map(({ id, question, answer }) => (
                <AccordionItem value={`item-${id}`} key={id}>
                  <AccordionTrigger>{question}</AccordionTrigger>
                  <AccordionContent>{answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Support</CardTitle>
            <CardDescription>
              Still need help? Reach out and we’ll get back to you shortly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LabeledInput id="name" label="Name" placeholder="Your name" />
                <LabeledInput
                  id="email"
                  label="Email"
                  type="email"
                  placeholder="Your email address"
                />
              </div>

              <LabeledInput
                id="subject"
                label="Message"
                placeholder="Describe your issue or question in detail..."
              />

              <Button type="submit" className="flex items-center gap-2">
                <MailIcon className="h-4 w-4" />
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

// ✅ Fixed: SupportCard now accepts `href` and wraps the button in <a> if present
const SupportCard = ({ icon, title, description, buttonText, href }) => (
  <Card className="bg-primary/5">
    <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
      <div className="bg-primary/10 p-3 rounded-full">{icon}</div>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>

      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2"
        >
          <Button variant="default">{buttonText}</Button>
        </a>
      ) : (
        <Button variant="default" className="mt-2">
          {buttonText}
        </Button>
      )}
    </CardContent>
  </Card>
);

// Input with Label Component
const LabeledInput = ({ id, label, placeholder, type = "text" }) => (
  <div className="space-y-2">
    <label htmlFor={id} className="text-sm font-medium">
      {label}
    </label>
    <Input id={id} type={type} placeholder={placeholder} />
  </div>
);

// FAQ Items
const faqItems = [
  {
    id: 1,
    question: "What is CourseGPT?",
    answer:
      "CourseGPT is an AI-powered platform designed to streamline and enhance course creation. It uses the Gemini API to help educators generate lesson plans, activities, assessments, and more with ease.",
  },
  {
    id: 2,
    question: "How does the AI content generation work?",
    answer:
      "CourseGPT leverages the Gemini 1.5 Flash API to generate content based on your input. Provide the subject, level, topic, and context — and the AI will generate structured, tailored content accordingly.",
  },
  {
    id: 3,
    question: "Can I edit the AI-generated content?",
    answer:
      "Absolutely! You can customize and fine-tune all generated content using our built-in Content Editor — modify structure, text, and more to suit your teaching needs.",
  },
  {
    id: 4,
    question: "How do I organize my course modules?",
    answer:
      "Use the Module Organizer to create, edit, and arrange lessons and modules via a user-friendly drag-and-drop interface. Preview your course as your students will see it.",
  },
  {
    id: 5,
    question: "Is my content secure?",
    answer:
      "Yes — we follow industry-standard security practices to protect your data and content. We never share your content with third parties without explicit consent.",
  },
];

export default Help;
