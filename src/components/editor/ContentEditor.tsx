
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { enhanceContent } from "@/services/geminiService";
import { 
  SparklesIcon, 
  SaveIcon, 
  Loader2Icon, 
  PlusIcon, 
  Undo2Icon, 
  Redo2Icon,
  EyeIcon,
  CodeIcon,
  TextIcon
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MarkdownPreview from "../shared/MarkdownPreview";

interface Enhancement {
  instruction: string;
  beforeContent: string;
  afterContent: string;
}

const ContentEditor = () => {
  const [title, setTitle] = useState("Introduction to Neural Networks");
  const [content, setContent] = useState(`# Introduction to Neural Networks

## Learning Objectives
- Understand the basic structure of neural networks
- Learn about activation functions
- Explore simple applications of neural networks

## What are Neural Networks?

Neural networks are computational models inspired by the human brain. They consist of nodes (neurons) connected in layers that process information and learn patterns.

### Basic Structure

1. Input Layer: Receives initial data
2. Hidden Layers: Process and transform the data
3. Output Layer: Produces the final result

## Key Concepts

- **Weights**: Parameters that determine the strength of connections
- **Bias**: Additional parameter that helps the model fit better
- **Activation Functions**: Functions that introduce non-linearity

## Simple Example

Let's consider a simple neural network that can classify whether an image contains a cat or a dog.

1. Input: Pixel values from the image
2. Processing: The network analyzes patterns and features
3. Output: Probability that the image contains a cat or dog

## Additional Resources

- Books on neural networks
- Online courses
- Practice problems`);

  const [isEnhancing, setIsEnhancing] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [enhancementHistory, setEnhancementHistory] = useState<Enhancement[]>([]);
  const { toast } = useToast();
  const [enhancementType, setEnhancementType] = useState("improve");
  const [customInstruction, setCustomInstruction] = useState("");

  const handleSave = () => {
    toast({
      title: "Content Saved",
      description: "Your content has been saved successfully",
    });
  };

  const getEnhancementInstruction = () => {
    switch (enhancementType) {
      case "improve":
        return "Improve this content by making it more engaging and clearer";
      case "simplify":
        return "Simplify this content for easier understanding";
      case "expand":
        return "Expand this content with more details and examples";
      case "academic":
        return "Make this content more academically rigorous with citations";
      case "examples":
        return "Add more examples to illustrate the concepts";
      case "custom":
        return customInstruction;
      default:
        return "Improve this content";
    }
  };

  const handleEnhanceContent = async () => {
    if (!selectedText) {
      toast({
        title: "No text selected",
        description: "Please select some text to enhance",
        variant: "destructive",
      });
      return;
    }

    setIsEnhancing(true);
    const instruction = getEnhancementInstruction();
    
    try {
      const response = await enhanceContent(selectedText, instruction);
      
      if (response.error) {
        toast({
          title: "Enhancement Error",
          description: response.error,
          variant: "destructive",
        });
      } else {
        const enhancement: Enhancement = {
          instruction,
          beforeContent: selectedText,
          afterContent: response.text
        };
        
        setEnhancementHistory([enhancement, ...enhancementHistory]);
        
        // Replace the selected text with enhanced content
        const newContent = content.replace(selectedText, response.text);
        setContent(newContent);
        
        toast({
          title: "Content Enhanced",
          description: "Selected content has been enhanced",
        });
      }
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Failed to enhance content",
        variant: "destructive",
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleTextSelect = () => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      setSelectedText(selection.toString());
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Content Editor</h1>
        <p className="text-muted-foreground mt-1">
          Edit and enhance your course content
        </p>
      </div>

      <Card>
        <CardHeader className="space-y-1">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <Label htmlFor="title">Lesson Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="font-medium text-lg max-w-md"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon">
                <Undo2Icon className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Redo2Icon className="h-4 w-4" />
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <Button onClick={handleSave} className="gap-2">
                <SaveIcon className="h-4 w-4" />
                Save
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Tabs defaultValue="edit">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="edit" className="gap-2">
                <TextIcon className="h-4 w-4" />
                Edit
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-2">
                <EyeIcon className="h-4 w-4" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <CodeIcon className="h-4 w-4" />
                History
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="edit" className="space-y-4 pt-4">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <div className="flex-1 min-w-[200px]">
                  <Select 
                    value={enhancementType}
                    onValueChange={setEnhancementType}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose enhancement type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="improve">Improve Content</SelectItem>
                      <SelectItem value="simplify">Simplify Language</SelectItem>
                      <SelectItem value="expand">Expand with Details</SelectItem>
                      <SelectItem value="academic">Make More Academic</SelectItem>
                      <SelectItem value="examples">Add Examples</SelectItem>
                      <SelectItem value="custom">Custom Instruction</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {enhancementType === "custom" && (
                  <div className="flex-1 min-w-[200px]">
                    <Input
                      placeholder="Enter custom enhancement instruction"
                      value={customInstruction}
                      onChange={(e) => setCustomInstruction(e.target.value)}
                    />
                  </div>
                )}
                
                <Button 
                  onClick={handleEnhanceContent} 
                  className="gap-2 whitespace-nowrap" 
                  disabled={isEnhancing}
                >
                  {isEnhancing ? (
                    <>
                      <Loader2Icon className="h-4 w-4 animate-spin" />
                      Enhancing...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="h-4 w-4" />
                      Enhance Selected
                    </>
                  )}
                </Button>
              </div>
              
              <div 
                className="min-h-[400px] p-4 border rounded-md font-mono text-sm whitespace-pre-wrap" 
                contentEditable={true}
                suppressContentEditableWarning={true}
                onMouseUp={handleTextSelect}
                onKeyUp={handleTextSelect}
                dangerouslySetInnerHTML={{ __html: content }}
              />
              
              <div className="text-sm text-muted-foreground mt-2">
                <p>
                  * Select text and click "Enhance Selected" to improve specific sections with AI
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="preview" className="pt-4">
              <Card className="border shadow-none">
                <CardContent className="p-6">
                  <MarkdownPreview markdown={content} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Enhancement History</CardTitle>
                  <CardDescription>
                    Recent AI enhancements made to your content
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {enhancementHistory.length > 0 ? (
                    enhancementHistory.map((enhancement, index) => (
                      <Card key={index} className="border">
                        <CardHeader className="py-3">
                          <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <SparklesIcon className="h-4 w-4 text-primary" />
                            Enhancement: {enhancement.instruction}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="py-0">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="font-medium mb-2 text-muted-foreground">Before:</p>
                              <div className="p-3 bg-secondary rounded-md whitespace-pre-wrap">
                                {enhancement.beforeContent}
                              </div>
                            </div>
                            <div>
                              <p className="font-medium mb-2 text-muted-foreground">After:</p>
                              <div className="p-3 bg-secondary rounded-md whitespace-pre-wrap">
                                {enhancement.afterContent}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center p-6">
                      <p className="text-muted-foreground">
                        No enhancements have been made yet. Select text and use the enhance feature to see history.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentEditor;
