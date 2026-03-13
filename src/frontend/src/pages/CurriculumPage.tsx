import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookMarked,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Play,
  Settings,
  Youtube,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useCurriculum } from "../hooks/useQueries";

const SUBJECTS = ["Hindi", "English", "Maths", "Science"] as const;
type Subject = (typeof SUBJECTS)[number];

const SUBJECT_COLORS: Record<Subject, string> = {
  Hindi: "oklch(0.62 0.21 15)",
  English: "oklch(0.55 0.18 300)",
  Maths: "oklch(0.38 0.11 185)",
  Science: "oklch(0.65 0.19 145)",
};

const SUBJECT_BG: Record<Subject, string> = {
  Hindi: "oklch(0.97 0.04 15)",
  English: "oklch(0.97 0.03 300)",
  Maths: "oklch(0.96 0.02 185)",
  Science: "oklch(0.96 0.04 145)",
};

const SUBJECT_EMOJIS: Record<Subject, string> = {
  Hindi: "🗣️",
  English: "📖",
  Maths: "📐",
  Science: "🔬",
};

interface VideoResult {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
}

type VideoCache = Map<string, VideoResult[]>;

function VideoSkeletons() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 px-3 pb-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-xl overflow-hidden border border-border"
        >
          <Skeleton className="w-full aspect-video" />
          <div className="p-2 space-y-1.5">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

function VideoCard({
  video,
  index,
}: {
  video: VideoResult;
  index: number;
}) {
  return (
    <motion.a
      href={`https://www.youtube.com/watch?v=${video.videoId}`}
      target="_blank"
      rel="noopener noreferrer"
      data-ocid={`curriculum.video.item.${index}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="group block rounded-xl overflow-hidden border border-border hover:border-primary/40 hover:shadow-md transition-all bg-card"
    >
      <div className="relative aspect-video bg-muted overflow-hidden">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Play className="w-8 h-8 text-white fill-white" />
        </div>
      </div>
      <div className="p-2">
        <p className="text-xs font-medium text-foreground line-clamp-2 leading-snug mb-1">
          {video.title}
        </p>
        <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
          <ExternalLink className="w-3 h-3 flex-shrink-0" />
          {video.channelTitle}
        </p>
      </div>
    </motion.a>
  );
}

function TopicRow({
  topic,
  index,
  subject,
  subjectColor,
  subjectBg,
  apiKey,
  videoCache,
  onCacheUpdate,
  onOpenSettings,
}: {
  topic: string;
  index: number;
  subject: Subject;
  subjectColor: string;
  subjectBg: string;
  apiKey: string;
  videoCache: VideoCache;
  onCacheUpdate: (key: string, videos: VideoResult[]) => void;
  onOpenSettings: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cacheKey = `${subject}:${topic}`;
  const videos = videoCache.get(cacheKey);
  const fetchedRef = useRef(false);

  const fetchVideos = async () => {
    if (!apiKey || videoCache.has(cacheKey) || fetchedRef.current) return;
    fetchedRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const query = encodeURIComponent(`${topic} Class 10 NCERT ${subject}`);
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=3&type=video&q=${query}&key=${apiKey}`;
      const res = await fetch(url);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = data?.error?.message || `API error ${res.status}`;
        throw new Error(msg);
      }
      const data = await res.json();
      const results: VideoResult[] = (data.items || []).map((item: any) => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.medium.url,
      }));
      onCacheUpdate(cacheKey, results);
    } catch (e: any) {
      setError(e.message || "Failed to load videos");
      fetchedRef.current = false;
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    const next = !expanded;
    setExpanded(next);
    if (next && apiKey && !videoCache.has(cacheKey)) {
      fetchVideos();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      data-ocid={`curriculum.topic.item.${index + 1}`}
    >
      <Card className="border-border shadow-xs overflow-hidden">
        <CardContent className="p-0">
          {/* Topic Header Row */}
          <button
            type="button"
            onClick={handleToggle}
            className="w-full flex items-center gap-3 p-3 hover:bg-muted/40 transition-colors text-left"
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-sm"
              style={{ background: subjectBg, color: subjectColor }}
            >
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground leading-snug">
                {topic}
              </p>
            </div>
            <Badge
              variant="outline"
              className="text-xs flex-shrink-0 border"
              style={{
                borderColor: subjectColor,
                color: subjectColor,
                background: subjectBg,
              }}
            >
              Ch. {index + 1}
            </Badge>
            <div className="flex-shrink-0 ml-1 text-muted-foreground">
              {expanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </button>

          {/* Expandable Video Section */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div
                  className="border-t border-border"
                  style={{ borderColor: `${subjectColor}33` }}
                >
                  {!apiKey ? (
                    <div className="px-4 py-4 flex flex-col items-center gap-2 text-center">
                      <Youtube className="w-8 h-8 text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground">
                        Add your YouTube API key in settings to see topic
                        videos.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenSettings();
                        }}
                        className="gap-1.5"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        Open Settings
                      </Button>
                    </div>
                  ) : loading ? (
                    <div className="pt-3">
                      <VideoSkeletons />
                    </div>
                  ) : error ? (
                    <div
                      className="px-4 py-3 text-sm text-destructive flex items-center gap-2"
                      data-ocid="curriculum.video.error_state"
                    >
                      <span>⚠️</span>
                      <span>{error}. Check your API key or quota.</span>
                    </div>
                  ) : videos && videos.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3">
                      {videos.map((v, vi) => (
                        <VideoCard key={v.videoId} video={v} index={vi + 1} />
                      ))}
                    </div>
                  ) : (
                    <div
                      className="px-4 py-3 text-sm text-muted-foreground"
                      data-ocid="curriculum.video.empty_state"
                    >
                      No videos found for this topic.
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function SubjectContent({
  subject,
  apiKey,
  videoCache,
  onCacheUpdate,
  onOpenSettings,
}: {
  subject: Subject;
  apiKey: string;
  videoCache: VideoCache;
  onCacheUpdate: (key: string, videos: VideoResult[]) => void;
  onOpenSettings: () => void;
}) {
  const { data: topics, isLoading } = useCurriculum(subject);

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 6 }, (_, i) => `sk-${i}`).map((k) => (
          <Skeleton key={k} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  const displayTopics =
    topics && topics.length > 0 ? topics : getDefaultTopics(subject);

  return (
    <div className="space-y-3 p-4">
      {displayTopics.map((topicObj, i) => {
        const topicName =
          "topic" in topicObj ? topicObj.topic : String(topicObj);
        return (
          <TopicRow
            key={topicName}
            topic={topicName}
            index={i}
            subject={subject}
            subjectColor={SUBJECT_COLORS[subject]}
            subjectBg={SUBJECT_BG[subject]}
            apiKey={apiKey}
            videoCache={videoCache}
            onCacheUpdate={onCacheUpdate}
            onOpenSettings={onOpenSettings}
          />
        );
      })}
    </div>
  );
}

function getDefaultTopics(
  subject: Subject,
): { topic: string; subject: string }[] {
  const topicsMap: Record<Subject, string[]> = {
    Hindi: [
      "सूरदास — पद",
      "तुलसीदास — राम-लक्ष्मण-परशुराम संवाद",
      "देव — सवैया और कवित्त",
      "जयशंकर प्रसाद — आत्मकथ्य",
      "सूर्यकांत त्रिपाठी 'निराला' — उत्साह और अट नहीं रही है",
      "नागार्जुन — यह दंतुरित मुसकान और फसल",
      "कृतिका — माता का अँचल",
      "जॉर्ज पंचम की नाक",
      "साना-साना हाथ जोड़ि",
      "एही ठैयाँ झुलनी हेरानी हो रामा!",
      "मैं क्यों लिखता हूँ?",
      "नेताजी का चश्मा",
    ],
    English: [
      "A Letter to God",
      "Nelson Mandela: Long Walk to Freedom",
      "Two Stories about Flying",
      "From the Diary of Anne Frank",
      "Glimpses of India",
      "Mijbil the Otter",
      "Madam Rides the Bus",
      "The Sermon at Benares",
      "The Proposal",
      "A Triumph of Surgery",
      "The Thief's Story",
      "The Midnight Visitor",
    ],
    Maths: [
      "Real Numbers",
      "Polynomials",
      "Pair of Linear Equations in Two Variables",
      "Quadratic Equations",
      "Arithmetic Progressions",
      "Triangles",
      "Coordinate Geometry",
      "Introduction to Trigonometry",
      "Some Applications of Trigonometry",
      "Circles",
      "Areas Related to Circles",
      "Surface Areas and Volumes",
      "Statistics",
      "Probability",
    ],
    Science: [
      "Chemical Reactions and Equations",
      "Acids, Bases and Salts",
      "Metals and Non-metals",
      "Carbon and its Compounds",
      "Life Processes",
      "Control and Coordination",
      "How do Organisms Reproduce?",
      "Heredity and Evolution",
      "Light — Reflection and Refraction",
      "Human Eye and the Colourful World",
      "Electricity",
      "Magnetic Effects of Electric Current",
      "Our Environment",
      "Management of Natural Resources",
    ],
  };
  return topicsMap[subject].map((t) => ({ topic: t, subject }));
}

export default function CurriculumPage() {
  const [activeSubject, setActiveSubject] = useState<Subject>("Hindi");
  const [apiKey, setApiKey] = useState<string>(
    () => localStorage.getItem("yt_api_key") || "",
  );
  const [videoCache, setVideoCache] = useState<VideoCache>(new Map());
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleSaveKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem("yt_api_key", key);
    // Clear cache so videos are re-fetched with new key
    setVideoCache(new Map());
  };

  const handleCacheUpdate = (key: string, videos: VideoResult[]) => {
    setVideoCache((prev) => {
      const next = new Map(prev);
      next.set(key, videos);
      return next;
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Page Header */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <BookMarked
            className="w-5 h-5"
            style={{ color: "oklch(0.38 0.11 185)" }}
          />
          <h2 className="font-display font-bold text-xl text-foreground flex-1">
            Curriculum
          </h2>
          {/* YouTube API Key Settings */}
          <div className="flex items-center gap-1.5">
            {apiKey && (
              <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                <Youtube className="w-3 h-3" />
                Videos on
              </span>
            )}
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  data-ocid="curriculum.settings_button"
                  className="w-8 h-8 rounded-lg"
                  title="YouTube API Settings"
                >
                  <Settings className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Youtube className="w-5 h-5 text-red-500" />
                    YouTube API Settings
                  </DialogTitle>
                  <DialogDescription>
                    Enter your YouTube Data API v3 key to load topic-related
                    videos. Get one free from{" "}
                    <a
                      href="https://console.developers.google.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-primary"
                    >
                      Google Cloud Console
                    </a>
                    .
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-2">
                  <Label htmlFor="yt-api-key-main">API Key</Label>
                  <ApiKeyInput
                    currentKey={apiKey}
                    onSave={handleSaveKey}
                    onClose={() => setSettingsOpen(false)}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <p className="text-muted-foreground text-sm">
          Class 10 · NCERT Syllabus · Click any topic to watch videos
        </p>
      </div>

      <Tabs
        value={activeSubject}
        onValueChange={(v) => setActiveSubject(v as Subject)}
        className="w-full"
      >
        <div className="px-4">
          <TabsList className="w-full grid grid-cols-4 h-auto p-1 bg-secondary">
            {SUBJECTS.map((s) => (
              <TabsTrigger
                key={s}
                value={s}
                data-ocid="curriculum.subject_tab"
                className="text-xs font-medium py-2 data-[state=active]:shadow-sm"
                style={{
                  color: activeSubject === s ? SUBJECT_COLORS[s] : undefined,
                }}
              >
                <span className="mr-1">{SUBJECT_EMOJIS[s]}</span>
                {s}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {SUBJECTS.map((s) => (
          <TabsContent key={s} value={s} className="mt-0">
            <SubjectContent
              subject={s}
              apiKey={apiKey}
              videoCache={videoCache}
              onCacheUpdate={handleCacheUpdate}
              onOpenSettings={() => setSettingsOpen(true)}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

// Inline form inside the dialog to avoid hook-in-conditional issues
function ApiKeyInput({
  currentKey,
  onSave,
  onClose,
}: {
  currentKey: string;
  onSave: (key: string) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(currentKey);

  return (
    <>
      <Input
        id="yt-api-key-main"
        data-ocid="curriculum.apikey.input"
        type="password"
        placeholder="AIza..."
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        className="font-mono text-sm"
      />
      <DialogFooter className="gap-2 pt-2">
        <Button
          variant="outline"
          onClick={onClose}
          data-ocid="curriculum.apikey.cancel_button"
        >
          Cancel
        </Button>
        <Button
          onClick={() => onSave(draft.trim())}
          data-ocid="curriculum.apikey.save_button"
        >
          Save Key
        </Button>
      </DialogFooter>
    </>
  );
}
