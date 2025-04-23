import React, { useRef, useState } from "react";
import { Camera, Image, RefreshCw, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNutrition } from "@/contexts/NutritionContext";
import { useToast } from "@/components/ui/use-toast";

export const ImageCapture: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");


  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
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

  const handleCameraCapture = async (mode: "user" | "environment" = facingMode) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode },
      });
      streamRef.current = stream;
      setFacingMode(mode); // Update after starting camera
      setIsCameraOpen(true);
  
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((err) => {
            toast({
              title: "Video playback failed",
              description: String(err),
              variant: "destructive",
            });
          });
        }
      }, 100);
    } catch (error) {
      toast({
        title: "Camera error",
        description: "Could not access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };
  
  

  const captureFromVideo = () => {
    const video = videoRef.current;
    if (!video) return;
  
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  
    const ctx = canvas.getContext("2d");
    if (ctx) {
      if (facingMode === "user") {
        // Flip canvas horizontally
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
  
      // Draw after flip (or no flip)
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
      const dataUrl = canvas.toDataURL("image/jpeg");
      setPreviewUrl(dataUrl);
    }
  
    stopCamera();
    setIsCameraOpen(false);
  };
  

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const handleSwitchCamera = () => {
    const newMode = facingMode === "user" ? "environment" : "user";
    stopCamera();
    handleCameraCapture(newMode); // Pass it directly
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

  const handleCancelCamera = () => {
    stopCamera();
    setIsCameraOpen(false);
  };

  const handleRetake = () => {
    setPreviewUrl(null);
    handleCameraCapture();
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
        ) : isCameraOpen ? (
          <video
            ref={videoRef}
            className={`w-full h-full object-cover ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
            autoPlay
            muted
            playsInline
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
        {isCameraOpen ? (
          <div className="flex flex-col gap-4">
          <Button onClick={captureFromVideo} size="lg" className="w-full">
            📸 Capture Photo
          </Button>
          <div className="flex gap-4">
            <Button onClick={handleSwitchCamera} variant="secondary" size="lg" className="w-full">
              🔄 Switch Camera
            </Button>
            <Button
              onClick={handleCancelCamera}
              variant="destructive"
              size="lg"
              className="w-full"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
        ) : previewUrl ? (
          <>
            <Button onClick={handleAnalyze} size="lg" className="w-full">
              Analyze Food
            </Button>
            <div className="flex gap-4">
              <Button onClick={handleRetake} variant="outline" size="lg" className="w-full">
                <RotateCcw className="w-4 h-4 mr-2" />
                Retake
              </Button>
              <Button onClick={handleReset} variant="outline" size="lg" className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => handleCameraCapture()}
              variant="outline"
              size="lg"
              className="w-full"
            >
              <Camera className="w-4 h-4 mr-2" />
              Camera
            </Button>
            <Button
              onClick={handleUploadClick}
              variant="outline"
              size="lg"
              className="w-full"
            >
              <Image className="w-4 h-4 mr-2" />
              Gallery
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
