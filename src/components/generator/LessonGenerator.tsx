
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateLesson, GenerateLessonParams } from "@/services/geminiService";
import { Loader2Icon, SaveIcon, SparklesIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import MarkdownPreview from "../shared/MarkdownPreview";

const LessonGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lessonParams, setLessonParams] = useState<GenerateLessonParams>({
    subject: "",
    level: "intermediate",
    topic: "",
    additionalContext: "",
  });
  const [generatedContent, setGeneratedContent] = useState("");
  const { toast } = useToast();

  const handleParamChange = (field: keyof GenerateLessonParams, value: string) => {
    setLessonParams((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    if (!lessonParams.subject || !lessonParams.topic) {
      toast({
        title: "Missing information",
        description: "Please provide both subject and topic",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await generateLesson(lessonParams);
      
      if (response.error) {
        toast({
          title: "Generation Error",
          description: response.error,
          variant: "destructive",
        });
      } else {
        setGeneratedContent(response.text);
        toast({
          title: "Lesson Generated",
          description: "Your lesson content has been successfully created",
        });
      }
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Failed to generate lesson content",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    // Implementation for saving lesson
    toast({
      title: "Lesson Saved",
      description: "Your lesson has been saved to your content library",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Lesson Generator</h1>
        <p className="text-muted-foreground mt-1">
          Use AI to create educational content for your courses
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Create New Lesson</CardTitle>
            <CardDescription>
              Provide details about the lesson you want to generate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="e.g. Computer Science, Mathematics, History"
                value={lessonParams.subject}
                onChange={(e) => handleParamChange("subject", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="level">Level</Label>
              <Select 
                value={lessonParams.level} 
                onValueChange={(value) => handleParamChange("level", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                placeholder="e.g. Introduction to Neural Networks"
                value={lessonParams.topic}
                onChange={(e) => handleParamChange("topic", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="context">Additional Context (Optional)</Label>
              <Textarea
                id="context"
                placeholder="Add any specific requirements or context for the lesson"
                rows={4}
                value={lessonParams.additionalContext}
                onChange={(e) => handleParamChange("additionalContext", e.target.value)}
              />
            </div>
            
            <Button 
              onClick={handleGenerate} 
              className="w-full gap-2" 
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <SparklesIcon className="h-4 w-4" />
                  Generate Lesson
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="h-min lg:max-h-[calc(100vh-10rem)] lg:overflow-y-auto">
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              Generated lesson content will appear here
            </CardDescription>
          </CardHeader>
          <CardContent>
            {generatedContent ? (
              <div className="space-y-4">
                <MarkdownPreview markdown={generatedContent} />
                <Button 
                  onClick={handleSave} 
                  variant="outline" 
                  className="gap-2 mt-4"
                >
                  <SaveIcon className="h-4 w-4" />
                  Save to Library
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-10 text-center border rounded-md border-dashed">
                <SparklesIcon className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  Generated content will appear here. Fill in the form and click Generate Lesson.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LessonGenerator;
