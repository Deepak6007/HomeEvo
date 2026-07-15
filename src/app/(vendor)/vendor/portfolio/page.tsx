"use client";

import * as React from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vendorProfileApi } from "@/lib/api/vendorProfile";
import { queryKeys } from "@/hooks/queryKeys";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { vendorNavItems } from "@/lib/nav-config";
import { useAuth } from "@/hooks/useAuth";
import { AvailabilityToggle } from "@/components/vendor/AvailabilityToggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { 
  FolderKanban, 
  Upload, 
  Trash2, 
  CheckCircle, 
  MapPin, 
  Star, 
  Hammer, 
  Award,
  Sparkles,
  ShieldCheck,
  Plus,
  X
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function PortfolioPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // States
  const [photos, setPhotos] = React.useState<string[]>([]);
  const [tags, setTags] = React.useState<string[]>(["Acrylic Laminates", "Modular Framing", "Hettich Hinges", "Veneer Polishing"]);
  const [newTag, setNewTag] = React.useState("");
  
  const [serviceAreas, setServiceAreas] = React.useState<string[]>(["Vijayawada", "Guntur"]);

  // Fetch Vendor Profile
  const { data: profileResponse, isLoading } = useQuery({
    queryKey: queryKeys.vendorProfile.detail(),
    queryFn: () => vendorProfileApi.get(),
  });

  const profile = profileResponse?.profile ?? {
    name: "Raju Prasad",
    businessName: "Raju Carpentry & Interiors",
    category: "Carpentry",
    rating: 4.8,
    reviewCount: 24,
    location: "Vijayawada, AP",
    priceRange: "₹₹ (Moderate)",
    isVerified: true,
    portfolioPhotos: [
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1556909212-d5b604dadb72?w=600&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=600&auto=format&fit=crop&q=60"
    ],
    yearsExperience: 8,
    aadhaar: "XXXX-XXXX-9823",
    gstin: "37AAAAA1111A1Z1"
  };

  // Sync photos from api
  React.useEffect(() => {
    if (profile.portfolioPhotos) {
      setPhotos(profile.portfolioPhotos);
    }
  }, [profileResponse]);

  // Upload Photo Mutation
  const uploadPhotoMutation = useMutation({
    mutationFn: (file: File) => vendorProfileApi.uploadPortfolioPhoto(file),
    onSuccess: (data) => {
      toast.success("Portfolio photo uploaded!");
      queryClient.invalidateQueries({ queryKey: queryKeys.vendorProfile.all });
      setPhotos(prev => [...prev, data.url]);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to upload photo.");
    }
  });

  // Delete Photo Mutation
  const deletePhotoMutation = useMutation({
    mutationFn: (photoId: string) => vendorProfileApi.deletePortfolioPhoto(photoId),
    onSuccess: (_, deletedUrl) => {
      toast.success("Photo removed from portfolio.");
      queryClient.invalidateQueries({ queryKey: queryKeys.vendorProfile.all });
      setPhotos(prev => prev.filter(url => url !== deletedUrl));
    },
    onError: (err) => {
      toast.error(err.message || "Failed to remove photo.");
    }
  });

  const handleUploadClick = () => {
    if (photos.length >= 20) {
      toast.warning("Maximum of 20 portfolio photos allowed.");
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadPhotoMutation.mutate(file);
  };

  const handleDeletePhoto = (photoUrl: string) => {
    if (photos.length <= 3) {
      toast.warning("A minimum of 3 portfolio photos is required to remain active.");
    }
    // Simulate deleting by url as photoId
    deletePhotoMutation.mutate(photoUrl);
  };

  // HTML5 Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    const draggedIndex = parseInt(e.dataTransfer.getData("text/plain"));
    if (isNaN(draggedIndex) || draggedIndex === index) return;
    
    const reorderedPhotos = [...photos];
    const [removed] = reorderedPhotos.splice(draggedIndex, 1);
    reorderedPhotos.splice(index, 0, removed);
    
    setPhotos(reorderedPhotos);
    toast.success("Portfolio layout order updated!");
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleToggleDistrict = (dist: string) => {
    if (serviceAreas.includes(dist)) {
      if (serviceAreas.length <= 1) {
        toast.warning("Must serve at least 1 district.");
        return;
      }
      setServiceAreas(serviceAreas.filter(d => d !== dist));
    } else {
      setServiceAreas([...serviceAreas, dist]);
    }
  };

  const AP_DISTRICTS = ["Vijayawada", "Guntur", "Visakhapatnam", "Nellore", "Kurnool", "Anantapur"];

  const shellUser = React.useMemo(() => {
    return {
      name: user?.name || "Vendor Pro",
      email: user?.email || "",
      avatarInitials: user?.name
        ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase()
        : "VP",
    };
  }, [user]);

  return (
    <DashboardShell
      role="vendor"
      navItems={vendorNavItems}
      user={shellUser}
      topbarActions={<AvailabilityToggle />}
    >
      <div className="space-y-6 relative z-10 text-white">
        
        {/* Header Title */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="space-y-1">
            <h1 className="font-industrial text-2xl font-bold tracking-wider uppercase text-white">
              MY DIGITAL PORTFOLIO
            </h1>
            <p className="font-body text-3xs text-neutral-400">
              Showcase project photos, configure service locations, and review verification badges.
            </p>
          </div>
        </div>

        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />

        {/* Profile Header Card */}
        <div className="rounded-xl border border-white/6 bg-dark-3 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border border-white/10 shrink-0 select-none">
              <AvatarImage src="" />
              <AvatarFallback className="bg-orange font-mono font-bold text-white text-lg">
                {shellUser.avatarInitials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-body text-xs md:text-sm font-bold">{profile.businessName}</h2>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-orange fill-orange" />
                  <span className="font-mono text-3xs font-bold">{profile.rating} ({profile.reviewCount} Reviews)</span>
                </div>
              </div>
              <p className="font-body text-4xs text-neutral-400 leading-normal flex items-center gap-1">
                <Hammer className="h-3 w-3 text-orange" /> {profile.category} expert &bull; { (profile as any).yearsExperience || 8 } Years Experience
              </p>
              <p className="font-body text-4xs text-neutral-400 leading-normal flex items-center gap-1">
                <MapPin className="h-3 w-3 text-neutral-500" /> Based in {profile.location}
              </p>
            </div>
          </div>

          {/* Verification Badges */}
          <div className="flex flex-wrap items-center gap-2 border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
            {profile.aadhaar && (
              <span className="px-2.5 py-1 rounded bg-green-500/10 border border-green-500/20 text-green-400 text-5xs font-mono font-bold flex items-center gap-1 select-none">
                <ShieldCheck className="h-3.5 w-3.5" /> Aadhaar Verified
              </span>
            )}
            {profile.gstin && (
              <span className="px-2.5 py-1 rounded bg-green-500/10 border border-green-500/20 text-green-400 text-5xs font-mono font-bold flex items-center gap-1 select-none">
                <ShieldCheck className="h-3.5 w-3.5" /> GSTIN ✓
              </span>
            )}
            <span className="px-2.5 py-1 rounded bg-green-500/10 border border-green-500/20 text-green-400 text-5xs font-mono font-bold flex items-center gap-1 select-none">
              <ShieldCheck className="h-3.5 w-3.5" /> BG Checked ✓
            </span>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left/Middle Column: Photos Drag Grid */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-white/6 bg-dark-3 p-6 space-y-5 shadow-xl">
              
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h3 className="font-industrial text-xs font-bold tracking-widest text-neutral-400 uppercase">
                  PORTFOLIO SHOWCASE GALLERY ({photos.length}/20)
                </h3>
                
                <Button
                  size="xs"
                  onClick={handleUploadClick}
                  disabled={uploadPhotoMutation.isPending}
                  className="bg-orange/10 hover:bg-orange border border-orange/20 hover:border-transparent text-orange hover:text-white font-industrial font-bold uppercase tracking-wider text-4xs rounded px-3 py-1.5 h-auto transition-all"
                >
                  <Upload className="h-3.5 w-3.5 mr-1" />
                  {uploadPhotoMutation.isPending ? "Uploading..." : "Upload Photos"}
                </Button>
              </div>

              {photos.length < 3 && (
                <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 text-4xs text-amber-400 font-body leading-normal">
                  Alert: Upload at least 3 photos to complete profile integrity guidelines.
                </div>
              )}

              {/* Masonry Grid with D&D */}
              {photos.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-white/5 rounded-xl bg-dark-2">
                  <FolderKanban className="h-8 w-8 text-neutral-600 mx-auto mb-3" />
                  <p className="text-sm text-neutral-400">No portfolio photos uploaded.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {photos.map((url, idx) => (
                    <div 
                      key={url}
                      draggable
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, idx)}
                      className="relative rounded-lg overflow-hidden border border-white/5 bg-dark-2 aspect-square cursor-grab active:cursor-grabbing group shadow-md"
                    >
                      <Image 
                        src={url} 
                        alt={`Portfolio item ${idx+1}`} 
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 250px"
                        placeholder="blur"
                        blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZkZjhmMiIvPjwvc3ZnPg=="
                        className="object-cover opacity-80 group-hover:scale-105 transition-all duration-300"
                      />
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3 pointer-events-none">
                        <span className="text-5xs font-mono text-white bg-dark-2 px-1.5 py-0.5 rounded self-start">
                          PROJECT CARD #{idx+1}
                        </span>
                        
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleDeletePhoto(url);
                          }}
                          className="p-2 rounded bg-red-600 hover:bg-red-700 text-white self-end shrink-0 transition-colors pointer-events-auto shadow-sm"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              )}

              <p className="text-5xs font-mono text-neutral-500 leading-normal block pt-2">
                Tip: Drag and drop gallery cards to reorder how they display on your public profile.
              </p>

            </div>
          </div>

          {/* Right Column: Specializations and Service Areas */}
          <div className="space-y-6">
            
            {/* Specializations Tags */}
            <div className="rounded-xl border border-white/6 bg-dark-3 p-6 space-y-4 shadow-xl">
              <h3 className="font-industrial text-xs font-bold tracking-widest text-neutral-400 uppercase border-b border-white/5 pb-2">
                SPECIALTIES & TAGS
              </h3>

              {/* Tag Editor Form */}
              <form onSubmit={handleAddTag} className="flex gap-2">
                <input 
                  placeholder="e.g. Laminates"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="bg-dark-2 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white outline-none focus:border-orange flex-1"
                />
                <Button 
                  type="submit" 
                  size="sm"
                  className="bg-orange hover:bg-orange/90 text-white font-industrial font-bold uppercase tracking-wider text-xs px-3 h-8"
                >
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </form>

              {/* Tags Container */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                {tags.map((t) => (
                  <div key={t} className="px-2.5 py-1 rounded bg-orange/5 border border-orange/10 text-orange font-mono text-4xs font-bold flex items-center gap-1 select-none">
                    <span>{t}</span>
                    <button type="button" onClick={() => handleRemoveTag(t)} className="hover:text-red-400 shrink-0">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Service Areas */}
            <div className="rounded-xl border border-white/6 bg-dark-3 p-6 space-y-4 shadow-xl">
              <h3 className="font-industrial text-xs font-bold tracking-widest text-neutral-400 uppercase border-b border-white/5 pb-2">
                SERVICE DISTRICTS IN AP
              </h3>

              <div className="grid grid-cols-2 gap-2 text-3xs font-body text-neutral-300">
                {AP_DISTRICTS.map((dist) => {
                  const isChecked = serviceAreas.includes(dist);
                  return (
                    <label key={dist} className="flex items-center gap-2 cursor-pointer py-1 select-none">
                      <input 
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleDistrict(dist)}
                        className="rounded border-white/10 text-orange bg-dark-2 outline-none focus:ring-orange accent-orange"
                      />
                      <span className={isChecked ? "text-white font-bold" : "text-neutral-400"}>
                        {dist}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

      </div>
    </DashboardShell>
  );
}
