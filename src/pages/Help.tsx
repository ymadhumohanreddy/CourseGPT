
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircleIcon, BookOpenIcon, VideoIcon, MailIcon } from "lucide-react";

const Help = () => {
  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Help & Support</h1>
          <p className="text-muted-foreground mt-1">
            Find answers to common questions and get support
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-primary/5">
            <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <MessageCircleIcon className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Chat Support</CardTitle>
              <CardDescription>
                Chat with our support team for immediate assistance
              </CardDescription>
              <Button variant="default" className="mt-2">
                Start Chat
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-primary/5">
            <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <BookOpenIcon className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Documentation</CardTitle>
              <CardDescription>
                Browse our comprehensive documentation and guides
              </CardDescription>
              <Button variant="default" className="mt-2">
                View Docs
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-primary/5">
            <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <VideoIcon className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Video Tutorials</CardTitle>
              <CardDescription>
                Watch video tutorials to learn how to use CourseGPT
              </CardDescription>
              <Button variant="default" className="mt-2">
                Watch Videos
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <CardDescription>
              Find answers to the most common questions about CourseGPT
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>What is CourseGPT?</AccordionTrigger>
                <AccordionContent>
                  CourseGPT is an AI-powered platform that simplifies and enhances the course creation process. 
                  It leverages the Gemini API to help educators and content creators generate lesson plans, 
                  activities, assessments, and more with minimal effort.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger>How does the AI content generation work?</AccordionTrigger>
                <AccordionContent>
                  CourseGPT uses the Gemini 1.5 Flash API to generate educational content based on your input. 
                  Simply provide the subject, level, topic, and any additional context, and the AI will 
                  create comprehensive lesson plans, activities, and assessments tailored to your needs.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger>Can I edit the AI-generated content?</AccordionTrigger>
                <AccordionContent>
                  Yes! All AI-generated content can be edited and customized using our Content Editor. 
                  You can modify the text, format, structure, and more to ensure the content meets your 
                  specific requirements and teaching style.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger>How do I organize my course modules?</AccordionTrigger>
                <AccordionContent>
                  The Module Organizer allows you to create, edit, and arrange course modules and lessons 
                  with an intuitive drag-and-drop interface. You can easily structure your course, add new 
                  modules and lessons, and preview how your course will look to students.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5">
                <AccordionTrigger>Is my content secure?</AccordionTrigger>
                <AccordionContent>
                  Yes, your content is secure. We use industry-standard security measures to protect your 
                  data and content. We do not share your content with third parties without your explicit 
                  permission.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Contact Support</CardTitle>
            <CardDescription>
              Can't find what you're looking for? Contact our support team.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Name</label>
                  <Input id="name" placeholder="Your name" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <Input id="email" type="email" placeholder="Your email address" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                <Input id="subject" placeholder="How can we help you?" />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">Message</label>
                <textarea 
                  id="message" 
                  rows={4} 
                  className="w-full p-2 border rounded-md" 
                  placeholder="Please describe your issue or question in detail..."
                />
              </div>
              
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

export default Help;
