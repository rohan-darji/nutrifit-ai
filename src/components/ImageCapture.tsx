
import React, { useRef, useState } from "react";
import { Camera, Image, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNutrition } from "@/contexts/NutritionContext";
import { useToast } from "@/components/ui/use-toast";

export const ImageCapture: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { analyzeImage } = useNutrition();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return;
      }

      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);  
    }
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement("video");
      const canvas = document.createElement("canvas");
      
      // Wait for video to be ready
      video.srcObject = stream;
      await video.play();
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Capture frame from video
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      
      // Convert to data URL
      const dataUrl = canvas.toDataURL("image/jpeg");
      setPreviewUrl(dataUrl);
      
      // Clean up
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      toast({
        title: "Camera error",
        description: "Could not access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAnalyze = () => {
    if (previewUrl) {
      analyzeImage(previewUrl);
    } else {
      toast({
        title: "No image selected",
        description: "Please capture or upload an image first.",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-6">
      <div className="w-full max-w-md aspect-square rounded-xl overflow-hidden bg-secondary/50 border border-secondary flex items-center justify-center relative">
        {previewUrl ? (
          <img 
            src={previewUrl} 
            alt="Food preview" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center p-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
              <Image className="w-8 h-8 text-primary" />
            </div>
            <p className="text-muted-foreground">
              Take a photo or upload an image of your food
            </p>
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />

      <div className="w-full flex flex-col gap-4">
        {previewUrl ? (
          <>
            <Button onClick={handleAnalyze} size="lg" className="w-full">
              Analyze Food
            </Button>
            <Button onClick={handleReset} variant="outline" size="lg" className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset Image
            </Button>
          </>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={handleCameraCapture} variant="outline" size="lg" className="w-full">
              <Camera className="w-4 h-4 mr-2" />
              Camera
            </Button>
            <Button onClick={handleUploadClick} variant="outline" size="lg" className="w-full">
              <Image className="w-4 h-4 mr-2" />
              Gallery
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
